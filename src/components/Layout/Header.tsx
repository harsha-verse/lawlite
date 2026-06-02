import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Bell, Search, Globe, MapPin } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { INDIAN_STATES } from '@/types';
import { LANGUAGE_OPTIONS } from '@/i18n';
import logo from '@/assets/logo.png';

const Header: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { user, profile, logout } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');

  const changeLanguage = (language: string) => {
    i18n.changeLanguage(language);
  };

  return (
    <header className="bg-card shadow-sm border-b sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-3">
            <img src={logo} alt="LAWLITE" className="h-10 w-10" />
            <h1 className="text-xl font-bold text-primary">LAWLITE</h1>
          </div>

          <div className="flex-1 max-w-md mx-8 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input type="search" placeholder={t('search')} value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10 bg-background" />
          </div>

          <div className="flex items-center space-x-3">
            <Select value={profile?.state || ''} onValueChange={() => {}}>
              <SelectTrigger className="w-[140px]">
                <MapPin className="h-4 w-4 mr-1 text-primary" />
                <SelectValue placeholder={t('state')} />
              </SelectTrigger>
              <SelectContent>
                {INDIAN_STATES.map((state) => (
                  <SelectItem key={state} value={state}>{state}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select onValueChange={changeLanguage} value={i18n.language}>
              <SelectTrigger className="w-24"><Globe className="h-4 w-4" /></SelectTrigger>
              <SelectContent>
                {LANGUAGE_OPTIONS.map((lang) => (
                  <SelectItem key={lang.code} value={lang.code}>{lang.nativeLabel}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button variant="ghost" size="icon"><Bell className="h-5 w-5" /></Button>

            {user && (
              <div className="flex items-center space-x-2">
                <Avatar>
                  <AvatarImage src={profile?.avatar_url || undefined} />
                  <AvatarFallback>
                    {(profile?.name || user.email || '?').charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <Button variant="ghost" onClick={logout} className="text-sm">{t('logout')}</Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
