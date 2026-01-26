import { useEffect, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthProvider";
import { db } from "@/lib/db";
import { useSEO } from "@/hooks/useSEO";

export default function Profile() {
  useSEO({
    title: "Your Profile",
    description: "Manage your WordStack profile. Update your username, bio, avatar, and poet settings."
  });
  const { user, profile, isPoet, refreshProfile, refreshRoles, signOut } = useAuth();
  const { toast } = useToast();

  const profileLinks = (profile?.links || {}) as Record<string, string>;
  
  const [username, setUsername] = useState(profile?.username ?? "");
  const [displayName, setDisplayName] = useState(profile?.display_name ?? "");
  const [avatarUrl, setAvatarUrl] = useState(profile?.avatar_url ?? "");
  const [bio, setBio] = useState(profile?.bio ?? "");
  const [buyMeACoffeeUrl, setBuyMeACoffeeUrl] = useState(profileLinks.buyMeACoffee ?? "");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const links = (profile?.links || {}) as Record<string, string>;
    setUsername(profile?.username ?? "");
    setDisplayName(profile?.display_name ?? "");
    setAvatarUrl(profile?.avatar_url ?? "");
    setBio(profile?.bio ?? "");
    setBuyMeACoffeeUrl(links.buyMeACoffee ?? "");
  }, [profile?.user_id]);

  const saveProfile = async () => {
    if (!user) return;
    setSaving(true);
    const updatedLinks = {
      ...profileLinks,
      buyMeACoffee: buyMeACoffeeUrl.trim() || undefined,
    };
    // Remove undefined values
    Object.keys(updatedLinks).forEach(key => {
      if (updatedLinks[key] === undefined) delete updatedLinks[key];
    });
    
    const { error } = await db
      .from("profiles")
      .update({
        username: username.trim() || null,
        display_name: displayName.trim() || null,
        avatar_url: avatarUrl.trim() || null,
        bio: bio.trim() || null,
        links: updatedLinks,
      })
      .eq("user_id", user.id);
    setSaving(false);

    if (error) {
      toast({ title: "Couldn't save", description: error.message, variant: "destructive" });
      return;
    }
    await refreshProfile();
    toast({ title: "Saved", description: "Your profile was updated." });
  };

  const enablePoet = async () => {
    if (!user) return;
    const { error } = await db.from("user_roles").insert({ user_id: user.id, role: "poet" });
    if (error) {
      toast({ title: "Couldn't enable Poet mode", description: error.message, variant: "destructive" });
      return;
    }
    await refreshRoles();
    toast({ title: "Poet mode enabled", description: "You can now create drafts and publish poems." });
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border">
        <div className="flex items-center justify-between px-4 h-14 max-w-lg mx-auto">
          <Link to="/home" className="p-2 -ml-2 hover:bg-secondary rounded-full transition-colors">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <h1 className="font-semibold">Profile</h1>
          <Button variant="ghost" size="sm" onClick={() => signOut?.()}>Sign out</Button>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 pb-24">
        <div className="pt-6 pb-4 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <Input id="username" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="e.g. quietink" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="display">Display name</Label>
            <Input id="display" value={displayName} onChange={(e) => setDisplayName(e.target.value)} placeholder="e.g. James Chen" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="avatar">Avatar URL</Label>
            <Input id="avatar" value={avatarUrl} onChange={(e) => setAvatarUrl(e.target.value)} placeholder="https://…" />
            <p className="text-xs text-muted-foreground">We’ll add avatar upload next (for now, paste a link).</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="coffee">Buy Me a Coffee URL</Label>
            <Input 
              id="coffee" 
              value={buyMeACoffeeUrl} 
              onChange={(e) => setBuyMeACoffeeUrl(e.target.value)} 
              placeholder="https://buymeacoffee.com/yourname" 
            />
            <p className="text-xs text-muted-foreground">Add your tip link so readers can support you</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio">Bio</Label>
            <Textarea id="bio" value={bio} onChange={(e) => setBio(e.target.value)} className="bg-secondary/50" placeholder="Tell readers about your voice…" />
          </div>

          <div className="flex flex-wrap gap-2">
            <Button onClick={saveProfile} disabled={saving}>{saving ? 'Saving…' : 'Save profile'}</Button>
            {isPoet ? (
              <Button asChild variant="outline">
                <Link to="/my-poems">My Poems</Link>
              </Button>
            ) : (
              <Button variant="outline" onClick={enablePoet}>Enable Poet mode</Button>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
