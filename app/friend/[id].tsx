import React, { useEffect, useState } from 'react';
import { View, FlatList, Text, StyleSheet } from 'react-native';
import { useLocalSearchParams, Stack, useRouter } from 'expo-router';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { ShelfItem } from '@/components/shelf/ShelfItem';
import { supabase } from '@/lib/supabase';
import { COLORS } from '@/constants/theme';
import type { ShelfItem as ShelfItemType } from '@/lib/store/shelfStore';
import type { Profile } from '@/lib/store/authStore';

export default function FriendShelfScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [items, setItems] = useState<ShelfItemType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', id)
          .single();

        setProfile(profileData as Profile | null);

        const { data: itemsData } = await supabase
          .from('shelf_items')
          .select('*')
          .eq('user_id', id)
          .eq('is_shared', true)
          .order('storage_type')
          .order('created_at', { ascending: false });

        setItems((itemsData as ShelfItemType[]) ?? []);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const fridgeItems = items.filter((i) => i.storage_type === 'fridge');
  const pantryItems = items.filter((i) => i.storage_type === 'pantry');

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: profile?.display_name ?? profile?.username ?? 'Friend\'s Shelf',
          headerStyle: { backgroundColor: COLORS.primary },
          headerTintColor: '#FFFFFF',
        }}
      />

      <FlatList
        data={[]}
        renderItem={() => null}
        ListHeaderComponent={
          <>
            {profile && (
              <View style={styles.profileSection}>
                <Avatar
                  uri={profile.avatar_url}
                  name={profile.display_name ?? profile.username}
                  size={64}
                />
                <Text style={styles.profileName}>
                  {profile.display_name ?? profile.username}
                </Text>
                <Text style={styles.profileUsername}>@{profile.username}</Text>
              </View>
            )}

            <Button
              title="🍳 Invite to Mingle"
              onPress={() => router.push('/(app)/mingle')}
              style={styles.mingleButton}
            />

            {fridgeItems.length > 0 && (
              <>
                <Text style={styles.sectionTitle}>🧊 Fridge</Text>
                {fridgeItems.map((item) => (
                  <ShelfItem key={item.id} item={item} />
                ))}
              </>
            )}

            {pantryItems.length > 0 && (
              <>
                <Text style={styles.sectionTitle}>🏠 Pantry</Text>
                {pantryItems.map((item) => (
                  <ShelfItem key={item.id} item={item} />
                ))}
              </>
            )}

            {items.length === 0 && !loading && (
              <View style={styles.empty}>
                <Text style={styles.emptyText}>No shared items</Text>
                <Text style={styles.emptySubtext}>
                  This friend hasn't shared any items yet
                </Text>
              </View>
            )}
          </>
        }
        refreshing={loading}
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
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  profileSection: {
    alignItems: 'center',
    marginBottom: 16,
  },
  profileName: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.text,
    marginTop: 8,
  },
  profileUsername: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  mingleButton: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
    marginTop: 16,
    marginBottom: 8,
  },
  empty: {
    alignItems: 'center',
    paddingTop: 40,
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
