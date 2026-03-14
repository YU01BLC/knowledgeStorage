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

export default function App() {
  const [mode, setMode] = useState<'light' | 'dark'>('dark');
  const initialize = useDomainStore((state) => state.initialize);
  const viewMode = useUIStore((state) => state.viewMode);
  const currentPage = useUIStore((state) => state.currentPage);

  useEffect(() => {
    const run = async () => {
      try {
        await initialize();
      } catch (error) {
        console.error('Failed to initialize store:', error);
      }
    };

    run();
  }, [initialize]);

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
