import { Card } from '@/components/ui/Card';
import { Txt } from '@/components/ui/Txt';
import { Button } from '@/components/ui/Button';

interface Props {
  title: string;
  message?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({ title, message, actionLabel, onAction }: Props) {
  return (
    <Card>
      <Txt variant="heading">{title}</Txt>
      {message ? <Txt variant="small">{message}</Txt> : null}
      {actionLabel && onAction ? <Button label={actionLabel} onPress={onAction} size="sm" style={{ alignSelf: 'flex-start' }} /> : null}
    </Card>
  );
}
