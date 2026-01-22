import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { db } from "@/lib/db";

export type UserRole = "user" | "poet" | "moderator" | "admin";

type ProfileRow = {
  user_id: string;
  username: string | null;
  display_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  links: Record<string, unknown>;
};

type AuthContextValue = {
  loading: boolean;
  session: Session | null;
  user: User | null;
  profile: ProfileRow | null;
  roles: UserRole[];
  isPoet: boolean;
  refreshProfile: () => Promise<void>;
  refreshRoles: () => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

async function fetchProfile(userId: string): Promise<ProfileRow | null> {
  const { data, error } = await db
    .from("profiles")
    .select("user_id, username, display_name, avatar_url, bio, links")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) throw error;
  return data ?? null;
}

async function fetchRoles(userId: string): Promise<UserRole[]> {
  const { data, error } = await db
    .from("user_roles")
    .select("role")
    .eq("user_id", userId);

  if (error) throw error;
  return (data ?? []).map((r: { role: string }) => r.role as UserRole);
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<ProfileRow | null>(null);
  const [roles, setRoles] = useState<UserRole[]>([]);

  const refreshProfile = async () => {
    if (!user) {
      setProfile(null);
      return;
    }
    setProfile(await fetchProfile(user.id));
  };

  const refreshRoles = async () => {
    if (!user) {
      setRoles([]);
      return;
    }
    setRoles(await fetchRoles(user.id));
  };

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      setUser(nextSession?.user ?? null);
    });

    // Initial session
    supabase.auth
      .getSession()
      .then(async ({ data }) => {
        setSession(data.session);
        setUser(data.session?.user ?? null);
      })
      .finally(() => setLoading(false));

    return () => sub.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) {
      setProfile(null);
      setRoles([]);
      return;
    }

    let cancelled = false;
    (async () => {
      try {
        const [p, r] = await Promise.all([fetchProfile(user.id), fetchRoles(user.id)]);
        if (cancelled) return;
        setProfile(p);
        setRoles(r);
      } catch {
        // RLS might block if profile not created yet; leave null.
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [user?.id]);

  const value = useMemo<AuthContextValue>(
    () => ({
      loading,
      session,
      user,
      profile,
      roles,
      isPoet: roles.includes("poet"),
      refreshProfile,
      refreshRoles,
      signOut: async () => {
        await supabase.auth.signOut();
      },
    }),
    [loading, session, user, profile, roles]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
