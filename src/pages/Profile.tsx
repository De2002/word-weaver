export default function Profile() {
  // Profile is now a self-managed page (no mock user).
  // Public poet profiles can be added later.
  const { user, profile, isPoet, refreshProfile, refreshRoles, signOut } = require('@/context/AuthProvider').useAuth?.() ?? {};

  const [username, setUsername] = useState(profile?.username ?? '');
  const [displayName, setDisplayName] = useState(profile?.display_name ?? '');
  const [avatarUrl, setAvatarUrl] = useState(profile?.avatar_url ?? '');
  const [bio, setBio] = useState(profile?.bio ?? '');
  const [saving, setSaving] = useState(false);

  const { toast } = require('@/hooks/use-toast').useToast?.() ?? {};
  const supabaseClient = require('@/integrations/supabase/client').supabase;

  useEffect(() => {
    setUsername(profile?.username ?? '');
    setDisplayName(profile?.display_name ?? '');
    setAvatarUrl(profile?.avatar_url ?? '');
    setBio(profile?.bio ?? '');
  }, [profile?.user_id]);

  const saveProfile = async () => {
    if (!user) return;
    setSaving(true);
    const { error } = await supabaseClient
      .from('profiles')
      .update({
        username: username.trim() || null,
        display_name: displayName.trim() || null,
        avatar_url: avatarUrl.trim() || null,
        bio: bio.trim() || null,
      })
      .eq('user_id', user.id);
    setSaving(false);
    if (error) {
      toast?.({ title: 'Couldn\'t save', description: error.message, variant: 'destructive' });
      return;
    }
    await refreshProfile?.();
    toast?.({ title: 'Saved', description: 'Your profile was updated.' });
  };

  const enablePoet = async () => {
    if (!user) return;
    const { error } = await supabaseClient.from('user_roles').insert({ user_id: user.id, role: 'poet' });
    if (error) {
      toast?.({ title: 'Couldn\'t enable Poet mode', description: error.message, variant: 'destructive' });
      return;
    }
    await refreshRoles?.();
    toast?.({ title: 'Poet mode enabled', description: 'You can now create drafts and publish poems.' });
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="max-w-sm w-full rounded-2xl border border-border bg-card p-6">
          <h1 className="text-xl font-semibold">Profile</h1>
          <p className="mt-2 text-sm text-muted-foreground">Sign in to manage your profile.</p>
          <Button asChild className="mt-4 w-full">
            <a href="/login">Sign in</a>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border">
        <div className="flex items-center justify-between px-4 h-14 max-w-lg mx-auto">
          <a href="/home" className="p-2 -ml-2 hover:bg-secondary rounded-full transition-colors">
            <ArrowLeft className="h-5 w-5" />
          </a>
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
            <Label htmlFor="bio">Bio</Label>
            <Textarea id="bio" value={bio} onChange={(e) => setBio(e.target.value)} className="bg-secondary/50" placeholder="Tell readers about your voice…" />
          </div>

          <div className="flex flex-wrap gap-2">
            <Button onClick={saveProfile} disabled={saving}>{saving ? 'Saving…' : 'Save profile'}</Button>
            {isPoet ? (
              <Button asChild variant="outline">
                <a href="/my-poems">My Poems</a>
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
