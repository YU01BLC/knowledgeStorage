import { useState, useContext } from 'react';
import { Box, TextField, Button, IconButton } from '@mui/material';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import { useTheme } from '@mui/material/styles';

import { LabelFilter } from './LabelFilter';
import { NewLabelDialog } from './NewLabelDialog';
import { LabelManageDialog } from '../label/LabelManageDialog';
import { CardCreateButton } from '../card/CardCreateButton';
import { ColorModeContext } from '../../theme/ColorModeContext';
import { useDomainStore } from '../../stores/useDomainStore';

export const Header = () => {
  const theme = useTheme();
  const colorMode = useContext(ColorModeContext);

  const [labelDialogOpen, setLabelDialogOpen] = useState(false);
  const [newLabelDialogOpen, setNewLabelDialogOpen] = useState(false);

  const {
    labels,
    selectedLabelIds,
    setSelectedLabelIds,
    addLabel,
    exportBackup,
    importBackup,
    searchText,
    setSearchText,
  } = useDomainStore();

  return (
    <Box display='flex' alignItems='center' gap={2} p={2} flexWrap='wrap'>
      {/* Theme toggle */}
      <IconButton onClick={colorMode.toggleColorMode}>
        {theme.palette.mode === 'dark' ? (
          <Brightness7Icon />
        ) : (
          <Brightness4Icon />
        )}
      </IconButton>

      {/* Search */}
      <TextField
        size='small'
        placeholder='検索'
        value={searchText}
        onChange={(e) => setSearchText(e.target.value)}
        sx={{ minWidth: 260 }}
      />

      {/* Label Filter */}
      <LabelFilter
        labels={labels}
        selectedLabelIds={selectedLabelIds}
        onChange={setSelectedLabelIds}
      />

      {/* Label manage */}
      <Button variant='contained' onClick={() => setLabelDialogOpen(true)}>
        ラベル管理
      </Button>

      <CardCreateButton />

      {/* 右寄せエリア */}
      <Box sx={{ ml: 'auto', display: 'flex', gap: 1 }}>
        <Button variant='outlined' onClick={exportBackup}>
          バックアップ
        </Button>

        <Button component='label' variant='outlined'>
          復元
          <input
            type='file'
            hidden
            accept='application/json'
            onChange={async (e) => {
              const input = e.currentTarget;
              const file = input.files?.[0];
              if (!file) return;

              try {
                const text = await file.text();
                const json = JSON.parse(text);

                const success = importBackup(json);
                if (!success) {
                  alert('不正なバックアップファイルです');
                }
              } catch {
                alert('バックアップの読み込みに失敗しました');
              } finally {
                input.value = '';
              }
            }}
          />
        </Button>
      </Box>

      {/* Dialogs */}
      <LabelManageDialog
        open={labelDialogOpen}
        onClose={() => setLabelDialogOpen(false)}
      />

      <NewLabelDialog
        open={newLabelDialogOpen}
        onClose={() => setNewLabelDialogOpen(false)}
        onCreate={(label) => addLabel(label)}
      />
    </Box>
  );
};
