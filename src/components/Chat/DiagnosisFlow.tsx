import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { motion, AnimatePresence } from 'framer-motion';
import { Stethoscope, ArrowRight, RotateCcw, Send } from 'lucide-react';
import { CATEGORY_STEP, FOLLOW_UP_STEPS, buildDiagnosisSummary, type DiagnosisStep } from './diagnosisData';

interface DiagnosisFlowProps {
  onComplete: (summary: string, category: string) => void;
  onCancel: () => void;
}

const DiagnosisFlow: React.FC<DiagnosisFlowProps> = ({ onComplete, onCancel }) => {
  const { t } = useTranslation();
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [freeText, setFreeText] = useState('');
  const [showFreeText, setShowFreeText] = useState(false);

  // Get current steps list
  const steps: DiagnosisStep[] = selectedCategory
    ? [CATEGORY_STEP, ...(FOLLOW_UP_STEPS[selectedCategory] || [])]
    : [CATEGORY_STEP];

  const currentStep = steps[currentStepIndex];
  const isLastStep = currentStepIndex === steps.length - 1;
  const totalSteps = selectedCategory ? steps.length : 1;

  const handleOptionSelect = (value: string) => {
    if (currentStepIndex === 0) {
      // Category selection
      if (value === 'other') {
        setSelectedCategory('other');
        setShowFreeText(true);
        return;
      }
      setSelectedCategory(value);
      setAnswers({});
      // If category has follow-up steps, advance
      if (FOLLOW_UP_STEPS[value]?.length > 0) {
        setCurrentStepIndex(1);
      } else {
        // No follow-ups, show free text
        setShowFreeText(true);
      }
    } else {
      // Follow-up answer
      const newAnswers = { ...answers, [currentStep.id]: value };
      setAnswers(newAnswers);

      if (isLastStep) {
        // All questions answered, submit
        const summary = buildDiagnosisSummary(selectedCategory!, newAnswers, freeText || undefined);
        onComplete(summary, selectedCategory!);
      } else {
        setCurrentStepIndex(currentStepIndex + 1);
      }
    }
  };

  const handleFreeTextSubmit = () => {
    if (!freeText.trim() && selectedCategory === 'other') return;
    const summary = buildDiagnosisSummary(selectedCategory || 'other', answers, freeText || undefined);
    onComplete(summary, selectedCategory || 'other');
  };

  const handleRestart = () => {
    setCurrentStepIndex(0);
    setSelectedCategory(null);
    setAnswers({});
    setFreeText('');
    setShowFreeText(false);
  };

  const progress = totalSteps > 1 ? ((currentStepIndex + 1) / totalSteps) * 100 : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card border rounded-lg p-4 mx-2 my-2 shadow-sm"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center">
            <Stethoscope className="h-4 w-4 text-primary" />
          </div>
          <div>
            <p className="text-sm font-semibold">{t('diagTitle')}</p>
            <p className="text-[10px] text-muted-foreground">{t('diagSubtitle')}</p>
          </div>
        </div>
        <div className="flex gap-1">
          {currentStepIndex > 0 && (
            <Button variant="ghost" size="sm" className="h-6 text-xs" onClick={handleRestart}>
              <RotateCcw className="h-3 w-3 mr-1" /> {t('diagRestart')}
            </Button>
          )}
          <Button variant="ghost" size="sm" className="h-6 text-xs text-muted-foreground" onClick={onCancel}>
            {t('close')}
          </Button>
        </div>
      </div>

      {/* Progress bar */}
      {totalSteps > 1 && (
        <div className="w-full bg-muted rounded-full h-1.5 mb-3">
          <motion.div
            className="bg-primary h-1.5 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      )}

      {/* Free text input for "other" or after all steps */}
      <AnimatePresence mode="wait">
        {showFreeText ? (
          <motion.div
            key="freetext"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <p className="text-sm font-medium mb-2">{t('diagDescribeProblem')}</p>
            <div className="flex gap-2">
              <Input
                value={freeText}
                onChange={(e) => setFreeText(e.target.value)}
                placeholder={t('diagFreeTextPlaceholder')}
                className="text-sm"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleFreeTextSubmit();
                }}
              />
              <Button size="sm" onClick={handleFreeTextSubmit} disabled={!freeText.trim() && selectedCategory === 'other'}>
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key={currentStep?.id || 'loading'}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            {/* Question */}
            <p className="text-sm font-medium mb-3">{t(currentStep.questionKey)}</p>

            {/* Step indicator */}
            {totalSteps > 1 && (
              <p className="text-[10px] text-muted-foreground mb-2">
                {t('diagStep', { current: currentStepIndex + 1, total: totalSteps })}
              </p>
            )}

            {/* Options */}
            <div className="grid grid-cols-1 gap-1.5">
              {currentStep.options.map((option) => (
                <button
                  key={option.value}
                  onClick={() => handleOptionSelect(option.value)}
                  className="flex items-center justify-between px-3 py-2 rounded-md border border-border bg-background hover:bg-primary/5 hover:border-primary/30 transition-all text-left text-sm group"
                >
                  <span>{t(option.label)}</span>
                  <ArrowRight className="h-3.5 w-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
              ))}
            </div>

            {/* Free text option for category step */}
            {currentStep.allowFreeText && (
              <button
                onClick={() => {
                  setSelectedCategory('other');
                  setShowFreeText(true);
                }}
                className="mt-2 w-full text-xs text-primary hover:underline text-center"
              >
                {t('diagTypeInstead')}
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default DiagnosisFlow;
