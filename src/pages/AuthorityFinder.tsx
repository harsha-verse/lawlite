import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Search, Phone, ExternalLink, MapPin, FileText, Scale, Shield,
  Briefcase, Building, Users, Globe, AlertCircle
} from 'lucide-react';
import { INDIAN_STATES } from '@/types';
import {
  getAuthoritiesForState, searchAuthorities, AUTHORITY_CATEGORY_LABELS,
  type Authority, type AuthorityCategory
} from '@/data/authorityData';

const CATEGORY_ICONS: Record<AuthorityCategory, React.ElementType> = {
  legal_services: Scale,
  consumer: FileText,
  police: Shield,
  labour: Briefcase,
  msme: Building,
  women: Users,
  cyber: Globe,
  property: MapPin,
  court: Scale,
};

const ISSUE_FILTERS = [
  { value: 'all', label: 'All Categories' },
  { value: 'legal_services', label: 'Legal Aid' },
  { value: 'consumer', label: 'Consumer' },
  { value: 'police', label: 'Police' },
  { value: 'labour', label: 'Labour' },
  { value: 'msme', label: 'MSME' },
  { value: 'women', label: 'Women' },
  { value: 'cyber', label: 'Cybercrime' },
  { value: 'property', label: 'Property' },
  { value: 'court', label: 'Courts' },
];

const AuthorityFinder: React.FC = () => {
  const { t } = useTranslation();
  const { profile } = useAuth();
  const [selectedState, setSelectedState] = useState<string>(profile?.state || '');
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  const authorities = useMemo(() => {
    let result = getAuthoritiesForState(selectedState || undefined);
    if (categoryFilter !== 'all') {
      result = result.filter(a => a.category === categoryFilter);
    }
    if (searchQuery.trim()) {
      result = searchAuthorities(result, searchQuery);
    }
    return result;
  }, [selectedState, searchQuery, categoryFilter]);

  // Group by category for display
  const grouped = useMemo(() => {
    const map = new Map<AuthorityCategory, Authority[]>();
    authorities.forEach(a => {
      const list = map.get(a.category) || [];
      list.push(a);
      map.set(a.category, list);
    });
    return map;
  }, [authorities]);

  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-1">{t('authorityFinderTitle')}</h1>
        <p className="text-muted-foreground">{t('authorityFinderSubtitle')}</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder={t('searchAuthoritiesPlaceholder')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={selectedState || 'all-states'} onValueChange={(v) => setSelectedState(v === 'all-states' ? '' : v)}>
          <SelectTrigger className="w-full sm:w-56">
            <SelectValue placeholder={t('selectYourState')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all-states">{t('allStates')}</SelectItem>
            {INDIAN_STATES.map(s => (
              <SelectItem key={s} value={s}>{s}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Category chips */}
      <div className="flex flex-wrap gap-2">
        {ISSUE_FILTERS.map(f => (
          <Button
            key={f.value}
            size="sm"
            variant={categoryFilter === f.value ? 'default' : 'outline'}
            className="text-xs h-8"
            onClick={() => setCategoryFilter(f.value)}
          >
            {f.label}
          </Button>
        ))}
      </div>

      {/* State indicator */}
      {selectedState && (
        <div className="flex items-center gap-2 text-sm text-primary">
          <MapPin className="h-4 w-4" />
          <span>{t('showingAuthoritiesFor')} <strong>{selectedState}</strong></span>
        </div>
      )}

      {/* Results */}
      {authorities.length === 0 ? (
        <Card className="py-12">
          <CardContent className="flex flex-col items-center gap-3 text-center">
            <AlertCircle className="h-10 w-10 text-muted-foreground" />
            <p className="text-muted-foreground">{t('noAuthoritiesFound')}</p>
          </CardContent>
        </Card>
      ) : (
        Array.from(grouped.entries()).map(([category, items]) => (
          <div key={category} className="space-y-3">
            <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
              {React.createElement(CATEGORY_ICONS[category], { className: 'h-5 w-5 text-primary' })}
              {AUTHORITY_CATEGORY_LABELS[category]}
              <Badge variant="secondary" className="text-xs">{items.length}</Badge>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {items.map(auth => (
                <AuthorityCard key={auth.id} authority={auth} />
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  );
};

const AuthorityCard: React.FC<{ authority: Authority }> = ({ authority }) => {
  const { t } = useTranslation();
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold leading-snug">{authority.name}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-xs text-muted-foreground">{authority.description}</p>

        {authority.phone && (
          <div className="flex items-center gap-2 text-xs">
            <Phone className="h-3.5 w-3.5 text-primary" />
            <a href={`tel:${authority.phone}`} className="text-primary hover:underline font-medium">{authority.phone}</a>
          </div>
        )}

        {authority.address && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <MapPin className="h-3.5 w-3.5" />
            <span>{authority.address}</span>
          </div>
        )}

        <div className="flex flex-wrap gap-2 pt-1">
          {authority.website && (
            <Button size="sm" variant="outline" className="text-xs h-7 gap-1" asChild>
              <a href={authority.website} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-3 w-3" /> {t('visitWebsite')}
              </a>
            </Button>
          )}
          {authority.complaintPortal && (
            <Button size="sm" variant="default" className="text-xs h-7 gap-1" asChild>
              <a href={authority.complaintPortal} target="_blank" rel="noopener noreferrer">
                <FileText className="h-3 w-3" /> {t('fileComplaint')}
              </a>
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default AuthorityFinder;
