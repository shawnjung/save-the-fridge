const ANTHROPIC_API_URL = 'https://api.anthropic.com/v1/messages';
const MODEL = 'claude-sonnet-4-20250514';

export type ParticipantIngredients = {
  userId: string;
  displayName: string;
  items: {
    name: string;
    quantity: number;
    unit: string;
    category: string;
  }[];
};

export type RecipeSuggestion = {
  recipe_name: string;
  description: string;
  ingredients_used: {
    name: string;
    quantity: number;
    unit: string;
    owner_user_id: string;
  }[];
  missing_ingredients: {
    name: string;
    quantity: number;
    unit: string;
  }[];
  instructions: string;
  match_score: number;
};

export async function suggestRecipes(
  participants: ParticipantIngredients[]
): Promise<RecipeSuggestion[]> {
  const apiKey = process.env.EXPO_PUBLIC_ANTHROPIC_KEY ?? '';

  const ingredientsList = participants
    .map(
      (p) =>
        `${p.displayName}'s items:\n${p.items.map((i) => `  - ${i.name}: ${i.quantity} ${i.unit} (${i.category})`).join('\n')}`
    )
    .join('\n\n');

  const response = await fetch(ANTHROPIC_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 2048,
      messages: [
        {
          role: 'user',
          content: `You are a helpful cooking assistant. Given these ingredients from multiple people who want to cook together, suggest 3 recipes that use as many of their combined ingredients as possible.

Ingredients available:
${ingredientsList}

Respond with a JSON array of recipe suggestions. Each recipe should have:
- recipe_name: string
- description: short description
- ingredients_used: array of {name, quantity, unit, owner_user_id} for ingredients from the participants
- missing_ingredients: array of {name, quantity, unit} for any additional ingredients needed
- instructions: step-by-step cooking instructions
- match_score: 0-100, how well the available ingredients match this recipe

Return ONLY the JSON array, no other text.`,
        },
      ],
    }),
  });

  if (!response.ok) {
    throw new Error(`Anthropic API error: ${response.status}`);
  }

  const data = await response.json();
  const content = data.content?.[0]?.text ?? '[]';

  try {
    return JSON.parse(content) as RecipeSuggestion[];
  } catch {
    return [];
  }
}
