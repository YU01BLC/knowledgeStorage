import { Label, Card } from './schema';
import { HorseCard } from './horseSchema';
import { Offspring } from './offspringSchema';
import { Pedigree } from './pedigreeSchema';
import { DiagnosisRecord } from './diagnosisSchema';

const DB_NAME = 'knowledge-storage';
const DB_VERSION = 5;
const STORE_LABELS = 'labels';
const STORE_CARDS = 'cards';
const STORE_HORSE_CARDS = 'horseCards';
const STORE_OFFSPRING = 'offspring';
const STORE_PEDIGREE = 'pedigree';
const STORE_DIAGNOSIS = 'diagnosisRecords';

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

      // horseCardsストアの作成
      if (!db.objectStoreNames.contains(STORE_HORSE_CARDS)) {
        db.createObjectStore(STORE_HORSE_CARDS, { keyPath: 'id' });
      }

      if (!db.objectStoreNames.contains(STORE_OFFSPRING)) {
        db.createObjectStore(STORE_OFFSPRING, { keyPath: 'id' });
      }

      if (!db.objectStoreNames.contains(STORE_PEDIGREE)) {
        db.createObjectStore(STORE_PEDIGREE, { keyPath: 'id' });
      }

      if (!db.objectStoreNames.contains(STORE_DIAGNOSIS)) {
        db.createObjectStore(STORE_DIAGNOSIS, { keyPath: 'id' });
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

/**
 * 馬情報カードを読み込む
 */
export const loadHorseCards = async (): Promise<HorseCard[]> => {
  try {
    const db = await openDatabase();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_HORSE_CARDS], 'readonly');
      const store = transaction.objectStore(STORE_HORSE_CARDS);
      const request = store.getAll();

      request.onsuccess = () => {
        resolve(request.result || []);
      };

      request.onerror = () => {
        reject(new Error('Failed to load horse cards'));
      };
    });
  } catch (error) {
    console.error('Error loading horse cards:', error);
    return [];
  }
};

/**
 * 馬情報カードを保存する
 */
export const saveHorseCards = async (horseCards: HorseCard[]): Promise<void> => {
  try {
    const db = await openDatabase();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_HORSE_CARDS], 'readwrite');
      const store = transaction.objectStore(STORE_HORSE_CARDS);

      // 既存データをクリア
      store.clear();

      // 新しいデータを追加
      horseCards.forEach((card) => {
        store.add(card);
      });

      transaction.oncomplete = () => {
        resolve();
      };

      transaction.onerror = () => {
        reject(new Error('Failed to save horse cards'));
      };
    });
  } catch (error) {
    console.error('Error saving horse cards:', error);
    throw error;
  }
};

/**
 * 産駒データを読み込む
 */
export const loadOffspring = async (): Promise<Offspring[]> => {
  try {
    const db = await openDatabase();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_OFFSPRING], 'readonly');
      const store = transaction.objectStore(STORE_OFFSPRING);
      const request = store.getAll();

      request.onsuccess = () => {
        resolve(request.result || []);
      };

      request.onerror = () => {
        reject(new Error('Failed to load offspring'));
      };
    });
  } catch (error) {
    console.error('Error loading offspring:', error);
    return [];
  }
};

/**
 * 産駒データを保存する
 */
export const saveOffspring = async (offspring: Offspring[]): Promise<void> => {
  try {
    const db = await openDatabase();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_OFFSPRING], 'readwrite');
      const store = transaction.objectStore(STORE_OFFSPRING);

      store.clear();
      offspring.forEach((item) => store.add(item));

      transaction.oncomplete = () => resolve();
      transaction.onerror = () => {
        reject(new Error('Failed to save offspring'));
      };
    });
  } catch (error) {
    console.error('Error saving offspring:', error);
    throw error;
  }
};

/**
 * 血統マスタを読み込む
 */
export const loadPedigree = async (): Promise<Pedigree[]> => {
  try {
    const db = await openDatabase();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_PEDIGREE], 'readonly');
      const store = transaction.objectStore(STORE_PEDIGREE);
      const request = store.getAll();

      request.onsuccess = () => {
        resolve(request.result || []);
      };

      request.onerror = () => {
        reject(new Error('Failed to load pedigree'));
      };
    });
  } catch (error) {
    console.error('Error loading pedigree:', error);
    return [];
  }
};

/**
 * 血統マスタを保存する
 */
export const savePedigree = async (pedigree: Pedigree[]): Promise<void> => {
  try {
    const db = await openDatabase();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_PEDIGREE], 'readwrite');
      const store = transaction.objectStore(STORE_PEDIGREE);

      store.clear();
      pedigree.forEach((item) => store.add(item));

      transaction.oncomplete = () => resolve();
      transaction.onerror = () => {
        reject(new Error('Failed to save pedigree'));
      };
    });
  } catch (error) {
    console.error('Error saving pedigree:', error);
    throw error;
  }
};

/**
 * 全頭診断履歴を読み込む
 */
export const loadDiagnosisRecords = async (): Promise<DiagnosisRecord[]> => {
  try {
    const db = await openDatabase();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_DIAGNOSIS], 'readonly');
      const store = transaction.objectStore(STORE_DIAGNOSIS);
      const request = store.getAll();

      request.onsuccess = () => {
        resolve(request.result || []);
      };

      request.onerror = () => {
        reject(new Error('Failed to load diagnosis records'));
      };
    });
  } catch (error) {
    console.error('Error loading diagnosis records:', error);
    return [];
  }
};

/**
 * 全頭診断履歴を保存する
 */
export const saveDiagnosisRecords = async (
  records: DiagnosisRecord[]
): Promise<void> => {
  try {
    const db = await openDatabase();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_DIAGNOSIS], 'readwrite');
      const store = transaction.objectStore(STORE_DIAGNOSIS);

      store.clear();
      records.forEach((record) => {
        store.add(record);
      });

      transaction.oncomplete = () => {
        resolve();
      };

      transaction.onerror = () => {
        reject(new Error('Failed to save diagnosis records'));
      };
    });
  } catch (error) {
    console.error('Error saving diagnosis records:', error);
    throw error;
  }
};
