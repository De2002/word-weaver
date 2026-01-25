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
import { useBlockUser } from '@/hooks/useBlockedUsers';
import { useToast } from '@/hooks/use-toast';

interface BlockUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
  userName: string;
  onBlocked?: () => void;
}

export function BlockUserDialog({
  open,
  onOpenChange,
  userId,
  userName,
  onBlocked,
}: BlockUserDialogProps) {
  const blockUser = useBlockUser();
  const { toast } = useToast();

  const handleBlock = async () => {
    try {
      await blockUser.mutateAsync(userId);
      toast({
        title: 'User blocked',
        description: `You will no longer receive messages from ${userName}.`,
      });
      onOpenChange(false);
      onBlocked?.();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to block user',
        variant: 'destructive',
      });
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Block {userName}?</AlertDialogTitle>
          <AlertDialogDescription>
            They won't be able to send you messages. You can unblock them later from your settings.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleBlock}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {blockUser.isPending ? 'Blocking...' : 'Block'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
