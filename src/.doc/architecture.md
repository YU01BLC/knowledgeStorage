# KnowledgeStorage アーキテクチャ設計・実装方針

本ドキュメントは、現時点（ラベル CRUD + localStorage 永続化 + UI 実装完了段階）における **全体構造・責務分離・実装方針** を明文化し、今後の作業で **構造的不整合や設計ブレを防ぐこと** を目的とする。

---

## 1. 全体アーキテクチャ概要

本アプリは以下のレイヤに明確に分離されている。

```
UI (React / MUI)
  ↓
Store (Zustand)
  ↓
Domain (Zod Schema / Type)
  ↓
Storage (localStorage)
```

### 基本原則

- UI は **状態管理・永続化・バリデーションを一切知らない**
- Domain は **真実の定義（Single Source of Truth）**
- Store は **唯一のデータ操作窓口**
- 永続化は **Store 内部で完結**

---

## 2. ディレクトリ構造と責務

### `src/domain/`

**ドメイン層（最重要）**

| ファイル         | 責務                                     |
| ---------------- | ---------------------------------------- |
| `schema.ts`      | Zod による Card / Label の正規定義       |
| `inputSchema.ts` | Create / Update 用 Input Schema          |
| `type.ts`        | Zod から導出された TypeScript 型         |
| `id.ts`          | ID 生成（UI / Store から直接触らせない） |
| `storage.ts`     | localStorage IO（純関数）                |
| `index.ts`       | domain public API の集約                 |

### 設計ルール

- **型定義は schema.ts が起点**
- UI / Store から `zod` を直接 import しない
- localStorage には **Zod 検証済みデータのみ保存**

---

### `src/stores/`

**状態管理層（Zustand）**

| ファイル            | 責務                          |
| ------------------- | ----------------------------- |
| `useDomainStore.ts` | Card / Label の CRUD + 永続化 |
| `useUIStore.ts`     | Dialog / Theme 等 UI 状態     |

#### DomainStore の責務

- Zod validation
- ID 採番
- ラベル削除時のカード整合性保証
- localStorage 同期

👉 **UI は DomainStore 経由以外でデータを触ってはいけない**

---

### `src/ui/`

**表示・操作レイヤ（React + MUI）**

```
ui/
├─ header/
│  ├─ Header.tsx
│  ├─ LabelFilter.tsx
│  └─ NewLabelDialog.tsx
├─ label/
│  ├─ LabelManageDialog.tsx
│  ├─ LabelRow.tsx
│  ├─ ConfirmDeleteDialog.tsx
│  └─ generateUniqueLabelColor.ts
├─ card/
│  ├─ KnowledgeCard.tsx
│  └─ KnowledgeCardList.tsx
└─ layout/
   └─ AppLayout.tsx
```

### UI 実装原則

- MUI コンポーネントのみ使用
- スタイルは theme 経由
- 状態は **極力持たない**（編集状態のみ局所管理）

---

## 3. ラベル設計方針（重要）

### ラベルに親子関係を持たせない理由

- 検索ロジックが単純になる
- フィルター UI が破綻しない
- ユーザーの思考構造を強制しない

👉 **ラベルは完全にフラットなタグ**

---

### ラベルカラー設計

- 固定色配列は禁止
- 作成時に **既存ラベルと被らない色を自動生成**
- HSL + Golden Angle を使用

```ts
color = generateUniqueLabelColor(existingLabels);
```

- 色の決定責務は **DomainStore**
- UI で色を決めてはいけない

---

## 4. Card 設計方針

### Card の役割

- ユーザーの知見・仮説・傾向を記録する最小単位
- 事実情報ではなく **主観メモ前提**

### Card 構造

```ts
{
  id: string
  title: string
  body: string (Markdown)
  labelIds: string[]
  createdAt: number
  updatedAt: number
}
```

---

## 5. localStorage 永続化方針

### 原則

- UI から localStorage を触らせない
- DomainStore が唯一の IO 窓口
- restore 時も Zod validation 必須

### 保存キー

```ts
knowledge-storage:labels
knowledge-storage:cards
```

---

## 6. 今後の実装指針（ブレ防止）

### やってよいこと

- UI を先に作る（仮 state OK）
- DomainStore に処理を寄せる
- Zod schema の拡張

### やってはいけないこと

- UI で validation
- UI で localStorage 操作
- ラベルに構造（親子・階層）を追加
- 固定値による色管理

---

## 7. 次フェーズの推奨順

1. Card 作成 UI（Markdown Editor + Label Select）
2. Card 検索（全文 + ラベル AND）
3. Card 編集 UI
4. 将来的な Repository 抽象化

---

## 8. 設計思想まとめ

> 「シンプルであることを壊さない」

- 状態は少なく
- 構造は平坦に
- 責務は一点集中

この設計を守れば、
**スケールしても壊れない個人知識アプリ**になります。
