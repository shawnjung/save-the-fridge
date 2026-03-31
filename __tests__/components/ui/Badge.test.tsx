import React from 'react';
import { render } from '@testing-library/react-native';
import { Badge } from '@/components/ui/Badge';

describe('Badge', () => {
  it('should render the label text', () => {
    const { getByText } = render(<Badge label="New" />);
    expect(getByText('New')).toBeTruthy();
  });

  it('should render with default variant', () => {
    const { getByText } = render(<Badge label="Default" />);
    expect(getByText('Default')).toBeTruthy();
  });

  it('should render with warning variant', () => {
    const { getByText } = render(<Badge label="Warning" variant="warning" />);
    expect(getByText('Warning')).toBeTruthy();
  });

  it('should render with danger variant', () => {
    const { getByText } = render(<Badge label="Expired" variant="danger" />);
    expect(getByText('Expired')).toBeTruthy();
  });

  it('should render with success variant', () => {
    const { getByText } = render(<Badge label="Fresh" variant="success" />);
    expect(getByText('Fresh')).toBeTruthy();
  });

  it('should display the exact label text provided', () => {
    const { getByText } = render(<Badge label="3d left" variant="warning" />);
    expect(getByText('3d left')).toBeTruthy();
  });
});
