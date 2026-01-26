import { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Stack,
  Box,
  Divider,
  TextField,
  IconButton,
} from '@mui/material';
import ArticleIcon from '@mui/icons-material/Article';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import { Card as CardType } from '../../domain/schema';
import { useDomainStore } from '../../stores/useDomainStore';
import { ConfirmDialog } from './ConfirmDialog';
import { LabelSelector } from '../label/LabelSelector';
import { useCardForm } from './useCardForm';
import { DateTimeDisplay } from '../common/DateTimeDisplay';
import { LabelChip } from '../label/LabelChip';

type Props = {
  open: boolean;
  onClose: () => void;
  card: CardType;
};

export const CardDetailDialog = ({ open, onClose, card }: Props) => {
  const { labels, updateCard, deleteCard } = useDomainStore();

  const [editing, setEditing] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [discardConfirmOpen, setDiscardConfirmOpen] = useState(false);

  const {
    title,
    setTitle,
    body,
    setBody,
    labelIds,
    setLabelIds,
    titleError,
    setTitleError,
    isDirty,
    reset,
    validate,
  } = useCardForm({
    card: open ? card : undefined,
  });

  const cardLabels = labels.filter((label) =>
    card.labelIds.includes(label.id)
  );

  const handleSave = () => {
    if (!validate()) return;

    updateCard({
      id: card.id,
      title: title.trim(),
      body: body.trim(),
      labelIds,
    });

    setEditing(false);
  };

  const handleCancelEdit = () => {
    reset();
    setEditing(false);
  };

  const handleClose = () => {
    if (editing && isDirty) {
      setDiscardConfirmOpen(true);
      return;
    }
    onClose();
  };

  const handleDelete = () => {
    deleteCard(card.id);
    setDeleteConfirmOpen(false);
    onClose();
  };

  return (
    <>
      <Dialog
        open={open}
        onClose={handleClose}
        fullWidth
        maxWidth='md'
        slotProps={{
          paper: {
            sx: { borderRadius: 2, maxHeight: '90vh' },
          },
        }}
      >
        <DialogTitle>
          <Stack direction='row' justifyContent='space-between'>
            <Stack direction='row' spacing={1} alignItems='center'>
              <ArticleIcon color='primary' />
              <Typography variant='h6' fontWeight={600}>
                {editing ? 'カード編集' : card.title}
              </Typography>
            </Stack>

            {!editing && (
              <IconButton
                size='small'
                onClick={() => {
                  reset();
                  setEditing(true);
                }}
              >
                <EditIcon />
              </IconButton>
            )}
          </Stack>
        </DialogTitle>

        <DialogContent dividers>
          <Stack spacing={3}>
            {editing ? (
              <>
                <TextField
                  label='タイトル'
                  value={title}
                  onChange={(e) => {
                    setTitle(e.target.value);
                    setTitleError(false);
                  }}
                  error={titleError}
                  helperText={titleError && 'タイトルは必須です'}
                  fullWidth
                />
                <TextField
                  label='内容'
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  multiline
                  rows={12}
                  fullWidth
                />
              </>
            ) : (
              <Typography sx={{ whiteSpace: 'pre-wrap', lineHeight: 1.8 }}>
                {card.body || '内容がありません'}
              </Typography>
            )}

            <Divider />

            <Box>
              <Typography variant='subtitle2' fontWeight={600} mb={1}>
                ラベル
              </Typography>
              {editing ? (
                <LabelSelector value={labelIds} onChange={setLabelIds} />
              ) : (
                <Stack direction='row' spacing={1} flexWrap='wrap'>
                  {cardLabels.map((label) => (
                    <LabelChip key={label.id} label={label} />
                  ))}
                </Stack>
              )}
            </Box>

            {!editing && (
              <DateTimeDisplay
                updatedAt={card.updatedAt}
                createdAt={card.createdAt}
              />
            )}
          </Stack>
        </DialogContent>

        <DialogActions>
          {editing ? (
            <>
              <Button onClick={handleCancelEdit} startIcon={<CancelIcon />}>
                キャンセル
              </Button>
              <Button
                variant='contained'
                onClick={handleSave}
                startIcon={<SaveIcon />}
              >
                保存
              </Button>
            </>
          ) : (
            <>
              <Button
                color='error'
                startIcon={<DeleteIcon />}
                onClick={() => setDeleteConfirmOpen(true)}
              >
                削除
              </Button>
              <Button variant='contained' onClick={handleClose}>
                閉じる
              </Button>
            </>
          )}
        </DialogActions>
      </Dialog>

      {/* 削除確認 */}
      <ConfirmDialog
        open={deleteConfirmOpen}
        title={`「${card.title}」を削除しますか？`}
        message={'削除操作は取り消せません！\n 本当に削除しますか？'}
        confirmLabel={'削除'}
        onConfirm={handleDelete}
        onCancel={() => setDeleteConfirmOpen(false)}
      />

      {/* 編集破棄確認 */}
      <ConfirmDialog
        open={discardConfirmOpen}
        title={'編集内容が保存されていません！'}
        message={'編集内容が保存されていません。\n変更を破棄してページを離脱しますか？'}
        confirmLabel={'破棄'}
        onConfirm={() => {
          setDiscardConfirmOpen(false);
          handleCancelEdit();
          onClose();
        }}
        onCancel={() => setDiscardConfirmOpen(false)}
      />
    </>
  );
};
