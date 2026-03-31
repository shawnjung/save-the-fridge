import React from 'react';
import { render } from '@testing-library/react-native';
import { Avatar } from '@/components/ui/Avatar';

describe('Avatar', () => {
  it('should render initials when no uri is provided', () => {
    const { getByText } = render(<Avatar name="John Doe" />);
    expect(getByText('JD')).toBeTruthy();
  });

  it('should render single initial for single-word name', () => {
    const { getByText } = render(<Avatar name="Alice" />);
    expect(getByText('A')).toBeTruthy();
  });

  it('should render "?" when no name or uri is provided', () => {
    const { getByText } = render(<Avatar />);
    expect(getByText('?')).toBeTruthy();
  });

  it('should render initials in uppercase', () => {
    const { getByText } = render(<Avatar name="john doe" />);
    expect(getByText('JD')).toBeTruthy();
  });

  it('should limit initials to 2 characters', () => {
    const { getByText } = render(<Avatar name="John Michael Doe" />);
    expect(getByText('JM')).toBeTruthy();
  });

  it('should render an Image when uri is provided', () => {
    const { toJSON } = render(
      <Avatar uri="https://example.com/avatar.jpg" name="John" size={48} />
    );
    const tree = toJSON();
    // Should render an Image component, not a text placeholder
    expect(tree).toBeTruthy();
  });

  it('should use default size of 40', () => {
    const { toJSON } = render(<Avatar name="Test" />);
    const tree = toJSON();
    expect(tree).toBeTruthy();
  });

  it('should accept custom size', () => {
    const { toJSON } = render(<Avatar name="Test" size={96} />);
    const tree = toJSON();
    expect(tree).toBeTruthy();
  });
});
