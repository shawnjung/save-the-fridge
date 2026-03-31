import React, { useEffect } from 'react';
import { View, FlatList, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, Stack } from 'expo-router';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { RecipeSuggestionCard } from '@/components/mingle/RecipeSuggestionCard';
import { useMingleStore } from '@/lib/store/mingleStore';
import { COLORS } from '@/constants/theme';

export default function MingleSessionScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const {
    currentSession,
    participants,
    suggestions,
    isLoading,
    fetchSessionDetails,
    generateSuggestions,
    updateSessionStatus,
  } = useMingleStore();

  useEffect(() => {
    if (id) {
      fetchSessionDetails(id);
    }
  }, [id, fetchSessionDetails]);

  if (isLoading && !currentSession) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: currentSession?.title ?? 'Mingle Session',
          headerStyle: { backgroundColor: COLORS.primary },
          headerTintColor: '#FFFFFF',
        }}
      />

      <FlatList
        data={suggestions}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <RecipeSuggestionCard suggestion={item} />}
        ListHeaderComponent={
          <>
            <Text style={styles.sectionTitle}>Participants</Text>
            <View style={styles.participantRow}>
              {participants.map((p) => (
                <View key={p.id} style={styles.participant}>
                  <Avatar
                    uri={p.profile?.avatar_url}
                    name={p.profile?.display_name ?? p.profile?.username}
                    size={40}
                  />
                  <Text style={styles.participantName} numberOfLines={1}>
                    {p.profile?.display_name ?? p.profile?.username ?? 'User'}
                  </Text>
                </View>
              ))}
            </View>

            {currentSession?.status === 'active' && (
              <View style={styles.actionRow}>
                <Button
                  title="🤖 Get AI Suggestions"
                  onPress={() => id && generateSuggestions(id)}
                  loading={isLoading}
                />
                <Button
                  title="Complete Session"
                  onPress={() => id && updateSessionStatus(id, 'completed')}
                  variant="secondary"
                  style={styles.completeButton}
                />
              </View>
            )}

            {suggestions.length > 0 && (
              <Text style={styles.sectionTitle}>Recipe Suggestions</Text>
            )}
          </>
        }
        ListEmptyComponent={
          !isLoading ? (
            <View style={styles.empty}>
              <Text style={styles.emptyEmoji}>🍳</Text>
              <Text style={styles.emptyText}>No suggestions yet</Text>
              <Text style={styles.emptySubtext}>
                Tap "Get AI Suggestions" to get recipe ideas
              </Text>
            </View>
          ) : null
        }
        contentContainerStyle={styles.content}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
    marginTop: 16,
    marginBottom: 12,
  },
  participantRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    marginBottom: 16,
  },
  participant: {
    alignItems: 'center',
    width: 64,
  },
  participantName: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 4,
    textAlign: 'center',
  },
  actionRow: {
    marginBottom: 16,
  },
  completeButton: {
    marginTop: 8,
  },
  empty: {
    alignItems: 'center',
    paddingTop: 40,
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
    textAlign: 'center',
  },
});
