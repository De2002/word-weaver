import { useState } from 'react';
import { Droplets } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer';
import { useInkPour } from '@/hooks/useInkPour';
import { useAuth } from '@/context/AuthProvider';
import { toast } from '@/hooks/use-toast';

interface InkPourDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  poemId: string;
  poetUserId: string;
}

const INK_OPTIONS = [5, 10, 25, 50, 100];

export function InkPourDrawer({ open, onOpenChange, poemId, poetUserId }: InkPourDrawerProps) {
  const { session } = useAuth();
  const { balance, pourInk, isPouring } = useInkPour();
  const [selected, setSelected] = useState<number | null>(null);

  const handlePour = () => {
    if (!session?.user) {
      toast({ title: 'Sign in required', description: 'Please sign in to pour ink.' });
      onOpenChange(false);
      return;
    }
    if (session.user.id === poetUserId) {
      toast({ title: 'Cannot pour', description: "You can't pour ink on your own poem." });
      onOpenChange(false);
      return;
    }
    if (!selected) return;
    pourInk(
      { poemId, poetUserId, amount: selected },
      {
        onSuccess: () => {
          setSelected(null);
          onOpenChange(false);
        },
      },
    );
  };

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle className="flex items-center gap-2">
            <Droplets className="h-5 w-5 text-primary" />
            Pour ink
          </DrawerTitle>
          <DrawerDescription>
            Support this poem. You have <span className="font-semibold text-foreground">{balance} ink</span> available.
          </DrawerDescription>
        </DrawerHeader>
        <div className="px-4 pb-2 grid grid-cols-3 gap-2">
          {INK_OPTIONS.map((amount) => (
            <Button
              key={amount}
              variant={selected === amount ? 'default' : 'outline'}
              className="h-11"
              disabled={balance < amount}
              onClick={() => setSelected(amount)}
            >
              {amount} ink
            </Button>
          ))}
        </div>
        <DrawerFooter className="flex-row gap-2">
          <Button variant="secondary" className="flex-1" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            className="flex-1"
            disabled={!selected || isPouring}
            onClick={handlePour}
          >
            {isPouring ? 'Pouring...' : `Pour ${selected ?? ''} ink`}
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
