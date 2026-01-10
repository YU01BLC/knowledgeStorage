import { useState, useContext } from 'react';
import { Box, TextField, Button } from '@mui/material';
import { LabelFilter } from './LabelFilter';
import { NewLabelDialog } from './NewLabelDialog';
import { IconButton } from '@mui/material';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import { useTheme } from '@mui/material/styles';
import { ColorModeContext } from '../../theme/ColorModeContext';
import { LabelManageDialog } from '../label/LabelManageDialog';

export type Label = {
  id: string;
  name: string;
  color: string;
};

export const Header = () => {
  const [searchText, setSearchText] = useState('');
  const theme = useTheme();
  const colorMode = useContext(ColorModeContext);
  const [labelDialogOpen, setLabelDialogOpen] = useState(false);

  const [labels, setLabels] = useState<Label[]>([
    { id: '1', name: '中山', color: '#64b5f6' },
    { id: '2', name: '芝2000', color: '#64b5f6' },
    { id: '3', name: '中京', color: '#81c784' },
    { id: '4', name: '血統', color: '#e57373' },
    { id: '5', name: 'ノーザンファーム', color: '#e57373' },
  ]);
  const [selectedLabelIds, setSelectedLabelIds] = useState<string[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <Box display='flex' alignItems='center' gap={2} p={2} flexWrap='wrap'>
      <IconButton onClick={colorMode.toggleColorMode}>
        {theme.palette.mode === 'dark' ? (
          <Brightness7Icon />
        ) : (
          <Brightness4Icon />
        )}
      </IconButton>
      <TextField
        size='small'
        placeholder='検索（レース名・メモなど）'
        value={searchText}
        onChange={(e) => setSearchText(e.target.value)}
        sx={{ minWidth: 260 }}
      />

      <LabelFilter
        labels={labels}
        selectedLabelIds={selectedLabelIds}
        onChange={setSelectedLabelIds}
      />

      <Button variant='contained' onClick={() => setLabelDialogOpen(true)}>
        ラベル管理
      </Button>

      <LabelManageDialog
        open={labelDialogOpen}
        onClose={() => setLabelDialogOpen(false)}
      />

      <NewLabelDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onCreate={(label) => setLabels((prev) => [...prev, label])}
      />
    </Box>
  );
};
