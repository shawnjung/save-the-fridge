import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Avatar } from '@/components/ui/Avatar';
import { COLORS } from '@/constants/theme';
import type { Friendship } from '@/lib/store/friendStore';

type FriendCardProps = {
  friendship: Friendship;
  onPress: () => void;
};

export function FriendCard({ friendship, onPress }: FriendCardProps) {
  const { other_user } = friendship;

  return (
    <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.7}>
      <Avatar
        uri={other_user.avatar_url}
        name={other_user.display_name ?? other_user.username}
        size={48}
      />
      <View style={styles.content}>
        <Text style={styles.name} numberOfLines={1}>
          {other_user.display_name ?? other_user.username}
        </Text>
        <Text style={styles.username}>@{other_user.username}</Text>
      </View>
      <Text style={styles.arrow}>›</Text>
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
  content: {
    flex: 1,
    marginLeft: 12,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
  },
  username: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  arrow: {
    fontSize: 24,
    color: COLORS.textSecondary,
  },
});
