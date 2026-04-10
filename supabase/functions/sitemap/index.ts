import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SITE_URL = "https://www.wordstack.io";

const STATIC_ROUTES = [
  { path: "/", priority: "1.0", changefreq: "daily" },
  { path: "/home", priority: "0.9", changefreq: "hourly" },
  { path: "/discover", priority: "0.8", changefreq: "daily" },
  { path: "/search", priority: "0.7", changefreq: "weekly" },
  { path: "/events", priority: "0.8", changefreq: "daily" },
  { path: "/chapbooks", priority: "0.7", changefreq: "weekly" },
  { path: "/meet", priority: "0.7", changefreq: "daily" },
  { path: "/trails", priority: "0.7", changefreq: "weekly" },
  { path: "/journals", priority: "0.7", changefreq: "daily" },
  { path: "/qa", priority: "0.7", changefreq: "daily" },
  { path: "/classics", priority: "0.8", changefreq: "weekly" },
  { path: "/classics/poets", priority: "0.7", changefreq: "weekly" },
  { path: "/challenges", priority: "0.8", changefreq: "daily" },
  { path: "/upgrade", priority: "0.6", changefreq: "monthly" },
  { path: "/about", priority: "0.5", changefreq: "monthly" },
  { path: "/rules", priority: "0.4", changefreq: "monthly" },
  { path: "/user-agreement", priority: "0.3", changefreq: "monthly" },
  { path: "/privacy-policy", priority: "0.3", changefreq: "monthly" },
  { path: "/refund-policy", priority: "0.3", changefreq: "monthly" },
];

function escapeXml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function normalizeSitemapUrl(loc: string): string {
  return loc.replace(LEGACY_SITE_URL, SITE_URL);
}

function urlEntry(
  loc: string,
  lastmod?: string,
  changefreq?: string,
  priority?: string
): string {
  const normalizedLoc = normalizeSitemapUrl(loc);

  return `  <url>
    <loc>${escapeXml(normalizedLoc)}</loc>${lastmod ? `\n    <lastmod>${lastmod}</lastmod>` : ""}${changefreq ? `\n    <changefreq>${changefreq}</changefreq>` : ""}${priority ? `\n    <priority>${priority}</priority>` : ""}
  </url>`;
}

Deno.serve(async () => {
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  const urls: string[] = [];

  // Static routes
  for (const route of STATIC_ROUTES) {
    urls.push(urlEntry(`${SITE_URL}${route.path}`, undefined, route.changefreq, route.priority));
  }

  // Published poems
  const { data: poems } = await supabase
    .from("poems")
    .select("slug, updated_at")
    .eq("status", "published")
    .order("updated_at", { ascending: false })
    .limit(5000);

  for (const poem of poems ?? []) {
    urls.push(urlEntry(
      `${SITE_URL}/poem/${escapeXml(poem.slug)}`,
      poem.updated_at?.slice(0, 10),
      "weekly",
      "0.8"
    ));
  }

  // Poet profiles
  const { data: profiles } = await supabase
    .from("profiles")
    .select("username, updated_at")
    .not("username", "is", null)
    .limit(5000);

  for (const profile of profiles ?? []) {
    if (profile.username) {
      urls.push(urlEntry(
        `${SITE_URL}/poet/${escapeXml(profile.username)}`,
        profile.updated_at?.slice(0, 10),
        "weekly",
        "0.7"
      ));
    }
  }

  // Tag pages
  const { data: tagRows } = await supabase
    .from("tag_metadata")
    .select("tag, updated_at");

  for (const row of tagRows ?? []) {
    urls.push(urlEntry(
      `${SITE_URL}/tag/${escapeXml(row.tag)}`,
      row.updated_at?.slice(0, 10),
      "weekly",
      "0.6"
    ));
  }

  // Events
  const { data: events } = await supabase
    .from("events")
    .select("id, updated_at")
    .eq("status", "approved")
    .limit(2000);

  for (const event of events ?? []) {
    urls.push(urlEntry(
      `${SITE_URL}/events/${event.id}`,
      event.updated_at?.slice(0, 10),
      "weekly",
      "0.6"
    ));
  }

  // Chapbooks
  const { data: chapbooks } = await supabase
    .from("chapbooks")
    .select("id, updated_at")
    .eq("status", "approved")
    .limit(2000);

  for (const chapbook of chapbooks ?? []) {
    urls.push(urlEntry(
      `${SITE_URL}/chapbooks/${chapbook.id}`,
      chapbook.updated_at?.slice(0, 10),
      "monthly",
      "0.6"
    ));
  }

  // Trails
  const { data: trails } = await supabase
    .from("trails")
    .select("id, updated_at")
    .eq("status", "published")
    .limit(2000);

  for (const trail of trails ?? []) {
    urls.push(urlEntry(
      `${SITE_URL}/trails/${trail.id}`,
      trail.updated_at?.slice(0, 10),
      "weekly",
      "0.6"
    ));
  }

  // Journals
  const { data: journals } = await supabase
    .from("journals")
    .select("id, updated_at")
    .eq("status", "published")
    .limit(2000);

  for (const journal of journals ?? []) {
    urls.push(urlEntry(
      `${SITE_URL}/journals/${journal.id}`,
      journal.updated_at?.slice(0, 10),
      "weekly",
      "0.6"
    ));
  }

  // Q&A questions
  const { data: questions } = await supabase
    .from("qa_questions")
    .select("id, updated_at")
    .limit(2000);

  for (const q of questions ?? []) {
    urls.push(urlEntry(
      `${SITE_URL}/qa/${q.id}`,
      q.updated_at?.slice(0, 10),
      "weekly",
      "0.5"
    ));
  }

  // Classic poets
  const { data: classicPoets } = await supabase
    .from("classic_poets")
    .select("slug, updated_at");

  for (const poet of classicPoets ?? []) {
    urls.push(urlEntry(
      `${SITE_URL}/classics/poet/${escapeXml(poet.slug)}`,
      poet.updated_at?.slice(0, 10),
      "monthly",
      "0.7"
    ));
  }

  // Classic poems
  const { data: classicPoems } = await supabase
    .from("classic_poems")
    .select("slug, updated_at")
    .eq("status", "published")
    .limit(5000);

  for (const poem of classicPoems ?? []) {
    urls.push(urlEntry(
      `${SITE_URL}/classics/poem/${escapeXml(poem.slug)}`,
      poem.updated_at?.slice(0, 10),
      "monthly",
      "0.7"
    ));
  }

  // Challenges
  const { data: challenges } = await supabase
    .from("challenges")
    .select("id, updated_at")
    .limit(500);

  for (const challenge of challenges ?? []) {
    urls.push(urlEntry(
      `${SITE_URL}/challenges/${challenge.id}`,
      challenge.updated_at?.slice(0, 10),
      "weekly",
      "0.6"
    ));
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join("\n")}
</urlset>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
});
