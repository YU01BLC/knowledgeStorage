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

type Props = {
  open: boolean;
  onClose: () => void;
};

export const CardCreateDialog = ({ open, onClose }: Props) => {
  const { addCard } = useDomainStore();

  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [titleError, setTitleError] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      setTitleError(true);
      return;
    }

    addCard({
      title: title.trim(),
      body: body.trim(),
      labelIds: [],
    });

    // Reset form
    setTitle('');
    setBody('');
    setTitleError(false);
    onClose();
  };

  const handleClose = () => {
    setTitle('');
    setBody('');
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
                setTitle(e.target.value);
                setTitleError(false);
              }}
              error={titleError}
              helperText={titleError ? 'タイトルは必須です' : ''}
              required
              fullWidth
              autoFocus
            />

            <TextField
              label='内容'
              placeholder='カードの内容を入力（Markdown対応）'
              value={body}
              onChange={(e) => setBody(e.target.value)}
              multiline
              rows={6}
              fullWidth
            />

            {/* ラベル選択UI（将来の拡張用） */}
            <Stack spacing={1}>
              <Typography variant='body2' color='text.secondary'>
                ラベル（今後実装予定）
              </Typography>
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
