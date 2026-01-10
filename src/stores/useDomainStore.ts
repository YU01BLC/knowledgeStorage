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
} from '../domain/storage';

/**
 * =========================
 * restore helpers
 * =========================
 */
const restoreLabels = (): Label[] => {
  const raw = loadLabels();
  const parsed = z.array(LabelSchema).safeParse(raw);
  return parsed.success ? parsed.data : [];
};

const restoreCards = (): Card[] => {
  const raw = loadCards();
  const parsed = z.array(CardSchema).safeParse(raw);
  return parsed.success ? parsed.data : [];
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
   * Card CRUD
   */
  addCard: (input: CreateCardInput) => void;
  updateCard: (input: UpdateCardInput) => void;
  deleteCard: (cardId: string) => void;

  /**
   * Label CRUD
   */
  addLabel: (label: Omit<Label, 'color'> & { color?: string }) => void;
  updateLabel: (label: Label) => void;
  deleteLabel: (labelId: string) => void;
};

/**
 * =========================
 * Store Implementation
 * =========================
 */
export const useDomainStore = create<DomainState>((set) => ({
  cards: restoreCards(),
  labels: restoreLabels(),

  /**
   * -------- Card --------
   */
  addCard: (input) => {
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
      saveCards(next);
      return { cards: next };
    });
  },

  updateCard: (input) => {
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
      saveCards(next);
      return { cards: next };
    });
  },

  deleteCard: (cardId) =>
    set((state) => {
      const next = state.cards.filter((card) => card.id !== cardId);
      saveCards(next);
      return { cards: next };
    }),

  /**
   * -------- Label --------
   */
  addLabel: (label) =>
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
      saveLabels(next);

      return { labels: next };
    }),

  updateLabel: (label) => {
    const parsed = LabelSchema.safeParse(label);
    if (!parsed.success) {
      console.error(parsed.error);
      return;
    }

    set((state) => {
      const next = state.labels.map((l) =>
        l.id === parsed.data.id ? parsed.data : l
      );
      saveLabels(next);
      return { labels: next };
    });
  },

  deleteLabel: (labelId) =>
    set((state) => {
      const nextLabels = state.labels.filter((label) => label.id !== labelId);

      const nextCards = state.cards.map((card) => ({
        ...card,
        labelIds: card.labelIds.filter((id) => id !== labelId),
      }));

      saveLabels(nextLabels);
      saveCards(nextCards);

      return {
        labels: nextLabels,
        cards: nextCards,
      };
    }),
}));
