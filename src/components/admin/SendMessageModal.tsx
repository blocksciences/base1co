import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useState } from 'react';
import { toast } from 'sonner';
import { z } from 'zod';

interface User {
  id: string;
  address: string;
}

interface SendMessageModalProps {
  user: User | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const messageSchema = z.object({
  subject: z.string().trim().min(1, 'Subject is required').max(200, 'Subject is too long'),
  message: z.string().trim().min(10, 'Message must be at least 10 characters').max(2000, 'Message is too long')
});

export const SendMessageModal = ({ user, open, onOpenChange }: SendMessageModalProps) => {
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validation = messageSchema.safeParse({ subject, message });
    if (!validation.success) {
      toast.error(validation.error.errors[0].message);
      return;
    }

    setIsSending(true);
    
    // Simulate sending message
    setTimeout(() => {
      toast.success(`Message sent to ${user?.address.slice(0, 6)}...${user?.address.slice(-4)}`);
      setSubject('');
      setMessage('');
      setIsSending(false);
      onOpenChange(false);
    }, 1000);
  };

  if (!user) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Send Message to User</DialogTitle>
        </DialogHeader>

        <div className="mb-4 p-3 bg-muted/30 rounded">
          <p className="text-sm text-muted-foreground">To:</p>
          <code className="text-sm">{user.address}</code>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="subject">Subject *</Label>
            <Input
              id="subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Enter message subject"
              required
              maxLength={200}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="message">Message *</Label>
            <Textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Enter your message..."
              className="min-h-[150px]"
              required
              maxLength={2000}
            />
            <p className="text-xs text-muted-foreground text-right">
              {message.length}/2000 characters
            </p>
          </div>

          <div className="flex gap-3 justify-end pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSending}>
              Cancel
            </Button>
            <Button type="submit" className="bg-gradient-primary" disabled={isSending}>
              {isSending ? 'Sending...' : 'Send Message'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
