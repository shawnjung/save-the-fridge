import React, { useEffect, useState } from 'react';
import { View, FlatList, Text, TextInput, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Button } from '@/components/ui/Button';
import { MingleSessionCard } from '@/components/mingle/MingleSessionCard';
import { useMingleStore } from '@/lib/store/mingleStore';
import { useFriendStore } from '@/lib/store/friendStore';
import { COLORS } from '@/constants/theme';

export default function MingleScreen() {
  const { sessions, isLoading, fetchSessions, createSession } = useMingleStore();
  const { friends, fetchFriends } = useFriendStore();
  const [showCreate, setShowCreate] = useState(false);
  const [title, setTitle] = useState('');
  const [selectedFriends, setSelectedFriends] = useState<Set<string>>(new Set());
  const router = useRouter();

  useEffect(() => {
    fetchSessions();
    fetchFriends();
  }, [fetchSessions, fetchFriends]);

  const handleCreate = async () => {
    if (!title.trim()) return;

    try {
      const sessionId = await createSession(title.trim(), Array.from(selectedFriends));
      setShowCreate(false);
      setTitle('');
      setSelectedFriends(new Set());
      router.push(`/mingle/${sessionId}`);
    } catch {
      // Create failed
    }
  };

  const toggleFriend = (id: string) => {
    setSelectedFriends((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  return (
    <View style={styles.container}>
      {showCreate ? (
        <View style={styles.createForm}>
          <Text style={styles.formTitle}>New Cook Together Session</Text>
          <TextInput
            style={styles.input}
            value={title}
            onChangeText={setTitle}
            placeholder="Session title (e.g., Friday Dinner)"
            placeholderTextColor={COLORS.textSecondary}
          />
          <Text style={styles.label}>Invite Friends:</Text>
          {friends.map((f) => (
            <Button
              key={f.id}
              title={`${selectedFriends.has(f.other_user.id) ? '✓ ' : ''}${f.other_user.display_name ?? f.other_user.username}`}
              onPress={() => toggleFriend(f.other_user.id)}
              variant={selectedFriends.has(f.other_user.id) ? 'primary' : 'outline'}
              size="sm"
              style={styles.friendButton}
            />
          ))}
          <View style={styles.buttonRow}>
            <Button title="Cancel" onPress={() => setShowCreate(false)} variant="outline" style={styles.flex} />
            <Button title="Create" onPress={handleCreate} style={styles.flex} disabled={!title.trim()} />
          </View>
        </View>
      ) : (
        <>
          <Button
            title="🍳 Start Cooking Together"
            onPress={() => setShowCreate(true)}
            style={styles.createButton}
          />
          <FlatList
            data={sessions}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <MingleSessionCard
                session={item}
                onPress={() => router.push(`/mingle/${item.id}`)}
              />
            )}
            ListEmptyComponent={
              <View style={styles.empty}>
                <Text style={styles.emptyEmoji}>👨‍🍳</Text>
                <Text style={styles.emptyText}>No sessions yet</Text>
                <Text style={styles.emptySubtext}>
                  Start a cook-together session with friends!
                </Text>
              </View>
            }
            refreshing={isLoading}
            onRefresh={fetchSessions}
            contentContainerStyle={styles.listContent}
          />
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    padding: 16,
  },
  createButton: {
    marginBottom: 16,
  },
  createForm: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 20,
  },
  formTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
    color: COLORS.text,
    backgroundColor: COLORS.background,
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginBottom: 8,
  },
  friendButton: {
    marginBottom: 6,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  flex: {
    flex: 1,
  },
  listContent: {
    paddingBottom: 24,
    flexGrow: 1,
  },
  empty: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 80,
  },
  emptyEmoji: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
  },
  emptySubtext: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
});
