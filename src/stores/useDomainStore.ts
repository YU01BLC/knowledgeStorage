import { create } from 'zustand';
import { z } from 'zod';
import { Card, CardSchema, Label, LabelSchema } from '../domain/schema';
import { Offspring, OffspringSchema } from '../domain/offspringSchema';
import { Pedigree, PedigreeSchema } from '../domain/pedigreeSchema';
import { normalizeKana } from '../utils/kana';
import {
  HorseCard,
  HorseCardSchema,
  CreateHorseCardInput,
  CreateHorseCardInputSchema,
  UpdateHorseCardInput,
  UpdateHorseCardInputSchema,
} from '../domain/horseSchema';
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
  loadHorseCards,
  saveHorseCards,
  loadOffspring,
  saveOffspring,
  loadPedigree,
  savePedigree,
} from '../domain/indexedDB';
import { migrateFromLocalStorage } from '../domain/migrateFromLocalStorage';
import { BackupSchema } from '../domain/backupSchema';
import { HorseBackupSchema } from '../domain/horseBackupSchema';

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
  horseCards: HorseCard[];
  pedigree: Pedigree[];
  offspring: Offspring[];

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
   * HorseCard CRUD
   */
  addHorseCard: (input: CreateHorseCardInput) => Promise<void>;
  updateHorseCard: (input: UpdateHorseCardInput) => Promise<void>;
  deleteHorseCard: (cardId: string) => Promise<void>;

  /**
   * Offspring CRUD
   */
  addPedigree: (input: { id: string; name: string }) => Promise<void>;
  updatePedigree: (input: Pedigree) => Promise<void>;
  deletePedigree: (pedigreeId: string) => Promise<void>;
  addOffspring: (input: { id: string; name: string }) => Promise<void>;
  updateOffspring: (input: Offspring) => Promise<void>;
  deleteOffspring: (offspringId: string) => Promise<void>;
  ensurePedigreeNames: (names: string[]) => Promise<void>;
  ensureOffspringNames: (names: string[]) => Promise<void>;

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
  exportHorseBackup: () => Promise<void>;
  importHorseBackup: (data: unknown) => Promise<boolean>;

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
  horseCards: [],
  pedigree: [],
  offspring: [],

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
   * -------- HorseCard --------
   */
  addHorseCard: async (input) => {
    const parsed = CreateHorseCardInputSchema.safeParse(input);
    if (!parsed.success) {
      console.error(parsed.error);
      return;
    }

    const now = Date.now();

    const horseCard: HorseCard = {
      id: generateId(),
      name: parsed.data.name,
      sire: parsed.data.sire,
      dam: parsed.data.dam,
      damSire: parsed.data.damSire,
      offspringNames: parsed.data.offspringNames,
      createdAt: now,
      updatedAt: now,
    };

    const validated = HorseCardSchema.safeParse(horseCard);
    if (!validated.success) {
      console.error(validated.error);
      return;
    }

    set((state) => {
      const next = [...state.horseCards, validated.data];
      saveHorseCards(next).catch((error) => {
        console.error('Error saving horse cards:', error);
      });
      return { horseCards: next };
    });
  },

  updateHorseCard: async (input) => {
    const parsed = UpdateHorseCardInputSchema.safeParse(input);
    if (!parsed.success) {
      console.error(parsed.error);
      return;
    }

    set((state) => {
      const next = state.horseCards.map((card) =>
        card.id === parsed.data.id
          ? {
              ...card,
              ...parsed.data,
              updatedAt: Date.now(),
            }
          : card
      );
      saveHorseCards(next).catch((error) => {
        console.error('Error saving horse cards:', error);
      });
      return { horseCards: next };
    });
  },

  deleteHorseCard: async (cardId) => {
    set((state) => {
      const next = state.horseCards.filter((card) => card.id !== cardId);
      saveHorseCards(next).catch((error) => {
        console.error('Error saving horse cards:', error);
      });
      return { horseCards: next };
    });
  },

  /**
   * -------- Pedigree --------
   */
  addPedigree: async (input) => {
    const parsed = PedigreeSchema.safeParse(input);
    if (!parsed.success) {
      console.error(parsed.error);
      return;
    }

    const exists = get().pedigree.some(
      (o) => normalizeKana(o.name) === normalizeKana(parsed.data.name)
    );
    if (exists) return;

    set((state) => {
      const next = [...state.pedigree, parsed.data];
      savePedigree(next).catch((error) => {
        console.error('Error saving pedigree:', error);
      });
      return { pedigree: next };
    });
  },

  updatePedigree: async (input) => {
    const parsed = PedigreeSchema.safeParse(input);
    if (!parsed.success) {
      console.error(parsed.error);
      return;
    }

    set((state) => {
      const prev = state.pedigree.find((o) => o.id === parsed.data.id);
      const nextPedigree = state.pedigree.map((o) =>
        o.id === parsed.data.id ? parsed.data : o
      );

      const nextHorseCards =
        prev && prev.name !== parsed.data.name
          ? state.horseCards.map((card) => ({
              ...card,
              sire: card.sire === prev.name ? parsed.data.name : card.sire,
              dam: card.dam === prev.name ? parsed.data.name : card.dam,
              damSire:
                card.damSire === prev.name ? parsed.data.name : card.damSire,
              offspringNames: card.offspringNames.map((name) =>
                name === prev.name ? parsed.data.name : name
              ),
            }))
          : state.horseCards;

      savePedigree(nextPedigree).catch((error) => {
        console.error('Error saving pedigree:', error);
      });
      if (nextHorseCards !== state.horseCards) {
        saveHorseCards(nextHorseCards).catch((error) => {
          console.error('Error saving horse cards:', error);
        });
      }

      return { pedigree: nextPedigree, horseCards: nextHorseCards };
    });
  },

  deletePedigree: async (pedigreeId) => {
    set((state) => {
      const target = state.pedigree.find((o) => o.id === pedigreeId);
      const nextPedigree = state.pedigree.filter((o) => o.id !== pedigreeId);
      const nextHorseCards = target
        ? state.horseCards.map((card) => ({
            ...card,
            sire: card.sire === target.name ? undefined : card.sire,
            dam: card.dam === target.name ? undefined : card.dam,
            damSire: card.damSire === target.name ? undefined : card.damSire,
            offspringNames: card.offspringNames.filter(
              (name) => name !== target.name
            ),
          }))
        : state.horseCards;

      savePedigree(nextPedigree).catch((error) => {
        console.error('Error saving pedigree:', error);
      });
      if (nextHorseCards !== state.horseCards) {
        saveHorseCards(nextHorseCards).catch((error) => {
          console.error('Error saving horse cards:', error);
        });
      }

      return { pedigree: nextPedigree, horseCards: nextHorseCards };
    });
  },

  /**
   * -------- Offspring --------
   */
  addOffspring: async (input) => {
    const parsed = OffspringSchema.safeParse(input);
    if (!parsed.success) {
      console.error(parsed.error);
      return;
    }

    const exists = get().offspring.some(
      (o) => normalizeKana(o.name) === normalizeKana(parsed.data.name)
    );
    if (exists) return;

    set((state) => {
      const next = [...state.offspring, parsed.data];
      saveOffspring(next).catch((error) => {
        console.error('Error saving offspring:', error);
      });
      return { offspring: next };
    });
  },

  updateOffspring: async (input) => {
    const parsed = OffspringSchema.safeParse(input);
    if (!parsed.success) {
      console.error(parsed.error);
      return;
    }

    set((state) => {
      const prev = state.offspring.find((o) => o.id === parsed.data.id);
      const nextOffspring = state.offspring.map((o) =>
        o.id === parsed.data.id ? parsed.data : o
      );

      const nextHorseCards =
        prev && prev.name !== parsed.data.name
          ? state.horseCards.map((card) => ({
              ...card,
              offspringNames: card.offspringNames.map((name) =>
                name === prev.name ? parsed.data.name : name
              ),
            }))
          : state.horseCards;

      saveOffspring(nextOffspring).catch((error) => {
        console.error('Error saving offspring:', error);
      });
      if (nextHorseCards !== state.horseCards) {
        saveHorseCards(nextHorseCards).catch((error) => {
          console.error('Error saving horse cards:', error);
        });
      }

      return { offspring: nextOffspring, horseCards: nextHorseCards };
    });
  },

  deleteOffspring: async (offspringId) => {
    set((state) => {
      const target = state.offspring.find((o) => o.id === offspringId);
      const nextOffspring = state.offspring.filter((o) => o.id !== offspringId);
      const nextHorseCards = target
        ? state.horseCards.map((card) => ({
            ...card,
            offspringNames: card.offspringNames.filter(
              (name) => name !== target.name
            ),
          }))
        : state.horseCards;

      saveOffspring(nextOffspring).catch((error) => {
        console.error('Error saving offspring:', error);
      });
      if (nextHorseCards !== state.horseCards) {
        saveHorseCards(nextHorseCards).catch((error) => {
          console.error('Error saving horse cards:', error);
        });
      }

      return { offspring: nextOffspring, horseCards: nextHorseCards };
    });
  },

  ensurePedigreeNames: async (names) => {
    const normalized = Array.from(
      new Set(names.map((n) => n.trim()).filter(Boolean))
    );
    if (normalized.length === 0) return;

    const existing = get().pedigree;
    const missing = normalized.filter(
      (name) => !existing.some((p) => p.name.toLowerCase() === name.toLowerCase())
    );
    if (missing.length === 0) return;

    const toAdd = missing.map((name) => ({ id: generateId(), name }));
    set((state) => {
      const next = [...state.pedigree, ...toAdd];
      savePedigree(next).catch((error) => {
        console.error('Error saving pedigree:', error);
      });
      return { pedigree: next };
    });
  },

  ensureOffspringNames: async (names) => {
    const normalized = Array.from(
      new Set(names.map((n) => n.trim()).filter(Boolean))
    );
    if (normalized.length === 0) return;

    const existing = get().offspring;
    const missing = normalized.filter(
      (name) =>
        !existing.some((o) => o.name.toLowerCase() === name.toLowerCase())
    );
    if (missing.length === 0) return;

    const toAdd = missing.map((name) => ({ id: generateId(), name }));
    set((state) => {
      const next = [...state.offspring, ...toAdd];
      saveOffspring(next).catch((error) => {
        console.error('Error saving offspring:', error);
      });
      return { offspring: next };
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

  exportHorseBackup: async () => {
    const { horseCards, pedigree, offspring } = get();

    const backup = {
      version: 1 as const,
      exportedAt: Date.now(),
      horseCards,
      pedigree,
      offspring,
    };

    const blob = new Blob([JSON.stringify(backup, null, 2)], {
      type: 'application/json',
    });

    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `horse-backup-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  },

  importHorseBackup: async (data) => {
    const parsed = HorseBackupSchema.safeParse(data);

    if (!parsed.success) {
      console.error(parsed.error);
      return false;
    }

    const { horseCards, pedigree, offspring } = parsed.data;

    try {
      await saveHorseCards(horseCards);
      await savePedigree(pedigree ?? []);
      await saveOffspring(offspring ?? []);

      set({
        horseCards,
        pedigree: pedigree ?? [],
        offspring: offspring ?? [],
      });

      return true;
    } catch (error) {
      console.error('Error importing horse backup:', error);
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
      const horseCards = await loadHorseCards();
      const storedOffspring = await loadOffspring();
      const storedPedigree = await loadPedigree();

      const pedigreeFromCards = Array.from(
        new Set(
          horseCards.flatMap((card) => [card.sire, card.dam, card.damSire])
        )
      )
        .map((name) => name?.trim())
        .filter((name): name is string => Boolean(name))
        .map((name) => ({ id: generateId(), name }));

      const offspringFromCards = Array.from(
        new Set(
          horseCards.flatMap((card) =>
            card.offspringNames.map((name) => name.trim()).filter(Boolean)
          )
        )
      ).map((name) => ({ id: generateId(), name }));

      const mergedPedigree = [
        ...storedPedigree,
        ...pedigreeFromCards.filter(
          (item) =>
            !storedPedigree.some(
              (p) => p.name.toLowerCase() === item.name.toLowerCase()
            )
        ),
      ];

      const mergedOffspring = [
        ...storedOffspring,
        ...offspringFromCards.filter(
          (item) =>
            !storedOffspring.some(
              (o) => o.name.toLowerCase() === item.name.toLowerCase()
            )
        ),
      ];

      set({
        labels,
        cards,
        horseCards,
        pedigree: mergedPedigree,
        offspring: mergedOffspring,
      });

      if (mergedPedigree.length !== storedPedigree.length) {
        await savePedigree(mergedPedigree);
      }
      if (mergedOffspring.length !== storedOffspring.length) {
        await saveOffspring(mergedOffspring);
      }
    } catch (error) {
      console.error('Error initializing store:', error);
    }
  },
}));
