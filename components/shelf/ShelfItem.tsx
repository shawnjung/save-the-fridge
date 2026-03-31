import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { CATEGORY_EMOJI } from '@/constants/categories';
import { ExpiryBadge } from '@/components/shelf/ExpiryBadge';
import { COLORS } from '@/constants/theme';
import type { ShelfItem as ShelfItemType } from '@/lib/store/shelfStore';

type ShelfItemProps = {
  item: ShelfItemType;
  onPress?: () => void;
};

export function ShelfItem({ item, onPress }: ShelfItemProps) {
  const emoji = CATEGORY_EMOJI[item.category] ?? '📦';

  return (
    <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.emojiContainer}>
        <Text style={styles.emoji}>{emoji}</Text>
      </View>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.name} numberOfLines={1}>
            {item.name}
          </Text>
          {!item.is_shared && <Text style={styles.privateBadge}>🔒</Text>}
        </View>
        <Text style={styles.details}>
          {item.quantity} {item.unit}
        </Text>
      </View>
      <View style={styles.right}>
        <ExpiryBadge expiryDate={item.expiry_date} />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  emojiContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  emoji: {
    fontSize: 20,
  },
  content: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
  },
  privateBadge: {
    fontSize: 12,
  },
  details: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  right: {
    marginLeft: 8,
  },
});
