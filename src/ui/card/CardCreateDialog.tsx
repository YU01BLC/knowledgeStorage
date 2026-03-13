import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Stack,
  Typography,
  Box,
} from '@mui/material';
import { useEffect, useState } from 'react';
import { useDomainStore } from '../../stores/useDomainStore';
import { LabelSelector } from '../label/LabelSelector';
import { useCardForm } from './useCardForm';
import { ConfirmDialog } from './ConfirmDialog';
import { PedigreeSelector } from '../pedigree/PedigreeSelector';
import { OffspringSelector } from '../offspring/OffspringSelector';
import { useUIStore } from '../../stores/useUIStore';

type Props = {
  open: boolean;
  onClose: () => void;
};

export const CardCreateDialog = ({ open, onClose }: Props) => {
  const { addCard, addHorseCard, ensurePedigreeNames, ensureOffspringNames } =
    useDomainStore();
  const viewMode = useUIStore((s) => s.viewMode);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const [mode, setMode] = useState<'card' | 'horse'>('card');

  // 馬情報用フィールド（タイトルは既存の title を馬名として利用）
  const [sire, setSire] = useState('');
  const [dam, setDam] = useState('');
  const [damSire, setDamSire] = useState('');
  const [offspringName, setOffspringName] = useState('');

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

  useEffect(() => {
    if (!open) return;
    setMode(viewMode === 'horse' ? 'horse' : 'card');
  }, [open, viewMode]);

  const resetHorseFields = () => {
    setSire('');
    setDam('');
    setDamSire('');
    setOffspringName('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    setConfirmOpen(true);
  };

  const handleClose = () => {
    setConfirmOpen(false);
    setMode('card');
    resetHorseFields();
    reset();
    onClose();
  };

  const handleConfirmCreate = async () => {
    if (mode === 'card') {
      await addCard({
        title: title.trim(),
        body: body.trim(),
        labelIds,
      });
    } else {
      const pedigreeCandidates = [sire, dam, damSire];
      const offspringCandidates = [offspringName];
      await ensurePedigreeNames(pedigreeCandidates);
      await ensureOffspringNames(offspringCandidates);

      await addHorseCard({
        name: title.trim(),
        sire: sire.trim() || undefined,
        dam: dam.trim() || undefined,
        damSire: damSire.trim() || undefined,
        offspringNames: offspringName.trim() ? [offspringName.trim()] : [],
      });
    }

    setConfirmOpen(false);
    setMode('card');
    resetHorseFields();
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
              {/* モード切り替え */}
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button
                  variant={mode === 'card' ? 'contained' : 'outlined'}
                  onClick={() => setMode('card')}
                  size='small'
                >
                  通常カード
                </Button>
                <Button
                  variant={mode === 'horse' ? 'contained' : 'outlined'}
                  onClick={() => setMode('horse')}
                  size='small'
                >
                  馬情報カード
                </Button>
              </Box>

              {mode === 'card' ? (
                <>
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
                </>
              ) : (
                <>
                  <TextField
                    label='馬名'
                    placeholder='馬名を入力'
                    value={title}
                    onChange={(e) => {
                      if (e.target.value.length <= 60) {
                        setTitle(e.target.value);
                      }
                      setTitleError(false);
                    }}
                    error={titleError}
                    helperText={titleError && '馬名は必須です'}
                    required
                    fullWidth
                    autoFocus
                    variant='outlined'
                  />

                  <Stack spacing={2}>
                    <PedigreeSelector
                      label='父'
                      value={sire}
                      onChange={setSire}
                    />
                    <PedigreeSelector
                      label='母'
                      value={dam}
                      onChange={setDam}
                    />
                    <PedigreeSelector
                      label='母父'
                      value={damSire}
                      onChange={setDamSire}
                    />
                  </Stack>

                  <Stack spacing={1}>
                    <OffspringSelector
                      label='生産'
                      value={offspringName}
                      onChange={setOffspringName}
                    />
                  </Stack>
                </>
              )}
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
