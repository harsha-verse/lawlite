import React from 'react';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Award, Star, Shield, TrendingUp } from 'lucide-react';

interface TrustBadgesProps {
  isVerified: boolean;
  rating: number;
  totalReviews: number;
  experience: number;
  totalCases: number;
}

const TrustBadges: React.FC<TrustBadgesProps> = ({ isVerified, rating, totalReviews, experience, totalCases }) => {
  const badges: { icon: React.FC<{ className?: string }>; label: string; className: string }[] = [];

  if (isVerified) badges.push({ icon: CheckCircle, label: 'Verified Lawyer', className: 'bg-green-100 text-green-700 border-green-200' });
  if (rating >= 4.5 && totalReviews >= 5) badges.push({ icon: Star, label: 'Top Rated', className: 'bg-yellow-100 text-yellow-700 border-yellow-200' });
  if (experience >= 10) badges.push({ icon: Award, label: 'Experienced Advocate', className: 'bg-blue-100 text-blue-700 border-blue-200' });
  if (totalCases >= 50) badges.push({ icon: TrendingUp, label: 'Highly Recommended', className: 'bg-purple-100 text-purple-700 border-purple-200' });
  if (rating >= 4.0 && totalReviews >= 10) badges.push({ icon: Shield, label: 'Trusted Professional', className: 'bg-indigo-100 text-indigo-700 border-indigo-200' });

  if (badges.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2">
      {badges.map(b => {
        const Icon = b.icon;
        return <Badge key={b.label} variant="outline" className={b.className}><Icon className="h-3 w-3 mr-1" />{b.label}</Badge>;
      })}
    </div>
  );
};

export default TrustBadges;
