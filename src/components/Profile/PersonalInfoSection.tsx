import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { INDIAN_STATES } from '@/types';
import { toast } from '@/hooks/use-toast';
import { Pencil, Save, X } from 'lucide-react';
import { LANGUAGE_OPTIONS } from '@/i18n';

const PersonalInfoSection = () => {
  const { t } = useTranslation();
  const { user, profile, refreshProfile } = useAuth();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    name: profile?.name || '',
    email: user?.email || '',
    phone: profile?.phone || '',
    dob: '',
    gender: '',
    address: '',
    city: profile?.city || '',
    state: profile?.state || '',
    pincode: '',
    language: profile?.preferred_language || 'en',
    occupation: '',
  });

  if (!user) return null;

  const handleSave = async () => {
    await supabase.from('profiles').update({
      name: form.name,
      phone: form.phone || null,
      city: form.city || null,
      state: form.state || null,
      preferred_language: form.language,
    }).eq('id', user.id);
    await refreshProfile();
    setEditing(false);
    toast({ title: t('profileUpdated'), description: t('profileUpdatedDesc') });
  };

  const genderOptions = [
    { value: 'Male', label: t('male') },
    { value: 'Female', label: t('female') },
    { value: 'Other', label: t('other') },
    { value: 'Prefer not to say', label: t('preferNotToSay') },
  ];

  const Field = ({ label, value, field, type = 'text' }: { label: string; value: string; field: string; type?: string }) => (
    <div className="space-y-1.5">
      <Label className="text-xs text-muted-foreground">{label}</Label>
      {editing ? (
        <Input type={type} value={value} onChange={e => setForm(prev => ({ ...prev, [field]: e.target.value }))} className="h-9" />
      ) : (
        <p className="text-sm font-medium text-foreground py-1.5 px-3 bg-muted/50 rounded-md min-h-[36px] flex items-center">{value || '—'}</p>
      )}
    </div>
  );

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-4">
        <CardTitle className="text-lg">{t('personalInformation')}</CardTitle>
        {editing ? (
          <div className="flex gap-2">
            <Button size="sm" variant="ghost" onClick={() => setEditing(false)}><X className="h-4 w-4 mr-1" /> {t('cancel')}</Button>
            <Button size="sm" onClick={handleSave}><Save className="h-4 w-4 mr-1" /> {t('save')}</Button>
          </div>
        ) : (
          <Button size="sm" variant="outline" onClick={() => setEditing(true)}><Pencil className="h-4 w-4 mr-1" /> {t('edit')}</Button>
        )}
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label={t('fullName')} value={form.name} field="name" />
          <Field label={t('emailAddress')} value={form.email} field="email" type="email" />
          <Field label={t('phoneNumber')} value={form.phone} field="phone" type="tel" />
          <Field label={t('dateOfBirth')} value={form.dob} field="dob" type="date" />
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">{t('gender')}</Label>
            {editing ? (
              <Select value={form.gender} onValueChange={v => setForm(p => ({ ...p, gender: v }))}>
                <SelectTrigger className="h-9"><SelectValue placeholder={t('selectGender')} /></SelectTrigger>
                <SelectContent>{genderOptions.map(g => <SelectItem key={g.value} value={g.value}>{g.label}</SelectItem>)}</SelectContent>
              </Select>
            ) : (
              <p className="text-sm font-medium text-foreground py-1.5 px-3 bg-muted/50 rounded-md min-h-[36px] flex items-center">{form.gender || '—'}</p>
            )}
          </div>
          <Field label={t('occupation')} value={form.occupation} field="occupation" />
          <Field label={t('residentialAddress')} value={form.address} field="address" />
          <Field label={t('city')} value={form.city} field="city" />
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">{t('state')}</Label>
            {editing ? (
              <Select value={form.state} onValueChange={v => setForm(p => ({ ...p, state: v }))}>
                <SelectTrigger className="h-9"><SelectValue placeholder={t('pleaseSelectState')} /></SelectTrigger>
                <SelectContent>{INDIAN_STATES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
              </Select>
            ) : (
              <p className="text-sm font-medium text-foreground py-1.5 px-3 bg-muted/50 rounded-md min-h-[36px] flex items-center">{form.state || '—'}</p>
            )}
          </div>
          <Field label={t('pincode')} value={form.pincode} field="pincode" />
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">{t('preferredLanguage')}</Label>
            {editing ? (
              <Select value={form.language} onValueChange={v => setForm(p => ({ ...p, language: v }))}>
                <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                <SelectContent>{LANGUAGE_OPTIONS.map(l => <SelectItem key={l.code} value={l.code}>{l.nativeLabel}</SelectItem>)}</SelectContent>
              </Select>
            ) : (
              <p className="text-sm font-medium text-foreground py-1.5 px-3 bg-muted/50 rounded-md min-h-[36px] flex items-center">{form.language || '—'}</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PersonalInfoSection;
