import { suggestRecipes, type ParticipantIngredients, type RecipeSuggestion } from '@/lib/anthropic';

// Mock global fetch
const mockFetch = jest.fn();
global.fetch = mockFetch;

describe('anthropic', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const mockParticipants: ParticipantIngredients[] = [
    {
      userId: 'user-1',
      displayName: 'Alice',
      items: [
        { name: 'Chicken', quantity: 500, unit: 'g', category: 'meat' },
        { name: 'Rice', quantity: 2, unit: 'cups', category: 'grain' },
      ],
    },
    {
      userId: 'user-2',
      displayName: 'Bob',
      items: [
        { name: 'Tomatoes', quantity: 3, unit: 'pcs', category: 'produce' },
        { name: 'Onion', quantity: 1, unit: 'pcs', category: 'produce' },
      ],
    },
  ];

  const mockRecipeSuggestions: RecipeSuggestion[] = [
    {
      recipe_name: 'Chicken Stir Fry',
      description: 'Quick and easy chicken stir fry',
      ingredients_used: [
        { name: 'Chicken', quantity: 500, unit: 'g', owner_user_id: 'user-1' },
        { name: 'Rice', quantity: 2, unit: 'cups', owner_user_id: 'user-1' },
      ],
      missing_ingredients: [
        { name: 'Soy Sauce', quantity: 2, unit: 'tbsp' },
      ],
      instructions: 'Cook chicken, add rice, serve.',
      match_score: 85,
    },
  ];

  it('should call the Anthropic API with correct parameters', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        content: [{ text: JSON.stringify(mockRecipeSuggestions) }],
      }),
    });

    await suggestRecipes(mockParticipants);

    expect(mockFetch).toHaveBeenCalledTimes(1);
    expect(mockFetch).toHaveBeenCalledWith(
      'https://api.anthropic.com/v1/messages',
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          'Content-Type': 'application/json',
          'anthropic-version': '2023-06-01',
        }),
      })
    );
  });

  it('should parse and return recipe suggestions from API response', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        content: [{ text: JSON.stringify(mockRecipeSuggestions) }],
      }),
    });

    const result = await suggestRecipes(mockParticipants);

    expect(result).toEqual(mockRecipeSuggestions);
    expect(result).toHaveLength(1);
    expect(result[0].recipe_name).toBe('Chicken Stir Fry');
  });

  it('should throw error when API returns non-ok response', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
    });

    await expect(suggestRecipes(mockParticipants)).rejects.toThrow(
      'Anthropic API error: 500'
    );
  });

  it('should return empty array when response content is not valid JSON', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        content: [{ text: 'not valid json' }],
      }),
    });

    const result = await suggestRecipes(mockParticipants);
    expect(result).toEqual([]);
  });

  it('should return empty array when response content is empty', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        content: [],
      }),
    });

    const result = await suggestRecipes(mockParticipants);
    expect(result).toEqual([]);
  });

  it('should include participant ingredients in the API request body', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        content: [{ text: '[]' }],
      }),
    });

    await suggestRecipes(mockParticipants);

    const callBody = JSON.parse(mockFetch.mock.calls[0][1].body);
    expect(callBody.model).toBe('claude-sonnet-4-20250514');
    expect(callBody.max_tokens).toBe(2048);
    expect(callBody.messages[0].content).toContain("Alice's items");
    expect(callBody.messages[0].content).toContain("Bob's items");
    expect(callBody.messages[0].content).toContain('Chicken');
    expect(callBody.messages[0].content).toContain('Tomatoes');
  });
});
