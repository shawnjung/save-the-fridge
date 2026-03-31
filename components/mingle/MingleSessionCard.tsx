import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { COLORS } from '@/constants/theme';
import type { MingleSession } from '@/lib/store/mingleStore';

type MingleSessionCardProps = {
  session: MingleSession;
  onPress: () => void;
};

export function MingleSessionCard({ session, onPress }: MingleSessionCardProps) {
  const statusColor =
    session.status === 'active'
      ? COLORS.success
      : session.status === 'completed'
        ? COLORS.textSecondary
        : COLORS.danger;

  return (
    <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.header}>
        <Text style={styles.title}>{session.title ?? 'Mingle Session'}</Text>
        <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
      </View>
      <Text style={styles.date}>
        {new Date(session.created_at).toLocaleDateString()}
      </Text>
      <Text style={styles.status}>{session.status}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    flex: 1,
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  date: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  status: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 2,
    textTransform: 'capitalize',
  },
});
