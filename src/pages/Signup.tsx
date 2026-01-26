import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { db } from "@/lib/db";
import { useSEO } from "@/hooks/useSEO";

export default function Signup() {
  useSEO({
    title: "Create Account",
    description: "Join WordStack as a reader or poet. Share your poetry with a community that appreciates the craft."
  });
  const navigate = useNavigate();
  const { toast } = useToast();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: window.location.origin,
      },
    });

    if (error) {
      setLoading(false);
      toast({ title: "Sign up failed", description: error.message, variant: "destructive" });
      return;
    }

    const userId = data.user?.id;
    if (!userId) {
      setLoading(false);
      toast({ title: "Sign up incomplete", description: "Please try again.", variant: "destructive" });
      return;
    }

    // Create profile + baseline role
    const { error: profileError } = await db.from("profiles").insert({
      user_id: userId,
      username: username.trim() || null,
      display_name: displayName.trim() || null,
      links: {},
    });

    if (profileError) {
      setLoading(false);
      toast({ title: "Couldn’t create profile", description: profileError.message, variant: "destructive" });
      return;
    }

    await db.from("user_roles").insert({ user_id: userId, role: "user" });

    setLoading(false);
    toast({ title: "Welcome to WordStack", description: "You can complete your profile now." });
    navigate("/profile");
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-sm rounded-2xl border border-border bg-card p-6">
        <h1 className="text-xl font-semibold">Create your account</h1>
        <p className="mt-1 text-sm text-muted-foreground">Join as a reader now — become a poet anytime.</p>

        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <Input id="username" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="e.g. quietink" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="display">Display name</Label>
            <Input id="display" value={displayName} onChange={(e) => setDisplayName(e.target.value)} placeholder="e.g. James Chen" />
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Creating…" : "Create account"}
          </Button>
        </form>

        <p className="mt-4 text-sm text-muted-foreground">
          Already have an account? <Link className="text-primary hover:underline" to="/login">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
