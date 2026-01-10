import { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
} from '@mui/material';
import { v4 as uuid } from 'uuid';

type Props = {
  open: boolean;
  onClose: () => void;
  onCreate: (label: { id: string; name: string; color: string }) => void;
};

export const NewLabelDialog = ({ open, onClose, onCreate }: Props) => {
  const [name, setName] = useState('');
  const [color, setColor] = useState('#64b5f6');

  const handleCreate = () => {
    if (!name.trim()) return;

    onCreate({
      id: uuid(),
      name,
      color,
    });

    setName('');
    setColor('#64b5f6');
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>ラベル作成</DialogTitle>

      <DialogContent>
        <Box display='flex' gap={2} mt={1}>
          <TextField
            label='ラベル名'
            value={name}
            onChange={(e) => setName(e.target.value)}
            fullWidth
          />
          <input
            type='color'
            value={color}
            onChange={(e) => setColor(e.target.value)}
            style={{ width: 48, height: 40 }}
          />
        </Box>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>キャンセル</Button>
        <Button variant='contained' onClick={handleCreate}>
          作成
        </Button>
      </DialogActions>
    </Dialog>
  );
};
