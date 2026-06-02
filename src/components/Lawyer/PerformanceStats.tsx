import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Star, Briefcase, CheckCircle, Users, TrendingUp, Clock } from 'lucide-react';

interface PerformanceStatsProps {
  rating: number;
  totalReviews: number;
  casesHandled: number;
  casesCompleted: number;
  consultationCount: number;
}

const PerformanceStats: React.FC<PerformanceStatsProps> = ({ rating, totalReviews, casesHandled, casesCompleted, consultationCount }) => {
  const satisfactionRate = casesHandled > 0 ? Math.round((casesCompleted / casesHandled) * 100) : 0;

  const stats = [
    { icon: Star, label: 'Avg Rating', value: rating > 0 ? `${rating}/5` : '–', color: 'text-yellow-600', bg: 'bg-yellow-50' },
    { icon: Users, label: 'Reviews', value: totalReviews.toString(), color: 'text-blue-600', bg: 'bg-blue-50' },
    { icon: Briefcase, label: 'Cases Handled', value: casesHandled.toString(), color: 'text-primary', bg: 'bg-primary/5' },
    { icon: CheckCircle, label: 'Completed', value: casesCompleted.toString(), color: 'text-green-600', bg: 'bg-green-50' },
    { icon: TrendingUp, label: 'Satisfaction', value: `${satisfactionRate}%`, color: 'text-purple-600', bg: 'bg-purple-50' },
    { icon: Clock, label: 'Consultations', value: consultationCount.toString(), color: 'text-orange-600', bg: 'bg-orange-50' },
  ];

  return (
    <Card>
      <CardHeader><CardTitle className="text-lg flex items-center gap-2"><TrendingUp className="h-5 w-5" />Performance</CardTitle></CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {stats.map(s => {
            const Icon = s.icon;
            return (
              <div key={s.label} className={`${s.bg} rounded-lg p-3 text-center`}>
                <Icon className={`h-5 w-5 mx-auto mb-1 ${s.color}`} />
                <p className="text-lg font-bold text-foreground">{s.value}</p>
                <p className="text-xs text-muted-foreground">{s.label}</p>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default PerformanceStats;
