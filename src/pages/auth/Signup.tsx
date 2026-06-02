import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { User, MapPin, Globe } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { INDIAN_STATES } from '@/types';
import { LANGUAGE_OPTIONS } from '@/i18n';
import logo from '@/assets/logo.png';

const Signup: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { signup } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    email: '', password: '', confirmPassword: '', name: '',
    selectedState: '', preferredLanguage: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.email) newErrors.email = t('pleaseEnterEmail');
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = t('invalidEmail');
    if (!formData.password) newErrors.password = t('pleaseEnterPassword');
    else if (formData.password.length < 8) newErrors.password = t('passwordMinLength');
    if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = t('passwordsDoNotMatch');
    if (!formData.name) newErrors.name = t('pleaseEnterName');
    if (!formData.selectedState) newErrors.selectedState = t('pleaseSelectState');
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsLoading(true);
    try {
      const result = await signup({
        email: formData.email,
        password: formData.password,
        name: formData.name,
        user_type: 'user',
        state: formData.selectedState,
        preferred_language: formData.preferredLanguage || 'en',
      });
      if (result.success) {
        toast({ title: t('success'), description: t('registrationSuccessful') });
        navigate('/dashboard');
      } else {
        toast({ title: t('error'), description: result.error || t('registrationFailed'), variant: "destructive" });
      }
    } catch {
      toast({ title: t('error'), description: t('errorOccurred'), variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md max-h-[90vh] overflow-y-auto">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4"><img src={logo} alt="LAWLITE" className="h-16 w-16" /></div>
          <CardTitle className="text-2xl font-bold text-primary">LAWLITE</CardTitle>
          <CardDescription>{t('createYourAccount')}</CardDescription>
          <div className="flex justify-center mt-2">
            <Select onValueChange={(v) => i18n.changeLanguage(v)} value={i18n.language}>
              <SelectTrigger className="w-32"><Globe className="h-4 w-4 mr-1" /><SelectValue /></SelectTrigger>
              <SelectContent>
                {LANGUAGE_OPTIONS.map((lang) => (
                  <SelectItem key={lang.code} value={lang.code}>{lang.nativeLabel}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">{t('fullName')}</Label>
              <Input id="name" name="name" value={formData.name} onChange={handleInputChange} className={errors.name ? 'border-destructive' : ''} />
              {errors.name && <Alert variant="destructive"><AlertDescription>{errors.name}</AlertDescription></Alert>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">{t('email')}</Label>
              <Input id="email" name="email" type="email" value={formData.email} onChange={handleInputChange} className={errors.email ? 'border-destructive' : ''} />
              {errors.email && <Alert variant="destructive"><AlertDescription>{errors.email}</AlertDescription></Alert>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">{t('password')}</Label>
              <Input id="password" name="password" type="password" value={formData.password} onChange={handleInputChange} className={errors.password ? 'border-destructive' : ''} />
              {errors.password && <Alert variant="destructive"><AlertDescription>{errors.password}</AlertDescription></Alert>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">{t('confirmPassword')}</Label>
              <Input id="confirmPassword" name="confirmPassword" type="password" value={formData.confirmPassword} onChange={handleInputChange} className={errors.confirmPassword ? 'border-destructive' : ''} />
              {errors.confirmPassword && <Alert variant="destructive"><AlertDescription>{errors.confirmPassword}</AlertDescription></Alert>}
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-1"><MapPin className="h-4 w-4 text-primary" />{t('selectYourState')} *</Label>
              <Select onValueChange={(value) => handleSelectChange('selectedState', value)}>
                <SelectTrigger className={errors.selectedState ? 'border-destructive' : ''}><SelectValue placeholder={t('chooseYourState')} /></SelectTrigger>
                <SelectContent>{INDIAN_STATES.map((state) => (<SelectItem key={state} value={state}>{state}</SelectItem>))}</SelectContent>
              </Select>
              {errors.selectedState && <Alert variant="destructive"><AlertDescription>{errors.selectedState}</AlertDescription></Alert>}
            </div>

            <div className="space-y-2">
              <Label>{t('preferredLanguage')}</Label>
              <Select onValueChange={(value) => handleSelectChange('preferredLanguage', value)}>
                <SelectTrigger><SelectValue placeholder={t('chooseLanguage')} /></SelectTrigger>
                <SelectContent>
                  {LANGUAGE_OPTIONS.map((lang) => (
                    <SelectItem key={lang.code} value={lang.code}>{lang.nativeLabel} ({lang.label})</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? t('creatingAccount') : t('signup')}
            </Button>
            <div className="text-center space-y-1">
              <p className="text-sm text-muted-foreground">
                {t('alreadyHaveAccount')}{' '}
                <Link to="/login" className="text-primary hover:underline">{t('login')}</Link>
              </p>
              <p className="text-sm text-muted-foreground">
                Are you a lawyer?{' '}
                <Link to="/lawyer-signup" className="text-primary hover:underline font-medium">Register as Lawyer</Link>
              </p>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Signup;
