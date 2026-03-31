import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '@/constants/theme';

type BadgeProps = {
  label: string;
  variant?: 'default' | 'warning' | 'danger' | 'success';
};

export function Badge({ label, variant = 'default' }: BadgeProps) {
  return (
    <View style={[styles.badge, styles[variant]]}>
      <Text style={[styles.text, styles[`text_${variant}`]]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  default: {
    backgroundColor: COLORS.border,
  },
  warning: {
    backgroundColor: '#FEF3C7',
  },
  danger: {
    backgroundColor: '#FEE2E2',
  },
  success: {
    backgroundColor: '#D1FAE5',
  },
  text: {
    fontSize: 12,
    fontWeight: '600',
  },
  text_default: {
    color: COLORS.textSecondary,
  },
  text_warning: {
    color: '#92400E',
  },
  text_danger: {
    color: '#991B1B',
  },
  text_success: {
    color: '#065F46',
  },
});
