import React from 'react';
import { render } from '@testing-library/react-native';
import { RecipeSuggestionCard } from '@/components/mingle/RecipeSuggestionCard';
import type { MingleSuggestion } from '@/lib/store/mingleStore';

const mockSuggestion: MingleSuggestion = {
  id: 'suggestion-1',
  session_id: 'session-1',
  recipe_name: 'Chicken Stir Fry',
  description: 'Quick and easy chicken stir fry with vegetables',
  ingredients_used: [
    { name: 'Chicken', quantity: 500, unit: 'g', owner_user_id: 'user-1' },
    { name: 'Rice', quantity: 2, unit: 'cups', owner_user_id: 'user-1' },
    { name: 'Onion', quantity: 1, unit: 'pcs', owner_user_id: 'user-2' },
  ],
  missing_ingredients: [
    { name: 'Soy Sauce', quantity: 2, unit: 'tbsp' },
    { name: 'Ginger', quantity: 1, unit: 'tsp' },
  ],
  instructions: '1. Cut chicken. 2. Cook rice. 3. Stir fry.',
  match_score: 85,
  created_at: '2025-01-01T00:00:00Z',
};

describe('RecipeSuggestionCard', () => {
  it('should render recipe name', () => {
    const { getByText } = render(
      <RecipeSuggestionCard suggestion={mockSuggestion} />
    );
    expect(getByText('Chicken Stir Fry')).toBeTruthy();
  });

  it('should render description', () => {
    const { getByText } = render(
      <RecipeSuggestionCard suggestion={mockSuggestion} />
    );
    expect(getByText('Quick and easy chicken stir fry with vegetables')).toBeTruthy();
  });

  it('should render match score badge', () => {
    const { getByText } = render(
      <RecipeSuggestionCard suggestion={mockSuggestion} />
    );
    expect(getByText('85% match')).toBeTruthy();
  });

  it('should render ingredients used', () => {
    const { getByText } = render(
      <RecipeSuggestionCard suggestion={mockSuggestion} />
    );
    expect(getByText('✅ Using:')).toBeTruthy();
    expect(getByText('• Chicken (500 g)')).toBeTruthy();
    expect(getByText('• Rice (2 cups)')).toBeTruthy();
    expect(getByText('• Onion (1 pcs)')).toBeTruthy();
  });

  it('should render missing ingredients', () => {
    const { getByText } = render(
      <RecipeSuggestionCard suggestion={mockSuggestion} />
    );
    expect(getByText('🛒 Need to buy:')).toBeTruthy();
    expect(getByText('• Soy Sauce (2 tbsp)')).toBeTruthy();
    expect(getByText('• Ginger (1 tsp)')).toBeTruthy();
  });

  it('should render instructions', () => {
    const { getByText } = render(
      <RecipeSuggestionCard suggestion={mockSuggestion} />
    );
    expect(getByText('📝 Instructions:')).toBeTruthy();
    expect(getByText('1. Cut chicken. 2. Cook rice. 3. Stir fry.')).toBeTruthy();
  });

  it('should handle suggestion with no description', () => {
    const noDescSuggestion = { ...mockSuggestion, description: null };
    const { getByText, queryByText } = render(
      <RecipeSuggestionCard suggestion={noDescSuggestion} />
    );
    expect(getByText('Chicken Stir Fry')).toBeTruthy();
    expect(queryByText('Quick and easy chicken stir fry with vegetables')).toBeNull();
  });

  it('should handle suggestion with no missing ingredients', () => {
    const noMissingSuggestion = { ...mockSuggestion, missing_ingredients: [] };
    const { queryByText } = render(
      <RecipeSuggestionCard suggestion={noMissingSuggestion} />
    );
    expect(queryByText('🛒 Need to buy:')).toBeNull();
  });

  it('should handle suggestion with null match score', () => {
    const noScoreSuggestion = { ...mockSuggestion, match_score: null };
    const { queryByText } = render(
      <RecipeSuggestionCard suggestion={noScoreSuggestion} />
    );
    expect(queryByText(/match/)).toBeNull();
  });

  it('should show success variant for high match score', () => {
    const { getByText } = render(
      <RecipeSuggestionCard suggestion={mockSuggestion} />
    );
    // 85% should get "success" variant badge
    expect(getByText('85% match')).toBeTruthy();
  });

  it('should show warning variant for medium match score', () => {
    const mediumSuggestion = { ...mockSuggestion, match_score: 50 };
    const { getByText } = render(
      <RecipeSuggestionCard suggestion={mediumSuggestion} />
    );
    expect(getByText('50% match')).toBeTruthy();
  });

  it('should show danger variant for low match score', () => {
    const lowSuggestion = { ...mockSuggestion, match_score: 20 };
    const { getByText } = render(
      <RecipeSuggestionCard suggestion={lowSuggestion} />
    );
    expect(getByText('20% match')).toBeTruthy();
  });
});
