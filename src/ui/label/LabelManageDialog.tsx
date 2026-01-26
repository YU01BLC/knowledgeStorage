import {
  Dialog,
  DialogTitle,
  DialogContent,
  Stack,
  TextField,
  Button,
  Divider,
} from '@mui/material';
import { useState } from 'react';
import { useDomainStore } from '../../stores/useDomainStore';
import { LabelRow } from '../label/LabelRow';
import { generateId } from '../../domain/id';

type Props = {
  open: boolean;
  onClose: () => void;
};

export const LabelManageDialog = ({ open, onClose }: Props) => {
  const { labels, addLabel } = useDomainStore();

  const [newLabelName, setNewLabelName] = useState('');

  const handleCreate = async () => {
    if (!newLabelName.trim()) return;

    await addLabel({
      id: generateId(),
      name: newLabelName.trim(),
    });

    setNewLabelName('');
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth='sm'>
      <DialogTitle>ラベル管理</DialogTitle>

      <DialogContent>
        <Stack spacing={2}>
          {/* Create */}
          <Stack direction='row' spacing={1}>
            <TextField
              fullWidth
              size='small'
              placeholder='ラベル名'
              value={newLabelName}
              onChange={(e) => setNewLabelName(e.target.value)}
            />
            <Button variant='contained' onClick={handleCreate}>
              作成
            </Button>
          </Stack>

          <Divider />

          {/* List */}
          <Stack direction='row' spacing={1} useFlexGap flexWrap='wrap'>
            {labels.map((label) => (
              <LabelRow key={label.id} label={label} />
            ))}
          </Stack>
        </Stack>
      </DialogContent>
    </Dialog>
  );
};
