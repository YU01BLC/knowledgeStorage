import { create } from 'zustand';
import { z } from 'zod';
import { Card, CardSchema, Label, LabelSchema } from '../domain/schema';
import {
  CreateCardInput,
  CreateCardInputSchema,
  UpdateCardInput,
  UpdateCardInputSchema,
} from '../domain/inputSchema';
import { generateId } from '../domain/id';
import { generateUniqueLabelColor } from '../domain/generateUniqueLabelColor';
import {
  loadLabels,
  saveLabels,
  loadCards,
  saveCards,
} from '../domain/indexedDB';
import { migrateFromLocalStorage } from '../domain/migrateFromLocalStorage';
import { BackupSchema } from '../domain/backupSchema';

/**
 * =========================
 * restore helpers
 * =========================
 */
const restoreLabels = async (): Promise<Label[]> => {
  try {
    const raw = await loadLabels();
    const parsed = z.array(LabelSchema).safeParse(raw);
    return parsed.success ? parsed.data : [];
  } catch (error) {
    console.error('Error restoring labels:', error);
    return [];
  }
};

const restoreCards = async (): Promise<Card[]> => {
  try {
    const raw = await loadCards();
    const parsed = z.array(CardSchema).safeParse(raw);
    return parsed.success ? parsed.data : [];
  } catch (error) {
    console.error('Error restoring cards:', error);
    return [];
  }
};

/**
 * =========================
 * Store State
 * =========================
 */
type DomainState = {
  cards: Card[];
  labels: Label[];

  /**
   * Label Filter (UI State)
   */
  selectedLabelIds: string[];
  setSelectedLabelIds: (ids: string[]) => void;

  /**
   * Search
   */
  searchText: string;
  setSearchText: (text: string) => void;

  /**
   * Card CRUD
   */
  addCard: (input: CreateCardInput) => Promise<void>;
  updateCard: (input: UpdateCardInput) => Promise<void>;
  deleteCard: (cardId: string) => Promise<void>;

  /**
   * Label CRUD
   */
  addLabel: (label: Omit<Label, 'color'> & { color?: string }) => Promise<void>;
  updateLabel: (label: Label) => Promise<void>;
  deleteLabel: (labelId: string) => Promise<void>;

  /**
   * Backup
   */
  exportBackup: () => Promise<void>;
  exportFilteredBackup: () => Promise<void>;
  importBackup: (data: unknown) => Promise<boolean>;

  /**
   * Initialization
   */
  initialize: () => Promise<void>;
};

/**
 * =========================
 * Store Implementation
 * =========================
 */
export const useDomainStore = create<DomainState>((set, get) => ({
  cards: [],
  labels: [],

  /**
   * -------- Label Filter --------
   */
  selectedLabelIds: [],
  setSelectedLabelIds: (ids) => set({ selectedLabelIds: ids }),

  /**
   * -------- Search --------
   */
  searchText: '',
  setSearchText: (text) => set({ searchText: text }),

  /**
   * -------- Card --------
   */
  addCard: async (input) => {
    const parsed = CreateCardInputSchema.safeParse(input);
    if (!parsed.success) {
      console.error(parsed.error);
      return;
    }

    const now = Date.now();

    const card: Card = {
      id: generateId(),
      title: parsed.data.title,
      body: parsed.data.body,
      labelIds: parsed.data.labelIds,
      createdAt: now,
      updatedAt: now,
    };

    const validated = CardSchema.safeParse(card);
    if (!validated.success) {
      console.error(validated.error);
      return;
    }

    set((state) => {
      const next = [...state.cards, validated.data];
      saveCards(next).catch((error) => {
        console.error('Error saving cards:', error);
      });
      return { cards: next };
    });
  },

  updateCard: async (input) => {
    const parsed = UpdateCardInputSchema.safeParse(input);
    if (!parsed.success) {
      console.error(parsed.error);
      return;
    }

    set((state) => {
      const next = state.cards.map((card) =>
        card.id === parsed.data.id
          ? {
              ...card,
              ...parsed.data,
              updatedAt: Date.now(),
            }
          : card
      );
      saveCards(next).catch((error) => {
        console.error('Error saving cards:', error);
      });
      return { cards: next };
    });
  },

  deleteCard: async (cardId) => {
    set((state) => {
      const next = state.cards.filter((card) => card.id !== cardId);
      saveCards(next).catch((error) => {
        console.error('Error saving cards:', error);
      });
      return { cards: next };
    });
  },

  /**
   * -------- Label --------
   */
  addLabel: async (label) => {
    set((state) => {
      const color =
        label.color ?? generateUniqueLabelColor(state.labels.length);

      const labelWithColor: Label = {
        id: label.id,
        name: label.name,
        color,
      };

      const parsed = LabelSchema.safeParse(labelWithColor);
      if (!parsed.success) {
        console.error(parsed.error);
        return state;
      }

      const next = [...state.labels, parsed.data];
      saveLabels(next).catch((error) => {
        console.error('Error saving labels:', error);
      });

      return { labels: next };
    });
  },

  updateLabel: async (label) => {
    const parsed = LabelSchema.safeParse(label);
    if (!parsed.success) {
      console.error(parsed.error);
      return;
    }

    set((state) => {
      const next = state.labels.map((l) =>
        l.id === parsed.data.id ? parsed.data : l
      );
      saveLabels(next).catch((error) => {
        console.error('Error saving labels:', error);
      });
      return { labels: next };
    });
  },

  deleteLabel: async (labelId) => {
    set((state) => {
      const nextLabels = state.labels.filter((label) => label.id !== labelId);

      const nextCards = state.cards.map((card) => ({
        ...card,
        labelIds: card.labelIds.filter((id) => id !== labelId),
      }));

      saveLabels(nextLabels).catch((error) => {
        console.error('Error saving labels:', error);
      });
      saveCards(nextCards).catch((error) => {
        console.error('Error saving cards:', error);
      });

      return {
        labels: nextLabels,
        cards: nextCards,
        selectedLabelIds: state.selectedLabelIds.filter((id) => id !== labelId),
      };
    });
  },

  /**
   * -------- Backup --------
   */
  exportBackup: async () => {
    const { cards, labels } = get();

    const backup = {
      version: 1 as const,
      exportedAt: Date.now(),
      cards,
      labels,
    };

    const blob = new Blob([JSON.stringify(backup, null, 2)], {
      type: 'application/json',
    });

    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `knowledge-backup-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  },

  exportFilteredBackup: async () => {
    const { cards, labels, selectedLabelIds, searchText } = get();
    const normalizedSearch = searchText.trim();

    const filteredCards = cards.filter((card) => {
      const textMatch =
        normalizedSearch === '' || card.title.includes(normalizedSearch);
      const labelMatch =
        selectedLabelIds.length === 0 ||
        card.labelIds.some((id) => selectedLabelIds.includes(id));

      return textMatch && labelMatch;
    });

    const labelIdSet = new Set(
      filteredCards.flatMap((card) => card.labelIds)
    );
    const filteredLabels = labels.filter((label) => labelIdSet.has(label.id));

    const backup = {
      version: 1 as const,
      exportedAt: Date.now(),
      cards: filteredCards,
      labels: filteredLabels,
    };

    const blob = new Blob([JSON.stringify(backup, null, 2)], {
      type: 'application/json',
    });

    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `knowledge-backup-filtered-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  },

  importBackup: async (data) => {
    const parsed = BackupSchema.safeParse(data);

    if (!parsed.success) {
      console.error(parsed.error);
      return false;
    }

    const { cards, labels } = parsed.data;

    try {
      await saveCards(cards);
      await saveLabels(labels);

      set({
        cards,
        labels,
        selectedLabelIds: [],
      });

      return true;
    } catch (error) {
      console.error('Error importing backup:', error);
      return false;
    }
  },

  /**
   * -------- Initialization --------
   */
  initialize: async () => {
    try {
      // localStorageからIndexedDBへの移行を試行
      await migrateFromLocalStorage();

      // データを読み込む
      const labels = await restoreLabels();
      const cards = await restoreCards();

      set({
        labels,
        cards,
      });
    } catch (error) {
      console.error('Error initializing store:', error);
    }
  },
}));
