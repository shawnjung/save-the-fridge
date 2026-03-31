import React, { useState, useCallback } from 'react';
import { View, TextInput, FlatList, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { COLORS } from '@/constants/theme';
import { useFriendStore, type SearchedUser } from '@/lib/store/friendStore';

export function FriendSearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchedUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [sentRequests, setSentRequests] = useState<Set<string>>(new Set());
  const { searchUsers, sendRequest } = useFriendStore();

  const debounceTimeout = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleSearch = useCallback(
    (text: string) => {
      setQuery(text);
      if (debounceTimeout.current) {
        clearTimeout(debounceTimeout.current);
      }
      if (text.length < 2) {
        setResults([]);
        return;
      }
      debounceTimeout.current = setTimeout(async () => {
        setLoading(true);
        try {
          const users = await searchUsers(text);
          setResults(users);
        } catch {
          // Search failed silently
        } finally {
          setLoading(false);
        }
      }, 300);
    },
    [searchUsers]
  );

  const handleSendRequest = async (userId: string) => {
    try {
      await sendRequest(userId);
      setSentRequests((prev) => new Set(prev).add(userId));
    } catch {
      // Request failed silently
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        value={query}
        onChangeText={handleSearch}
        placeholder="Search by username..."
        placeholderTextColor={COLORS.textSecondary}
        autoCapitalize="none"
      />

      {loading && <ActivityIndicator style={styles.loader} color={COLORS.primary} />}

      <FlatList
        data={results}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.userCard}>
            <Avatar
              uri={item.avatar_url}
              name={item.display_name ?? item.username}
              size={40}
            />
            <View style={styles.userInfo}>
              <Text style={styles.userName}>
                {item.display_name ?? item.username}
              </Text>
              <Text style={styles.userUsername}>@{item.username}</Text>
            </View>
            {sentRequests.has(item.id) ? (
              <Text style={styles.sentLabel}>Sent ✓</Text>
            ) : (
              <Button
                title="Add"
                onPress={() => handleSendRequest(item.id)}
                size="sm"
              />
            )}
          </View>
        )}
        ListEmptyComponent={
          query.length >= 2 && !loading ? (
            <Text style={styles.empty}>No users found</Text>
          ) : null
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
    color: COLORS.text,
    backgroundColor: COLORS.surface,
    marginBottom: 12,
  },
  loader: {
    marginVertical: 12,
  },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  userInfo: {
    flex: 1,
    marginLeft: 12,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
  },
  userUsername: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  sentLabel: {
    fontSize: 14,
    color: COLORS.success,
    fontWeight: '600',
  },
  empty: {
    textAlign: 'center',
    color: COLORS.textSecondary,
    marginTop: 24,
    fontSize: 16,
  },
});
