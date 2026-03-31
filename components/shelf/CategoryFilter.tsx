import React from 'react';
import { ScrollView, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { CATEGORIES, CATEGORY_EMOJI, CATEGORY_LABELS, type ItemCategory } from '@/constants/categories';
import { COLORS } from '@/constants/theme';

type CategoryFilterProps = {
  selected: ItemCategory | 'all';
  onSelect: (category: ItemCategory | 'all') => void;
};

export function CategoryFilter({ selected, onSelect }: CategoryFilterProps) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.container}>
      <TouchableOpacity
        style={[styles.chip, selected === 'all' && styles.chipActive]}
        onPress={() => onSelect('all')}
      >
        <Text style={[styles.chipText, selected === 'all' && styles.chipTextActive]}>All</Text>
      </TouchableOpacity>
      {CATEGORIES.map((cat) => (
        <TouchableOpacity
          key={cat}
          style={[styles.chip, selected === cat && styles.chipActive]}
          onPress={() => onSelect(cat)}
        >
          <Text style={styles.chipEmoji}>{CATEGORY_EMOJI[cat]}</Text>
          <Text style={[styles.chipText, selected === cat && styles.chipTextActive]}>
            {CATEGORY_LABELS[cat]}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 8,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginRight: 8,
    backgroundColor: COLORS.surface,
  },
  chipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  chipEmoji: {
    fontSize: 14,
    marginRight: 4,
  },
  chipText: {
    fontSize: 13,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  chipTextActive: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
});
