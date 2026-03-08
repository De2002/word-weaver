import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { useReportUser, USER_REPORT_REASONS, UserReportReason } from '@/hooks/useUserReports';
import { useToast } from '@/hooks/use-toast';

interface ReportUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
  userName: string;
}

export function ReportUserDialog({ open, onOpenChange, userId, userName }: ReportUserDialogProps) {
  const [reason, setReason] = useState<UserReportReason | ''>('');
  const [details, setDetails] = useState('');
  const reportUser = useReportUser();
  const { toast } = useToast();

  const handleSubmit = async () => {
    if (!reason) return;

    try {
      await reportUser.mutateAsync({
        reportedUserId: userId,
        reason,
        details: details || undefined,
      });

      toast({
        title: 'Report submitted',
        description: 'Thank you for helping keep our community safe.',
      });

      onOpenChange(false);
      setReason('');
      setDetails('');
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to submit report',
        variant: 'destructive',
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Report {userName}</DialogTitle>
          <DialogDescription>
            Help us understand why you're reporting this user.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <RadioGroup value={reason} onValueChange={(v) => setReason(v as UserReportReason)}>
            {USER_REPORT_REASONS.map((r) => (
              <div key={r.value} className="flex items-center space-x-2">
                <RadioGroupItem value={r.value} id={`user-${r.value}`} />
                <Label htmlFor={`user-${r.value}`} className="cursor-pointer">
                  {r.label}
                </Label>
              </div>
            ))}
          </RadioGroup>

          <div className="space-y-2">
            <Label htmlFor="user-details">Additional details (optional)</Label>
            <Textarea
              id="user-details"
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              placeholder="Provide any additional context..."
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!reason || reportUser.isPending}
            variant="destructive"
          >
            {reportUser.isPending ? 'Submitting...' : 'Submit Report'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
