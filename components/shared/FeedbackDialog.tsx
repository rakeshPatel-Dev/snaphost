'use client';

import { useState } from 'react';
import { useForm, ValidationError } from '@formspree/react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { MessageSquarePlus } from 'lucide-react';
import { toast } from 'sonner';

export default function FeedbackDialog() {
  const [open, setOpen] = useState(false);
  const [state, handleSubmit] = useForm(process.env.NEXT_PUBLIC_FORMSPREE_ENDPOINT_ID || '');
  const [category, setCategory] = useState('');

  const onOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
  };

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    await handleSubmit(e);
    if (state.succeeded) {
      toast.success('Thank you for your feedback!');
      setOpen(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button variant="default" size="sm" className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90 font-medium">
          <MessageSquarePlus className="w-4 h-4" />
          Give Feedback
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Send us Feedback</DialogTitle>
          <DialogDescription>
            Have a suggestion, found a bug, or just want to say hi? Let us know!
          </DialogDescription>
        </DialogHeader>

        {state.succeeded ? (
          <div className="flex flex-col items-center justify-center py-6 text-center gap-4">
            <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center text-green-600">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="text-sm text-muted-foreground">Thanks for your feedback! We appreciate it.</p>
            <Button variant="outline" onClick={() => setOpen(false)}>Close</Button>
          </div>
        ) : (
          <form onSubmit={onSubmit} className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name (optional)</Label>
              <Input id="name" name="name" placeholder="Your name" />
              <ValidationError prefix="Name" field="name" errors={state.errors} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email (optional)</Label>
              <Input id="email" name="email" type="email" placeholder="your@email.com" />
              <ValidationError prefix="Email" field="email" errors={state.errors} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input id="title" name="title" placeholder="Brief summary" required />
              <ValidationError prefix="Title" field="title" errors={state.errors} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select name="category" onValueChange={setCategory} required>
                <SelectTrigger>
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="feature">Feature Request</SelectItem>
                  <SelectItem value="bug">Bug Report</SelectItem>
                  <SelectItem value="suggestion">Suggestion</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
              <ValidationError prefix="Category" field="category" errors={state.errors} />
            </div>

            {category === 'other' && (
              <div className="space-y-2">
                <Label htmlFor="otherCategory">Please specify</Label>
                <Input id="otherCategory" name="otherCategory" placeholder="Specify category" required />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="message">Message</Label>
              <Textarea 
                id="message" 
                name="message" 
                placeholder="Tell us more about it..." 
                className="min-h-[100px]"
                required 
              />
              <ValidationError prefix="Message" field="message" errors={state.errors} />
            </div>

            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={state.submitting}>
                {state.submitting ? 'Sending...' : 'Send Feedback'}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
