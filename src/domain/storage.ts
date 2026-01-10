import { Label, Card } from './schema';

const LABELS_KEY = 'knowledge-storage:labels';

export const loadLabels = (): Label[] => {
  try {
    const raw = localStorage.getItem(LABELS_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as Label[];
  } catch {
    return [];
  }
};

export const saveLabels = (labels: Label[]) => {
  localStorage.setItem(LABELS_KEY, JSON.stringify(labels));
};

const CARDS_KEY = 'knowledge-storage:cards';

export const loadCards = (): Card[] => {
  try {
    const raw = localStorage.getItem(CARDS_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as Card[];
  } catch {
    return [];
  }
};

export const saveCards = (cards: Card[]) => {
  localStorage.setItem(CARDS_KEY, JSON.stringify(cards));
};
