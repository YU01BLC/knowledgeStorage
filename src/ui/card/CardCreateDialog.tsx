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
  Chip,
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
  const { addCard, addHorseCard } = useDomainStore();
  const [confirmOpen, setConfirmOpen] = useState(false);

  const [mode, setMode] = useState<'card' | 'horse'>('card');

  // 馬情報用フィールド（タイトルは既存の title を馬名として利用）
  const [sire, setSire] = useState('');
  const [dam, setDam] = useState('');
  const [damSire, setDamSire] = useState('');
  const [offspringNames, setOffspringNames] = useState<string[]>([]);
  const [offspringInput, setOffspringInput] = useState('');

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

  const resetHorseFields = () => {
    setSire('');
    setDam('');
    setDamSire('');
    setOffspringNames([]);
    setOffspringInput('');
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
      await addHorseCard({
        name: title.trim(),
        sire: sire.trim() || undefined,
        dam: dam.trim() || undefined,
        damSire: damSire.trim() || undefined,
        offspringNames,
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

  const handleAddOffspring = () => {
    const name = offspringInput.trim();
    if (!name) return;
    if (offspringNames.includes(name)) {
      setOffspringInput('');
      return;
    }
    setOffspringNames([...offspringNames, name]);
    setOffspringInput('');
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
                    <TextField
                      label='父'
                      value={sire}
                      onChange={(e) => setSire(e.target.value)}
                      fullWidth
                    />
                    <TextField
                      label='母'
                      value={dam}
                      onChange={(e) => setDam(e.target.value)}
                      fullWidth
                    />
                    <TextField
                      label='母父'
                      value={damSire}
                      onChange={(e) => setDamSire(e.target.value)}
                      fullWidth
                    />
                  </Stack>

                  <Stack spacing={1}>
                    <Typography variant='subtitle2' sx={{ fontWeight: 600 }}>
                      産駒
                    </Typography>
                    <TextField
                      label='産駒を追加'
                      placeholder='産駒名を入力してEnterで追加'
                      value={offspringInput}
                      onChange={(e) => setOffspringInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddOffspring();
                        }
                      }}
                      fullWidth
                    />
                    {offspringNames.length > 0 && (
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                        {offspringNames.map((name) => (
                          <Chip
                            key={name}
                            label={name}
                            onDelete={() =>
                              setOffspringNames(
                                offspringNames.filter((n) => n !== name)
                              )
                            }
                            size='small'
                          />
                        ))}
                      </Box>
                    )}
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
