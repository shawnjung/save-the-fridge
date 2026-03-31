import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { CategoryFilter } from '@/components/shelf/CategoryFilter';

describe('CategoryFilter', () => {
  it('should render "All" option', () => {
    const { getByText } = render(
      <CategoryFilter selected="all" onSelect={jest.fn()} />
    );
    expect(getByText('All')).toBeTruthy();
  });

  it('should render all category labels', () => {
    const { getByText } = render(
      <CategoryFilter selected="all" onSelect={jest.fn()} />
    );

    expect(getByText('Produce')).toBeTruthy();
    expect(getByText('Dairy')).toBeTruthy();
    expect(getByText('Meat')).toBeTruthy();
    expect(getByText('Grain')).toBeTruthy();
    expect(getByText('Condiment')).toBeTruthy();
    expect(getByText('Beverage')).toBeTruthy();
    expect(getByText('Other')).toBeTruthy();
  });

  it('should render category emojis', () => {
    const { getByText } = render(
      <CategoryFilter selected="all" onSelect={jest.fn()} />
    );

    expect(getByText('🥬')).toBeTruthy();
    expect(getByText('🧀')).toBeTruthy();
    expect(getByText('🥩')).toBeTruthy();
  });

  it('should call onSelect when "All" is pressed', () => {
    const onSelect = jest.fn();
    const { getByText } = render(
      <CategoryFilter selected="dairy" onSelect={onSelect} />
    );

    fireEvent.press(getByText('All'));
    expect(onSelect).toHaveBeenCalledWith('all');
  });

  it('should call onSelect with category when a category chip is pressed', () => {
    const onSelect = jest.fn();
    const { getByText } = render(
      <CategoryFilter selected="all" onSelect={onSelect} />
    );

    fireEvent.press(getByText('Dairy'));
    expect(onSelect).toHaveBeenCalledWith('dairy');
  });

  it('should call onSelect with produce when produce is pressed', () => {
    const onSelect = jest.fn();
    const { getByText } = render(
      <CategoryFilter selected="all" onSelect={onSelect} />
    );

    fireEvent.press(getByText('Produce'));
    expect(onSelect).toHaveBeenCalledWith('produce');
  });
});
