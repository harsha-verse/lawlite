import React from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/context/AuthContext';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Mail, MapPin, Calendar, ShieldCheck, Hash } from 'lucide-react';

const ProfileOverview = () => {
  const { t } = useTranslation();
  const { user, profile } = useAuth();
  if (!user || !profile) return null;

  const initials = (profile.name || user.email || '?').slice(0, 2).toUpperCase();

  return (
    <Card className="p-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
        <Avatar className="h-20 w-20 border-2 border-primary/20">
          <AvatarImage src={profile.avatar_url || undefined} />
          <AvatarFallback className="bg-primary/10 text-primary text-xl font-bold">{initials}</AvatarFallback>
        </Avatar>
        <div className="flex-1 space-y-2">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-xl font-bold text-foreground">{profile.name || t('user')}</h1>
            <Badge variant="outline" className="capitalize">{t(profile.user_type)}</Badge>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-1 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5"><Mail className="h-3.5 w-3.5" /> {user.email}</span>
            <span className="flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5" /> {profile.state || t('notSet')}</span>
            <span className="flex items-center gap-1.5"><Hash className="h-3.5 w-3.5" /> {t('userId')}: {user.id.slice(-8).toUpperCase()}</span>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default ProfileOverview;
