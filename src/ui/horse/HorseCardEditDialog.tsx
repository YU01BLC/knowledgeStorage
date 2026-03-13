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
import { useEffect, useState } from 'react';
import { HorseCard } from '../../domain/horseSchema';
import { useDomainStore } from '../../stores/useDomainStore';
import { ConfirmDialog } from '../card/ConfirmDialog';
import { PedigreeSelector } from '../pedigree/PedigreeSelector';
import { OffspringSelector } from '../offspring/OffspringSelector';

type Props = {
  open: boolean;
  card: HorseCard;
  onClose: () => void;
};

export const HorseCardEditDialog = ({ open, card, onClose }: Props) => {
  const {
    updateHorseCard,
    deleteHorseCard,
    ensurePedigreeNames,
    ensureOffspringNames,
  } = useDomainStore();
  const [name, setName] = useState(card.name);
  const [sire, setSire] = useState(card.sire ?? '');
  const [dam, setDam] = useState(card.dam ?? '');
  const [damSire, setDamSire] = useState(card.damSire ?? '');
  const [primaryOffspring, setPrimaryOffspring] = useState(
    card.offspringNames[0] ?? ''
  );
  const [extraOffspring, setExtraOffspring] = useState<string[]>(
    card.offspringNames.slice(1)
  );
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [nameError, setNameError] = useState(false);

  useEffect(() => {
    if (!open) return;
    setName(card.name);
    setSire(card.sire ?? '');
    setDam(card.dam ?? '');
    setDamSire(card.damSire ?? '');
    setPrimaryOffspring(card.offspringNames[0] ?? '');
    setExtraOffspring(card.offspringNames.slice(1));
    setNameError(false);
  }, [open, card]);

  const handleSave = async () => {
    if (!name.trim()) {
      setNameError(true);
      return;
    }

    const nextOffspringNames = [
      ...(primaryOffspring.trim() ? [primaryOffspring.trim()] : []),
      ...extraOffspring.filter((name) => name.trim() !== ''),
    ];

    const uniqueOffspringNames = Array.from(new Set(nextOffspringNames));

    const pedigreeCandidates = [sire, dam, damSire];
    const offspringCandidates = [
      primaryOffspring,
      ...extraOffspring,
    ];
    await ensurePedigreeNames(pedigreeCandidates);
    await ensureOffspringNames(offspringCandidates);

    await updateHorseCard({
      id: card.id,
      name: name.trim(),
      sire: sire.trim() || undefined,
      dam: dam.trim() || undefined,
      damSire: damSire.trim() || undefined,
      offspringNames: uniqueOffspringNames,
    });
    onClose();
  };

  const handleConfirmDelete = async () => {
    await deleteHorseCard(card.id);
    setConfirmOpen(false);
    onClose();
  };

  return (
    <>
      <Dialog open={open} onClose={onClose} fullWidth maxWidth='sm'>
        <DialogTitle>馬情報を編集</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label='馬名'
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setNameError(false);
              }}
              error={nameError}
              helperText={nameError && '馬名は必須です'}
              required
              fullWidth
            />
            <PedigreeSelector label='父' value={sire} onChange={setSire} />
            <PedigreeSelector label='母' value={dam} onChange={setDam} />
            <PedigreeSelector label='母父' value={damSire} onChange={setDamSire} />

            <Stack spacing={1}>
              <OffspringSelector
                label='生産'
                value={primaryOffspring}
                onChange={(value) => {
                  setPrimaryOffspring(value);
                  setExtraOffspring((prev) =>
                    prev.filter((name) => name !== value)
                  );
                }}
              />
              {extraOffspring.length > 0 && (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {extraOffspring.map((name) => (
                    <Chip
                      key={name}
                      label={name}
                      onDelete={() =>
                        setExtraOffspring((prev) =>
                          prev.filter((n) => n !== name)
                        )
                      }
                      size='small'
                    />
                  ))}
                </Box>
              )}
            </Stack>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>閉じる</Button>
          <Button color='error' onClick={() => setConfirmOpen(true)}>
            削除
          </Button>
          <Button variant='contained' onClick={handleSave}>
            保存
          </Button>
        </DialogActions>
      </Dialog>

      <ConfirmDialog
        open={confirmOpen}
        title='馬情報を削除しますか？'
        message='この操作は取り消せません。'
        confirmLabel='削除'
        onConfirm={handleConfirmDelete}
        onCancel={() => setConfirmOpen(false)}
      />
    </>
  );
};
