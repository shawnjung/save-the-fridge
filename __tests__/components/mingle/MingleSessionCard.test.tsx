import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { MingleSessionCard } from '@/components/mingle/MingleSessionCard';
import type { MingleSession } from '@/lib/store/mingleStore';

const mockActiveSession: MingleSession = {
  id: 'session-1',
  created_by: 'user-123',
  title: 'Friday Dinner',
  status: 'active',
  created_at: '2025-06-15T18:00:00Z',
  expires_at: '2025-06-16T18:00:00Z',
};

const mockCompletedSession: MingleSession = {
  id: 'session-2',
  created_by: 'user-123',
  title: 'Sunday Brunch',
  status: 'completed',
  created_at: '2025-06-14T10:00:00Z',
  expires_at: '2025-06-15T10:00:00Z',
};

const mockCancelledSession: MingleSession = {
  id: 'session-3',
  created_by: 'user-123',
  title: null,
  status: 'cancelled',
  created_at: '2025-06-13T10:00:00Z',
  expires_at: null,
};

describe('MingleSessionCard', () => {
  it('should render session title', () => {
    const { getByText } = render(
      <MingleSessionCard session={mockActiveSession} onPress={jest.fn()} />
    );
    expect(getByText('Friday Dinner')).toBeTruthy();
  });

  it('should render "Mingle Session" when title is null', () => {
    const { getByText } = render(
      <MingleSessionCard session={mockCancelledSession} onPress={jest.fn()} />
    );
    expect(getByText('Mingle Session')).toBeTruthy();
  });

  it('should render session status', () => {
    const { getByText } = render(
      <MingleSessionCard session={mockActiveSession} onPress={jest.fn()} />
    );
    expect(getByText('active')).toBeTruthy();
  });

  it('should render completed status', () => {
    const { getByText } = render(
      <MingleSessionCard session={mockCompletedSession} onPress={jest.fn()} />
    );
    expect(getByText('completed')).toBeTruthy();
  });

  it('should render cancelled status', () => {
    const { getByText } = render(
      <MingleSessionCard session={mockCancelledSession} onPress={jest.fn()} />
    );
    expect(getByText('cancelled')).toBeTruthy();
  });

  it('should call onPress when pressed', () => {
    const onPress = jest.fn();
    const { getByText } = render(
      <MingleSessionCard session={mockActiveSession} onPress={onPress} />
    );

    fireEvent.press(getByText('Friday Dinner'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('should render the date', () => {
    const { getByText } = render(
      <MingleSessionCard session={mockActiveSession} onPress={jest.fn()} />
    );
    // Check that some date string is rendered (format depends on locale)
    const dateStr = new Date('2025-06-15T18:00:00Z').toLocaleDateString();
    expect(getByText(dateStr)).toBeTruthy();
  });
});
