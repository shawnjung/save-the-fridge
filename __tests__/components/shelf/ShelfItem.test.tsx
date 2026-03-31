import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { ShelfItem } from '@/components/shelf/ShelfItem';
import type { ShelfItem as ShelfItemType } from '@/lib/store/shelfStore';

// Mock the ExpiryBadge component
jest.mock('@/components/shelf/ExpiryBadge', () => ({
  ExpiryBadge: ({ expiryDate }: { expiryDate: string | null }) => {
    if (!expiryDate) return null;
    const React = require('react');
    const { Text } = require('react-native');
    return React.createElement(Text, null, `Expiry: ${expiryDate}`);
  },
}));

const mockItem: ShelfItemType = {
  id: 'item-1',
  user_id: 'user-123',
  name: 'Milk',
  category: 'dairy',
  storage_type: 'fridge',
  quantity: 1,
  unit: 'L',
  expiry_date: '2025-12-31',
  is_shared: true,
  image_url: null,
  notes: null,
  created_at: '2025-01-01T00:00:00Z',
};

describe('ShelfItem', () => {
  it('should render item name', () => {
    const { getByText } = render(<ShelfItem item={mockItem} />);
    expect(getByText('Milk')).toBeTruthy();
  });

  it('should render quantity and unit', () => {
    const { getByText } = render(<ShelfItem item={mockItem} />);
    expect(getByText('1 L')).toBeTruthy();
  });

  it('should render category emoji', () => {
    const { getByText } = render(<ShelfItem item={mockItem} />);
    expect(getByText('🧀')).toBeTruthy();
  });

  it('should call onPress when pressed', () => {
    const onPress = jest.fn();
    const { getByText } = render(
      <ShelfItem item={mockItem} onPress={onPress} />
    );

    fireEvent.press(getByText('Milk'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('should show lock icon for private items', () => {
    const privateItem = { ...mockItem, is_shared: false };
    const { getByText } = render(<ShelfItem item={privateItem} />);
    expect(getByText('🔒')).toBeTruthy();
  });

  it('should not show lock icon for shared items', () => {
    const { queryByText } = render(<ShelfItem item={mockItem} />);
    expect(queryByText('🔒')).toBeNull();
  });

  it('should render different emojis for different categories', () => {
    const produceItem = { ...mockItem, category: 'produce' as const };
    const { getByText } = render(<ShelfItem item={produceItem} />);
    expect(getByText('🥬')).toBeTruthy();
  });

  it('should render meat emoji for meat category', () => {
    const meatItem = { ...mockItem, category: 'meat' as const };
    const { getByText } = render(<ShelfItem item={meatItem} />);
    expect(getByText('🥩')).toBeTruthy();
  });
});
