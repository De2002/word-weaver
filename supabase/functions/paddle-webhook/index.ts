import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const PADDLE_PRICE_IDS: Record<string, "lyric" | "epic"> = {
  "pri_01kn7zx65q75grh17vscg0qjm6": "lyric",
  "pri_01kjqj6pv12w6e7fve9ybcvsjg": "epic",
};

// Ink credits per tier
const INK_CREDITS: Record<string, number> = {
  lyric: 50,
  epic: 150,
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const signature = req.headers.get("paddle-signature");
    const webhookSecret = Deno.env.get("PADDLE_WEBHOOK_SECRET");

    // Verify webhook signature
    if (!signature || !webhookSecret) {
      console.error("Missing signature or webhook secret");
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.text();
    const payload = JSON.parse(body);

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const eventType = payload.event_type;
    const data = payload.data;

    // Log event
    await supabase.from("subscription_events").insert({
      paddle_event_id: payload.event_id,
      event_type: eventType,
      customer_email: data?.customer?.email || data?.customer_email,
      subscription_id: data?.id || data?.subscription_id,
      price_id: data?.items?.[0]?.price?.id,
      amount: data?.items?.[0]?.price?.unit_price?.amount
        ? Number(data.items[0].price.unit_price.amount) / 100
        : null,
      currency: data?.currency_code || "USD",
      raw_payload: payload,
    });

    // Handle subscription activated / resumed
    if (
      eventType === "subscription.activated" ||
      eventType === "subscription.resumed"
    ) {
      const email = data?.customer?.email;
      const priceId = data?.items?.[0]?.price?.id;

      if (!email || !priceId) {
        return new Response(JSON.stringify({ error: "Missing email or price" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const tier = PADDLE_PRICE_IDS[priceId];
      if (!tier) {
        return new Response(JSON.stringify({ error: "Unknown price ID" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Find user by email
      const { data: users } = await supabase.auth.admin.listUsers();
      const user = users?.users?.find(
        (u: { email?: string }) => u.email?.toLowerCase() === email.toLowerCase()
      );

      if (!user) {
        console.error("No user found for email:", email);
        return new Response(JSON.stringify({ ok: true, note: "User not found" }), {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Grant tier role (lyric or epic)
      await supabase.from("user_roles").upsert(
        { user_id: user.id, role: tier },
        { onConflict: "user_id,role" }
      );

      // Also grant 'pro' role for both tiers
      await supabase.from("user_roles").upsert(
        { user_id: user.id, role: "pro" },
        { onConflict: "user_id,role" }
      );

      // Credit ink to wallet
      const inkAmount = INK_CREDITS[tier];
      const { data: existingWallet } = await supabase
        .from("ink_wallets")
        .select("id, balance, total_received")
        .eq("user_id", user.id)
        .maybeSingle();

      if (existingWallet) {
        await supabase
          .from("ink_wallets")
          .update({
            balance: existingWallet.balance + inkAmount,
            total_received: existingWallet.total_received + inkAmount,
          })
          .eq("user_id", user.id);
      } else {
        await supabase.from("ink_wallets").insert({
          user_id: user.id,
          balance: inkAmount,
          total_received: inkAmount,
        });
      }

      // Record ink transaction
      await supabase.from("ink_transactions").insert({
        from_user_id: user.id,
        to_user_id: user.id,
        amount: inkAmount,
        note: `${tier.charAt(0).toUpperCase() + tier.slice(1)} subscription activated — ${inkAmount} ink credited`,
      });

      // Add revenue to poet pool (50% split)
      const totalAmount =
        data?.items?.[0]?.price?.unit_price?.amount
          ? Number(data.items[0].price.unit_price.amount) / 100
          : 0;
      const poetShare = totalAmount * 0.5;
      const platformShare = totalAmount * 0.5;

      // Get or create current period
      const now = new Date();
      const periodStart = new Date(now.getFullYear(), now.getMonth(), 1)
        .toISOString()
        .split("T")[0];
      const periodEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0)
        .toISOString()
        .split("T")[0];

      let { data: period } = await supabase
        .from("payout_periods")
        .select("id, pool_amount")
        .eq("period_start", periodStart)
        .eq("status", "active")
        .maybeSingle();

      if (!period) {
        const { data: newPeriod } = await supabase
          .from("payout_periods")
          .insert({ period_start: periodStart, period_end: periodEnd, pool_amount: poetShare })
          .select("id, pool_amount")
          .single();
        period = newPeriod;
      } else {
        await supabase
          .from("payout_periods")
          .update({ pool_amount: period.pool_amount + poetShare })
          .eq("id", period.id);
      }

      // Upsert poet_pool record
      if (period) {
        const { data: existingPool } = await supabase
          .from("poet_pool")
          .select("id, total_amount, platform_share, poet_share")
          .eq("period_id", period.id)
          .maybeSingle();

        if (existingPool) {
          await supabase
            .from("poet_pool")
            .update({
              total_amount: existingPool.total_amount + totalAmount,
              platform_share: existingPool.platform_share + platformShare,
              poet_share: existingPool.poet_share + poetShare,
            })
            .eq("id", existingPool.id);
        } else {
          await supabase.from("poet_pool").insert({
            period_id: period.id,
            total_amount: totalAmount,
            platform_share: platformShare,
            poet_share: poetShare,
          });
        }
      }

      console.log(`✅ ${tier} subscription activated for ${email}, ${inkAmount} ink credited, $${poetShare} added to pool`);
    }

    // Handle subscription canceled
    if (eventType === "subscription.canceled") {
      const email = data?.customer?.email;
      if (email) {
        const { data: users } = await supabase.auth.admin.listUsers();
        const user = users?.users?.find(
          (u: { email?: string }) => u.email?.toLowerCase() === email.toLowerCase()
        );
        if (user) {
          // Remove tier roles but keep poet role
          for (const role of ["lyric", "epic", "pro"] as const) {
            await supabase
              .from("user_roles")
              .delete()
              .eq("user_id", user.id)
              .eq("role", role);
          }
          console.log(`❌ Subscription canceled for ${email}, roles removed`);
        }
      }
    }

    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Webhook error:", err);
    return new Response(JSON.stringify({ error: "Internal error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
