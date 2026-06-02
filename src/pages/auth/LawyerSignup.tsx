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
import { Badge } from '@/components/ui/badge';
import { Scale, Globe, MapPin, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { INDIAN_STATES } from '@/types';
import { LANGUAGE_OPTIONS } from '@/i18n';
import logo from '@/assets/logo.png';

const PRACTICE_AREAS = [
  'Criminal Law', 'Civil Law', 'Family Law', 'Property Law',
  'Labour Law', 'Consumer Law', 'Corporate Law', 'Cyber Law',
  'Tax Law', 'Constitutional Law', 'Environmental Law', 'Banking Law',
];

const ROLE_TYPES = [
  { value: 'junior_lawyer', label: 'Junior Lawyer' },
  { value: 'advocate', label: 'Advocate' },
  { value: 'senior_advocate', label: 'Senior Advocate' },
  { value: 'legal_consultant', label: 'Legal Consultant' },
];

const LawyerSignup: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { signup } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '', email: '', phone: '', password: '', confirmPassword: '',
    state: '', city: '', bar_council_number: '', year_of_practice: '',
    role_type: 'advocate', specialization: '', experience: '',
    consultation_fee: '', preferred_language: 'en',
  });
  const [practiceAreas, setPracticeAreas] = useState<string[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!formData.name) e.name = t('pleaseEnterName');
    if (!formData.email || !/\S+@\S+\.\S+/.test(formData.email)) e.email = t('invalidEmail');
    if (!formData.phone) e.phone = 'Phone number is required';
    if (!formData.password || formData.password.length < 8) e.password = t('passwordMinLength');
    if (formData.password !== formData.confirmPassword) e.confirmPassword = t('passwordsDoNotMatch');
    if (!formData.state) e.state = t('pleaseSelectState');
    if (!formData.bar_council_number) e.bar_council_number = 'Bar Council number is required';
    if (!formData.year_of_practice) e.year_of_practice = 'Year of practice is required';
    if (practiceAreas.length === 0) e.practice_areas = 'Select at least one practice area';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setIsLoading(true);
    try {
      const result = await signup({
        email: formData.email,
        password: formData.password,
        name: formData.name,
        user_type: 'lawyer',
        state: formData.state,
        city: formData.city,
        phone: formData.phone,
        preferred_language: formData.preferred_language,
        bar_council_number: formData.bar_council_number,
        year_of_practice: parseInt(formData.year_of_practice) || 0,
        role_type: formData.role_type,
        practice_areas: practiceAreas,
        specialization: formData.specialization,
        experience: parseInt(formData.experience) || 0,
        consultation_fee: parseInt(formData.consultation_fee) || 0,
      });
      if (result.success) {
        toast({ title: 'Registration Successful!', description: 'Your account is pending verification. You can upload documents from your dashboard.' });
        navigate('/lawyer-dashboard');
      } else {
        toast({ title: t('error'), description: result.error || t('registrationFailed'), variant: 'destructive' });
      }
    } catch {
      toast({ title: t('error'), description: t('errorOccurred'), variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const togglePracticeArea = (area: string) => {
    setPracticeAreas(prev => prev.includes(area) ? prev.filter(a => a !== area) : [...prev, area]);
    if (errors.practice_areas) setErrors(prev => ({ ...prev, practice_areas: '' }));
  };

  const renderField = (name: string, label: string, type = 'text', placeholder = '') => (
    <div className="space-y-2" key={name}>
      <Label htmlFor={name}>{label} *</Label>
      <Input id={name} name={name} type={type} value={(formData as any)[name]} onChange={handleChange} placeholder={placeholder} className={errors[name] ? 'border-destructive' : ''} />
      {errors[name] && <p className="text-xs text-destructive">{errors[name]}</p>}
    </div>
  );

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-lg max-h-[95vh] overflow-y-auto">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-3">
            <div className="h-14 w-14 bg-primary/10 rounded-full flex items-center justify-center">
              <Scale className="h-7 w-7 text-primary" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-primary">Join LawLite as a Lawyer</CardTitle>
          <CardDescription>Register your professional account for verification</CardDescription>
          <div className="flex justify-center mt-2">
            <Select onValueChange={v => i18n.changeLanguage(v)} value={i18n.language}>
              <SelectTrigger className="w-32"><Globe className="h-4 w-4 mr-1" /><SelectValue /></SelectTrigger>
              <SelectContent>{LANGUAGE_OPTIONS.map(l => <SelectItem key={l.code} value={l.code}>{l.nativeLabel}</SelectItem>)}</SelectContent>
            </Select>
          </div>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Personal Info */}
            <div className="space-y-1 mb-2"><h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Personal Information</h3></div>
            {renderField('name', t('fullName'))}
            {renderField('email', t('email'), 'email')}
            {renderField('phone', 'Phone Number', 'tel', '+91 XXXXX XXXXX')}
            <div className="grid grid-cols-2 gap-3">
              {renderField('password', t('password'), 'password')}
              {renderField('confirmPassword', t('confirmPassword'), 'password')}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label><MapPin className="h-3 w-3 inline mr-1" />State *</Label>
                <Select onValueChange={v => { setFormData(p => ({ ...p, state: v })); if (errors.state) setErrors(p => ({ ...p, state: '' })); }}>
                  <SelectTrigger className={errors.state ? 'border-destructive' : ''}><SelectValue placeholder="Select state" /></SelectTrigger>
                  <SelectContent>{INDIAN_STATES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                </Select>
                {errors.state && <p className="text-xs text-destructive">{errors.state}</p>}
              </div>
              {renderField('city', 'City')}
            </div>

            {/* Professional Info */}
            <div className="space-y-1 mt-4 mb-2"><h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Professional Details</h3></div>
            {renderField('bar_council_number', 'Bar Council Enrollment Number', 'text', 'e.g. KAR/1234/2020')}
            
            <div className="grid grid-cols-2 gap-3">
              {renderField('year_of_practice', 'Year of Practice Start', 'number', 'e.g. 2015')}
              {renderField('experience', 'Years of Experience', 'number', 'e.g. 8')}
            </div>

            <div className="space-y-2">
              <Label>Role Type *</Label>
              <Select value={formData.role_type} onValueChange={v => setFormData(p => ({ ...p, role_type: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{ROLE_TYPES.map(r => <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>)}</SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Primary Practice Areas *</Label>
              <div className="flex flex-wrap gap-2">
                {PRACTICE_AREAS.map(area => (
                  <Badge key={area} variant={practiceAreas.includes(area) ? 'default' : 'outline'}
                    className="cursor-pointer transition-colors" onClick={() => togglePracticeArea(area)}>
                    {area} {practiceAreas.includes(area) && <X className="h-3 w-3 ml-1" />}
                  </Badge>
                ))}
              </div>
              {errors.practice_areas && <p className="text-xs text-destructive">{errors.practice_areas}</p>}
            </div>

            {renderField('consultation_fee', 'Consultation Fee (₹/hour)', 'number', 'e.g. 500')}

            <div className="space-y-2">
              <Label>Preferred Language</Label>
              <Select value={formData.preferred_language} onValueChange={v => setFormData(p => ({ ...p, preferred_language: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{LANGUAGE_OPTIONS.map(l => <SelectItem key={l.code} value={l.code}>{l.nativeLabel} ({l.label})</SelectItem>)}</SelectContent>
              </Select>
            </div>

            <Alert className="bg-muted/50 border-border">
              <AlertDescription className="text-xs">
                After registration, you'll need to upload your Bar Council Certificate, Government ID, and Professional Photo for verification.
              </AlertDescription>
            </Alert>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Creating Account...' : 'Register as Lawyer'}
            </Button>

            <div className="text-center space-y-1">
              <p className="text-sm text-muted-foreground">
                Already have an account? <Link to="/login" className="text-primary hover:underline">{t('login')}</Link>
              </p>
              <p className="text-sm text-muted-foreground">
                Register as a user? <Link to="/signup" className="text-primary hover:underline">User Signup</Link>
              </p>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default LawyerSignup;
