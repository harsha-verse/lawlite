import React from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Scale, FileText, Users, MessageCircle, Shield, Building, Heart, Laptop, Globe, UserCheck, Briefcase, Gavel, Home, Zap } from 'lucide-react';

const Services: React.FC = () => {
  const { t } = useTranslation();

  const mainServices = [
    { title: t('businessSetup'), description: t('businessSetupDesc'), icon: Building, color: 'bg-blue-500', href: '/templates?category=business' },
    { title: t('documentation'), description: t('documentationDesc'), icon: FileText, color: 'bg-green-500', href: '/templates' },
    { title: t('disputes'), description: t('disputesDesc'), icon: Scale, color: 'bg-red-500', href: '/lawyers?specialization=civil' },
    { title: t('consultant'), description: t('consultantDesc'), icon: UserCheck, color: 'bg-purple-500', href: '/consultants' },
    { title: t('legalAdvice'), description: t('legalAdviceDesc'), icon: MessageCircle, color: 'bg-orange-500', href: '/chat' },
  ];

  const legalCategories = [
    { title: t('familyLaw'), description: 'Divorce, custody, matrimonial disputes', icon: Heart, cases: '2,500+ ' + t('casesHandled'), href: '/lawyers?specialization=family' },
    { title: t('criminalLaw'), description: 'Criminal defense, bail applications', icon: Gavel, cases: '1,800+ ' + t('casesHandled'), href: '/lawyers?specialization=criminal' },
    { title: t('cyberLaw'), description: 'Cybercrime, data protection, IT law', icon: Laptop, cases: '950+ ' + t('casesHandled'), href: '/lawyers?specialization=cyber' },
    { title: t('civilLaw'), description: 'Property disputes, contracts, torts', icon: Users, cases: '3,200+ ' + t('casesHandled'), href: '/lawyers?specialization=civil' },
    { title: t('corporateLaw'), description: 'Business law, mergers, compliance', icon: Building, cases: '1,200+ ' + t('casesHandled'), href: '/lawyers?specialization=corporate' },
    { title: t('propertyLaw'), description: 'Real estate, land acquisition, property disputes', icon: Home, cases: '2,100+ ' + t('casesHandled'), href: '/lawyers?specialization=property' },
  ];

  const additionalServices = [
    { title: t('legalInformation'), description: t('legalInformationDesc'), icon: Globe },
    { title: t('crossborderLaws'), description: t('crossborderLawsDesc'), icon: Globe },
    { title: t('legalAid'), description: t('legalAidDesc'), icon: Shield },
    { title: t('trafficLaws'), description: t('trafficLawsDesc'), icon: Zap },
    { title: t('publicInterest'), description: t('publicInterestDesc'), icon: Users },
    { title: t('immigration'), description: t('immigrationDesc'), icon: Globe },
    { title: t('intellectualProperty'), description: t('intellectualPropertyDesc'), icon: Briefcase },
  ];

  return (
    <div className="p-6 space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-foreground">{t('services')}</h1>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">{t('servicesSubtitle')}</p>
      </div>

      <section>
        <h2 className="text-2xl font-bold mb-6">{t('coreServices')}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {mainServices.map((service) => {
            const Icon = service.icon;
            return (
              <Link key={service.href} to={service.href}>
                <Card className="hover:shadow-lg transition-all duration-300 cursor-pointer h-full group">
                  <CardHeader>
                    <div className={`w-14 h-14 ${service.color} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                      <Icon className="h-7 w-7 text-white" />
                    </div>
                    <CardTitle className="text-xl">{service.title}</CardTitle>
                  </CardHeader>
                  <CardContent><CardDescription className="text-base">{service.description}</CardDescription></CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-6">{t('legalSpecializations')}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {legalCategories.map((category) => {
            const Icon = category.icon;
            return (
              <Link key={category.href} to={category.href}>
                <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                  <CardHeader>
                    <div className="flex items-start space-x-4">
                      <div className="bg-primary/10 p-3 rounded-lg"><Icon className="h-6 w-6 text-primary" /></div>
                      <div className="flex-1">
                        <CardTitle className="text-lg">{category.title}</CardTitle>
                        <CardDescription className="mt-2">{category.description}</CardDescription>
                        <p className="text-sm text-primary font-medium mt-3">{category.cases}</p>
                      </div>
                    </div>
                  </CardHeader>
                </Card>
              </Link>
            );
          })}
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-6">{t('additionalServices')}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {additionalServices.map((service, index) => {
            const Icon = service.icon;
            return (
              <Card key={index} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3">
                    <div className="bg-accent/10 p-2 rounded-lg"><Icon className="h-5 w-5 text-accent" /></div>
                    <div><h3 className="font-semibold text-sm">{service.title}</h3><p className="text-xs text-muted-foreground mt-1">{service.description}</p></div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      <section className="bg-primary/5 rounded-xl p-8">
        <h2 className="text-2xl font-bold text-center mb-8">{t('whyChooseLawlite')}</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="text-center"><div className="text-3xl font-bold text-primary mb-2">500+</div><div className="text-muted-foreground">{t('verifiedLawyers')}</div></div>
          <div className="text-center"><div className="text-3xl font-bold text-primary mb-2">10,000+</div><div className="text-muted-foreground">{t('casesResolved')}</div></div>
          <div className="text-center"><div className="text-3xl font-bold text-primary mb-2">50+</div><div className="text-muted-foreground">{t('legalTemplatesCount')}</div></div>
          <div className="text-center"><div className="text-3xl font-bold text-primary mb-2">24/7</div><div className="text-muted-foreground">{t('aiLegalAssistant')}</div></div>
        </div>
      </section>

      <section className="text-center space-y-6 py-8">
        <h2 className="text-3xl font-bold">{t('readyToStart')}</h2>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">{t('readyToStartDesc')}</p>
        <div className="flex justify-center space-x-4">
          <Button size="lg" asChild><Link to="/lawyers">{t('findALawyer')}</Link></Button>
          <Button size="lg" variant="outline" asChild><Link to="/templates">{t('browseTemplates')}</Link></Button>
        </div>
      </section>
    </div>
  );
};

export default Services;
