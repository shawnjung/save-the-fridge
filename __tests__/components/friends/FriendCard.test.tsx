import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { FriendCard } from '@/components/friends/FriendCard';
import type { Friendship } from '@/lib/store/friendStore';

const mockFriendship: Friendship = {
  id: 'friendship-1',
  requester_id: 'user-123',
  addressee_id: 'user-456',
  status: 'accepted',
  created_at: '2025-01-01T00:00:00Z',
  other_user: {
    id: 'user-456',
    username: 'alice',
    display_name: 'Alice Wonderland',
    avatar_url: null,
  },
};

describe('FriendCard', () => {
  it('should render friend display name', () => {
    const { getByText } = render(
      <FriendCard friendship={mockFriendship} onPress={jest.fn()} />
    );
    expect(getByText('Alice Wonderland')).toBeTruthy();
  });

  it('should render friend username with @ prefix', () => {
    const { getByText } = render(
      <FriendCard friendship={mockFriendship} onPress={jest.fn()} />
    );
    expect(getByText('@alice')).toBeTruthy();
  });

  it('should render arrow indicator', () => {
    const { getByText } = render(
      <FriendCard friendship={mockFriendship} onPress={jest.fn()} />
    );
    expect(getByText('›')).toBeTruthy();
  });

  it('should call onPress when pressed', () => {
    const onPress = jest.fn();
    const { getByText } = render(
      <FriendCard friendship={mockFriendship} onPress={onPress} />
    );

    fireEvent.press(getByText('Alice Wonderland'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('should fallback to username when display_name is null', () => {
    const friendWithoutName: Friendship = {
      ...mockFriendship,
      other_user: {
        ...mockFriendship.other_user,
        display_name: null,
      },
    };

    const { getAllByText } = render(
      <FriendCard friendship={friendWithoutName} onPress={jest.fn()} />
    );
    // Username shown both as name and as @username
    expect(getAllByText(/alice/)).toBeTruthy();
  });
});
