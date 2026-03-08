import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Flag, User, MessageSquare, Ban, ShieldX, Trash2, CheckCircle, RotateCcw, ChevronDown, ChevronUp, Clock, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { Textarea } from '@/components/ui/textarea';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useAdminUserReports, useAdminMessageReports, useAdminAccountAction, useAdminMessageReportAction, AccountAction, UserReport } from '@/hooks/useUserReports';
import { useToast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-amber-500/15 text-amber-600 border-amber-500/25',
  resolved: 'bg-green-500/15 text-green-600 border-green-500/25',
  dismissed: 'bg-muted text-muted-foreground',
};

const ACCOUNT_STATUS_COLORS: Record<string, string> = {
  active: 'bg-green-500/15 text-green-600 border-green-500/25',
  suspended: 'bg-amber-500/15 text-amber-600 border-amber-500/25',
  banned: 'bg-red-500/15 text-red-600 border-red-500/25',
  terminated: 'bg-destructive/15 text-destructive border-destructive/25',
};

function UserReportRow({ report }: { report: UserReport }) {
  const [expanded, setExpanded] = useState(false);
  const [confirmAction, setConfirmAction] = useState<AccountAction | null>(null);
  const [adminNote, setAdminNote] = useState('');
  const accountAction = useAdminAccountAction();
  const { toast } = useToast();

  const accountStatus = report.reported?.account_status || 'active';

  const handleAction = async (action: AccountAction) => {
    try {
      await accountAction.mutateAsync({
        targetUserId: report.reported_user_id,
        action,
        reportId: report.id,
        adminNote,
      });
      toast({
        title: 'Action applied',
        description: `User has been ${action === 'restore' ? 'restored' : action + 'd'}.`,
      });
      setConfirmAction(null);
      setAdminNote('');
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    }
  };

  const actionLabels: Record<AccountAction, string> = {
    suspend: 'Suspend account',
    ban: 'Ban account',
    terminate: 'Terminate account',
    restore: 'Restore account',
  };

  const actionDescriptions: Record<AccountAction, string> = {
    suspend: 'Temporarily restrict this user from using the platform.',
    ban: 'Permanently ban this user from the platform.',
    terminate: 'Permanently delete all content and access for this user.',
    restore: 'Restore full platform access for this user.',
  };

  return (
    <div className="border border-border rounded-xl overflow-hidden">
      <div
        className="flex items-center gap-3 p-4 cursor-pointer hover:bg-secondary/30 transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <Avatar className="h-9 w-9 shrink-0">
          <AvatarImage src={report.reported?.avatar_url || undefined} />
          <AvatarFallback className="text-xs">
            {(report.reported?.display_name || report.reported?.username || '?')[0].toUpperCase()}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <Link
              to={`/poet/${report.reported?.username}`}
              className="font-medium text-sm hover:underline"
              onClick={e => e.stopPropagation()}
            >
              {report.reported?.display_name || `@${report.reported?.username}` || 'Unknown user'}
            </Link>
            <Badge className={`text-[10px] ${ACCOUNT_STATUS_COLORS[accountStatus] || ''}`}>
              {accountStatus}
            </Badge>
            <Badge className={`text-[10px] ${STATUS_COLORS[report.status] || ''}`}>
              {report.status}
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            Reported for <span className="font-medium">{report.reason.replace(/_/g, ' ')}</span>
            {' · '}
            {formatDistanceToNow(new Date(report.created_at), { addSuffix: true })}
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {report.status === 'pending' && accountStatus === 'active' && (
            <AlertTriangle className="h-4 w-4 text-amber-500" />
          )}
          {expanded ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
        </div>
      </div>

      {expanded && (
        <div className="border-t border-border p-4 space-y-4 bg-secondary/20">
          {/* Reporter info */}
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span>Reported by:</span>
            <Link to={`/poet/${report.reporter?.username}`} className="font-medium hover:underline">
              {report.reporter?.display_name || `@${report.reporter?.username}` || 'Unknown'}
            </Link>
          </div>

          {/* Details */}
          {report.details && (
            <div className="bg-background rounded-lg p-3 text-sm text-foreground/80 border border-border">
              "{report.details}"
            </div>
          )}

          {/* Admin note (if already reviewed) */}
          {report.admin_note && (
            <div className="bg-primary/5 rounded-lg p-3 text-sm border border-primary/20">
              <p className="text-[10px] font-bold uppercase tracking-wider text-primary mb-1">Admin Note</p>
              <p>{report.admin_note}</p>
            </div>
          )}

          {/* Action area */}
          {report.status === 'pending' && (
            <div className="space-y-3">
              <Textarea
                placeholder="Add an internal note (optional)..."
                value={adminNote}
                onChange={e => setAdminNote(e.target.value)}
                rows={2}
                className="text-sm"
              />
              <div className="flex flex-wrap gap-2">
                {accountStatus !== 'suspended' && accountStatus !== 'banned' && accountStatus !== 'terminated' && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-amber-500/50 text-amber-600 hover:bg-amber-500/10 text-xs"
                    onClick={() => setConfirmAction('suspend')}
                    disabled={accountAction.isPending}
                  >
                    <Clock className="h-3.5 w-3.5 mr-1.5" />
                    Suspend
                  </Button>
                )}
                {accountStatus !== 'banned' && accountStatus !== 'terminated' && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-red-500/50 text-red-600 hover:bg-red-500/10 text-xs"
                    onClick={() => setConfirmAction('ban')}
                    disabled={accountAction.isPending}
                  >
                    <Ban className="h-3.5 w-3.5 mr-1.5" />
                    Ban
                  </Button>
                )}
                {accountStatus !== 'terminated' && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-destructive/50 text-destructive hover:bg-destructive/10 text-xs"
                    onClick={() => setConfirmAction('terminate')}
                    disabled={accountAction.isPending}
                  >
                    <Trash2 className="h-3.5 w-3.5 mr-1.5" />
                    Terminate
                  </Button>
                )}
                {(accountStatus === 'suspended' || accountStatus === 'banned') && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-green-500/50 text-green-600 hover:bg-green-500/10 text-xs"
                    onClick={() => setConfirmAction('restore')}
                    disabled={accountAction.isPending}
                  >
                    <RotateCcw className="h-3.5 w-3.5 mr-1.5" />
                    Restore
                  </Button>
                )}
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-xs text-muted-foreground"
                  onClick={() => handleAction('restore')}
                  disabled={accountAction.isPending}
                >
                  <CheckCircle className="h-3.5 w-3.5 mr-1.5" />
                  Dismiss report
                </Button>
              </div>
            </div>
          )}

          {/* Already-reviewed indicator */}
          {report.status === 'resolved' && report.reviewed_at && (
            <p className="text-xs text-muted-foreground">
              Resolved {formatDistanceToNow(new Date(report.reviewed_at), { addSuffix: true })}
            </p>
          )}
        </div>
      )}

      {/* Confirm dialog */}
      <AlertDialog open={!!confirmAction} onOpenChange={() => setConfirmAction(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {confirmAction ? actionLabels[confirmAction] : ''}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {confirmAction ? actionDescriptions[confirmAction] : ''} This action will be recorded.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => confirmAction && handleAction(confirmAction)}
              className={confirmAction === 'terminate' ? 'bg-destructive text-destructive-foreground hover:bg-destructive/90' : ''}
            >
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function MessageReportRow({ report }: { report: any }) {
  const [expanded, setExpanded] = useState(false);
  const messageAction = useAdminMessageReportAction();
  const { toast } = useToast();

  const handleAction = async (status: 'resolved' | 'dismissed') => {
    try {
      await messageAction.mutateAsync({ reportId: report.id, status });
      toast({ title: status === 'resolved' ? 'Report resolved' : 'Report dismissed' });
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    }
  };

  return (
    <div className="border border-border rounded-xl overflow-hidden">
      <div
        className="flex items-center gap-3 p-4 cursor-pointer hover:bg-secondary/30 transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="h-9 w-9 rounded-full bg-secondary flex items-center justify-center shrink-0">
          <MessageSquare className="h-4 w-4 text-muted-foreground" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-medium text-sm">
              {report.reporter?.display_name || `@${report.reporter?.username}` || 'Unknown'}
            </span>
            <Badge className={`text-[10px] ${STATUS_COLORS[report.status] || ''}`}>
              {report.status}
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            Reported message · <span className="font-medium">{report.reason.replace(/_/g, ' ')}</span>
            {' · '}
            {formatDistanceToNow(new Date(report.created_at), { addSuffix: true })}
          </p>
        </div>
        {expanded ? <ChevronUp className="h-4 w-4 text-muted-foreground shrink-0" /> : <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />}
      </div>

      {expanded && (
        <div className="border-t border-border p-4 space-y-3 bg-secondary/20">
          {report.details && (
            <div className="bg-background rounded-lg p-3 text-sm text-foreground/80 border border-border">
              "{report.details}"
            </div>
          )}
          {report.status === 'pending' && (
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                className="text-xs border-green-500/50 text-green-600 hover:bg-green-500/10"
                onClick={() => handleAction('resolved')}
                disabled={messageAction.isPending}
              >
                <CheckCircle className="h-3.5 w-3.5 mr-1.5" />
                Mark resolved
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="text-xs text-muted-foreground"
                onClick={() => handleAction('dismissed')}
                disabled={messageAction.isPending}
              >
                Dismiss
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function ModerationPanel() {
  const { data: userReports, isLoading: userLoading } = useAdminUserReports();
  const { data: messageReports, isLoading: msgLoading } = useAdminMessageReports();

  const pendingUserReports = userReports?.filter(r => r.status === 'pending') || [];
  const pendingMsgReports = messageReports?.filter((r: any) => r.status === 'pending') || [];
  const totalPending = pendingUserReports.length + pendingMsgReports.length;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-destructive/10 rounded-xl">
          <Flag className="h-5 w-5 text-destructive" />
        </div>
        <div>
          <h2 className="font-semibold">Content Moderation</h2>
          <p className="text-sm text-muted-foreground">
            {totalPending > 0 ? `${totalPending} pending report${totalPending !== 1 ? 's' : ''}` : 'No pending reports'}
          </p>
        </div>
      </div>

      <Tabs defaultValue="users">
        <TabsList>
          <TabsTrigger value="users" className="gap-2">
            <User className="h-3.5 w-3.5" />
            User Reports
            {pendingUserReports.length > 0 && (
              <Badge className="ml-1 h-4 px-1.5 text-[10px] bg-destructive text-destructive-foreground">
                {pendingUserReports.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="messages" className="gap-2">
            <MessageSquare className="h-3.5 w-3.5" />
            Message Reports
            {pendingMsgReports.length > 0 && (
              <Badge className="ml-1 h-4 px-1.5 text-[10px] bg-destructive text-destructive-foreground">
                {pendingMsgReports.length}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="mt-4 space-y-3">
          {userLoading ? (
            Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-16 rounded-xl" />)
          ) : !userReports || userReports.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center py-12 text-center text-muted-foreground">
                <ShieldX className="h-10 w-10 mb-3 opacity-40" />
                <p className="font-medium">No user reports</p>
                <p className="text-sm mt-1">Reported users will appear here</p>
              </CardContent>
            </Card>
          ) : (
            <>
              {pendingUserReports.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs font-bold uppercase tracking-wider text-amber-600">Pending</p>
                  {pendingUserReports.map(r => <UserReportRow key={r.id} report={r} />)}
                </div>
              )}
              {userReports.filter(r => r.status !== 'pending').length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mt-4">Reviewed</p>
                  {userReports.filter(r => r.status !== 'pending').map(r => (
                    <UserReportRow key={r.id} report={r} />
                  ))}
                </div>
              )}
            </>
          )}
        </TabsContent>

        <TabsContent value="messages" className="mt-4 space-y-3">
          {msgLoading ? (
            Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-16 rounded-xl" />)
          ) : !messageReports || messageReports.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center py-12 text-center text-muted-foreground">
                <MessageSquare className="h-10 w-10 mb-3 opacity-40" />
                <p className="font-medium">No message reports</p>
                <p className="text-sm mt-1">Reported messages will appear here</p>
              </CardContent>
            </Card>
          ) : (
            <>
              {pendingMsgReports.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs font-bold uppercase tracking-wider text-amber-600">Pending</p>
                  {pendingMsgReports.map((r: any) => <MessageReportRow key={r.id} report={r} />)}
                </div>
              )}
              {messageReports.filter((r: any) => r.status !== 'pending').length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mt-4">Reviewed</p>
                  {messageReports.filter((r: any) => r.status !== 'pending').map((r: any) => (
                    <MessageReportRow key={r.id} report={r} />
                  ))}
                </div>
              )}
            </>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
