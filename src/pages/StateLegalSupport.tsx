import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, MapPin, Scale, AlertTriangle, ExternalLink, BookOpen } from 'lucide-react';

interface StateInfo {
  id: string; name: string;
  importantRules: { title: string; description: string; category: string }[];
  commonIssues: string[];
  governmentPortals: { name: string; url: string }[];
  localVariations?: string[];
}

const statesData: StateInfo[] = [
  { id: 'maharashtra', name: 'Maharashtra', importantRules: [{ title: 'Stamp Duty on Property', description: 'Stamp duty ranges from 3% to 6% depending on location. Women buyers get 1% concession in some areas.', category: 'property' }, { title: 'Rent Control Act', description: 'Maharashtra Rent Control Act 1999 governs tenant-landlord relationships.', category: 'rental' }, { title: 'Police Verification', description: 'Mandatory for all tenants within 15 days of occupancy.', category: 'police' }, { title: 'Civil Court Jurisdiction', description: 'District courts handle civil matters up to ₹5 crore.', category: 'civil' }], commonIssues: ['Tenant eviction disputes', 'Property registration delays', 'RERA complaints', 'Cooperative housing society disputes', 'Domestic violence complaints'], governmentPortals: [{ name: 'MahaRERA', url: 'https://maharera.mahaonline.gov.in' }, { name: 'IGR Maharashtra', url: 'https://igrmaharashtra.gov.in' }], localVariations: ['Mumbai has separate rent control provisions under the Bombay Rents Act'] },
  { id: 'karnataka', name: 'Karnataka', importantRules: [{ title: 'Karnataka Rent Act 1999', description: 'Regulates residential and commercial tenancy.', category: 'rental' }, { title: 'Property Registration', description: 'Stamp duty is 5% for properties above ₹45 lakh.', category: 'property' }], commonIssues: ['Tenant deposit return disputes', 'Unauthorized construction penalties', 'Land encroachment cases'], governmentPortals: [{ name: 'K-RERA', url: 'https://rera.karnataka.gov.in' }, { name: 'Kaveri Online', url: 'https://kaverionline.karnataka.gov.in' }] },
  { id: 'delhi', name: 'Delhi', importantRules: [{ title: 'Delhi Rent Control Act', description: 'Applies to premises rented before 1988.', category: 'rental' }, { title: 'Property Registration', description: 'Stamp duty is 4% for women, 6% for men.', category: 'property' }], commonIssues: ['Unauthorized colony regularization', 'DDA flat allotment disputes', 'Traffic challan disputes'], governmentPortals: [{ name: 'Delhi Revenue Dept', url: 'https://revenue.delhi.gov.in' }] },
  { id: 'tamilnadu', name: 'Tamil Nadu', importantRules: [{ title: 'TN Rent Control Act', description: 'Governs all rental properties.', category: 'rental' }, { title: 'Property Registration', description: 'Stamp duty is 7% and registration fee is 4%.', category: 'property' }], commonIssues: ['Land grabbing', 'Temple land disputes', 'Labour court cases'], governmentPortals: [{ name: 'TNRERA', url: 'https://tnrera.in' }] },
  { id: 'kerala', name: 'Kerala', importantRules: [{ title: 'Kerala Rent Control Act', description: 'Fair rent determination by Rent Control Court.', category: 'rental' }, { title: 'Property Registration', description: 'Stamp duty is 8% and registration fee is 2%.', category: 'property' }], commonIssues: ['CRZ violation disputes', 'NRI property inheritance cases'], governmentPortals: [{ name: 'Kerala RERA', url: 'https://rera.kerala.gov.in' }] },
];

const categoryColors: Record<string, string> = { property: 'bg-primary/10 text-primary', rental: 'bg-secondary/20 text-secondary-foreground', police: 'bg-accent/20 text-accent-foreground', civil: 'bg-muted text-muted-foreground' };

const StateLegalSupport: React.FC = () => {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedState, setSelectedState] = useState<string>(statesData[0].id);
  const filteredStates = statesData.filter((state) => state.name.toLowerCase().includes(searchQuery.toLowerCase()));
  const currentState = statesData.find((s) => s.id === selectedState) || statesData[0];

  return (
    <div className="p-6 space-y-6">
      <div><h1 className="text-3xl font-bold text-foreground mb-2">{t('stateLegalSupport')}</h1><p className="text-muted-foreground">{t('stateLegalSupportSubtitle')}</p></div>
      <div className="relative max-w-md"><Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" /><Input type="search" placeholder={t('searchStatesPlaceholder')} value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10" /></div>

      <Tabs value={selectedState} onValueChange={setSelectedState}>
        <TabsList className="flex flex-wrap h-auto gap-1">{filteredStates.map((state) => (<TabsTrigger key={state.id} value={state.id} className="flex items-center gap-1"><MapPin className="h-3 w-3" />{state.name}</TabsTrigger>))}</TabsList>
        <TabsContent value={selectedState} className="mt-6 space-y-6">
          <div><h2 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2"><Scale className="h-5 w-5 text-primary" />{t('importantLegalRules')}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">{currentState.importantRules.map((rule, idx) => (<Card key={idx}><CardHeader className="pb-2"><div className="flex items-start justify-between gap-2"><CardTitle className="text-base">{rule.title}</CardTitle><Badge variant="outline" className={categoryColors[rule.category]}>{rule.category}</Badge></div></CardHeader><CardContent><p className="text-sm text-muted-foreground">{rule.description}</p></CardContent></Card>))}</div>
          </div>
          <Card><CardHeader><CardTitle className="flex items-center gap-2"><AlertTriangle className="h-5 w-5 text-destructive" />{t('commonLegalIssuesTitle')}</CardTitle><CardDescription>{t('frequentlyReported')} {currentState.name}</CardDescription></CardHeader><CardContent><ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">{currentState.commonIssues.map((issue, idx) => (<li key={idx} className="flex items-center gap-2 text-sm text-muted-foreground"><span className="h-1.5 w-1.5 rounded-full bg-primary shrink-0" />{issue}</li>))}</ul></CardContent></Card>
          <Card><CardHeader><CardTitle className="flex items-center gap-2"><ExternalLink className="h-5 w-5 text-primary" />{t('governmentPortals')}</CardTitle><CardDescription>{t('importantResources')} {currentState.name}</CardDescription></CardHeader><CardContent><div className="grid grid-cols-1 sm:grid-cols-2 gap-3">{currentState.governmentPortals.map((portal, idx) => (<a key={idx} href={portal.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 p-3 rounded-lg border hover:bg-accent/10 transition-colors text-sm"><ExternalLink className="h-4 w-4 text-primary shrink-0" /><span className="text-foreground font-medium">{portal.name}</span></a>))}</div></CardContent></Card>
          {currentState.localVariations && currentState.localVariations.length > 0 && (<Card className="bg-primary/5 border-primary/10"><CardHeader><CardTitle className="flex items-center gap-2"><BookOpen className="h-5 w-5 text-primary" />{t('localLawVariations')}</CardTitle></CardHeader><CardContent><ul className="space-y-2">{currentState.localVariations.map((v, idx) => (<li key={idx} className="flex items-start gap-2 text-sm text-muted-foreground"><span className="h-1.5 w-1.5 rounded-full bg-primary shrink-0 mt-1.5" />{v}</li>))}</ul></CardContent></Card>)}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default StateLegalSupport;
