import React from 'react';
import { render } from '@testing-library/react-native';
import { ExpiryBadge } from '@/components/shelf/ExpiryBadge';
import { differenceInDays, parseISO, format, addDays } from 'date-fns';

// Create ISO date string for a date N days from now at noon to avoid day-boundary issues
function daysFromNow(days: number): string {
  const date = addDays(new Date(), days);
  return format(date, 'yyyy-MM-dd');
}

describe('ExpiryBadge', () => {
  it('should return null when expiryDate is null', () => {
    const { toJSON } = render(<ExpiryBadge expiryDate={null} />);
    expect(toJSON()).toBeNull();
  });

  it('should show "Expired" badge for past dates', () => {
    const { getByText } = render(
      <ExpiryBadge expiryDate={daysFromNow(-2)} />
    );
    expect(getByText('Expired')).toBeTruthy();
  });

  it('should show days left badge for items expiring within 3 days', () => {
    const dateStr = daysFromNow(1);
    const expected = differenceInDays(parseISO(dateStr), new Date());
    const { getByText } = render(
      <ExpiryBadge expiryDate={dateStr} />
    );
    expect(getByText(`${expected}d left`)).toBeTruthy();
  });

  it('should show days left badge for items expiring today', () => {
    const dateStr = daysFromNow(0);
    const { getByText } = render(
      <ExpiryBadge expiryDate={dateStr} />
    );
    expect(getByText('0d left')).toBeTruthy();
  });

  it('should show days left badge for items expiring within 7 days', () => {
    const dateStr = daysFromNow(5);
    const expected = differenceInDays(parseISO(dateStr), new Date());
    const { getByText } = render(
      <ExpiryBadge expiryDate={dateStr} />
    );
    expect(getByText(`${expected}d left`)).toBeTruthy();
  });

  it('should return null for items expiring in more than 7 days', () => {
    const { toJSON } = render(
      <ExpiryBadge expiryDate={daysFromNow(10)} />
    );
    expect(toJSON()).toBeNull();
  });
});
