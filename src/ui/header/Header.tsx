import { useState, useContext } from 'react';
import { Box, TextField, Button, IconButton } from '@mui/material';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import OutputIcon from '@mui/icons-material/Output';
import { useTheme } from '@mui/material/styles';

import { LabelFilter } from './LabelFilter';
import { NewLabelDialog } from './NewLabelDialog';
import { LabelManageDialog } from '../label/LabelManageDialog';
import { CardCreateButton } from '../card/CardCreateButton';
import { ColorModeContext } from '../../theme/ColorModeContext';
import { useDomainStore } from '../../stores/useDomainStore';
import { useUIStore } from '../../stores/useUIStore';

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
    exportFilteredBackup,
    importBackup,
    searchText,
    setSearchText,
  } = useDomainStore();

  const {
    viewMode,
    setViewMode,
    setCurrentPage,
    setDiagnosisModalOpen,
  } = useUIStore();

  const isFilterActive =
    selectedLabelIds.length > 0 || searchText.trim() !== '';

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
        placeholder={viewMode === 'card' ? '検索' : '馬名検索'}
        value={searchText}
        onChange={(e) => setSearchText(e.target.value)}
        sx={{ minWidth: 260 }}
      />

      {/* Label Filter（通常カードモードのみ） */}
      {viewMode === 'card' && (
        <LabelFilter
          labels={labels}
          selectedLabelIds={selectedLabelIds}
          onChange={setSelectedLabelIds}
        />
      )}

      {/* Label manage（通常カードモードのみ） */}
      {viewMode === 'card' && (
        <Button variant='contained' onClick={() => setLabelDialogOpen(true)}>
          ラベル管理
        </Button>
      )}

      {/* Create Button: モードに応じて表示切り替え（現状は同じダイアログを利用） */}
      <CardCreateButton />

      <Button
        variant='outlined'
        onClick={() => {
          setCurrentPage('diagnosis');
          setDiagnosisModalOpen(true);
        }}
      >
        全頭診断
      </Button>

      {/* 右寄せエリア */}
      <Box sx={{ ml: 'auto', display: 'flex', gap: 1 }}>
        {/* ビューモード切替 */}
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant={viewMode === 'card' ? 'contained' : 'outlined'}
            onClick={() => {
              setViewMode('card');
              setCurrentPage('home');
              setDiagnosisModalOpen(false);
            }}
          >
            通常カード
          </Button>
          <Button
            variant={viewMode === 'horse' ? 'contained' : 'outlined'}
            onClick={() => {
              setViewMode('horse');
              setCurrentPage('home');
              setDiagnosisModalOpen(false);
            }}
          >
            馬情報
          </Button>
        </Box>

        {/* バックアップ/復元（通常カードモードのみ） */}
        {viewMode === 'card' && (
          <>
            {isFilterActive ? (
              <Button
                variant='outlined'
                startIcon={<OutputIcon />}
                onClick={async () => {
                  await exportFilteredBackup();
                }}
              >
                出力
              </Button>
            ) : (
              <Button
                variant='outlined'
                onClick={async () => {
                  await exportBackup();
                }}
              >
                バックアップ
              </Button>
            )}

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

                    const success = await importBackup(json);
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
          </>
        )}
      </Box>

      {/* Dialogs */}
      <LabelManageDialog
        open={labelDialogOpen}
        onClose={() => setLabelDialogOpen(false)}
      />

      <NewLabelDialog
        open={newLabelDialogOpen}
        onClose={() => setNewLabelDialogOpen(false)}
        onCreate={async (label) => {
          await addLabel(label);
        }}
      />

    </Box>
  );
};
