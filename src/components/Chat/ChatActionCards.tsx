import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { Star, MapPin, Scale, FileText, BookOpen, ChevronRight, Landmark, FilePlus } from 'lucide-react';
import { detectContext, matchLawyers, matchTemplates, getGuideRoute, getAuthorityRoute, type MatchedLawyer, type MatchedTemplate } from './chatActionUtils';

interface ChatActionCardsProps { messageContent: string; }

const ChatActionCards: React.FC<ChatActionCardsProps> = ({ messageContent }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { profile } = useAuth();
  const userState = profile?.state;
  const ctx = detectContext(messageContent);
  const lawyers = matchLawyers(ctx.categories, userState);
  const templates = ctx.needsTemplate ? matchTemplates(ctx.categories) : [];
  const guide = getGuideRoute(ctx.categories);
  const authority = getAuthorityRoute(ctx.categories);

  return (
    <div className="space-y-3 mt-3">
      <div className="bg-primary/5 rounded-lg p-3 border border-primary/10">
        <p className="text-xs font-semibold text-primary mb-2">{t('quickActionsLabel')}</p>
        <div className="flex flex-wrap gap-2">
          <Button size="sm" variant="default" className="text-xs h-7 gap-1" onClick={() => navigate(`/lawyers?category=${ctx.categories[0]}`)}><Scale className="h-3 w-3" /> {t('consultALawyer')}</Button>
          {templates.length > 0 && (<Button size="sm" variant="outline" className="text-xs h-7 gap-1" onClick={() => navigate(`/templates?category=${ctx.categories[0]}`)}><FileText className="h-3 w-3" /> {t('downloadTemplate')}</Button>)}
          <Button size="sm" variant="outline" className="text-xs h-7 gap-1" onClick={() => navigate(guide.path)}><BookOpen className="h-3 w-3" /> {t('viewStepByStepGuide')}</Button>
          <Button size="sm" variant="outline" className="text-xs h-7 gap-1" onClick={() => navigate(authority.path)}><Landmark className="h-3 w-3" /> {t('findAuthority')}</Button>
          <Button size="sm" variant="outline" className="text-xs h-7 gap-1" onClick={() => navigate(`/generate-document`)}><FilePlus className="h-3 w-3" /> {t('generateDocument')}</Button>
        </div>
      </div>
      {ctx.needsLawyer && lawyers.length > 0 && (
        <div className="bg-card rounded-lg p-3 border">
          <p className="text-xs font-semibold mb-2">{ctx.isComplex ? t('complexIssueWarning') : t('recommendedLawyers')}</p>
          <div className="space-y-2">{lawyers.map((lawyer) => (<LawyerMiniCard key={lawyer.id} lawyer={lawyer} onClick={() => navigate(`/lawyers?category=${lawyer.category}`)} />))}</div>
        </div>
      )}

      {templates.length > 0 && (
        <div className="bg-card rounded-lg p-3 border">
          <p className="text-xs font-semibold mb-2">{t('helpfulDocuments')}</p>
          <div className="space-y-1.5">{templates.map((tpl) => (<TemplateMiniCard key={tpl.id} template={tpl} onClick={() => navigate(`/templates?category=${tpl.category}`)} />))}</div>
        </div>
      )}
    </div>
  );
};

const LawyerMiniCard: React.FC<{ lawyer: MatchedLawyer; onClick: () => void }> = ({ lawyer, onClick }) => (
  <button onClick={onClick} className="w-full flex items-center justify-between p-2 rounded-md bg-muted/50 hover:bg-muted transition-colors text-left">
    <div className="flex-1 min-w-0">
      <p className="text-xs font-medium truncate">{lawyer.name}</p>
      <div className="flex items-center gap-2 text-[10px] text-muted-foreground mt-0.5">
        <span>{lawyer.specialization}</span>
        <span className="flex items-center gap-0.5"><MapPin className="h-2.5 w-2.5" />{lawyer.location}</span>
        <span className="flex items-center gap-0.5"><Star className="h-2.5 w-2.5 fill-yellow-400 text-yellow-400" />{lawyer.rating}</span>
      </div>
    </div>
    <ChevronRight className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
  </button>
);

const TemplateMiniCard: React.FC<{ template: MatchedTemplate; onClick: () => void }> = ({ template, onClick }) => (
  <button onClick={onClick} className="w-full flex items-center justify-between p-2 rounded-md bg-muted/50 hover:bg-muted transition-colors text-left">
    <div className="flex items-center gap-2"><FileText className="h-3.5 w-3.5 text-primary flex-shrink-0" /><span className="text-xs font-medium">{template.title}</span></div>
    <ChevronRight className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
  </button>
);

export default ChatActionCards;
