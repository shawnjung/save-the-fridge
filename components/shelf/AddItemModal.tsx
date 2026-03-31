import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Modal,
  ScrollView,
  TouchableOpacity,
  Switch,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Button } from '@/components/ui/Button';
import { CATEGORIES, CATEGORY_EMOJI, CATEGORY_LABELS, type ItemCategory } from '@/constants/categories';
import { UNITS } from '@/constants/units';
import { COLORS } from '@/constants/theme';
import type { StorageType } from '@/lib/store/shelfStore';

type AddItemModalProps = {
  visible: boolean;
  onClose: () => void;
  onAdd: (item: {
    name: string;
    category: ItemCategory;
    storage_type: StorageType;
    quantity: number;
    unit: string;
    expiry_date: string | null;
    is_shared: boolean;
    notes: string | null;
    image_url: string | null;
  }) => void;
};

export function AddItemModal({ visible, onClose, onAdd }: AddItemModalProps) {
  const [name, setName] = useState('');
  const [category, setCategory] = useState<ItemCategory>('other');
  const [storageType, setStorageType] = useState<StorageType>('fridge');
  const [quantity, setQuantity] = useState('1');
  const [unit, setUnit] = useState('pcs');
  const [expiryDate, setExpiryDate] = useState('');
  const [isShared, setIsShared] = useState(true);
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = () => {
    if (!name.trim()) {
      setError('Item name is required');
      return;
    }

    const parsedQuantity = parseFloat(quantity);
    if (isNaN(parsedQuantity) || parsedQuantity <= 0) {
      setError('Quantity must be a positive number');
      return;
    }

    onAdd({
      name: name.trim(),
      category,
      storage_type: storageType,
      quantity: parsedQuantity,
      unit,
      expiry_date: expiryDate || null,
      is_shared: isShared,
      notes: notes || null,
      image_url: null,
    });

    // Reset form
    setName('');
    setCategory('other');
    setStorageType('fridge');
    setQuantity('1');
    setUnit('pcs');
    setExpiryDate('');
    setIsShared(true);
    setNotes('');
    setError('');
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <KeyboardAvoidingView
        style={styles.overlay}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.modal}>
          <ScrollView showsVerticalScrollIndicator={false}>
            <Text style={styles.title}>Add Item</Text>

            {error ? <Text style={styles.error}>{error}</Text> : null}

            <Text style={styles.label}>Name *</Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="e.g., Milk, Eggs, Tomatoes"
              placeholderTextColor={COLORS.textSecondary}
            />

            <Text style={styles.label}>Storage</Text>
            <View style={styles.segmentContainer}>
              <TouchableOpacity
                style={[styles.segment, storageType === 'fridge' && styles.segmentActive]}
                onPress={() => setStorageType('fridge')}
              >
                <Text
                  style={[styles.segmentText, storageType === 'fridge' && styles.segmentTextActive]}
                >
                  🧊 Fridge
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.segment, storageType === 'pantry' && styles.segmentActive]}
                onPress={() => setStorageType('pantry')}
              >
                <Text
                  style={[styles.segmentText, storageType === 'pantry' && styles.segmentTextActive]}
                >
                  🏠 Pantry
                </Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.label}>Category</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryRow}>
              {CATEGORIES.map((cat) => (
                <TouchableOpacity
                  key={cat}
                  style={[styles.categoryChip, category === cat && styles.categoryChipActive]}
                  onPress={() => setCategory(cat)}
                >
                  <Text style={styles.categoryEmoji}>{CATEGORY_EMOJI[cat]}</Text>
                  <Text
                    style={[
                      styles.categoryLabel,
                      category === cat && styles.categoryLabelActive,
                    ]}
                  >
                    {CATEGORY_LABELS[cat]}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <View style={styles.row}>
              <View style={styles.halfField}>
                <Text style={styles.label}>Quantity</Text>
                <TextInput
                  style={styles.input}
                  value={quantity}
                  onChangeText={setQuantity}
                  keyboardType="decimal-pad"
                  placeholder="1"
                  placeholderTextColor={COLORS.textSecondary}
                />
              </View>
              <View style={styles.halfField}>
                <Text style={styles.label}>Unit</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <View style={styles.unitRow}>
                    {UNITS.map((u) => (
                      <TouchableOpacity
                        key={u}
                        style={[styles.unitChip, unit === u && styles.unitChipActive]}
                        onPress={() => setUnit(u)}
                      >
                        <Text
                          style={[styles.unitText, unit === u && styles.unitTextActive]}
                        >
                          {u}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </ScrollView>
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
              placeholder="Any notes..."
              placeholderTextColor={COLORS.textSecondary}
              multiline
              numberOfLines={3}
            />

            <View style={styles.buttonRow}>
              <Button title="Cancel" onPress={onClose} variant="outline" style={styles.flex} />
              <Button title="Add Item" onPress={handleSubmit} style={styles.flex} />
            </View>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modal: {
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    maxHeight: '90%',
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 16,
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
    backgroundColor: COLORS.background,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  error: {
    color: COLORS.danger,
    fontSize: 14,
    marginBottom: 8,
  },
  segmentContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  segment: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
  },
  segmentActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  segmentText: {
    fontSize: 15,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  segmentTextActive: {
    color: '#FFFFFF',
  },
  categoryRow: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginRight: 8,
    backgroundColor: COLORS.surface,
  },
  categoryChipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  categoryEmoji: {
    fontSize: 16,
    marginRight: 4,
  },
  categoryLabel: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  categoryLabelActive: {
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
  unitRow: {
    flexDirection: 'row',
    gap: 6,
    paddingVertical: 4,
  },
  unitChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  unitChipActive: {
    backgroundColor: COLORS.secondary,
    borderColor: COLORS.secondary,
  },
  unitText: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  unitTextActive: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
  },
  flex: {
    flex: 1,
  },
});
