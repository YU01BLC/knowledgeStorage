import { Knowledge } from '../domain/knowledge';

export const knowledgeMock: Knowledge[] = [
  {
    id: '1',
    title: 'React useEffect の依存配列',
    description:
      'useEffect の依存配列は、Effect が再実行される条件を制御します。適切に設定しないと無限ループや意図しない挙動を引き起こします。',
    labels: ['React', 'Hooks'],
    updatedAt: '2026-01-07',
  },
  {
    id: '2',
    title: 'TypeScript utility types',
    description:
      'Partial, Pick, Omit などの utility types は型定義を柔軟かつ安全に再利用するための重要な機能です。',
    labels: ['TypeScript'],
    updatedAt: '2026-01-05',
  },
];
