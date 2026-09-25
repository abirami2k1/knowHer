import { useMutation, useQueryClient } from '@tanstack/react-query';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { Navigate, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Button } from '@/components/ui/Button';
import { useMe } from '@/hooks/useMe';
import { buildRequest, useOnboarding } from '@/hooks/useOnboarding';
import { postOnboarding } from '@/lib/api/onboarding';
import {
  ConfirmStep,
  GoalsStep,
  HealthStep,
  HistoryStep,
  ProfileStep,
  TrackingStep,
  WelcomeStep,
} from './steps';

export default function Onboarding() {
  const me = useMe();
  const flow = useOnboarding();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const reduceMotion = useReducedMotion();
  const shift = reduceMotion ? 0 : 16;

  const submit = useMutation({
    mutationFn: () => postOnboarding(buildRequest(flow.draft)),
    onSuccess: (profile) => {
      queryClient.setQueryData(['me'], profile);
      toast.success(`You're all set${profile.displayName ? `, ${profile.displayName}` : ''}.`);
      navigate('/', { replace: true });
    },
    onError: (error: Error) => toast.error(error.message),
  });

  // 5.2.9: someone who has already finished never sees the flow again.
  if (me.data?.onboardedAt) return <Navigate to="/" replace />;

  const { draft, step, set, toggleCondition, toggleGoal } = flow;

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col px-4 py-8">
      <div className="mb-6 space-y-2">
        <p className="text-sm text-muted" role="status" aria-live="polite">
          Step {flow.stepNumber} of {flow.stepCount}
        </p>
        <div
          className="h-1.5 overflow-hidden rounded-full bg-primary/10"
          role="progressbar"
          aria-valuenow={flow.stepNumber}
          aria-valuemin={1}
          aria-valuemax={flow.stepCount}
          aria-label="Onboarding progress"
        >
          <motion.div
            className="h-full bg-primary"
            initial={false}
            animate={{ width: `${(flow.stepNumber / flow.stepCount) * 100}%` }}
            transition={{ duration: reduceMotion ? 0 : 0.3, ease: 'easeOut' }}
          />
        </div>
      </div>

      <div className="flex-1">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={step}
            initial={{ opacity: 0, x: shift }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -shift }}
            transition={{ duration: reduceMotion ? 0 : 0.2, ease: 'easeOut' }}
          >
            {step === 'welcome' && <WelcomeStep />}
            {step === 'profile' && <ProfileStep draft={draft} set={set} />}
            {step === 'history' && <HistoryStep draft={draft} set={set} />}
            {step === 'health' && <HealthStep draft={draft} toggleCondition={toggleCondition} />}
            {step === 'goals' && <GoalsStep draft={draft} toggleGoal={toggleGoal} />}
            {step === 'tracking' && <TrackingStep draft={draft} set={set} />}
            {step === 'confirm' && <ConfirmStep draft={draft} />}
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="mt-8 space-y-3">
        {flow.isLast ? (
          <Button onClick={() => submit.mutate()} loading={submit.isPending}>
            Take me to knowHer
          </Button>
        ) : (
          <Button onClick={flow.next} disabled={!flow.canAdvance}>
            {flow.isFirst ? "Let's begin" : 'Continue'}
          </Button>
        )}
        {!flow.isFirst && (
          <Button variant="ghost" onClick={flow.back} disabled={submit.isPending}>
            Back
          </Button>
        )}
      </div>
    </main>
  );
}
