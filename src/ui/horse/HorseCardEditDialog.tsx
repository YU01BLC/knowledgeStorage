import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Stack,
  Box,
  Chip,
  MenuItem,
  Typography,
} from '@mui/material';
import { useEffect, useState } from 'react';
import { HorseCard, HorseRecentRace } from '../../domain/horseSchema';
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
  const [recentRaces, setRecentRaces] = useState<HorseRecentRace[]>(
    card.recentRaces
  );
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmAddRaceOpen, setConfirmAddRaceOpen] = useState(false);
  const [nameError, setNameError] = useState(false);

  useEffect(() => {
    if (!open) return;
    setName(card.name);
    setSire(card.sire ?? '');
    setDam(card.dam ?? '');
    setDamSire(card.damSire ?? '');
    setPrimaryOffspring(card.offspringNames[0] ?? '');
    setExtraOffspring(card.offspringNames.slice(1));
    setRecentRaces(card.recentRaces);
    setNameError(false);
  }, [open, card]);

  const createEmptyRecentRace = (): HorseRecentRace => ({
    finish: '',
    distance: '',
    trackType: '',
    track: '',
    pace: '',
    cornerPassage: '',
    raceClass: '',
  });

  const handleAddRecentRace = () => {
    setRecentRaces((prev) => [
      createEmptyRecentRace(),
      ...prev.slice(0, 2),
    ]);
    setConfirmAddRaceOpen(false);
  };

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
      recentRaces,
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

            <Stack spacing={1}>
              <Typography variant='subtitle2' sx={{ fontWeight: 600 }}>
                成績
              </Typography>
              <Button
                variant='outlined'
                size='small'
                onClick={() => setConfirmAddRaceOpen(true)}
              >
                成績を追加
              </Button>
              <Stack spacing={2}>
                {recentRaces.map((race, index) => (
                  <Box
                    key={index}
                    sx={{
                      border: '1px solid rgba(255,255,255,0.12)',
                      borderRadius: 2,
                      p: 2,
                    }}
                  >
                    <Stack spacing={1}>
                      <Typography variant='caption' color='text.secondary'>
                        {index + 1}走前
                      </Typography>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                        <Box sx={{ width: 90 }}>
                          <TextField
                            select
                            label='着順'
                            value={race.finish}
                            onChange={(e) => {
                              const value = e.target.value;
                              setRecentRaces((prev) =>
                                prev.map((r, i) =>
                                  i === index ? { ...r, finish: value } : r
                                )
                              );
                            }}
                            fullWidth
                          >
                            <MenuItem value=''>未設定</MenuItem>
                            {Array.from({ length: 18 }, (_, i) => i + 1).map(
                              (value) => (
                                <MenuItem key={value} value={String(value)}>
                                  {value}
                                </MenuItem>
                              )
                            )}
                          </TextField>
                        </Box>
                        <Box sx={{ width: 110 }}>
                          <TextField
                            label='距離'
                            value={race.distance}
                            onChange={(e) => {
                              const value = e.target.value;
                              setRecentRaces((prev) =>
                                prev.map((r, i) =>
                                  i === index ? { ...r, distance: value } : r
                                )
                              );
                            }}
                            fullWidth
                          />
                        </Box>
                        <Box sx={{ width: 140 }}>
                          <TextField
                            select
                            label='コース種別'
                            value={race.trackType}
                            onChange={(e) => {
                              const value = e.target.value;
                              setRecentRaces((prev) =>
                                prev.map((r, i) =>
                                  i === index ? { ...r, trackType: value } : r
                                )
                              );
                            }}
                            fullWidth
                          >
                            <MenuItem value=''>未設定</MenuItem>
                            <MenuItem value='芝'>芝</MenuItem>
                            <MenuItem value='ダート'>ダート</MenuItem>
                            <MenuItem value='障害'>障害</MenuItem>
                          </TextField>
                        </Box>
                        <Box sx={{ width: 120 }}>
                          <TextField
                            select
                            label='馬場'
                            value={race.track}
                            onChange={(e) => {
                              const value = e.target.value;
                              setRecentRaces((prev) =>
                                prev.map((r, i) =>
                                  i === index ? { ...r, track: value } : r
                                )
                              );
                            }}
                            fullWidth
                          >
                            <MenuItem value=''>未設定</MenuItem>
                            <MenuItem value='良'>良</MenuItem>
                            <MenuItem value='稍重'>稍重</MenuItem>
                            <MenuItem value='重'>重</MenuItem>
                            <MenuItem value='不良'>不良</MenuItem>
                          </TextField>
                        </Box>
                        <Box sx={{ width: 110 }}>
                          <TextField
                            select
                            label='ペース'
                            value={race.pace}
                            onChange={(e) => {
                              const value = e.target.value;
                              setRecentRaces((prev) =>
                                prev.map((r, i) =>
                                  i === index ? { ...r, pace: value } : r
                                )
                              );
                            }}
                            fullWidth
                          >
                            <MenuItem value=''>未設定</MenuItem>
                            <MenuItem value='ハイ'>ハイ</MenuItem>
                            <MenuItem value='ミドル'>ミドル</MenuItem>
                            <MenuItem value='スロー'>スロー</MenuItem>
                          </TextField>
                        </Box>
                        <Box sx={{ width: 160 }}>
                          <TextField
                            label='コーナー順位'
                            value={race.cornerPassage}
                            onChange={(e) => {
                              const value = e.target.value;
                              setRecentRaces((prev) =>
                                prev.map((r, i) =>
                                  i === index
                                    ? { ...r, cornerPassage: value }
                                    : r
                                )
                              );
                            }}
                            fullWidth
                          />
                        </Box>
                        <Box sx={{ width: 140 }}>
                          <TextField
                            select
                            label='クラス'
                            value={race.raceClass}
                            onChange={(e) => {
                              const value = e.target.value;
                              setRecentRaces((prev) =>
                                prev.map((r, i) =>
                                  i === index ? { ...r, raceClass: value } : r
                                )
                              );
                            }}
                            fullWidth
                          >
                            <MenuItem value=''>未設定</MenuItem>
                            <MenuItem value='新馬'>新馬</MenuItem>
                            <MenuItem value='未勝利'>未勝利</MenuItem>
                            <MenuItem value='1勝'>1勝</MenuItem>
                            <MenuItem value='2勝'>2勝</MenuItem>
                            <MenuItem value='3勝'>3勝</MenuItem>
                            <MenuItem value='OP'>OP</MenuItem>
                            <MenuItem value='L'>L</MenuItem>
                            <MenuItem value='G3'>G3</MenuItem>
                            <MenuItem value='G2'>G2</MenuItem>
                            <MenuItem value='G1'>G1</MenuItem>
                            <MenuItem value='地方G以下'>地方G以下</MenuItem>
                            <MenuItem value='地方G'>地方G</MenuItem>
                            <MenuItem value='地方G3'>地方G3</MenuItem>
                            <MenuItem value='地方G2'>地方G2</MenuItem>
                            <MenuItem value='地方G1'>地方G1</MenuItem>
                          </TextField>
                        </Box>
                        <Box>
                          <Button
                            size='small'
                            color='error'
                            onClick={() =>
                              setRecentRaces((prev) =>
                                prev.map((r, i) =>
                                  i === index ? createEmptyRecentRace() : r
                                )
                              )
                            }
                          >
                            行を削除
                          </Button>
                        </Box>
                      </Box>
                    </Stack>
                  </Box>
                ))}
              </Stack>
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

      <ConfirmDialog
        open={confirmAddRaceOpen}
        title='成績を追加しますか？'
        message='一番古い成績が削除されます。よろしいですか？'
        confirmLabel='追加'
        onConfirm={handleAddRecentRace}
        onCancel={() => setConfirmAddRaceOpen(false)}
      />
    </>
  );
};
