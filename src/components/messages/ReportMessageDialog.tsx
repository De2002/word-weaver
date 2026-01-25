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
import { useReportMessage, REPORT_REASONS, ReportReason } from '@/hooks/useMessageReports';
import { useToast } from '@/hooks/use-toast';

interface ReportMessageDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  messageId: string;
}

export function ReportMessageDialog({ open, onOpenChange, messageId }: ReportMessageDialogProps) {
  const [reason, setReason] = useState<ReportReason | ''>('');
  const [details, setDetails] = useState('');
  const reportMessage = useReportMessage();
  const { toast } = useToast();

  const handleSubmit = async () => {
    if (!reason) return;

    try {
      await reportMessage.mutateAsync({
        messageId,
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
          <DialogTitle>Report Message</DialogTitle>
          <DialogDescription>
            Help us understand what's wrong with this message.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <RadioGroup value={reason} onValueChange={(v) => setReason(v as ReportReason)}>
            {REPORT_REASONS.map((r) => (
              <div key={r.value} className="flex items-center space-x-2">
                <RadioGroupItem value={r.value} id={r.value} />
                <Label htmlFor={r.value} className="cursor-pointer">
                  {r.label}
                </Label>
              </div>
            ))}
          </RadioGroup>

          <div className="space-y-2">
            <Label htmlFor="details">Additional details (optional)</Label>
            <Textarea
              id="details"
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
            disabled={!reason || reportMessage.isPending}
            variant="destructive"
          >
            {reportMessage.isPending ? 'Submitting...' : 'Submit Report'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
