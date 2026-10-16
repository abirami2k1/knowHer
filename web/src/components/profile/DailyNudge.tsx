import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Card, Eyebrow } from '@/components/ui/Card';
import { useNudge } from '@/hooks/useNudge';
import type { NudgeBlocker } from '@/lib/push-browser';

/**
 * Why the nudge is not on offer here, said plainly. On an iPhone especially:
 * the switch is not broken, the app simply has to be on the home screen first,
 * and being told that is kinder than a toggle that does nothing.
 */
const BLOCKER_COPY: Record<NudgeBlocker, string> = {
  install_first:
    'On iPhone and iPad, reminders need knowHer added to your home screen first — tap Share, then “Add to Home Screen”, and open it from there. (iOS 16.4 or later.)',
  denied:
    'This browser is set to block notifications from knowHer. You can change that in your browser’s settings for this site, then come back.',
  unsupported: 'This browser can’t send reminders. Opening knowHer on your phone usually can.',
};

/** Opt in to one reminder a day, on this browser, at a time she picks. */
export function DailyNudge() {
  const nudge = useNudge();
  // Null until she touches the field, so the input follows whatever the API
  // reports until there is an edit of her own to preserve.
  const [edited, setEdited] = useState<string | null>(null);
  const time = edited ?? nudge.nudgeTime;

  return (
    <Card className="space-y-4 p-5">
      <div>
        <Eyebrow>Daily reminder</Eyebrow>
        <p className="mt-2 text-[15px] leading-relaxed text-ink-soft">
          One quiet nudge a day to log, on this device. It says nothing about your cycle — just that
          you’re here.
        </p>
      </div>

      {nudge.blocker ? (
        <p className="rounded-2xl bg-surface-sunken p-4 text-sm leading-relaxed text-ink-soft">
          {BLOCKER_COPY[nudge.blocker]}
        </p>
      ) : (
        <>
          <div className="space-y-2">
            <label htmlFor="nudge-time" className="block text-sm font-medium text-ink">
              Remind me at
            </label>
            <input
              id="nudge-time"
              type="time"
              value={time}
              onChange={(event) => setEdited(event.target.value)}
              className="block min-h-12 w-full rounded-2xl bg-surface px-4 text-base text-ink ring-1 ring-line focus:ring-2 focus:ring-primary focus:outline-none"
            />
            <p className="text-sm leading-relaxed text-muted">
              Your own local time, wherever you are.
            </p>
          </div>

          {nudge.isOn ? (
            <>
              <p className="text-sm text-calm" role="status">
                Reminders are on for this device.
              </p>
              {time !== nudge.nudgeTime && (
                <Button
                  onClick={() => {
                    nudge.changeTime(time);
                    setEdited(null);
                  }}
                  loading={nudge.isSaving}
                >
                  Save {time}
                </Button>
              )}
              <Button variant="ghost" onClick={nudge.turnOff} disabled={nudge.isSaving}>
                Turn reminders off
              </Button>
            </>
          ) : (
            <Button
              onClick={() => {
                nudge.turnOn(time);
                setEdited(null);
              }}
              loading={nudge.isSaving}
              disabled={nudge.isLoading}
            >
              Remind me daily
            </Button>
          )}
        </>
      )}
    </Card>
  );
}
