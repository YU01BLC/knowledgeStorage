import { create } from 'zustand';
import { Card, CardSchema, Label, LabelSchema } from '../domain/schema';
import {
  CreateCardInput,
  CreateCardInputSchema,
  UpdateCardInput,
  UpdateCardInputSchema,
} from '../domain/inputSchema';
import { generateId } from '../domain/id';

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
  addLabel: (label: Label) => void;
  updateLabel: (label: Label) => void;
  deleteLabel: (labelId: string) => void;
};

/**
 * =========================
 * Store Implementation
 * =========================
 */
export const useDomainStore = create<DomainState>((set) => ({
  cards: [],
  labels: [],

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

    set((state) => ({
      cards: [...state.cards, validated.data],
    }));
  },

  updateCard: (input) => {
    const parsed = UpdateCardInputSchema.safeParse(input);
    if (!parsed.success) {
      console.error(parsed.error);
      return;
    }

    set((state) => ({
      cards: state.cards.map((card) =>
        card.id === parsed.data.id
          ? {
              ...card,
              ...parsed.data,
              updatedAt: Date.now(),
            }
          : card
      ),
    }));
  },

  deleteCard: (cardId) =>
    set((state) => ({
      cards: state.cards.filter((card) => card.id !== cardId),
    })),

  /**
   * -------- Label --------
   */
  addLabel: (label) => {
    const parsed = LabelSchema.safeParse(label);
    if (!parsed.success) {
      console.error(parsed.error);
      return;
    }

    set((state) => ({
      labels: [...state.labels, parsed.data],
    }));
  },

  updateLabel: (label) => {
    const parsed = LabelSchema.safeParse(label);
    if (!parsed.success) {
      console.error(parsed.error);
      return;
    }

    set((state) => ({
      labels: state.labels.map((l) =>
        l.id === parsed.data.id ? parsed.data : l
      ),
    }));
  },

  deleteLabel: (labelId) =>
    set((state) => ({
      labels: state.labels.filter((label) => label.id !== labelId),
      cards: state.cards.map((card) => ({
        ...card,
        labelIds: card.labelIds.filter((id) => id !== labelId),
      })),
    })),
}));
