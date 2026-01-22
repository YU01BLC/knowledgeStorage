import { useState, useEffect, useMemo } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Stack,
  Chip,
  Box,
  Divider,
  useTheme,
  TextField,
  IconButton,
} from '@mui/material';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import ArticleIcon from '@mui/icons-material/Article';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import { Card as CardType } from '../../domain/schema';
import { useDomainStore } from '../../stores/useDomainStore';
import { ConfirmDialog } from './ConfirmDialog';
import { LabelSelector } from '../label/LabelSelector';

type Props = {
  open: boolean;
  onClose: () => void;
  card: CardType;
};

const formatRelativeTime = (timestamp: number): string => {
  const now = Date.now();
  const diff = now - timestamp;
  const minutes = Math.floor(diff / 1000 / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days}日前`;
  if (hours > 0) return `${hours}時間前`;
  if (minutes > 0) return `${minutes}分前`;
  return 'たった今';
};

export const CardDetailDialog = ({ open, onClose, card }: Props) => {
  const { labels, updateCard, deleteCard } = useDomainStore();
  const theme = useTheme();

  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(card.title);
  const [body, setBody] = useState(card.body);
  const [editingLabelIds, setEditingLabelIds] = useState<string[]>([]);
  const [titleError, setTitleError] = useState(false);

  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [discardConfirmOpen, setDiscardConfirmOpen] = useState(false);

  /** ダイアログ open / card 切替時の初期化 */
  useEffect(() => {
    if (!open) return;

    setTitle(card.title);
    setBody(card.body);
    setEditingLabelIds(card.labelIds);
    setEditing(false);
    setTitleError(false);
  }, [card, open]);

  /** 編集差分検知（dirty 判定） */
  const isDirty = useMemo(() => {
    return (
      title !== card.title ||
      body !== card.body ||
      JSON.stringify(editingLabelIds) !== JSON.stringify(card.labelIds)
    );
  }, [title, body, editingLabelIds, card]);

  const cardLabels = labels.filter((label) =>
    card.labelIds.includes(label.id)
  );

  const updatedAtDate = new Date(card.updatedAt).toLocaleString('ja-JP');
  const createdAtDate = new Date(card.createdAt).toLocaleString('ja-JP');
  const relativeTime = formatRelativeTime(card.updatedAt);

  const handleSave = () => {
    if (!title.trim()) {
      setTitleError(true);
      return;
    }

    updateCard({
      id: card.id,
      title: title.trim(),
      body: body.trim(),
      labelIds: editingLabelIds,
    });

    setEditing(false);
    setTitleError(false);
  };

  const handleCancelEdit = () => {
    setTitle(card.title);
    setBody(card.body);
    setEditingLabelIds(card.labelIds);
    setEditing(false);
    setTitleError(false);
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
                  setEditingLabelIds(card.labelIds);
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
            {editing && (
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
            )}

            {editing ? (
              <TextField
                label='内容'
                value={body}
                onChange={(e) => setBody(e.target.value)}
                multiline
                rows={12}
                fullWidth
              />
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
                <LabelSelector
                  value={editingLabelIds}
                  onChange={setEditingLabelIds}
                />
              ) : (
                <Stack direction='row' spacing={1} flexWrap='wrap'>
                  {cardLabels.map((label) => (
                    <Chip
                      key={label.id}
                      label={label.name}
                      sx={{
                        borderColor: label.color,
                        color: label.color,
                      }}
                      variant='outlined'
                    />
                  ))}
                </Stack>
              )}
            </Box>

            {!editing && (
              <Box borderTop={`1px solid ${theme.palette.divider}`} pt={2}>
                <Typography variant='body2'>
                  更新: {updatedAtDate}（{relativeTime}）
                </Typography>
                <Typography variant='body2'>
                  作成: {createdAtDate}
                </Typography>
              </Box>
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
