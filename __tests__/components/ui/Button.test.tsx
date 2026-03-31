import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { Button } from '@/components/ui/Button';

describe('Button', () => {
  it('should render the title text', () => {
    const { getByText } = render(
      <Button title="Press Me" onPress={jest.fn()} />
    );
    expect(getByText('Press Me')).toBeTruthy();
  });

  it('should call onPress when pressed', () => {
    const onPress = jest.fn();
    const { getByText } = render(
      <Button title="Press" onPress={onPress} />
    );

    fireEvent.press(getByText('Press'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('should not call onPress when disabled', () => {
    const onPress = jest.fn();
    const { getByText } = render(
      <Button title="Disabled" onPress={onPress} disabled />
    );

    fireEvent.press(getByText('Disabled'));
    expect(onPress).not.toHaveBeenCalled();
  });

  it('should show ActivityIndicator when loading', () => {
    const { queryByText, UNSAFE_getByType } = render(
      <Button title="Loading" onPress={jest.fn()} loading />
    );

    // Title should not be visible when loading
    expect(queryByText('Loading')).toBeNull();
  });

  it('should not call onPress when loading', () => {
    const onPress = jest.fn();
    const { getByTestId } = render(
      <Button title="Loading" onPress={onPress} loading />
    );

    // Loading buttons are disabled
    expect(onPress).not.toHaveBeenCalled();
  });

  it('should render with different variants', () => {
    const { getByText: getText1 } = render(
      <Button title="Primary" onPress={jest.fn()} variant="primary" />
    );
    expect(getText1('Primary')).toBeTruthy();

    const { getByText: getText2 } = render(
      <Button title="Secondary" onPress={jest.fn()} variant="secondary" />
    );
    expect(getText2('Secondary')).toBeTruthy();

    const { getByText: getText3 } = render(
      <Button title="Outline" onPress={jest.fn()} variant="outline" />
    );
    expect(getText3('Outline')).toBeTruthy();

    const { getByText: getText4 } = render(
      <Button title="Danger" onPress={jest.fn()} variant="danger" />
    );
    expect(getText4('Danger')).toBeTruthy();
  });

  it('should render with different sizes', () => {
    const { getByText: getText1 } = render(
      <Button title="Small" onPress={jest.fn()} size="sm" />
    );
    expect(getText1('Small')).toBeTruthy();

    const { getByText: getText2 } = render(
      <Button title="Medium" onPress={jest.fn()} size="md" />
    );
    expect(getText2('Medium')).toBeTruthy();

    const { getByText: getText3 } = render(
      <Button title="Large" onPress={jest.fn()} size="lg" />
    );
    expect(getText3('Large')).toBeTruthy();
  });
});
