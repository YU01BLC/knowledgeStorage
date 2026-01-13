import { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Stack,
  Typography,
} from '@mui/material';
import { useDomainStore } from '../../stores/useDomainStore';
import { LabelSelector } from '../label/LabelSelector';

type Props = {
  open: boolean;
  onClose: () => void;
};

export const CardCreateDialog = ({ open, onClose }: Props) => {
  const { addCard } = useDomainStore();

  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [titleError, setTitleError] = useState(false);
  const [labelIds, setLabelIds] = useState<string[]>([]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      setTitleError(true);
      return;
    }

    addCard({
      title: title.trim(),
      body: body.trim(),
      labelIds,
    });

    // reset
    setTitle('');
    setBody('');
    setLabelIds([]);
    setTitleError(false);
    onClose();
  };

  const handleClose = () => {
    setTitle('');
    setBody('');
    setLabelIds([]);
    setTitleError(false);
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth='sm'>
      <form onSubmit={handleSubmit}>
        <DialogTitle>カード作成</DialogTitle>

        <DialogContent>
          <Stack spacing={3} sx={{ mt: 1 }}>
            <TextField
              label='タイトル'
              placeholder='カードのタイトルを入力'
              value={title}
              onChange={(e) => {
                if (e.target.value.length <= 60) {
                  setTitle(e.target.value);
                  setTitleError(false);
                }
              }}
              error={titleError}
              helperText={titleError && 'タイトルは必須です'}
              required
              fullWidth
              autoFocus
              variant='outlined'
            />

            <TextField
              label='内容'
              placeholder='カードの内容を入力'
              value={body}
              onChange={(e) => setBody(e.target.value)}
              multiline
              rows={6}
              fullWidth
            />

            {/* Labels（詳細ダイアログと同一仕様） */}
            <Stack spacing={1}>
              <Typography variant='subtitle2' sx={{ fontWeight: 600 }}>
                ラベル
              </Typography>
              <LabelSelector value={labelIds} onChange={setLabelIds} />
            </Stack>
          </Stack>
        </DialogContent>

        <DialogActions>
          <Button onClick={handleClose}>キャンセル</Button>
          <Button type='submit' variant='contained'>
            作成
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};
