# KnowledgeStorage アーキテクチャ設計・実装方針

本ドキュメントは、現時点（ラベル CRUD + Card CRUD + localStorage 永続化 + UI 実装完了段階）における **全体構造・責務分離・実装方針** を明文化し、今後の作業で **構造的不整合や設計ブレを防ぐこと** を目的とする。

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

| ファイル                      | 責務                                       | 実装状況 |
| ----------------------------- | ------------------------------------------ | -------- |
| `schema.ts`                   | Zod による Card / Label の正規定義         | ✅ 完了  |
| `inputSchema.ts`              | Create / Update 用 Input Schema            | ✅ 完了  |
| `id.ts`                       | ID 生成（UI / Store から直接触らせない）   | ✅ 完了  |
| `storage.ts`                  | localStorage IO（純関数）                  | ✅ 完了  |
| `generateUniqueLabelColor.ts` | ラベルカラー自動生成（HSL + Golden Angle） | ✅ 完了  |
| `index.ts`                    | domain public API の集約                   | ✅ 完了  |

**注意**: `type.ts` は削除されました。型定義は `schema.ts` から直接 `z.infer` で導出します。

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
│  ├─ Header.tsx                    ✅ 完了
│  ├─ LabelFilter.tsx               ✅ 完了
│  ├─ NewLabelButton.tsx            ✅ 完了
│  ├─ NewLabelDialog.tsx            ✅ 完了
│  └─ SearchInput.tsx               ✅ 完了（UI実装のみ、検索機能は未実装）
├─ label/
│  ├─ LabelManageDialog.tsx        ✅ 完了
│  ├─ LabelRow.tsx                  ✅ 完了
│  └─ ConfirmDeleteDialog.tsx      ✅ 完了
├─ card/
│  ├─ KnowledgeCard.tsx             ✅ 完了（リッチなUI実装）
│  ├─ KnowledgeCardList.tsx         ✅ 完了（MUI Grid2レイアウト）
│  ├─ CardCreateButton.tsx          ✅ 完了（MUI Button）
│  └─ CardCreateDialog.tsx         ✅ 完了（MUI Dialog、ラベル選択はプレースホルダー）
└─ layout/
   └─ AppLayout.tsx                 ✅ 完了
```

**注意**: `generateUniqueLabelColor.ts` は `domain/` に移動されました。

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
- 実装場所: `src/domain/generateUniqueLabelColor.ts`

```ts
color = generateUniqueLabelColor(existingLabels.length);
```

- 色の決定責務は **DomainStore**
- UI で色を決めてはいけない
- `generateUniqueLabelColor` は Domain 層に配置（UI 層から削除済み）

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

## 7. 実装状況と今後の実装予定

### 実装済み機能 ✅

#### ラベル機能

- ✅ ラベル作成（自動カラー生成）
- ✅ ラベル一覧表示
- ✅ ラベル編集（インライン編集）
- ✅ ラベル削除（確認ダイアログ付き）
- ✅ ラベルフィルター UI（Header）

#### Card 機能

- ✅ Card 作成（基本実装、ラベル選択はプレースホルダー）
- ✅ Card 一覧表示（MUI Grid2 レイアウト）
- ✅ Card 表示（リッチな UI、相対時間表示、ラベル表示）
- ✅ Card 削除（Store 実装済み、UI 未実装）

#### 永続化

- ✅ localStorage による Card / Label の永続化
- ✅ 起動時の自動復元（Zod validation 付き）

### 未実装機能（今後の実装予定）

#### Card 機能拡張

- ⏳ Card 編集 UI
- ⏳ Card 詳細表示（Markdown 表示）
- ⏳ Card 削除 UI（確認ダイアログ）
- ⏳ ラベル選択機能（Card 作成・編集時）

#### 検索機能

- ⏳ 全文検索（Card title / body）
- ⏳ ラベルフィルター（AND 検索）
- ⏳ 検索結果表示

#### Markdown 機能

- ⏳ Markdown エディタ（Card 作成・編集用）
- ⏳ Markdown ビューア（Card 表示用）

#### その他

- ⏳ Card 並び替え（日付、タイトル順など）
- ⏳ バックアップ・エクスポート機能
- ⏳ 将来的な Repository 抽象化（DB 移行対応）

---

## 8. 今後実装予定のファイル一覧

### Card 機能拡張

| ファイル                           | 責務                            | 優先度 |
| ---------------------------------- | ------------------------------- | ------ |
| `src/ui/card/CardEditDialog.tsx`   | カード編集ダイアログ            | 高     |
| `src/ui/card/CardDetailDialog.tsx` | カード詳細表示（Markdown 表示） | 中     |
| `src/ui/card/CardDeleteDialog.tsx` | カード削除確認ダイアログ        | 高     |

### 検索機能

| ファイル                          | 責務                                       | 優先度 |
| --------------------------------- | ------------------------------------------ | ------ |
| `src/ui/search/SearchBar.tsx`     | 検索バーコンポーネント                     | 高     |
| `src/ui/search/SearchResults.tsx` | 検索結果表示                               | 高     |
| `src/domain/search.ts`            | 検索ロジック（全文検索、ラベルフィルター） | 高     |

### Markdown 機能

| ファイル                             | 責務                                   | 優先度 |
| ------------------------------------ | -------------------------------------- | ------ |
| `src/ui/markdown/MarkdownEditor.tsx` | Markdown エディタ（Card 作成・編集用） | 中     |
| `src/ui/markdown/MarkdownViewer.tsx` | Markdown ビューア（Card 表示用）       | 中     |

### ラベル選択機能

| ファイル                         | 責務                                              | 優先度 |
| -------------------------------- | ------------------------------------------------- | ------ |
| `src/ui/label/LabelSelector.tsx` | ラベル選択コンポーネント（Card 作成・編集で使用） | 高     |

### 実装時の注意事項

- すべての新規ファイルは architecture.md の原則に従うこと
- UI 層は `useDomainStore` 経由でデータ操作を行うこと
- Domain 層の新規ファイルは `domain/index.ts` で export すること
- 検索ロジックは Domain 層に配置し、純関数として実装すること

---

## 9. 設計思想まとめ

> 「シンプルであることを壊さない」

- 状態は少なく
- 構造は平坦に
- 責務は一点集中

この設計を守れば、
**スケールしても壊れない個人知識アプリ**になります。
