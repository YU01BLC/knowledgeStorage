import { useMemo, useState, useEffect } from 'react';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { ColorModeContext } from './theme/ColorModeContext';
import { getTheme } from './theme/theme';
import { AppLayout } from './ui/layout/AppLayout';
import { Header } from './ui/header/Header';
import { KnowledgeCardList } from './ui/card/cardList';
import { useDomainStore } from './stores/useDomainStore';

export default function App() {
  const [mode, setMode] = useState<'light' | 'dark'>('dark');
  const initialize = useDomainStore((state) => state.initialize);

  useEffect(() => {
    initialize().catch((error) => {
      console.error('Failed to initialize store:', error);
    });
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
          <KnowledgeCardList />
        </AppLayout>
      </ThemeProvider>
    </ColorModeContext.Provider>
  );
}
