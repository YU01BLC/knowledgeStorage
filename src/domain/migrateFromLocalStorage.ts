import { Label, Card, LabelSchema, CardSchema } from './schema';
import { z } from 'zod';
import { saveLabels, saveCards, loadLabels, loadCards } from './indexedDB';

const LABELS_KEY = 'knowledge-storage:labels';
const CARDS_KEY = 'knowledge-storage:cards';

/**
 * localStorageからデータを読み込む
 */
const loadFromLocalStorage = (): {
  labels: Label[];
  cards: Card[];
} => {
  let labels: Label[] = [];
  let cards: Card[] = [];

  try {
    // ラベルの読み込み
    const labelsRaw = localStorage.getItem(LABELS_KEY);
    if (labelsRaw) {
      const parsed = z.array(LabelSchema).safeParse(JSON.parse(labelsRaw));
      if (parsed.success) {
        labels = parsed.data;
      }
    }

    // カードの読み込み
    const cardsRaw = localStorage.getItem(CARDS_KEY);
    if (cardsRaw) {
      const parsed = z.array(CardSchema).safeParse(JSON.parse(cardsRaw));
      if (parsed.success) {
        cards = parsed.data;
      }
    }
  } catch (error) {
    console.error('Error loading from localStorage:', error);
  }

  return { labels, cards };
};

/**
 * localStorageからIndexedDBへのデータ移行
 */
export const migrateFromLocalStorage = async (): Promise<boolean> => {
  try {
    // IndexedDBに既にデータがあるかチェック
    const existingLabels = await loadLabels();
    const existingCards = await loadCards();

    // 既にデータがある場合は移行しない
    if (existingLabels.length > 0 || existingCards.length > 0) {
      console.log('IndexedDB already has data, skipping migration');
      return false;
    }

    // localStorageからデータを読み込む
    const { labels, cards } = loadFromLocalStorage();

    // データがない場合は移行しない
    if (labels.length === 0 && cards.length === 0) {
      console.log('No data in localStorage to migrate');
      return false;
    }

    // IndexedDBに保存
    if (labels.length > 0) {
      await saveLabels(labels);
      console.log(`Migrated ${labels.length} labels to IndexedDB`);
    }

    if (cards.length > 0) {
      await saveCards(cards);
      console.log(`Migrated ${cards.length} cards to IndexedDB`);
    }

    // 移行成功後、localStorageのデータは削除しない（バックアップとして残す）
    // 必要に応じて手動で削除可能

    return true;
  } catch (error) {
    console.error('Error migrating from localStorage:', error);
    return false;
  }
};
