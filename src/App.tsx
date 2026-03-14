import { useMemo, useState, useEffect } from 'react';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { ColorModeContext } from './theme/ColorModeContext';
import { getTheme } from './theme/theme';
import { AppLayout } from './ui/layout/AppLayout';
import { Header } from './ui/header/Header';
import { KnowledgeCardList } from './ui/card/cardList';
import { HorseCardList } from './ui/horse/HorseCardList';
import { AllHorseDiagnosisPage } from './ui/diagnosis/AllHorseDiagnosisPage';
import { AllHorseDiagnosisListPage } from './ui/diagnosis/AllHorseDiagnosisListPage';
import { useDomainStore } from './stores/useDomainStore';
import { useUIStore } from './stores/useUIStore';

const TEMP_SYNC_KEY = 'temp-horse-recent-races-sync-20260315';
const TEMP_SYNC_ENTRIES = [
  {
    horseCardId: '4f4d477c-2940-4c54-b550-1f8b7e07fe98',
    horseName: 'ロードレイジング',
    recentRaces: [
      {
        finish: '13',
        distance: '1800',
        trackType: 'ダート',
        track: '良',
        pace: 'スロー',
        cornerPassage: '16-16-16-16',
        raceClass: '地方G3',
      },
      {
        finish: '4',
        distance: '1500',
        trackType: 'ダート',
        track: '稍重',
        pace: 'ハイ',
        cornerPassage: '12-12-12-8',
        raceClass: '地方G',
      },
      {
        finish: '3',
        distance: '1600',
        trackType: 'ダート',
        track: '良',
        pace: 'ハイ',
        cornerPassage: '7-7-7-4',
        raceClass: '地方G',
      },
    ],
  },
  {
    horseCardId: '66098a12-7321-481e-b31f-bfab4953bf58',
    horseName: 'アスクエジンバラ',
    recentRaces: [
      {
        finish: '3',
        distance: '2000',
        trackType: '芝',
        track: '良',
        pace: 'スロー',
        cornerPassage: '5-6-6-4',
        raceClass: 'G1',
      },
      {
        finish: '2',
        distance: '2000',
        trackType: '芝',
        track: '良',
        pace: 'ミドル',
        cornerPassage: '5-5-5-5',
        raceClass: 'G3',
      },
      {
        finish: '7',
        distance: '1600',
        trackType: '芝',
        track: '良',
        pace: 'スロー',
        cornerPassage: '5-6',
        raceClass: 'G3',
      },
    ],
  },
  {
    horseCardId: '07e9544a-8018-4ab8-946c-4f9a92f70961',
    horseName: 'タイキルッジェーロ',
    recentRaces: [
      {
        finish: '8',
        distance: '1800',
        trackType: '芝',
        track: '良',
        pace: 'ミドル',
        cornerPassage: '4-5-12-12(3角不利)',
        raceClass: '1勝',
      },
      {
        finish: '1',
        distance: '1800',
        trackType: '芝',
        track: '良',
        pace: 'スロー',
        cornerPassage: '2-2',
        raceClass: '新馬',
      },
    ],
  },
  {
    horseCardId: 'cbeb4569-5032-4c22-9046-7a1914922583',
    horseName: 'ラストスマイル',
    recentRaces: [
      {
        finish: '1',
        distance: '1800',
        trackType: '芝',
        track: '良',
        pace: 'スロー',
        cornerPassage: '2-2-2-2',
        raceClass: '1勝',
      },
      {
        finish: '5',
        distance: '1800',
        trackType: '芝',
        track: '良',
        pace: 'スロー',
        cornerPassage: '2-3-4',
        raceClass: 'G2',
      },
      {
        finish: '1',
        distance: '1800',
        trackType: '芝',
        track: '良',
        pace: 'スロー',
        cornerPassage: '1-1-1',
        raceClass: '未勝利',
      },
    ],
  },
  {
    horseCardId: '8b7cdefb-1f32-436b-aeb1-6a4125a2b899',
    horseName: 'フレイムスター',
    recentRaces: [
      {
        finish: '6',
        distance: '1800',
        trackType: '芝',
        track: '良',
        pace: 'スロー',
        cornerPassage: '1-1-1',
        raceClass: '1勝',
      },
      {
        finish: '15',
        distance: '1600',
        trackType: '芝',
        track: '良',
        pace: 'ミドル',
        cornerPassage: '2-2(S不利)',
        raceClass: 'G3',
      },
      {
        finish: '1',
        distance: '1600',
        trackType: '芝',
        track: '良',
        pace: 'ミドル',
        cornerPassage: '1-1',
        raceClass: '未勝利',
      },
    ],
  },
  {
    horseCardId: '48f98dd5-b89d-4c7a-a058-2638a9b51aca',
    horseName: 'ガリレア',
    recentRaces: [
      {
        finish: '7',
        distance: '1800',
        trackType: '芝',
        track: '良',
        pace: 'スロー',
        cornerPassage: '2-1-1',
        raceClass: 'G3',
      },
      {
        finish: '7',
        distance: '1600',
        trackType: '芝',
        track: '良',
        pace: 'ミドル',
        cornerPassage: '2-2',
        raceClass: 'G2',
      },
      {
        finish: '2',
        distance: '1600',
        trackType: '芝',
        track: '良',
        pace: 'スロー',
        cornerPassage: '3-3',
        raceClass: 'G3',
      },
    ],
  },
  {
    horseCardId: 'a5fb1cea-5b21-4d76-9101-231fbbc09b9b',
    horseName: 'ジーネキング',
    recentRaces: [
      {
        finish: '10',
        distance: '2000',
        trackType: '芝',
        track: '良',
        pace: 'スロー',
        cornerPassage: '1-1-1-1',
        raceClass: 'G3',
      },
      {
        finish: '12',
        distance: '2000',
        trackType: '芝',
        track: '良',
        pace: 'スロー',
        cornerPassage: '2-2-2-2',
        raceClass: 'G1',
      },
      {
        finish: '2',
        distance: '1800',
        trackType: '芝',
        track: '良',
        pace: 'スロー',
        cornerPassage: '1-1-1-1',
        raceClass: 'G3',
      },
    ],
  },
  {
    horseCardId: '427bef68-e097-471c-ab39-ff65a4e062eb',
    horseName: 'マイネルシンベリン',
    recentRaces: [
      {
        finish: '3',
        distance: '1800',
        trackType: '芝',
        track: '良',
        pace: 'ミドル',
        cornerPassage: '9-10-2-2(S接触)',
        raceClass: '1勝',
      },
      {
        finish: '8',
        distance: '1600',
        trackType: '芝',
        track: '良',
        pace: 'ミドル',
        cornerPassage: '6-10-8(出遅れ)',
        raceClass: '1勝',
      },
      {
        finish: '5',
        distance: '1800',
        trackType: '芝',
        track: '良',
        pace: 'スロー',
        cornerPassage: '1-1-1',
        raceClass: 'L',
      },
    ],
  },
  {
    horseCardId: '8d733c44-32fb-4eb1-b8ed-71f638163548',
    horseName: 'マカナアネラ',
    recentRaces: [
      {
        finish: '1',
        distance: '2000',
        trackType: '芝',
        track: '良',
        pace: 'ミドル',
        cornerPassage: '1-1-2-1',
        raceClass: '未勝利',
      },
      {
        finish: '9',
        distance: '1600',
        trackType: '芝',
        track: '良',
        pace: 'ハイ',
        cornerPassage: '11-9',
        raceClass: '未勝利',
      },
      {
        finish: '7',
        distance: '1400',
        trackType: '芝',
        track: '稍重',
        pace: 'ミドル',
        cornerPassage: '8-8',
        raceClass: '未勝利',
      },
    ],
  },
  {
    horseCardId: '0144d846-b9ea-4a15-8c27-4af6d69c3956',
    horseName: 'サノノグレーター',
    recentRaces: [
      {
        finish: '6',
        distance: '1800',
        trackType: '芝',
        track: '良',
        pace: 'スロー',
        cornerPassage: '6-6-6',
        raceClass: 'G3',
      },
      {
        finish: '1',
        distance: '2000',
        trackType: '芝',
        track: '良',
        pace: 'ミドル',
        cornerPassage: '7-7-6-6',
        raceClass: '1勝',
      },
      {
        finish: '6',
        distance: '1600',
        trackType: '芝',
        track: '良',
        pace: 'スロー',
        cornerPassage: '7-9(出遅れ)',
        raceClass: 'G3',
      },
    ],
  },
  {
    horseCardId: '8b856b53-dd6e-4a77-b93a-73299e175e21',
    horseName: 'テルヒコウ',
    recentRaces: [
      {
        finish: '4',
        distance: '1800',
        trackType: '芝',
        track: '良',
        pace: 'スロー',
        cornerPassage: '1-1-1',
        raceClass: 'G2',
      },
      {
        finish: '1',
        distance: '1800',
        trackType: '芝',
        track: '稍重',
        pace: 'スロー',
        cornerPassage: '1-1',
        raceClass: '新馬',
      },
    ],
  },
  {
    horseCardId: 'b43c1216-1291-4261-b64a-5f2f239d0aaf',
    horseName: 'クレパスキュラー',
    recentRaces: [
      {
        finish: '1',
        distance: '1600',
        trackType: '芝',
        track: '良',
        pace: 'ミドル',
        cornerPassage: '6-3-3',
        raceClass: '1勝',
      },
      {
        finish: '1',
        distance: '1800',
        trackType: '芝',
        track: '良',
        pace: 'ミドル',
        cornerPassage: '3-3-1-1',
        raceClass: '新馬',
      },
    ],
  },
  {
    horseCardId: '50e9e74f-5db1-4abb-ac50-2eb23315809d',
    horseName: 'ミスターライト',
    recentRaces: [
      {
        finish: '1',
        distance: '1800',
        trackType: '芝',
        track: '良',
        pace: 'スロー',
        cornerPassage: '3-3-2-2',
        raceClass: '未勝利',
      },
      {
        finish: '2',
        distance: '2000',
        trackType: '芝',
        track: '良',
        pace: 'スロー',
        cornerPassage: '6-5-5(出遅れ)',
        raceClass: '新馬',
      },
    ],
  },
  {
    horseCardId: '2f7200da-8055-483b-a30c-95940e3b6f61',
    horseName: 'アクロフェイズ',
    recentRaces: [
      {
        finish: '2',
        distance: '2000',
        trackType: '芝',
        track: '良',
        pace: 'スロー',
        cornerPassage: '7-7-5-2',
        raceClass: 'L',
      },
      {
        finish: '1',
        distance: '2000',
        trackType: '芝',
        track: '良',
        pace: 'スロー',
        cornerPassage: '4-4-3-3',
        raceClass: '未勝利',
      },
      {
        finish: '8',
        distance: '1800',
        trackType: 'ダート',
        track: '重',
        pace: 'ミドル',
        cornerPassage: '13-12-5-6(出遅れ)',
        raceClass: '新馬',
      },
    ],
  },
  {
    horseCardId: '36fd050f-a58e-473d-a538-f1086f14f0fc',
    horseName: 'アウダーシア',
    recentRaces: [
      {
        finish: '1',
        distance: '1800',
        trackType: '芝',
        track: '良',
        pace: 'スロー',
        cornerPassage: '3-4-3',
        raceClass: '未勝利',
      },
      {
        finish: '2',
        distance: '1600',
        trackType: '芝',
        track: '良',
        pace: 'スロー',
        cornerPassage: '7-4(出遅れ)',
        raceClass: '未勝利',
      },
      {
        finish: '2',
        distance: '1800',
        trackType: '芝',
        track: '良',
        pace: 'スロー',
        cornerPassage: '10-9-9(出遅れ)',
        raceClass: '新馬',
      },
    ],
  },
  {
    horseCardId: null,
    horseName: 'サウンドムーブ',
    recentRaces: [
      {
        finish: '2',
        distance: '1600',
        trackType: '芝',
        track: '良',
        pace: 'ミドル',
        cornerPassage: '9-9',
        raceClass: 'G3',
      },
      {
        finish: '1',
        distance: '1800',
        trackType: '芝',
        track: '良',
        pace: 'ミドル',
        cornerPassage: '3-2',
        raceClass: '未勝利',
      },
      {
        finish: '4',
        distance: '1800',
        trackType: '芝',
        track: '良',
        pace: 'スロー',
        cornerPassage: '6-5(出遅れ)',
        raceClass: '新馬',
      },
    ],
  },
];

export default function App() {
  const [mode, setMode] = useState<'light' | 'dark'>('dark');
  const initialize = useDomainStore((state) => state.initialize);
  const syncHorseRecentRaces = useDomainStore(
    (state) => state.syncHorseRecentRaces
  );
  const viewMode = useUIStore((state) => state.viewMode);
  const currentPage = useUIStore((state) => state.currentPage);

  useEffect(() => {
    const run = async () => {
      try {
        await initialize();
        if (!localStorage.getItem(TEMP_SYNC_KEY)) {
          await syncHorseRecentRaces(TEMP_SYNC_ENTRIES);
          localStorage.setItem(TEMP_SYNC_KEY, 'true');
        }
      } catch (error) {
        console.error('Failed to initialize store:', error);
      }
    };

    run();
  }, [initialize, syncHorseRecentRaces]);

  const colorMode = useMemo(
    () => ({
      toggleColorMode: () => {
        setMode((prev) => (prev === 'light' ? 'dark' : 'light'));
      },
    }),
    []
  );

  const theme = useMemo(() => getTheme(mode), [mode]);

  return (
    <ColorModeContext.Provider value={colorMode}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <AppLayout header={<Header />}>
          {currentPage === 'diagnosis-list' ? (
            <AllHorseDiagnosisListPage />
          ) : currentPage === 'diagnosis-result' ? (
            <AllHorseDiagnosisPage />
          ) : viewMode === 'card' ? (
            <KnowledgeCardList />
          ) : (
            <HorseCardList />
          )}
        </AppLayout>
      </ThemeProvider>
    </ColorModeContext.Provider>
  );
}
