import React, { useEffect, useState } from 'react';
import { View, FlatList, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { FriendCard } from '@/components/friends/FriendCard';
import { FriendSearch } from '@/components/friends/FriendSearch';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { useFriendStore } from '@/lib/store/friendStore';
import { COLORS } from '@/constants/theme';

type Tab = 'friends' | 'requests' | 'find';

export default function FriendsScreen() {
  const [activeTab, setActiveTab] = useState<Tab>('friends');
  const { friends, pendingReceived, pendingSent, isLoading, fetchFriends, acceptRequest } =
    useFriendStore();
  const router = useRouter();

  useEffect(() => {
    fetchFriends();
  }, [fetchFriends]);

  const renderFriendsTab = () => (
    <FlatList
      data={friends}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <FriendCard
          friendship={item}
          onPress={() => router.push(`/friend/${item.other_user.id}`)}
        />
      )}
      ListEmptyComponent={
        <View style={styles.empty}>
          <Text style={styles.emptyEmoji}>👋</Text>
          <Text style={styles.emptyText}>No friends yet</Text>
          <Text style={styles.emptySubtext}>
            Find people to connect with
          </Text>
        </View>
      }
      refreshing={isLoading}
      onRefresh={fetchFriends}
      contentContainerStyle={styles.listContent}
    />
  );

  const renderRequestsTab = () => (
    <FlatList
      data={[
        ...pendingReceived.map((r) => ({ ...r, type: 'received' as const })),
        ...pendingSent.map((r) => ({ ...r, type: 'sent' as const })),
      ]}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <View style={styles.requestCard}>
          <Avatar
            uri={item.other_user.avatar_url}
            name={item.other_user.display_name ?? item.other_user.username}
            size={44}
          />
          <View style={styles.requestInfo}>
            <Text style={styles.requestName}>
              {item.other_user.display_name ?? item.other_user.username}
            </Text>
            <Text style={styles.requestUsername}>@{item.other_user.username}</Text>
          </View>
          {item.type === 'received' ? (
            <Button
              title="Accept"
              onPress={async () => {
                await acceptRequest(item.id);
                fetchFriends();
              }}
              size="sm"
            />
          ) : (
            <Badge label="Pending" variant="warning" />
          )}
        </View>
      )}
      ListEmptyComponent={
        <View style={styles.empty}>
          <Text style={styles.emptyText}>No pending requests</Text>
        </View>
      }
      refreshing={isLoading}
      onRefresh={fetchFriends}
      contentContainerStyle={styles.listContent}
    />
  );

  return (
    <View style={styles.container}>
      <View style={styles.tabRow}>
        {(['friends', 'requests', 'find'] as Tab[]).map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, activeTab === tab && styles.tabActive]}
            onPress={() => setActiveTab(tab)}
          >
            <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
              {tab === 'friends'
                ? `Friends (${friends.length})`
                : tab === 'requests'
                  ? `Requests (${pendingReceived.length})`
                  : 'Find People'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {activeTab === 'friends' && renderFriendsTab()}
      {activeTab === 'requests' && renderRequestsTab()}
      {activeTab === 'find' && (
        <View style={styles.searchContainer}>
          <FriendSearch />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  tabRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingTop: 12,
    gap: 8,
  },
  tab: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  tabActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  tabText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  tabTextActive: {
    color: '#FFFFFF',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 24,
    flexGrow: 1,
  },
  searchContainer: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  requestCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  requestInfo: {
    flex: 1,
    marginLeft: 12,
  },
  requestName: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
  },
  requestUsername: {
    fontSize: 14,
    color: COLORS.textSecondary,
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
