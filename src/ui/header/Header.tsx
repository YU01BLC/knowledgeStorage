import { useState, useContext } from 'react';
import {
  Box,
  TextField,
  Button,
  IconButton,
  Menu,
  MenuItem,
  ListSubheader,
} from '@mui/material';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import SettingsIcon from '@mui/icons-material/Settings';
import { useTheme } from '@mui/material/styles';

import { LabelFilter } from './LabelFilter';
import { NewLabelDialog } from './NewLabelDialog';
import { LabelManageDialog } from '../label/LabelManageDialog';
import { PedigreeManageDialog } from '../pedigree/PedigreeManageDialog';
import { OffspringManageDialog } from '../offspring/OffspringManageDialog';
import { CardCreateButton } from '../card/CardCreateButton';
import { ColorModeContext } from '../../theme/ColorModeContext';
import { useDomainStore } from '../../stores/useDomainStore';
import { useUIStore } from '../../stores/useUIStore';

export const Header = () => {
  const theme = useTheme();
  const colorMode = useContext(ColorModeContext);

  const [labelDialogOpen, setLabelDialogOpen] = useState(false);
  const [newLabelDialogOpen, setNewLabelDialogOpen] = useState(false);
  const [pedigreeDialogOpen, setPedigreeDialogOpen] = useState(false);
  const [offspringDialogOpen, setOffspringDialogOpen] = useState(false);
  const [manageAnchorEl, setManageAnchorEl] = useState<null | HTMLElement>(
    null
  );
  const {
    labels,
    selectedLabelIds,
    setSelectedLabelIds,
    addLabel,
    exportBackup,
    exportFilteredBackup,
    importBackup,
    exportHorseBackup,
    importHorseBackup,
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

      {/* ビューモード切替（片方のみ表示） */}
      {viewMode === 'card' ? (
        <Button
          variant='outlined'
          onClick={() => {
            setViewMode('horse');
            setCurrentPage('home');
            setDiagnosisModalOpen(false);
          }}
        >
          馬情報
        </Button>
      ) : (
        <Button
          variant='outlined'
          onClick={() => {
            setViewMode('card');
            setCurrentPage('home');
            setDiagnosisModalOpen(false);
          }}
        >
          通常カード
        </Button>
      )}

      {/* 右寄せエリア */}
      <Box sx={{ ml: 'auto', display: 'flex', gap: 1 }}>
        <IconButton
          aria-label='管理'
          onClick={(e) => setManageAnchorEl(e.currentTarget)}
        >
          <SettingsIcon />
        </IconButton>
      </Box>

      <Menu
        anchorEl={manageAnchorEl}
        open={Boolean(manageAnchorEl)}
        onClose={() => setManageAnchorEl(null)}
      >
        <ListSubheader>管理</ListSubheader>
        <MenuItem
          onClick={() => {
            setLabelDialogOpen(true);
            setManageAnchorEl(null);
          }}
        >
          ラベル管理
        </MenuItem>
        <MenuItem
          onClick={() => {
            setPedigreeDialogOpen(true);
            setManageAnchorEl(null);
          }}
        >
          血統情報管理
        </MenuItem>
        <MenuItem
          onClick={() => {
            setOffspringDialogOpen(true);
            setManageAnchorEl(null);
          }}
        >
          生産情報管理
        </MenuItem>
        <ListSubheader>バックアップ</ListSubheader>
        <MenuItem
          onClick={async () => {
            if (isFilterActive) {
              await exportFilteredBackup();
            } else {
              await exportBackup();
            }
            setManageAnchorEl(null);
          }}
        >
          通常カード
        </MenuItem>
        <MenuItem
          onClick={async () => {
            await exportHorseBackup();
            setManageAnchorEl(null);
          }}
        >
          馬情報
        </MenuItem>
        <ListSubheader>復元</ListSubheader>
        <MenuItem component='label'>
          通常カード
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
                setManageAnchorEl(null);
              }
            }}
          />
        </MenuItem>
        <MenuItem component='label'>
          馬情報
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

                const success = await importHorseBackup(json);
                if (!success) {
                  alert('不正なバックアップファイルです');
                }
              } catch {
                alert('バックアップの読み込みに失敗しました');
              } finally {
                input.value = '';
                setManageAnchorEl(null);
              }
            }}
          />
        </MenuItem>
      </Menu>

      {/* Dialogs */}
      <LabelManageDialog
        open={labelDialogOpen}
        onClose={() => setLabelDialogOpen(false)}
      />
      <PedigreeManageDialog
        open={pedigreeDialogOpen}
        onClose={() => setPedigreeDialogOpen(false)}
      />
      <OffspringManageDialog
        open={offspringDialogOpen}
        onClose={() => setOffspringDialogOpen(false)}
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
