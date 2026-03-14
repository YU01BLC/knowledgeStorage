import {
  Dialog,
  DialogTitle,
  DialogContent,
  Stack,
  TextField,
  Button,
  Divider,
} from '@mui/material';
import { useMemo, useState } from 'react';
import { useDomainStore } from '../../stores/useDomainStore';
import { generateId } from '../../domain/id';
import { PedigreeRow } from './PedigreeRow';

type Props = {
  open: boolean;
  onClose: () => void;
};

export const PedigreeManageDialog = ({ open, onClose }: Props) => {
  const { pedigree, addPedigree } = useDomainStore();
  const [newName, setNewName] = useState('');
  const [search, setSearch] = useState('');

  const normalizedSearch = search.trim().toLowerCase();
  const filtered = useMemo(
    () =>
      normalizedSearch
        ? pedigree.filter((item) =>
            item.name.toLowerCase().includes(normalizedSearch)
          )
        : pedigree,
    [pedigree, normalizedSearch]
  );

  const handleCreate = async () => {
    if (!newName.trim()) return;
    await addPedigree({ id: generateId(), name: newName.trim() });
    setNewName('');
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth='sm'>
      <DialogTitle>血統情報管理</DialogTitle>
      <DialogContent>
        <Stack spacing={2}>
          <Stack direction='row' spacing={1}>
            <TextField
              fullWidth
              size='small'
              placeholder='血統名'
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
            />
            <Button variant='contained' onClick={handleCreate}>
              作成
            </Button>
          </Stack>

          <TextField
            fullWidth
            size='small'
            placeholder='血統を検索'
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <Divider />

          <Stack direction='row' spacing={1} useFlexGap flexWrap='wrap'>
            {filtered.map((item) => (
              <PedigreeRow key={item.id} pedigree={item} />
            ))}
          </Stack>
        </Stack>
      </DialogContent>
    </Dialog>
  );
};
