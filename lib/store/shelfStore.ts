import { create } from 'zustand';
import { supabase } from '@/lib/supabase';
import type { ItemCategory } from '@/constants/categories';

export type StorageType = 'fridge' | 'pantry';

export type ShelfItem = {
  id: string;
  user_id: string;
  name: string;
  category: ItemCategory;
  storage_type: StorageType;
  quantity: number;
  unit: string;
  expiry_date: string | null;
  is_shared: boolean;
  image_url: string | null;
  notes: string | null;
  created_at: string;
};

type ShelfState = {
  items: ShelfItem[];
  isLoading: boolean;
  filter: StorageType | 'all';
  categoryFilter: ItemCategory | 'all';
  setFilter: (filter: StorageType | 'all') => void;
  setCategoryFilter: (filter: ItemCategory | 'all') => void;
  fetchItems: () => Promise<void>;
  addItem: (item: Omit<ShelfItem, 'id' | 'user_id' | 'created_at'>) => Promise<void>;
  updateItem: (id: string, updates: Partial<ShelfItem>) => Promise<void>;
  deleteItem: (id: string) => Promise<void>;
  getFilteredItems: () => ShelfItem[];
};

export const useShelfStore = create<ShelfState>((set, get) => ({
  items: [],
  isLoading: false,
  filter: 'all',
  categoryFilter: 'all',

  setFilter: (filter) => set({ filter }),
  setCategoryFilter: (filter) => set({ categoryFilter: filter }),

  fetchItems: async () => {
    set({ isLoading: true });
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { data, error } = await supabase
        .from('shelf_items')
        .select('*')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      set({ items: (data as ShelfItem[]) ?? [] });
    } finally {
      set({ isLoading: false });
    }
  },

  addItem: async (item) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('shelf_items')
      .insert({ ...item, user_id: session.user.id })
      .select()
      .single();

    if (error) throw error;
    set((state) => ({ items: [data as ShelfItem, ...state.items] }));
  },

  updateItem: async (id, updates) => {
    const { data, error } = await supabase
      .from('shelf_items')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    set((state) => ({
      items: state.items.map((item) => (item.id === id ? (data as ShelfItem) : item)),
    }));
  },

  deleteItem: async (id) => {
    const { error } = await supabase.from('shelf_items').delete().eq('id', id);
    if (error) throw error;
    set((state) => ({
      items: state.items.filter((item) => item.id !== id),
    }));
  },

  getFilteredItems: () => {
    const { items, filter, categoryFilter } = get();
    return items.filter((item) => {
      if (filter !== 'all' && item.storage_type !== filter) return false;
      if (categoryFilter !== 'all' && item.category !== categoryFilter) return false;
      return true;
    });
  },
}));
