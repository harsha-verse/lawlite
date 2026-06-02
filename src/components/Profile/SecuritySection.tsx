import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { toast } from '@/hooks/use-toast';
import { Shield, Lock, Smartphone, LogOut, Monitor, MapPin } from 'lucide-react';

const SecuritySection = () => {
  const { t } = useTranslation();
  const [changingPassword, setChangingPassword] = useState(false);
  const [passwords, setPasswords] = useState({ current: '', newPass: '', confirm: '' });
  const [twoFA, setTwoFA] = useState(false);

  const handlePasswordChange = () => {
    if (passwords.newPass.length < 8) {
      toast({ title: t('error'), description: t('passwordMinLength'), variant: 'destructive' });
      return;
    }
    if (passwords.newPass !== passwords.confirm) {
      toast({ title: t('error'), description: t('passwordsDoNotMatch'), variant: 'destructive' });
      return;
    }
    setChangingPassword(false);
    setPasswords({ current: '', newPass: '', confirm: '' });
    toast({ title: t('passwordUpdated'), description: t('passwordUpdatedDesc') });
  };

  const loginHistory = [
    { device: 'Chrome on Windows', location: 'Mumbai, Maharashtra', time: t('hoursAgo'), current: true },
    { device: 'Safari on iPhone', location: 'Pune, Maharashtra', time: t('oneDayAgo'), current: false },
    { device: 'Firefox on macOS', location: 'Delhi', time: t('twoDaysAgo'), current: false },
  ];

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Lock className="h-4 w-4" /> {t('changePassword')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {changingPassword ? (
            <div className="space-y-3 max-w-sm">
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">{t('currentPassword')}</Label>
                <Input type="password" value={passwords.current} onChange={e => setPasswords(p => ({ ...p, current: e.target.value }))} className="h-9" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">{t('newPassword')}</Label>
                <Input type="password" value={passwords.newPass} onChange={e => setPasswords(p => ({ ...p, newPass: e.target.value }))} className="h-9" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">{t('confirmNewPassword')}</Label>
                <Input type="password" value={passwords.confirm} onChange={e => setPasswords(p => ({ ...p, confirm: e.target.value }))} className="h-9" />
              </div>
              <div className="flex gap-2">
                <Button size="sm" onClick={handlePasswordChange}>{t('updatePassword')}</Button>
                <Button size="sm" variant="ghost" onClick={() => setChangingPassword(false)}>{t('cancel')}</Button>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">{t('lastChanged')}</p>
              <Button size="sm" variant="outline" onClick={() => setChangingPassword(true)}>{t('changePassword')}</Button>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Smartphone className="h-4 w-4" /> {t('twoFactorAuth')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">{t('twoFactorDesc')}</p>
              <Badge variant="outline" className="mt-1">{twoFA ? t('enabled') : t('disabled')}</Badge>
            </div>
            <Switch checked={twoFA} onCheckedChange={v => {
              setTwoFA(v);
              toast({ title: v ? t('twoFAEnabled') : t('twoFADisabled') });
            }} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3 flex flex-row items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Monitor className="h-4 w-4" /> {t('loginActivity')}
          </CardTitle>
          <Button size="sm" variant="destructive" onClick={() => toast({ title: t('loggedOut'), description: t('loggedOutDesc') })}>
            <LogOut className="h-3.5 w-3.5 mr-1" /> {t('logoutAll')}
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {loginHistory.map((item, i) => (
              <div key={i} className="flex items-center justify-between py-2 border-b last:border-0 border-border">
                <div className="flex items-center gap-3">
                  <Monitor className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium text-foreground">{item.device}</p>
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <MapPin className="h-3 w-3" /> {item.location} · {item.time}
                    </p>
                  </div>
                </div>
                {item.current && <Badge variant="default" className="text-xs">{t('current')}</Badge>}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Shield className="h-4 w-4" /> {t('securityStatus')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              { label: t('passwordStrength'), status: t('strong'), color: 'bg-green-500' },
              { label: t('emailVerified'), status: t('yes'), color: 'bg-green-500' },
              { label: '2FA', status: twoFA ? t('enabled') : t('disabled'), color: twoFA ? 'bg-green-500' : 'bg-yellow-500' },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-2 p-3 rounded-lg bg-muted/50">
                <div className={`h-2 w-2 rounded-full ${item.color}`} />
                <div>
                  <p className="text-xs text-muted-foreground">{item.label}</p>
                  <p className="text-sm font-medium text-foreground">{item.status}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SecuritySection;
