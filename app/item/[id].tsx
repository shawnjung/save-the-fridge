import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, ScrollView, Switch, StyleSheet } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { Button } from '@/components/ui/Button';
import { useShelfStore } from '@/lib/store/shelfStore';
import { CATEGORIES, CATEGORY_EMOJI, CATEGORY_LABELS, type ItemCategory } from '@/constants/categories';
import { COLORS } from '@/constants/theme';
import { TouchableOpacity } from 'react-native';

export default function ItemDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { items, updateItem, deleteItem } = useShelfStore();
  const router = useRouter();

  const item = items.find((i) => i.id === id);

  const [name, setName] = useState(item?.name ?? '');
  const [quantity, setQuantity] = useState(String(item?.quantity ?? 1));
  const [unit, setUnit] = useState(item?.unit ?? 'pcs');
  const [category, setCategory] = useState<ItemCategory>(item?.category ?? 'other');
  const [expiryDate, setExpiryDate] = useState(item?.expiry_date ?? '');
  const [isShared, setIsShared] = useState(item?.is_shared ?? true);
  const [notes, setNotes] = useState(item?.notes ?? '');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!item) {
    return (
      <View style={styles.container}>
        <Stack.Screen options={{ title: 'Item Not Found' }} />
        <Text style={styles.notFound}>Item not found</Text>
        <Button title="Go Back" onPress={() => router.back()} variant="outline" />
      </View>
    );
  }

  const handleSave = async () => {
    if (!name.trim()) {
      setError('Name is required');
      return;
    }

    setLoading(true);
    setError('');
    try {
      await updateItem(item.id, {
        name: name.trim(),
        quantity: parseFloat(quantity) || 1,
        unit,
        category,
        expiry_date: expiryDate || null,
        is_shared: isShared,
        notes: notes || null,
      });
      router.back();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Update failed');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    setLoading(true);
    try {
      await deleteItem(item.id);
      router.back();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Delete failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Stack.Screen
        options={{
          title: item.name,
          headerStyle: { backgroundColor: COLORS.primary },
          headerTintColor: '#FFFFFF',
        }}
      />

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <Text style={styles.label}>Name</Text>
      <TextInput
        style={styles.input}
        value={name}
        onChangeText={setName}
        placeholder="Item name"
        placeholderTextColor={COLORS.textSecondary}
      />

      <Text style={styles.label}>Category</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={styles.chipRow}>
          {CATEGORIES.map((cat) => (
            <TouchableOpacity
              key={cat}
              style={[styles.chip, category === cat && styles.chipActive]}
              onPress={() => setCategory(cat)}
            >
              <Text style={styles.chipEmoji}>{CATEGORY_EMOJI[cat]}</Text>
              <Text style={[styles.chipText, category === cat && styles.chipTextActive]}>
                {CATEGORY_LABELS[cat]}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      <View style={styles.row}>
        <View style={styles.halfField}>
          <Text style={styles.label}>Quantity</Text>
          <TextInput
            style={styles.input}
            value={quantity}
            onChangeText={setQuantity}
            keyboardType="decimal-pad"
          />
        </View>
        <View style={styles.halfField}>
          <Text style={styles.label}>Unit</Text>
          <TextInput
            style={styles.input}
            value={unit}
            onChangeText={setUnit}
          />
        </View>
      </View>

      <Text style={styles.label}>Expiry Date (YYYY-MM-DD)</Text>
      <TextInput
        style={styles.input}
        value={expiryDate}
        onChangeText={setExpiryDate}
        placeholder="2025-12-31"
        placeholderTextColor={COLORS.textSecondary}
      />

      <View style={styles.switchRow}>
        <Text style={styles.label}>Share with friends</Text>
        <Switch
          value={isShared}
          onValueChange={setIsShared}
          trackColor={{ true: COLORS.primary, false: COLORS.border }}
          thumbColor="#FFFFFF"
        />
      </View>

      <Text style={styles.label}>Notes</Text>
      <TextInput
        style={[styles.input, styles.textArea]}
        value={notes}
        onChangeText={setNotes}
        placeholder="Notes..."
        placeholderTextColor={COLORS.textSecondary}
        multiline
        numberOfLines={3}
      />

      <Button title="Save Changes" onPress={handleSave} loading={loading} style={styles.saveButton} />
      <Button title="Delete Item" onPress={handleDelete} variant="danger" style={styles.deleteButton} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    padding: 20,
  },
  notFound: {
    fontSize: 18,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: 16,
    marginTop: 40,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginBottom: 6,
    marginTop: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
    color: COLORS.text,
    backgroundColor: COLORS.surface,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  error: {
    color: COLORS.danger,
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 8,
  },
  chipRow: {
    flexDirection: 'row',
    gap: 8,
    paddingBottom: 4,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surface,
  },
  chipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  chipEmoji: {
    fontSize: 14,
    marginRight: 4,
  },
  chipText: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  chipTextActive: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  halfField: {
    flex: 1,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
  },
  saveButton: {
    marginTop: 24,
  },
  deleteButton: {
    marginTop: 12,
    marginBottom: 40,
  },
});
