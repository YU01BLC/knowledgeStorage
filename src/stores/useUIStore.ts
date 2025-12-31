import { create } from 'zustand';

/**
 * =========================
 * UI Types
 * =========================
 */
export type CardViewMode = 'grid' | 'list';

export type CardSearchFilter = {
  keyword?: string;
  labelIds?: string[];
};

/**
 * =========================
 * UI Store State
 * =========================
 */
type UIState = {
  selectedCardId?: string;
  cardViewMode: CardViewMode;
  cardSearchFilter: CardSearchFilter;

  setSelectedCardId: (cardId?: string) => void;
  setCardViewMode: (mode: CardViewMode) => void;
  setCardSearchFilter: (filter: Partial<CardSearchFilter>) => void;
  resetCardSearchFilter: () => void;
};

/**
 * =========================
 * Store Implementation
 * =========================
 */
export const useUIStore = create<UIState>((set) => ({
  selectedCardId: undefined,
  cardViewMode: 'grid',
  cardSearchFilter: {},

  setSelectedCardId: (cardId) => set(() => ({ selectedCardId: cardId })),

  setCardViewMode: (mode) => set(() => ({ cardViewMode: mode })),

  setCardSearchFilter: (filter) =>
    set((state) => ({
      cardSearchFilter: {
        ...state.cardSearchFilter,
        ...filter,
      },
    })),

  resetCardSearchFilter: () => set(() => ({ cardSearchFilter: {} })),
}));
