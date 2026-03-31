import React from 'react';
import { differenceInDays, parseISO } from 'date-fns';
import { Badge } from '@/components/ui/Badge';

type ExpiryBadgeProps = {
  expiryDate: string | null;
};

export function ExpiryBadge({ expiryDate }: ExpiryBadgeProps) {
  if (!expiryDate) return null;

  const daysUntilExpiry = differenceInDays(parseISO(expiryDate), new Date());

  if (daysUntilExpiry < 0) {
    return <Badge label="Expired" variant="danger" />;
  }

  if (daysUntilExpiry <= 3) {
    return <Badge label={`${daysUntilExpiry}d left`} variant="warning" />;
  }

  if (daysUntilExpiry <= 7) {
    return <Badge label={`${daysUntilExpiry}d left`} variant="default" />;
  }

  return null;
}
