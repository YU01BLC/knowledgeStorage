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
import { OffspringRow } from './OffspringRow';

type Props = {
  open: boolean;
  onClose: () => void;
};

export const OffspringManageDialog = ({ open, onClose }: Props) => {
  const { offspring, addOffspring } = useDomainStore();
  const [newName, setNewName] = useState('');
  const [search, setSearch] = useState('');

  const normalizedSearch = search.trim().toLowerCase();
  const filtered = useMemo(
    () =>
      normalizedSearch
        ? offspring.filter((item) =>
            item.name.toLowerCase().includes(normalizedSearch)
          )
        : offspring,
    [offspring, normalizedSearch]
  );

  const handleCreate = async () => {
    if (!newName.trim()) return;
    await addOffspring({ id: generateId(), name: newName.trim() });
    setNewName('');
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth='sm'>
      <DialogTitle>生産情報管理</DialogTitle>
      <DialogContent>
        <Stack spacing={2}>
          <Stack direction='row' spacing={1}>
            <TextField
              fullWidth
              size='small'
              placeholder='生産名'
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
              placeholder='生産を検索'
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />

          <Divider />

          <Stack direction='row' spacing={1} useFlexGap flexWrap='wrap'>
            {filtered.map((item) => (
              <OffspringRow key={item.id} offspring={item} />
            ))}
          </Stack>
        </Stack>
      </DialogContent>
    </Dialog>
  );
};
