import { useState } from 'react';
import { MoreVertical, Flag, Ban, Trash2 } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { ReportMessageDialog } from './ReportMessageDialog';
import { BlockUserDialog } from './BlockUserDialog';

interface MessageActionsProps {
  messageId: string;
  senderId: string;
  senderName: string;
  isOwnMessage: boolean;
  onDelete?: () => void;
  onBlocked?: () => void;
}

export function MessageActions({
  messageId,
  senderId,
  senderName,
  isOwnMessage,
  onDelete,
  onBlocked,
}: MessageActionsProps) {
  const [showReportDialog, setShowReportDialog] = useState(false);
  const [showBlockDialog, setShowBlockDialog] = useState(false);

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {!isOwnMessage && (
            <>
              <DropdownMenuItem onClick={() => setShowReportDialog(true)}>
                <Flag className="h-4 w-4 mr-2" />
                Report message
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setShowBlockDialog(true)}>
                <Ban className="h-4 w-4 mr-2" />
                Block user
              </DropdownMenuItem>
            </>
          )}
          {isOwnMessage && onDelete && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={onDelete} className="text-destructive">
                <Trash2 className="h-4 w-4 mr-2" />
                Delete message
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <ReportMessageDialog
        open={showReportDialog}
        onOpenChange={setShowReportDialog}
        messageId={messageId}
      />

      <BlockUserDialog
        open={showBlockDialog}
        onOpenChange={setShowBlockDialog}
        userId={senderId}
        userName={senderName}
        onBlocked={onBlocked}
      />
    </>
  );
}
