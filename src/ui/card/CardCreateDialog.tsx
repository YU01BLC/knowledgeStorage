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
import { useState } from 'react';
import { useDomainStore } from '../../stores/useDomainStore';
import { LabelSelector } from '../label/LabelSelector';
import { useCardForm } from './useCardForm';
import { ConfirmDialog } from './ConfirmDialog';

type Props = {
  open: boolean;
  onClose: () => void;
};

export const CardCreateDialog = ({ open, onClose }: Props) => {
  const { addCard } = useDomainStore();
  const [confirmOpen, setConfirmOpen] = useState(false);

  const {
    title,
    setTitle,
    body,
    setBody,
    labelIds,
    setLabelIds,
    titleError,
    setTitleError,
    reset,
    validate,
  } = useCardForm();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    setConfirmOpen(true);
  };

  const handleClose = () => {
    setConfirmOpen(false);
    reset();
    onClose();
  };

  const handleConfirmCreate = async () => {
    await addCard({
      title: title.trim(),
      body: body.trim(),
      labelIds,
    });

    setConfirmOpen(false);
    reset();
    onClose();
  };

  const handleCancelConfirm = () => {
    setConfirmOpen(false);
  };

  return (
    <>
      <Dialog
        open={open}
        onClose={(_, reason) => {
          if (reason === 'backdropClick' || reason === 'escapeKeyDown') {
            return;
          }
          handleClose();
        }}
        disableEscapeKeyDown
        fullWidth
        maxWidth='sm'
      >
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
                  }
                  setTitleError(false);
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

      <ConfirmDialog
        open={confirmOpen}
        title='カードを作成しますか？'
        message='この内容でカードを作成します。'
        confirmLabel='作成'
        tone='info'
        onConfirm={handleConfirmCreate}
        onCancel={handleCancelConfirm}
      />
    </>
  );
};
