import { useMutation } from '@tanstack/react-query';
import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Field } from '@/components/ui/Field';
import { Sheet } from '@/components/ui/Sheet';
import { deleteAccount } from '@/lib/api/account';
import { ApiClientError } from '@/lib/api/client';

const PHRASE = 'delete my account';

interface DeleteAccountSheetProps {
  open: boolean;
  onClose: () => void;
  onDeleted: () => void;
}

/**
 * Permanent deletion, asked plainly. She types the phrase herself; the API checks
 * it too. Nothing here is undoable, so the sheet says exactly what goes.
 */
export function DeleteAccountSheet({ open, onClose, onDeleted }: DeleteAccountSheetProps) {
  const [typed, setTyped] = useState('');
  const remove = useMutation({ mutationFn: deleteAccount, onSuccess: onDeleted });
  const matches = typed.trim().toLowerCase() === PHRASE;

  const error =
    remove.error instanceof ApiClientError
      ? remove.error.message
      : remove.error
        ? 'Something went wrong. Nothing was deleted — please try again.'
        : null;

  return (
    <Sheet
      open={open}
      onClose={onClose}
      title="Delete your account"
      footer={
        <Button onClick={() => remove.mutate()} disabled={!matches} loading={remove.isPending}>
          Delete everything
        </Button>
      }
    >
      <div className="space-y-5 text-[15px] leading-relaxed text-ink-soft">
        <p>
          This permanently removes your profile, every cycle, every daily log and your sign-in. It
          can't be undone, and we keep no copy.
        </p>
        <p>If you'd like your data first, download it from your profile before you go.</p>
        <Field
          label={`Type "${PHRASE}" to confirm`}
          value={typed}
          onChange={(e) => setTyped(e.target.value)}
          autoComplete="off"
          autoCapitalize="none"
          spellCheck={false}
          error={error ?? undefined}
        />
      </div>
    </Sheet>
  );
}
