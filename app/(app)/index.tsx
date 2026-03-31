import React, { useEffect, useState, useCallback } from 'react';
import { View, FlatList, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ShelfItem } from '@/components/shelf/ShelfItem';
import { CategoryFilter } from '@/components/shelf/CategoryFilter';
import { AddItemModal } from '@/components/shelf/AddItemModal';
import { useShelfStore, type StorageType } from '@/lib/store/shelfStore';
import { COLORS } from '@/constants/theme';

export default function MyShelfScreen() {
  const {
    fetchItems,
    addItem,
    isLoading,
    filter,
    setFilter,
    categoryFilter,
    setCategoryFilter,
    getFilteredItems,
  } = useShelfStore();
  const [addModalVisible, setAddModalVisible] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const filteredItems = getFilteredItems();

  const fridgeCount = useShelfStore((s) => s.items.filter((i) => i.storage_type === 'fridge').length);
  const pantryCount = useShelfStore((s) => s.items.filter((i) => i.storage_type === 'pantry').length);

  return (
    <View style={styles.container}>
      {/* Storage type tabs */}
      <View style={styles.tabRow}>
        <TouchableOpacity
          style={[styles.tab, filter === 'all' && styles.tabActive]}
          onPress={() => setFilter('all')}
        >
          <Text style={[styles.tabText, filter === 'all' && styles.tabTextActive]}>
            All ({fridgeCount + pantryCount})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, filter === 'fridge' && styles.tabActive]}
          onPress={() => setFilter('fridge')}
        >
          <Text style={[styles.tabText, filter === 'fridge' && styles.tabTextActive]}>
            🧊 Fridge ({fridgeCount})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, filter === 'pantry' && styles.tabActive]}
          onPress={() => setFilter('pantry')}
        >
          <Text style={[styles.tabText, filter === 'pantry' && styles.tabTextActive]}>
            🏠 Pantry ({pantryCount})
          </Text>
        </TouchableOpacity>
      </View>

      {/* Category filter */}
      <CategoryFilter selected={categoryFilter} onSelect={setCategoryFilter} />

      {/* Item list */}
      <FlatList
        data={filteredItems}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <ShelfItem
            item={item}
            onPress={() => router.push(`/item/${item.id}`)}
          />
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyEmoji}>🍽️</Text>
            <Text style={styles.emptyText}>Your shelf is empty</Text>
            <Text style={styles.emptySubtext}>
              Tap the + button to add your first item
            </Text>
          </View>
        }
        refreshing={isLoading}
        onRefresh={fetchItems}
        contentContainerStyle={styles.listContent}
      />

      {/* FAB */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => setAddModalVisible(true)}
        activeOpacity={0.8}
      >
        <Ionicons name="add" size={28} color="#FFFFFF" />
      </TouchableOpacity>

      <AddItemModal
        visible={addModalVisible}
        onClose={() => setAddModalVisible(false)}
        onAdd={async (item) => {
          try {
            await addItem(item);
          } catch {
            // Item add failed
          }
        }}
      />
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
    paddingBottom: 100,
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
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
});
