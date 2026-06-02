import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Star, CheckCircle, MapPin, Clock, Award } from 'lucide-react';
import TrustBadges from './TrustBadges';

const FeaturedLawyers: React.FC = () => {
  const navigate = useNavigate();
  const [lawyers, setLawyers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchFeatured(); }, []);

  const fetchFeatured = async () => {
    const { data: lps } = await supabase.from('lawyer_profiles').select('*')
      .eq('verification_status', 'verified').eq('profile_visible', true)
      .gte('rating', 3).order('rating', { ascending: false }).limit(6);

    if (!lps || lps.length === 0) { setLoading(false); return; }

    const userIds = lps.map(l => l.user_id);
    const { data: profiles } = await supabase.from('profiles').select('id, name, avatar_url, city, state').in('id', userIds);
    const pMap = new Map((profiles || []).map(p => [p.id, p]));

    setLawyers(lps.map(lp => ({ ...lp, profile: pMap.get(lp.user_id) })));
    setLoading(false);
  };

  if (loading || lawyers.length === 0) return null;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-foreground flex items-center gap-2"><Award className="h-6 w-6 text-primary" />Top Lawyers on LawLite</h2>
        <Button variant="outline" size="sm" onClick={() => navigate('/lawyers')}>View All</Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {lawyers.map(l => {
          const p = l.profile;
          return (
            <Card key={l.user_id} className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate(`/lawyer/${l.user_id}`)}>
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <Avatar className="h-14 w-14">
                    <AvatarImage src={p?.avatar_url || undefined} />
                    <AvatarFallback className="bg-primary/10 text-primary">{(p?.name || '?').slice(0, 2).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1">
                      <p className="font-semibold text-foreground truncate">{p?.name || 'Lawyer'}</p>
                      <CheckCircle className="h-3.5 w-3.5 text-green-600 flex-shrink-0" />
                    </div>
                    <p className="text-xs text-muted-foreground">{l.specialization || l.role_type?.replace(/_/g, ' ')}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm font-medium">{l.rating || '–'}</span>
                      <span className="text-xs text-muted-foreground">({l.total_reviews} reviews)</span>
                    </div>
                    <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                      <span className="flex items-center gap-0.5"><Clock className="h-3 w-3" />{l.experience}y</span>
                      {p?.city && <span className="flex items-center gap-0.5"><MapPin className="h-3 w-3" />{p.city}</span>}
                    </div>
                  </div>
                </div>
                <div className="mt-3">
                  <TrustBadges isVerified={true} rating={l.rating || 0} totalReviews={l.total_reviews || 0} experience={l.experience || 0} totalCases={0} />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default FeaturedLawyers;
