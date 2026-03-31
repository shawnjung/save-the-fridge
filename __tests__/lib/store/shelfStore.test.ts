// Must use var for jest.mock hoisting to access the variable
var mockSupabase: any;

jest.mock('@/lib/supabase', () => {
  mockSupabase = {
    auth: {
      getSession: jest.fn(),
    },
    from: jest.fn(),
  };
  return { supabase: mockSupabase };
});

import { useShelfStore, type ShelfItem, type StorageType } from '@/lib/store/shelfStore';

const mockItem: ShelfItem = {
  id: 'item-1',
  user_id: 'user-123',
  name: 'Milk',
  category: 'dairy',
  storage_type: 'fridge',
  quantity: 1,
  unit: 'L',
  expiry_date: '2025-12-31',
  is_shared: true,
  image_url: null,
  notes: null,
  created_at: '2025-01-01T00:00:00Z',
};

const mockItem2: ShelfItem = {
  id: 'item-2',
  user_id: 'user-123',
  name: 'Rice',
  category: 'grain',
  storage_type: 'pantry',
  quantity: 2,
  unit: 'kg',
  expiry_date: null,
  is_shared: true,
  image_url: null,
  notes: null,
  created_at: '2025-01-02T00:00:00Z',
};

const mockItem3: ShelfItem = {
  id: 'item-3',
  user_id: 'user-123',
  name: 'Chicken',
  category: 'meat',
  storage_type: 'fridge',
  quantity: 500,
  unit: 'g',
  expiry_date: '2025-06-15',
  is_shared: false,
  image_url: null,
  notes: 'Fresh',
  created_at: '2025-01-03T00:00:00Z',
};

describe('shelfStore', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useShelfStore.setState({
      items: [],
      isLoading: false,
      filter: 'all',
      categoryFilter: 'all',
    });
  });

  describe('initial state', () => {
    it('should have empty items array', () => {
      expect(useShelfStore.getState().items).toEqual([]);
    });

    it('should not be loading', () => {
      expect(useShelfStore.getState().isLoading).toBe(false);
    });

    it('should have "all" as default filter', () => {
      expect(useShelfStore.getState().filter).toBe('all');
    });

    it('should have "all" as default category filter', () => {
      expect(useShelfStore.getState().categoryFilter).toBe('all');
    });
  });

  describe('setFilter', () => {
    it('should update filter to fridge', () => {
      useShelfStore.getState().setFilter('fridge');
      expect(useShelfStore.getState().filter).toBe('fridge');
    });

    it('should update filter to pantry', () => {
      useShelfStore.getState().setFilter('pantry');
      expect(useShelfStore.getState().filter).toBe('pantry');
    });

    it('should update filter to all', () => {
      useShelfStore.getState().setFilter('fridge');
      useShelfStore.getState().setFilter('all');
      expect(useShelfStore.getState().filter).toBe('all');
    });
  });

  describe('setCategoryFilter', () => {
    it('should update category filter', () => {
      useShelfStore.getState().setCategoryFilter('dairy');
      expect(useShelfStore.getState().categoryFilter).toBe('dairy');
    });

    it('should reset category filter to all', () => {
      useShelfStore.getState().setCategoryFilter('meat');
      useShelfStore.getState().setCategoryFilter('all');
      expect(useShelfStore.getState().categoryFilter).toBe('all');
    });
  });

  describe('getFilteredItems', () => {
    beforeEach(() => {
      useShelfStore.setState({
        items: [mockItem, mockItem2, mockItem3],
      });
    });

    it('should return all items when filter is "all"', () => {
      const filtered = useShelfStore.getState().getFilteredItems();
      expect(filtered).toHaveLength(3);
    });

    it('should filter by fridge storage type', () => {
      useShelfStore.getState().setFilter('fridge');
      const filtered = useShelfStore.getState().getFilteredItems();
      expect(filtered).toHaveLength(2);
      expect(filtered.every((i) => i.storage_type === 'fridge')).toBe(true);
    });

    it('should filter by pantry storage type', () => {
      useShelfStore.getState().setFilter('pantry');
      const filtered = useShelfStore.getState().getFilteredItems();
      expect(filtered).toHaveLength(1);
      expect(filtered[0].storage_type).toBe('pantry');
    });

    it('should filter by category', () => {
      useShelfStore.getState().setCategoryFilter('dairy');
      const filtered = useShelfStore.getState().getFilteredItems();
      expect(filtered).toHaveLength(1);
      expect(filtered[0].category).toBe('dairy');
    });

    it('should combine storage and category filters', () => {
      useShelfStore.getState().setFilter('fridge');
      useShelfStore.getState().setCategoryFilter('meat');
      const filtered = useShelfStore.getState().getFilteredItems();
      expect(filtered).toHaveLength(1);
      expect(filtered[0].name).toBe('Chicken');
    });

    it('should return empty array when no items match filters', () => {
      useShelfStore.getState().setFilter('pantry');
      useShelfStore.getState().setCategoryFilter('dairy');
      const filtered = useShelfStore.getState().getFilteredItems();
      expect(filtered).toHaveLength(0);
    });
  });

  describe('fetchItems', () => {
    it('should set isLoading during fetch', async () => {
      mockSupabase.auth.getSession.mockResolvedValueOnce({
        data: { session: { user: { id: 'user-123' } } },
      });
      const orderMock = jest.fn().mockResolvedValueOnce({ data: [mockItem], error: null });
      const eqMock = jest.fn().mockReturnValue({ order: orderMock });
      const selectMock = jest.fn().mockReturnValue({ eq: eqMock });
      mockSupabase.from.mockReturnValueOnce({ select: selectMock });

      const fetchPromise = useShelfStore.getState().fetchItems();
      expect(useShelfStore.getState().isLoading).toBe(true);
      await fetchPromise;
      expect(useShelfStore.getState().isLoading).toBe(false);
    });

    it('should populate items from supabase', async () => {
      mockSupabase.auth.getSession.mockResolvedValueOnce({
        data: { session: { user: { id: 'user-123' } } },
      });
      const orderMock = jest.fn().mockResolvedValueOnce({ data: [mockItem, mockItem2], error: null });
      const eqMock = jest.fn().mockReturnValue({ order: orderMock });
      const selectMock = jest.fn().mockReturnValue({ eq: eqMock });
      mockSupabase.from.mockReturnValueOnce({ select: selectMock });

      await useShelfStore.getState().fetchItems();

      expect(useShelfStore.getState().items).toHaveLength(2);
    });

    it('should not fetch if no session', async () => {
      mockSupabase.auth.getSession.mockResolvedValueOnce({
        data: { session: null },
      });

      await useShelfStore.getState().fetchItems();

      expect(useShelfStore.getState().items).toEqual([]);
    });
  });

  describe('addItem', () => {
    it('should throw if not authenticated', async () => {
      mockSupabase.auth.getSession.mockResolvedValueOnce({
        data: { session: null },
      });

      await expect(
        useShelfStore.getState().addItem({
          name: 'Test',
          category: 'other',
          storage_type: 'fridge',
          quantity: 1,
          unit: 'pcs',
          expiry_date: null,
          is_shared: true,
          image_url: null,
          notes: null,
        })
      ).rejects.toThrow('Not authenticated');
    });
  });

  describe('deleteItem', () => {
    it('should remove item from state after delete', async () => {
      useShelfStore.setState({ items: [mockItem, mockItem2] });
      const eqMock = jest.fn().mockResolvedValueOnce({ error: null });
      const deleteMock = jest.fn().mockReturnValue({ eq: eqMock });
      mockSupabase.from.mockReturnValueOnce({ delete: deleteMock });

      await useShelfStore.getState().deleteItem('item-1');

      expect(useShelfStore.getState().items).toHaveLength(1);
      expect(useShelfStore.getState().items[0].id).toBe('item-2');
    });
  });
});
