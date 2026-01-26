import { Label, Card } from './schema';

const DB_NAME = 'knowledge-storage';
const DB_VERSION = 1;
const STORE_LABELS = 'labels';
const STORE_CARDS = 'cards';

let dbInstance: IDBDatabase | null = null;

/**
 * IndexedDBが利用可能かチェック
 */
export const isIndexedDBAvailable = (): boolean => {
  return typeof indexedDB !== 'undefined';
};

/**
 * データベース接続を開く
 */
export const openDatabase = (): Promise<IDBDatabase> => {
  if (!isIndexedDBAvailable()) {
    return Promise.reject(
      new Error('IndexedDB is not available in this environment')
    );
  }

  return new Promise((resolve, reject) => {
    if (dbInstance) {
      resolve(dbInstance);
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => {
      reject(new Error('Failed to open database'));
    };

    request.onsuccess = () => {
      dbInstance = request.result;
      resolve(dbInstance);
    };

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;

      // labelsストアの作成
      if (!db.objectStoreNames.contains(STORE_LABELS)) {
        db.createObjectStore(STORE_LABELS, { keyPath: 'id' });
      }

      // cardsストアの作成
      if (!db.objectStoreNames.contains(STORE_CARDS)) {
        db.createObjectStore(STORE_CARDS, { keyPath: 'id' });
      }
    };
  });
};

/**
 * ラベルを読み込む
 */
export const loadLabels = async (): Promise<Label[]> => {
  try {
    const db = await openDatabase();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_LABELS], 'readonly');
      const store = transaction.objectStore(STORE_LABELS);
      const request = store.getAll();

      request.onsuccess = () => {
        resolve(request.result || []);
      };

      request.onerror = () => {
        reject(new Error('Failed to load labels'));
      };
    });
  } catch (error) {
    console.error('Error loading labels:', error);
    return [];
  }
};

/**
 * ラベルを保存する
 */
export const saveLabels = async (labels: Label[]): Promise<void> => {
  try {
    const db = await openDatabase();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_LABELS], 'readwrite');
      const store = transaction.objectStore(STORE_LABELS);

      // 既存データをクリア
      store.clear();

      // 新しいデータを追加
      labels.forEach((label) => {
        store.add(label);
      });

      transaction.oncomplete = () => {
        resolve();
      };

      transaction.onerror = () => {
        reject(new Error('Failed to save labels'));
      };
    });
  } catch (error) {
    console.error('Error saving labels:', error);
    throw error;
  }
};

/**
 * カードを読み込む
 */
export const loadCards = async (): Promise<Card[]> => {
  try {
    const db = await openDatabase();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_CARDS], 'readonly');
      const store = transaction.objectStore(STORE_CARDS);
      const request = store.getAll();

      request.onsuccess = () => {
        resolve(request.result || []);
      };

      request.onerror = () => {
        reject(new Error('Failed to load cards'));
      };
    });
  } catch (error) {
    console.error('Error loading cards:', error);
    return [];
  }
};

/**
 * カードを保存する
 */
export const saveCards = async (cards: Card[]): Promise<void> => {
  try {
    const db = await openDatabase();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_CARDS], 'readwrite');
      const store = transaction.objectStore(STORE_CARDS);

      // 既存データをクリア
      store.clear();

      // 新しいデータを追加
      cards.forEach((card) => {
        store.add(card);
      });

      transaction.oncomplete = () => {
        resolve();
      };

      transaction.onerror = () => {
        reject(new Error('Failed to save cards'));
      };
    });
  } catch (error) {
    console.error('Error saving cards:', error);
    throw error;
  }
};
