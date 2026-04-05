import { useEffect, useState } from "react";
import { ArrowLeft, Sparkles, Twitter, Instagram, Globe, Pin } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthProvider";
import { db } from "@/lib/db";
import { useSEO } from "@/hooks/useSEO";
import { AvatarUpload } from "@/components/AvatarUpload";
import { HeaderImageUpload } from "@/components/HeaderImageUpload";
import { useQuery } from "@tanstack/react-query";

export default function Profile() {
  useSEO({
    title: "Your Profile",
    description: "Manage your WordStack profile. Update your username, bio, avatar, and poet settings."
  });
  const { user, profile, roles, refreshProfile, signOut } = useAuth();
  const { toast } = useToast();

  const profileLinks = (profile?.links || {}) as Record<string, string>;

  const [username, setUsername] = useState(profile?.username ?? "");
  const [displayName, setDisplayName] = useState(profile?.display_name ?? "");
  const [avatarUrl, setAvatarUrl] = useState(profile?.avatar_url ?? "");
  const [bio, setBio] = useState(profile?.bio ?? "");
  const [about, setAbout] = useState((profile as any)?.about ?? "");
  const [headerImage, setHeaderImage] = useState<string | null>(profile?.header_image ?? null);
  const [pinnedPoemId, setPinnedPoemId] = useState<string>((profile as any)?.pinned_poem_id ?? "none");
  const [twitterUrl, setTwitterUrl] = useState(profileLinks.twitter ?? "");
  const [instagramUrl, setInstagramUrl] = useState(profileLinks.instagram ?? "");
  const [websiteUrl, setWebsiteUrl] = useState(profileLinks.website ?? "");
  const [saving, setSaving] = useState(false);

  // Fetch published poems for the pin selector
  const { data: publishedPoems = [] } = useQuery({
    queryKey: ["my-published-poems", user?.id],
    queryFn: async () => {
      const { data, error } = await db
        .from("poems")
        .select("id, title, slug, content")
        .eq("user_id", user!.id)
        .eq("status", "published")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data || [];
    },
    enabled: !!user,
  });

  useEffect(() => {
    const links = (profile?.links || {}) as Record<string, string>;
    setUsername(profile?.username ?? "");
    setDisplayName(profile?.display_name ?? "");
    setAvatarUrl(profile?.avatar_url ?? "");
    setBio(profile?.bio ?? "");
    setAbout((profile as any)?.about ?? "");
    setHeaderImage(profile?.header_image ?? null);
    setPinnedPoemId((profile as any)?.pinned_poem_id ?? "none");
    setTwitterUrl(links.twitter ?? "");
    setInstagramUrl(links.instagram ?? "");
    setWebsiteUrl(links.website ?? "");
  }, [profile?.user_id]);

  const saveProfile = async () => {
    if (!user) return;
    setSaving(true);

    const updatedLinks: Record<string, string> = {};
    if (twitterUrl.trim()) updatedLinks.twitter = twitterUrl.trim();
    if (instagramUrl.trim()) updatedLinks.instagram = instagramUrl.trim();
    if (websiteUrl.trim()) updatedLinks.website = websiteUrl.trim();

    const updatePayload: Record<string, unknown> = {
      username: username.trim() || null,
      display_name: displayName.trim() || null,
      avatar_url: avatarUrl.trim() || null,
      bio: bio.trim() || null,
    };

    // Only include pro-exclusive fields for pro users
    if (isPro) {
      updatePayload.about = about.trim() || null;
      updatePayload.links = updatedLinks;
      updatePayload.header_image = headerImage || null;
      updatePayload.pinned_poem_id = (pinnedPoemId && pinnedPoemId !== "none") ? pinnedPoemId : null;
    }

    const { error } = await db
      .from("profiles")
      .update(updatePayload)
      .eq("user_id", user.id);
    setSaving(false);

    if (error) {
      toast({ title: "Couldn't save", description: error.message, variant: "destructive" });
      return;
    }
    await refreshProfile();
    toast({ title: "Saved", description: "Your profile was updated." });
  };

  const isPro = roles.includes("pro");

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border">
        <div className="flex items-center justify-between px-4 h-14 max-w-lg mx-auto">
          <Link to="/" className="p-2 -ml-2 hover:bg-secondary rounded-full transition-colors">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <h1 className="font-semibold">Profile</h1>
          <Button variant="ghost" size="sm" onClick={() => signOut?.()}>Sign out</Button>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 pb-24">
        <div className="pt-6 pb-4 space-y-5">

          {/* Profile Banner — Pro only */}
          {isPro ? (
            <div className="space-y-2 pb-5 border-b border-border">
              <div className="flex items-center gap-2 mb-1">
                <Sparkles className="h-4 w-4 text-primary" />
                <Label className="text-sm font-semibold">Profile Banner</Label>
              </div>
              <p className="text-xs text-muted-foreground mb-2">
                This banner appears at the top of your public poet profile.
              </p>
              <HeaderImageUpload
                userId={user.id}
                currentHeaderUrl={headerImage}
                onUploadComplete={(url) => setHeaderImage(url)}
              />
            </div>
          ) : (
            <div className="p-4 rounded-xl border border-border bg-secondary/30 pb-5 border-b">
              <div className="flex items-center gap-2 mb-1">
                <Sparkles className="h-4 w-4 text-muted-foreground" />
                <Label className="text-sm font-semibold text-muted-foreground">Profile Banner</Label>
              </div>
              <p className="text-xs text-muted-foreground mb-3">Customize your profile header with a banner image.</p>
              <Button asChild variant="outline" size="sm">
                <Link to="/upgrade">Upgrade to Pro to unlock</Link>
              </Button>
            </div>
          )}

          {/* Avatar Upload */}
          <div className="flex flex-col items-center gap-3 pb-5 border-b border-border">
            <AvatarUpload
              userId={user.id}
              currentAvatarUrl={avatarUrl}
              displayName={displayName || username || "User"}
              onUploadComplete={(url) => setAvatarUrl(url)}
              size="lg"
            />
            <p className="text-sm text-muted-foreground">Tap to change your photo</p>
          </div>

          {/* Basic info */}
          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <Input id="username" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="e.g. quietink" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="display">Display name</Label>
            <Input id="display" value={displayName} onChange={(e) => setDisplayName(e.target.value)} placeholder="e.g. James Chen" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio">Short bio</Label>
            <Textarea id="bio" value={bio} onChange={(e) => setBio(e.target.value)} className="bg-secondary/50 resize-none" rows={2} placeholder="Tell readers about your voice…" />
          </div>

          {/* About section — Pro only */}
          {isPro ? (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Label htmlFor="about">About</Label>
              </div>
              <Textarea
                id="about"
                value={about}
                onChange={(e) => setAbout(e.target.value)}
                className="bg-secondary/50 resize-none"
                rows={4}
                placeholder="Write a longer description about yourself, your poetry journey, influences…"
              />
              <p className="text-xs text-muted-foreground">Shown on the About tab of your public profile.</p>
            </div>
          ) : (
            <div className="p-4 rounded-xl border border-border bg-secondary/30">
              <Label className="text-sm font-semibold text-muted-foreground">About</Label>
              <p className="text-xs text-muted-foreground mt-1 mb-3">Share your poetry journey with a longer bio on your profile.</p>
              <Button asChild variant="outline" size="sm">
                <Link to="/upgrade">Upgrade to Pro to unlock</Link>
              </Button>
            </div>
          )}

          {/* Pin a poem — Pro only */}
          {isPro ? (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Pin className="h-4 w-4 text-primary" />
                <Label htmlFor="pinned-poem">Pinned Poem</Label>
              </div>
              <Select value={pinnedPoemId} onValueChange={setPinnedPoemId}>
                <SelectTrigger id="pinned-poem" className="bg-secondary/50">
                  <SelectValue placeholder="Choose a poem to pin…" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">— No pinned poem —</SelectItem>
                  {publishedPoems.map((poem: any) => (
                    <SelectItem key={poem.id} value={poem.id}>
                      {poem.title || poem.content.slice(0, 40) + "…"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">This poem appears pinned at the top of your public profile.</p>
            </div>
          ) : (
            <div className="p-4 rounded-xl border border-border bg-secondary/30">
              <div className="flex items-center gap-2">
                <Pin className="h-4 w-4 text-muted-foreground" />
                <Label className="text-sm font-semibold text-muted-foreground">Pinned Poem</Label>
              </div>
              <p className="text-xs text-muted-foreground mt-1 mb-3">Pin your best poem to the top of your profile.</p>
              <Button asChild variant="outline" size="sm">
                <Link to="/upgrade">Upgrade to Pro to unlock</Link>
              </Button>
            </div>
          )}

          <Separator />

          {/* Social links — Pro only */}
          {isPro ? (
            <div className="space-y-4 p-4 rounded-xl bg-secondary/30 border border-border">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" />
                <p className="text-sm font-semibold">Social Links</p>
              </div>
              <p className="text-xs text-muted-foreground -mt-2">These appear on the Links tab of your public profile.</p>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Twitter className="h-4 w-4 text-muted-foreground shrink-0" />
                  <Label htmlFor="twitter" className="text-sm">Twitter / X</Label>
                </div>
                <Input
                  id="twitter"
                  value={twitterUrl}
                  onChange={(e) => setTwitterUrl(e.target.value)}
                  placeholder="https://twitter.com/yourhandle"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Instagram className="h-4 w-4 text-muted-foreground shrink-0" />
                  <Label htmlFor="instagram" className="text-sm">Instagram</Label>
                </div>
                <Input
                  id="instagram"
                  value={instagramUrl}
                  onChange={(e) => setInstagramUrl(e.target.value)}
                  placeholder="https://instagram.com/yourhandle"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Globe className="h-4 w-4 text-muted-foreground shrink-0" />
                  <Label htmlFor="website" className="text-sm">Website</Label>
                </div>
                <Input
                  id="website"
                  value={websiteUrl}
                  onChange={(e) => setWebsiteUrl(e.target.value)}
                  placeholder="https://yourwebsite.com"
                />
              </div>
            </div>
          ) : (
            <div className="p-4 rounded-xl border border-border bg-secondary/30">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-muted-foreground" />
                <p className="text-sm font-semibold text-muted-foreground">Social Links</p>
              </div>
              <p className="text-xs text-muted-foreground mt-1 mb-3">Add your Twitter, Instagram, and website links to your profile.</p>
              <Button asChild variant="outline" size="sm">
                <Link to="/upgrade">Upgrade to Pro to unlock</Link>
              </Button>
            </div>
          )}


          <div className="flex flex-wrap gap-2 pt-1">
            <Button onClick={saveProfile} disabled={saving}>{saving ? 'Saving…' : 'Save profile'}</Button>
            <Button asChild variant="outline">
              <Link to="/my-poems">My Poems</Link>
            </Button>
            {roles.includes("admin") && (
              <Button asChild variant="outline" className="border-primary/50 text-primary hover:bg-primary/10">
                <Link to="/admin">Admin Dashboard</Link>
              </Button>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
