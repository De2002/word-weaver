import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Users, FileText, Calendar, BookOpen, MessageSquare, Flag, Shield, TrendingUp, Loader2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/context/AuthProvider";
import { useSEO } from "@/hooks/useSEO";
import { useAdminStats } from "@/hooks/useAdminStats";

export default function AdminDashboard() {
  useSEO({
    title: "Admin Dashboard",
    description: "Manage WordStack platform"
  });

  const { profile } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");
  const { data: stats, isLoading: statsLoading } = useAdminStats();

  const statCards = [
    { label: "Total Users", value: stats?.totalUsers ?? 0, icon: Users, color: "text-blue-500" },
    { label: "Published Poems", value: stats?.publishedPoems ?? 0, icon: FileText, color: "text-green-500" },
    { label: "Events", value: stats?.approvedEvents ?? 0, icon: Calendar, color: "text-purple-500" },
    { label: "Trails", value: stats?.publishedTrails ?? 0, icon: BookOpen, color: "text-orange-500" },
  ];

  const quickActions = [
    { label: "Manage Users", href: "/admin/users", icon: Users, description: "View and manage user accounts" },
    { label: "Content Moderation", href: "/admin/moderation", icon: Flag, description: "Review reported content" },
    { label: "Analytics", href: "/admin/analytics", icon: TrendingUp, description: "View platform statistics" },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border">
        <div className="flex items-center justify-between px-4 h-14 max-w-6xl mx-auto">
          <div className="flex items-center gap-3">
            <Link to="/profile" className="p-2 -ml-2 hover:bg-secondary rounded-full transition-colors">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              <h1 className="font-semibold">Admin Dashboard</h1>
            </div>
          </div>
          <Badge variant="secondary" className="bg-primary/10 text-primary">
            Admin
          </Badge>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 pb-24">
        {/* Welcome */}
        <div className="py-6 border-b border-border">
          <h2 className="text-2xl font-bold">
            Welcome back, {profile?.display_name || profile?.username || "Admin"}
          </h2>
          <p className="text-muted-foreground mt-1">
            Here's what's happening on WordStack today.
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-6">
          <TabsList className="grid w-full grid-cols-3 lg:w-auto lg:inline-flex">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="moderation">Moderation</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-6 space-y-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {statCards.map((stat) => (
                <Card key={stat.label}>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      {stat.label}
                    </CardTitle>
                    <stat.icon className={`h-4 w-4 ${stat.color}`} />
                  </CardHeader>
                  <CardContent>
                    {statsLoading ? (
                      <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                    ) : (
                      <div className="text-2xl font-bold">{stat.value.toLocaleString()}</div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Quick Actions */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
              <div className="grid gap-4 md:grid-cols-3">
                {quickActions.map((action) => (
                  <Card key={action.label} className="hover:bg-secondary/50 transition-colors cursor-pointer">
                    <CardHeader>
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/10 rounded-lg">
                          <action.icon className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <CardTitle className="text-base">{action.label}</CardTitle>
                          <CardDescription className="text-xs">
                            {action.description}
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                  </Card>
                ))}
              </div>
            </div>

            {/* Recent Activity Placeholder */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Latest actions on the platform</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Activity feed coming soon</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="moderation" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Content Moderation</CardTitle>
                <CardDescription>Review reported poems, comments, and users</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12 text-muted-foreground">
                  <Flag className="h-10 w-10 mx-auto mb-3 opacity-50" />
                  <p className="font-medium">No pending reports</p>
                  <p className="text-sm mt-1">Reported content will appear here for review</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Platform Settings</CardTitle>
                <CardDescription>Configure platform-wide settings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center py-12 text-muted-foreground">
                  <Shield className="h-10 w-10 mx-auto mb-3 opacity-50" />
                  <p className="font-medium">Settings panel coming soon</p>
                  <p className="text-sm mt-1">Platform configuration options will be available here</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
