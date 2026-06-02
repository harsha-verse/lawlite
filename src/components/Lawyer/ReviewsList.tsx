import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Star, Flag, ThumbsUp, MessageCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ReviewsListProps {
  lawyerId: string;
}

const ReviewsList: React.FC<ReviewsListProps> = ({ lawyerId }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [reviews, setReviews] = useState<any[]>([]);
  const [profiles, setProfiles] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchReviews(); }, [lawyerId]);

  const fetchReviews = async () => {
    setLoading(true);
    const { data } = await supabase.from('lawyer_reviews' as any).select('*')
      .eq('lawyer_id', lawyerId).eq('is_flagged', false)
      .order('created_at', { ascending: false }).limit(50);
    if (data && data.length > 0) {
      setReviews(data);
      const clientIds = [...new Set(data.map((r: any) => r.client_id))];
      const { data: profs } = await supabase.from('profiles').select('id, name, avatar_url').in('id', clientIds as string[]);
      if (profs) setProfiles(Object.fromEntries(profs.map(p => [p.id, p])));
    } else {
      setReviews([]);
    }
    setLoading(false);
  };

  const handleFlag = async (reviewId: string) => {
    await supabase.from('lawyer_reviews' as any).update({ is_flagged: true, flag_reason: 'Reported by user' } as any).eq('id', reviewId);
    toast({ title: 'Review Reported', description: 'This review has been flagged for moderation.' });
    fetchReviews();
  };

  const avgByCategory = (key: string) => {
    const vals = reviews.map(r => r[key]).filter(Boolean);
    return vals.length > 0 ? (vals.reduce((a: number, b: number) => a + b, 0) / vals.length).toFixed(1) : null;
  };

  if (loading) return <Card><CardContent className="py-8 text-center text-muted-foreground">Loading reviews...</CardContent></Card>;

  const overallAvg = avgByCategory('overall_rating');

  return (
    <div className="space-y-4">
      {/* Rating Summary */}
      {reviews.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-6 flex-wrap">
              <div className="text-center">
                <p className="text-3xl font-bold text-foreground">{overallAvg}</p>
                <div className="flex gap-0.5 mt-1">
                  {[1, 2, 3, 4, 5].map(s => (
                    <Star key={s} className={`h-4 w-4 ${Number(overallAvg) >= s ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground/30'}`} />
                  ))}
                </div>
                <p className="text-xs text-muted-foreground mt-1">{reviews.length} reviews</p>
              </div>
              <div className="flex-1 grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
                {[
                  { key: 'communication_rating', label: 'Communication' },
                  { key: 'professionalism_rating', label: 'Professionalism' },
                  { key: 'knowledge_rating', label: 'Knowledge' },
                  { key: 'responsiveness_rating', label: 'Responsiveness' },
                ].map(cat => {
                  const avg = avgByCategory(cat.key);
                  return avg ? (
                    <div key={cat.key} className="text-center">
                      <p className="font-semibold text-foreground">{avg}</p>
                      <p className="text-xs text-muted-foreground">{cat.label}</p>
                    </div>
                  ) : null;
                })}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Reviews List */}
      <Card>
        <CardHeader><CardTitle className="text-lg flex items-center gap-2"><MessageCircle className="h-5 w-5" />Client Reviews ({reviews.length})</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          {reviews.length === 0 ? (
            <p className="text-center text-muted-foreground py-6">No reviews yet.</p>
          ) : (
            reviews.map((review: any) => {
              const client = profiles[review.client_id];
              return (
                <div key={review.id} className="border border-border rounded-lg p-4 space-y-2">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-primary/10 text-primary text-xs">
                          {(client?.name || 'U').slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium text-foreground">{client?.name || 'Client'}</p>
                        <p className="text-xs text-muted-foreground">{new Date(review.created_at).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex gap-0.5">
                        {[1, 2, 3, 4, 5].map(s => (
                          <Star key={s} className={`h-3.5 w-3.5 ${review.overall_rating >= s ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground/30'}`} />
                        ))}
                      </div>
                      {user && user.id !== review.client_id && (
                        <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => handleFlag(review.id)}>
                          <Flag className="h-3.5 w-3.5 text-muted-foreground" />
                        </Button>
                      )}
                    </div>
                  </div>
                  {review.review_text && <p className="text-sm text-foreground">{review.review_text}</p>}
                  {review.is_verified && <Badge variant="outline" className="text-xs"><ThumbsUp className="h-3 w-3 mr-1" />Verified Review</Badge>}
                </div>
              );
            })
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ReviewsList;
