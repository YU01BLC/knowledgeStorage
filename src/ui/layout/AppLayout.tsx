import { ReactNode } from 'react';
import { Box } from '@mui/material';

type AppLayoutProps = {
  header: ReactNode;
  children: ReactNode;
};

export const AppLayout = ({ header, children }: AppLayoutProps) => {
  return (
    <Box display='flex' flexDirection='column' height='100vh'>
      <Box borderBottom='1px solid #333'>{header}</Box>
      <Box flex={1} overflow='auto' p={2}>
        {children}
      </Box>
    </Box>
  );
};
