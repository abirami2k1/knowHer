import { useMutation } from '@tanstack/react-query';
import { useState } from 'react';
import { toast } from 'sonner';
import { DeleteAccountSheet } from '@/components/profile/DeleteAccountSheet';
import { Button } from '@/components/ui/Button';
import { Card, Eyebrow } from '@/components/ui/Card';
import { getAccountExport } from '@/lib/api/account';
import { todayIsoDate } from '@/lib/dates';
import { friendlyError } from '@/lib/errors';

/** Hands the export to the browser as a file — it never sits in a URL or a cache. */
function saveAsFile(data: unknown) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `knowher-export-${todayIsoDate()}.json`;
  link.click();
  URL.revokeObjectURL(url);
}

/** Her data is hers: take a copy, or take it all away. */
export function YourData({ onDeleted }: { onDeleted: () => void }) {
  const [confirming, setConfirming] = useState(false);
  const exporter = useMutation({
    mutationFn: getAccountExport,
    onSuccess: (data) => {
      saveAsFile(data);
      toast.success('Your data is downloading');
    },
    onError: (error: unknown) => toast.error(friendlyError(error)),
  });

  return (
    <Card className="space-y-4 p-5">
      <div>
        <Eyebrow>Your data</Eyebrow>
        <p className="mt-2 text-[15px] leading-relaxed text-ink-soft">
          Everything knowHer holds about you, as one file you can keep. Or remove it all.
        </p>
      </div>
      <Button variant="secondary" onClick={() => exporter.mutate()} loading={exporter.isPending}>
        Download my data
      </Button>
      <Button variant="ghost" onClick={() => setConfirming(true)} className="text-primary">
        Delete my account
      </Button>
      <DeleteAccountSheet
        open={confirming}
        onClose={() => setConfirming(false)}
        onDeleted={onDeleted}
      />
    </Card>
  );
}
