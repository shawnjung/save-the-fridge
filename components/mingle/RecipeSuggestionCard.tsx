import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Badge } from '@/components/ui/Badge';
import { COLORS } from '@/constants/theme';
import type { MingleSuggestion } from '@/lib/store/mingleStore';

type RecipeSuggestionCardProps = {
  suggestion: MingleSuggestion;
};

export function RecipeSuggestionCard({ suggestion }: RecipeSuggestionCardProps) {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{suggestion.recipe_name}</Text>
        {suggestion.match_score != null && (
          <Badge
            label={`${suggestion.match_score}% match`}
            variant={suggestion.match_score >= 70 ? 'success' : suggestion.match_score >= 40 ? 'warning' : 'danger'}
          />
        )}
      </View>

      {suggestion.description && (
        <Text style={styles.description}>{suggestion.description}</Text>
      )}

      {suggestion.ingredients_used && suggestion.ingredients_used.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>✅ Using:</Text>
          {suggestion.ingredients_used.map((ing, i) => (
            <Text key={i} style={styles.ingredient}>
              • {ing.name} ({ing.quantity} {ing.unit})
            </Text>
          ))}
        </View>
      )}

      {suggestion.missing_ingredients && suggestion.missing_ingredients.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🛒 Need to buy:</Text>
          {suggestion.missing_ingredients.map((ing, i) => (
            <Text key={i} style={styles.ingredient}>
              • {ing.name} ({ing.quantity} {ing.unit})
            </Text>
          ))}
        </View>
      )}

      {suggestion.instructions && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📝 Instructions:</Text>
          <Text style={styles.instructions}>{suggestion.instructions}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
    flex: 1,
  },
  description: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 12,
  },
  section: {
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 4,
  },
  ingredient: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginLeft: 8,
    marginBottom: 2,
  },
  instructions: {
    fontSize: 14,
    color: COLORS.text,
    lineHeight: 20,
    marginLeft: 8,
  },
});
