import { useState, useEffect } from 'react';
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
import { CardDeleteConfirmDialog } from './CardDeleteConfirmDialog';
import { LabelSelector } from '../label/LabelSelector';

type Props = {
  open: boolean;
  onClose: () => void;
  card: CardType;
};

const formatRelativeTime = (timestamp: number): string => {
  const now = Date.now();
  const diff = now - timestamp;
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
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
  const [titleError, setTitleError] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [editingLabelIds, setEditingLabelIds] = useState<string[]>(
    card.labelIds
  );
  // cardが変更されたときにフォームをリセット
  useEffect(() => {
    if (open) {
      setTitle(card.title);
      setBody(card.body);
      setEditing(false);
      setTitleError(false);
    }
  }, [card, open]);

  const cardLabels = labels.filter((label) => card.labelIds.includes(label.id));
  const updatedAtDate = new Date(card.updatedAt).toLocaleString('ja-JP', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
  const createdAtDate = new Date(card.createdAt).toLocaleString('ja-JP', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
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
      labelIds: card.labelIds,
    });

    setEditing(false);
    setTitleError(false);
  };

  const handleCancel = () => {
    setTitle(card.title);
    setBody(card.body);
    setEditing(false);
    setTitleError(false);
  };

  const handleDelete = () => {
    deleteCard(card.id);
    setDeleteConfirmOpen(false);
    onClose();
  };

  const handleClose = () => {
    if (editing) {
      handleCancel();
    }
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
            sx: {
              borderRadius: 2,
              maxHeight: '90vh',
            },
          },
        }}
      >
        <DialogTitle>
          <Stack
            direction='row'
            spacing={1}
            alignItems='center'
            justifyContent='space-between'
          >
            <Stack
              direction='row'
              spacing={1}
              alignItems='center'
              sx={{ flex: 1 }}
            >
              <ArticleIcon sx={{ color: 'primary.main' }} />
              <Typography
                variant='h6'
                component='span'
                sx={{ fontWeight: 600 }}
              >
                {editing ? 'カード編集' : card.title}
              </Typography>
            </Stack>
            {!editing && (
              <IconButton
                size='small'
                onClick={(e) => {
                  e.stopPropagation();
                  setEditing(true);
                }}
                sx={{ ml: 1 }}
              >
                <EditIcon />
              </IconButton>
            )}
          </Stack>
        </DialogTitle>

        <DialogContent
          dividers
          sx={{ maxHeight: 'calc(90vh - 200px)', overflow: 'auto' }}
        >
          <Stack spacing={3}>
            {/* Title Edit Field (editing mode only) */}
            {editing && (
              <Box sx={{ width: '100%', minWidth: 0 }}>
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
              </Box>
            )}

            {/* Body Content */}
            <Box>
              {editing ? (
                <TextField
                  label='内容'
                  placeholder='カードの内容を入力（Markdown対応）'
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  multiline
                  rows={12}
                  fullWidth
                  variant='outlined'
                />
              ) : (
                <Typography
                  variant='body1'
                  sx={{
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word',
                    lineHeight: 1.8,
                    color: 'text.primary',
                  }}
                >
                  {card.body || '内容がありません'}
                </Typography>
              )}
            </Box>

            <Divider />

            {/* Labels */}
            <Box>
              <Typography variant='subtitle2' sx={{ mb: 1, fontWeight: 600 }}>
                ラベル
              </Typography>

              {editing ? (
                <LabelSelector
                  value={editingLabelIds}
                  onChange={setEditingLabelIds}
                />
              ) : cardLabels.length > 0 ? (
                <Stack direction='row' spacing={1} useFlexGap flexWrap='wrap'>
                  {cardLabels.map((label) => (
                    <Chip
                      key={label.id}
                      label={label.name}
                      size='medium'
                      variant='outlined'
                      sx={{
                        borderColor: label.color,
                        color: label.color,
                        fontWeight: 500,
                        backgroundColor: `${label.color}08`,
                        '&:hover': {
                          backgroundColor: `${label.color}15`,
                          borderColor: label.color,
                        },
                      }}
                    />
                  ))}
                </Stack>
              ) : (
                <Typography variant='body2' color='text.secondary'>
                  ラベルは設定されていません
                </Typography>
              )}
            </Box>

            {/* Metadata */}
            {!editing && (
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 1,
                  pt: 1,
                  borderTop: `1px solid ${theme.palette.divider}`,
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <AccessTimeIcon
                    sx={{ fontSize: 16, color: 'text.secondary', opacity: 0.7 }}
                  />
                  <Typography variant='body2' color='text.secondary'>
                    <strong>更新:</strong> {updatedAtDate} ({relativeTime})
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <AccessTimeIcon
                    sx={{ fontSize: 16, color: 'text.secondary', opacity: 0.7 }}
                  />
                  <Typography variant='body2' color='text.secondary'>
                    <strong>作成:</strong> {createdAtDate}
                  </Typography>
                </Box>
              </Box>
            )}
          </Stack>
        </DialogContent>

        <DialogActions sx={{ px: 3, py: 2, gap: 1 }}>
          {editing ? (
            <>
              <Button
                onClick={handleCancel}
                startIcon={<CancelIcon />}
                color='inherit'
              >
                キャンセル
              </Button>
              <Button
                onClick={handleSave}
                variant='contained'
                startIcon={<SaveIcon />}
              >
                保存
              </Button>
            </>
          ) : (
            <>
              <Button
                onClick={() => setDeleteConfirmOpen(true)}
                color='error'
                startIcon={<DeleteIcon />}
                sx={{ mr: 'auto' }}
              >
                削除
              </Button>
              <Button onClick={handleClose} variant='contained'>
                閉じる
              </Button>
            </>
          )}
        </DialogActions>
      </Dialog>

      <CardDeleteConfirmDialog
        open={deleteConfirmOpen}
        cardTitle={card.title}
        onConfirm={handleDelete}
        onCancel={() => setDeleteConfirmOpen(false)}
      />
    </>
  );
};
