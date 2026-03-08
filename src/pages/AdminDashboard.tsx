import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Users, FileText, Calendar, BookOpen, MessageSquare, Flag, Shield, TrendingUp, Loader2, HelpCircle, MessageCircleQuestion, CheckCircle, Crown } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/context/AuthProvider";
import { useSEO } from "@/hooks/useSEO";
import { useAdminStats, useAdminQAStats, useAdminTopAnswerers } from "@/hooks/useAdminStats";
import { ClassicsAdminPanel } from "@/components/classics/ClassicsAdminPanel";
import { ModerationPanel } from "@/components/admin/ModerationPanel";
import { ChallengesAdminPanel } from "@/components/admin/ChallengesAdminPanel";

export default function AdminDashboard() {
  useSEO({
    title: "Admin Dashboard",
    description: "Manage WordStack platform"
  });

  const { profile } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");
  const { data: stats, isLoading: statsLoading } = useAdminStats();
  const { data: qaStats, isLoading: qaLoading } = useAdminQAStats();
  const { data: topAnswerers, isLoading: answerersLoading } = useAdminTopAnswerers();

  const statCards = [
    { label: "Total Users", value: stats?.totalUsers ?? 0, icon: Users, color: "text-blue-500" },
    { label: "Published Poems", value: stats?.publishedPoems ?? 0, icon: FileText, color: "text-green-500" },
    { label: "Events", value: stats?.approvedEvents ?? 0, icon: Calendar, color: "text-purple-500" },
    { label: "Trails", value: stats?.publishedTrails ?? 0, icon: BookOpen, color: "text-orange-500" },
  ];

  const qaStatCards = [
    {
      label: "Total Questions",
      value: qaStats?.totalQuestions ?? 0,
      icon: HelpCircle,
      color: "text-blue-500",
      description: "All questions ever asked",
    },
    {
      label: "Total Answers",
      value: qaStats?.totalAnswers ?? 0,
      icon: MessageSquare,
      color: "text-green-500",
      description: "Answers by Pro Poets",
    },
    {
      label: "Unanswered",
      value: qaStats?.unansweredQuestions ?? 0,
      icon: MessageCircleQuestion,
      color: qaStats?.unansweredQuestions ? "text-amber-500" : "text-muted-foreground",
      description: "Questions awaiting an answer",
    },
    {
      label: "Answer Rate",
      value: qaStats?.totalQuestions
        ? `${Math.round(((qaStats.totalQuestions - (qaStats.unansweredQuestions ?? 0)) / qaStats.totalQuestions) * 100)}%`
        : "—",
      icon: CheckCircle,
      color: "text-primary",
      description: "Questions with at least one answer",
      isText: true,
    },
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
          <TabsList className="grid w-full grid-cols-5 lg:w-auto lg:inline-flex">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="challenges">Challenges</TabsTrigger>
            <TabsTrigger value="classics">Classics</TabsTrigger>
            <TabsTrigger value="moderation">Moderation</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-6 space-y-8">
            {/* Platform Stats */}
            <div>
              <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide mb-4">Platform</h3>
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
            </div>

            {/* Q&A Stats */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Q&A</h3>
                <Link to="/qa" className="text-xs text-primary hover:underline">View Q&A →</Link>
              </div>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {qaStatCards.map((stat) => (
                  <Card key={stat.label}>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                      <CardTitle className="text-sm font-medium text-muted-foreground">
                        {stat.label}
                      </CardTitle>
                      <stat.icon className={`h-4 w-4 ${stat.color}`} />
                    </CardHeader>
                    <CardContent>
                      {qaLoading ? (
                        <Skeleton className="h-8 w-16" />
                      ) : (
                        <>
                          <div className="text-2xl font-bold">
                            {stat.isText ? stat.value : (stat.value as number).toLocaleString()}
                          </div>
                          <p className="text-[11px] text-muted-foreground mt-0.5">{stat.description}</p>
                        </>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Top Pro Poet Answerers */}
              <Card className="mt-4">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2">
                    <Crown className="h-4 w-4 text-amber-500" />
                    <CardTitle className="text-base">Top Pro Poet Answerers</CardTitle>
                  </div>
                  <CardDescription>Pro Poets with the most answers</CardDescription>
                </CardHeader>
                <CardContent>
                  {answerersLoading ? (
                    <div className="space-y-3">
                      {Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} className="flex items-center gap-3">
                          <Skeleton className="h-8 w-8 rounded-full" />
                          <div className="flex-1">
                            <Skeleton className="h-3.5 w-32 mb-1.5" />
                            <Skeleton className="h-3 w-20" />
                          </div>
                          <Skeleton className="h-6 w-12 rounded-full" />
                        </div>
                      ))}
                    </div>
                  ) : !topAnswerers || topAnswerers.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-40" />
                      <p className="text-sm">No answers posted yet</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {topAnswerers.map((answerer, index) => (
                        <div key={answerer.user_id} className="flex items-center gap-3">
                          <span className="text-sm font-bold text-muted-foreground w-5 text-center">
                            {index + 1}
                          </span>
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={answerer.avatar_url || undefined} />
                            <AvatarFallback className="text-xs">
                              {(answerer.display_name || answerer.username || 'A')[0].toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <Link
                              to={`/poet/${answerer.username}`}
                              className="text-sm font-medium hover:underline truncate block"
                            >
                              {answerer.display_name || `@${answerer.username}`}
                            </Link>
                            {answerer.username && (
                              <span className="text-xs text-muted-foreground">@{answerer.username}</span>
                            )}
                          </div>
                          <Badge className="text-xs bg-amber-500/15 text-amber-600 border-amber-500/25 shrink-0">
                            {answerer.answer_count} {answerer.answer_count === 1 ? 'answer' : 'answers'}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <div>
              <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide mb-4">Quick Actions</h3>
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

          <TabsContent value="classics" className="mt-6">
            <ClassicsAdminPanel />
          </TabsContent>

          <TabsContent value="moderation" className="mt-6">
            <ModerationPanel />
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
