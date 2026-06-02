import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { INDIAN_STATES, LEGAL_HELP_TYPES } from '@/types';
import { toast } from '@/hooks/use-toast';
import { Scale, Save, Pencil, X } from 'lucide-react';

const LegalPreferencesSection = () => {
  const { t } = useTranslation();
  const { profile } = useAuth();
  const [editing, setEditing] = useState(false);
  const [state, setState] = useState(profile?.state || '');
  const [district, setDistrict] = useState('');
  const [interests, setInterests] = useState<string[]>([]);

  const toggleInterest = (interest: string) => {
    setInterests(prev => prev.includes(interest) ? prev.filter(i => i !== interest) : [...prev, interest]);
  };

  const handleSave = () => {
    setEditing(false);
    toast({ title: t('preferencesSaved'), description: t('preferencesSavedDesc') });
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-4">
        <CardTitle className="text-lg flex items-center gap-2">
          <Scale className="h-4 w-4" /> {t('legalPreferences')}
        </CardTitle>
        {editing ? (
          <div className="flex gap-2">
            <Button size="sm" variant="ghost" onClick={() => setEditing(false)}><X className="h-4 w-4 mr-1" /> {t('cancel')}</Button>
            <Button size="sm" onClick={handleSave}><Save className="h-4 w-4 mr-1" /> {t('save')}</Button>
          </div>
        ) : (
          <Button size="sm" variant="outline" onClick={() => setEditing(true)}><Pencil className="h-4 w-4 mr-1" /> {t('edit')}</Button>
        )}
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">{t('stateForLegalSupport')}</Label>
            {editing ? (
              <Select value={state} onValueChange={setState}>
                <SelectTrigger className="h-9"><SelectValue placeholder={t('pleaseSelectState')} /></SelectTrigger>
                <SelectContent>{INDIAN_STATES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
              </Select>
            ) : (
              <p className="text-sm font-medium text-foreground py-1.5 px-3 bg-muted/50 rounded-md">{state || '—'}</p>
            )}
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">{t('districtCity')}</Label>
            {editing ? (
              <Input value={district} onChange={e => setDistrict(e.target.value)} className="h-9" placeholder={t('enterDistrictCity')} />
            ) : (
              <p className="text-sm font-medium text-foreground py-1.5 px-3 bg-muted/50 rounded-md">{district || '—'}</p>
            )}
          </div>
        </div>
        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground">{t('legalInterests')}</Label>
          <p className="text-xs text-muted-foreground">{t('legalInterestsDesc')}</p>
          <div className="flex flex-wrap gap-2 mt-2">
            {LEGAL_HELP_TYPES.map(type => {
              const selected = interests.includes(type);
              return (
                <Badge key={type} variant={selected ? 'default' : 'outline'}
                  className={`cursor-pointer transition-colors ${editing ? '' : 'pointer-events-none'} ${selected ? '' : 'hover:bg-primary/10'}`}
                  onClick={() => editing && toggleInterest(type)}>
                  {type}
                </Badge>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default LegalPreferencesSection;
