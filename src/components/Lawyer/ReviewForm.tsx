import React, { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Star, Send } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ReviewFormProps {
  lawyerId: string;
  caseId?: string;
  consultationId?: string;
  onSubmitted?: () => void;
}

const CRITERIA = [
  { key: 'overall', label: 'Overall Experience', required: true },
  { key: 'communication', label: 'Communication', required: false },
  { key: 'professionalism', label: 'Professionalism', required: false },
  { key: 'knowledge', label: 'Legal Knowledge', required: false },
  { key: 'responsiveness', label: 'Responsiveness', required: false },
] as const;

const StarRating = ({ value, onChange, size = 'md' }: { value: number; onChange: (v: number) => void; size?: 'sm' | 'md' }) => {
  const [hover, setHover] = useState(0);
  const sz = size === 'sm' ? 'h-4 w-4' : 'h-6 w-6';
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map(star => (
        <button key={star} type="button" onMouseEnter={() => setHover(star)} onMouseLeave={() => setHover(0)}
          onClick={() => onChange(star)} className="focus:outline-none">
          <Star className={`${sz} transition-colors ${(hover || value) >= star ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground/30'}`} />
        </button>
      ))}
    </div>
  );
};

const ReviewForm: React.FC<ReviewFormProps> = ({ lawyerId, caseId, consultationId, onSubmitted }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [ratings, setRatings] = useState<Record<string, number>>({});
  const [reviewText, setReviewText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!user || !ratings.overall) {
      toast({ title: 'Please provide an overall rating', variant: 'destructive' });
      return;
    }
    setSubmitting(true);
    const { error } = await supabase.from('lawyer_reviews' as any).insert({
      lawyer_id: lawyerId,
      client_id: user.id,
      case_id: caseId || null,
      consultation_id: consultationId || null,
      overall_rating: ratings.overall,
      communication_rating: ratings.communication || null,
      professionalism_rating: ratings.professionalism || null,
      knowledge_rating: ratings.knowledge || null,
      responsiveness_rating: ratings.responsiveness || null,
      review_text: reviewText.trim() || null,
    });
    setSubmitting(false);
    if (error) {
      toast({ title: 'Error', description: error.message.includes('unique') ? 'You have already reviewed this consultation.' : error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Review Submitted', description: 'Thank you for your feedback!' });
      setRatings({});
      setReviewText('');
      onSubmitted?.();
    }
  };

  return (
    <Card>
      <CardHeader><CardTitle className="text-lg">Rate & Review</CardTitle></CardHeader>
      <CardContent className="space-y-4">
        {CRITERIA.map(c => (
          <div key={c.key} className="flex items-center justify-between">
            <Label className="text-sm">{c.label}{c.required && ' *'}</Label>
            <StarRating value={ratings[c.key] || 0} onChange={v => setRatings(p => ({ ...p, [c.key]: v }))} size={c.required ? 'md' : 'sm'} />
          </div>
        ))}
        <div>
          <Label className="text-sm">Your Review (optional)</Label>
          <Textarea value={reviewText} onChange={e => setReviewText(e.target.value)} placeholder="Share your experience..." className="mt-1" maxLength={1000} />
        </div>
        <Button onClick={handleSubmit} disabled={submitting || !ratings.overall} className="w-full">
          <Send className="h-4 w-4 mr-2" />{submitting ? 'Submitting...' : 'Submit Review'}
        </Button>
      </CardContent>
    </Card>
  );
};

export { StarRating };
export default ReviewForm;
