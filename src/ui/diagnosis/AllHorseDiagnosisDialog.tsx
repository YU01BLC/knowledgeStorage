import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Stack,
  TextField,
  MenuItem,
  Typography,
  Box,
  InputAdornment,
  Autocomplete,
  Collapse,
} from '@mui/material';
import { useState } from 'react';
import { z } from 'zod';
import { useDomainStore } from '../../stores/useDomainStore';

type Props = {
  open: boolean;
  onClose: () => void;
  onDiagnose: (results: ResultRow[]) => void;
};

type RecentRace = {
  finish: string;
  cornerPassage: string;
  pace: string;
  distance?: string;
  track?: string;
  raceClass?: string;
};

type Entry = {
  frame: number | '';
  number: number | '';
  horseCardId?: string;
  horseName: string;
  recentRaces: RecentRace[];
};

export type ResultRow = {
  rating: string;
  number: number | '';
  horseName: string;
  reason: string;
};

const cornerPassagePattern = /^(?:\d+(?:-\d+){1}|\d+(?:-\d+){3})$/;

const createRecentRaces = (): RecentRace[] => [
  {
    finish: '',
    cornerPassage: '',
    pace: '',
    distance: '',
    track: '',
    raceClass: '',
  },
  {
    finish: '',
    cornerPassage: '',
    pace: '',
    distance: '',
    track: '',
    raceClass: '',
  },
  {
    finish: '',
    cornerPassage: '',
    pace: '',
    distance: '',
    track: '',
    raceClass: '',
  },
];

const RaceInfoSchema = z.object({
  date: z.string().min(1),
  course: z.string().min(1),
  raceName: z.string().min(1),
  trackType: z.enum(['芝', 'ダート']),
  distance: z.string().min(1),
  courseDirection: z.enum(['右回り', '左回り', '直線']),
  trackCondition: z.enum(['良', '稍重', '重', '不良']),
  trackConfig: z.enum(['A', 'B', 'C', 'D']).optional(),
});

type RaceInfoInput = z.infer<typeof RaceInfoSchema>;
type RaceInfoErrors = Partial<Record<keyof RaceInfoInput, string>>;
type RecentRaceErrors = Partial<Record<'cornerPassage', string>>;
type EntryErrors = {
  frame?: string;
  number?: string;
  horseName?: string;
  recentRaces?: RecentRaceErrors[];
};

export const AllHorseDiagnosisDialog = ({
  open,
  onClose,
  onDiagnose,
}: Props) => {
  const { horseCards } = useDomainStore();

  const [date, setDate] = useState('');
  const [course, setCourse] = useState('');
  const [raceName, setRaceName] = useState('');
  const [trackType, setTrackType] = useState<'芝' | 'ダート' | ''>('');
  const [distance, setDistance] = useState('');
  const [courseDirection, setCourseDirection] = useState<
    '右回り' | '左回り' | '直線' | ''
  >('');
  const [trackConfig, setTrackConfig] = useState<'A' | 'B' | 'C' | 'D' | ''>('');
  const [trackCondition, setTrackCondition] = useState<
    '良' | '稍重' | '重' | '不良' | ''
  >('');

  const [raceErrors, setRaceErrors] = useState<RaceInfoErrors>({});

  const [entries, setEntries] = useState<Entry[]>([
    {
      frame: 1,
      number: 1,
      horseName: '',
      recentRaces: createRecentRaces(),
    },
  ]);
  const [entryErrors, setEntryErrors] = useState<EntryErrors[]>([]);
  const [entryScoresOpen, setEntryScoresOpen] = useState<boolean[]>([false]);

  const handleChangeEntry =
    <K extends keyof Entry>(index: number, key: K) =>
    (value: Entry[K]) => {
      setEntries((prev) =>
        prev.map((e, i) =>
          i === index
            ? {
                ...e,
                [key]: value,
              }
            : e
        )
      );
    };

  const handleHorseNameChange = (index: number, name: string) => {
    const matched = horseCards.find((c) => c.name === name);
    setEntries((prev) =>
      prev.map((e, i) =>
        i === index
          ? {
              ...e,
              horseName: name,
              horseCardId: matched?.id,
            }
          : e
      )
    );
  };

  const handleAddEntry = () => {
    setEntries((prev) => [
      ...prev,
      {
        frame: '',
        number: '',
        horseName: '',
        recentRaces: createRecentRaces(),
      },
    ]);
    setEntryErrors((prev) => [...prev, {}]);
    setEntryScoresOpen((prev) => [...prev, false]);
  };

  const handleDiagnose = () => {
    const input: RaceInfoInput = {
      date,
      course,
      raceName,
      trackType: trackType as RaceInfoInput['trackType'],
      distance,
      courseDirection: courseDirection as RaceInfoInput['courseDirection'],
      trackCondition: trackCondition as RaceInfoInput['trackCondition'],
      trackConfig: trackConfig === '' ? undefined : trackConfig,
    };

    const result = RaceInfoSchema.safeParse(input);
    if (!result.success) {
      const nextErrors: RaceInfoErrors = {};
      for (const issue of result.error.issues) {
        const key = issue.path[0] as keyof RaceInfoInput | undefined;
        if (key && !nextErrors[key]) {
          nextErrors[key] = '必須です';
        }
      }
      setRaceErrors(nextErrors);
      return;
    }

    setRaceErrors({});

    const nextEntryErrors: EntryErrors[] = entries.map((entry) => {
      const errors: EntryErrors = {};
      if (entry.frame === '' || entry.frame < 1 || entry.frame > 8) {
        errors.frame = '1〜8';
      }
      if (entry.number === '' || entry.number < 1 || entry.number > 18) {
        errors.number = '1〜18';
      }
      if (!entry.horseName.trim()) {
        errors.horseName = '必須です';
      }
      const recentRaceErrors = entry.recentRaces.map((race) => {
        const raceErrors: RecentRaceErrors = {};
        if (
          race.cornerPassage &&
          !cornerPassagePattern.test(race.cornerPassage)
        ) {
          raceErrors.cornerPassage = '形式: X-X または X-X-X-X';
        }
        return raceErrors;
      });
      errors.recentRaces = recentRaceErrors;
      return errors;
    });

    const hasEntryErrors = nextEntryErrors.some((e) => {
      const hasCornerErrors =
        e.recentRaces?.some((race) => race.cornerPassage) ?? false;
      return e.frame || e.number || e.horseName || hasCornerErrors;
    });
    setEntryErrors(nextEntryErrors);
    if (hasEntryErrors) return;

    const raceInfoPayload = {
      date,
      course,
      raceName,
      trackType,
      distance,
      courseDirection,
      trackConfig: trackConfig === '' ? null : trackConfig,
      trackCondition,
    };

    const entriesPayload = entries.map((entry) => {
      const horseCard =
        horseCards.find((c) => c.id === entry.horseCardId) ??
        horseCards.find((c) => c.name === entry.horseName);

      return {
        frame: entry.frame,
        number: entry.number,
        horseName: entry.horseName,
        horseCardId: horseCard?.id ?? null,
        horseInfo: horseCard
          ? {
              sire: horseCard.sire ?? null,
              dam: horseCard.dam ?? null,
              damSire: horseCard.damSire ?? null,
              offspringNames: horseCard.offspringNames ?? [],
            }
          : null,
        recentRaces: entry.recentRaces
          .map((race) => ({
            finish: race.finish,
            distance: race.distance ?? '',
            track: race.track ?? '',
            pace: race.pace,
            cornerPassage: race.cornerPassage,
            raceClass: race.raceClass ?? '',
          }))
          .filter(
            (race) =>
              race.finish ||
              race.distance ||
              race.track ||
              race.pace ||
              race.cornerPassage ||
              race.raceClass
          ),
      };
    });

    const payload = {
      raceInfo: raceInfoPayload,
      entries: entriesPayload,
    };

    console.log('[AllHorseDiagnosis] payload', JSON.stringify(payload, null, 2));

    const nextResults: ResultRow[] = entries
      .filter((e) => e.number && e.horseName)
      .map((e) => ({
        rating: '',
        number: e.number,
        horseName: e.horseName,
        reason: '',
      }));
    onDiagnose(nextResults);
    onClose();
  };

  const handleClose = () => {
    setEntries([
      {
        frame: 1,
        number: 1,
        horseName: '',
        recentRaces: createRecentRaces(),
      },
    ]);
    setEntryErrors([]);
    setEntryScoresOpen([false]);
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={(_, reason) => {
        if (reason === 'backdropClick' || reason === 'escapeKeyDown') return;
        handleClose();
      }}
      fullWidth
      maxWidth='xl'
      PaperProps={{ sx: { maxWidth: 1200 } }}
    >
      <DialogTitle>全頭診断</DialogTitle>
      <DialogContent dividers>
        <Stack spacing={4} sx={{ mt: 1 }}>
          {/* レース基本情報 */}
          <Stack spacing={2}>
            <Typography variant='subtitle1' sx={{ fontWeight: 600 }}>
              レース情報
            </Typography>

            {/* 1行目: 日付 / 会場 / レース名 / 馬場種別 */}
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
              <Box sx={{ width: 200 }}>
                <TextField
                  label='日付'
                  type='date'
                  value={date}
                  onChange={(e) => {
                    setDate(e.target.value);
                    if (raceErrors.date) {
                      setRaceErrors((prev) => ({ ...prev, date: undefined }));
                    }
                  }}
                  InputLabelProps={{ shrink: true }}
                  required
                  error={Boolean(raceErrors.date)}
                  helperText={raceErrors.date}
                  fullWidth
                />
              </Box>
              <Box sx={{ width: 220 }}>
                <TextField
                  label='会場'
                  value={course}
                  onChange={(e) => {
                    setCourse(e.target.value);
                    if (raceErrors.course) {
                      setRaceErrors((prev) => ({ ...prev, course: undefined }));
                    }
                  }}
                  required
                  error={Boolean(raceErrors.course)}
                  helperText={raceErrors.course}
                  fullWidth
                />
              </Box>
              <Box sx={{ width: 260 }}>
                <TextField
                  label='レース名'
                  value={raceName}
                  onChange={(e) => {
                    setRaceName(e.target.value);
                    if (raceErrors.raceName) {
                      setRaceErrors((prev) => ({
                        ...prev,
                        raceName: undefined,
                      }));
                    }
                  }}
                  required
                  error={Boolean(raceErrors.raceName)}
                  helperText={raceErrors.raceName}
                  fullWidth
                />
              </Box>
              <Box sx={{ width: 160 }}>
                <TextField
                  select
                  label='馬場種別'
                  value={trackType}
                  onChange={(e) => {
                    setTrackType(e.target.value as '芝' | 'ダート' | '');
                    if (raceErrors.trackType) {
                      setRaceErrors((prev) => ({
                        ...prev,
                        trackType: undefined,
                      }));
                    }
                  }}
                  required
                  error={Boolean(raceErrors.trackType)}
                  helperText={raceErrors.trackType}
                  fullWidth
                >
                  <MenuItem value='芝'>芝</MenuItem>
                  <MenuItem value='ダート'>ダート</MenuItem>
                </TextField>
              </Box>
            </Box>

            {/* 2行目: 距離 / コース回り / コース区分 / 馬場想定 */}
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
              <Box sx={{ width: 220 }}>
                <TextField
                  label='距離'
                  value={distance}
                  onChange={(e) => {
                    setDistance(e.target.value);
                    if (raceErrors.distance) {
                      setRaceErrors((prev) => ({
                        ...prev,
                        distance: undefined,
                      }));
                    }
                  }}
                  required
                  error={Boolean(raceErrors.distance)}
                  helperText={raceErrors.distance}
                  fullWidth
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position='end'>m</InputAdornment>
                    ),
                  }}
                />
              </Box>
              <Box sx={{ width: 160 }}>
                <TextField
                  select
                  label='コース回り'
                  value={courseDirection}
                  onChange={(e) => {
                    setCourseDirection(
                      e.target.value as '右回り' | '左回り' | '直線' | ''
                    );
                    if (raceErrors.courseDirection) {
                      setRaceErrors((prev) => ({
                        ...prev,
                        courseDirection: undefined,
                      }));
                    }
                  }}
                  required
                  error={Boolean(raceErrors.courseDirection)}
                  helperText={raceErrors.courseDirection}
                  fullWidth
                >
                  <MenuItem value='右回り'>右回り</MenuItem>
                  <MenuItem value='左回り'>左回り</MenuItem>
                  <MenuItem value='直線'>直線</MenuItem>
                </TextField>
              </Box>
              <Box sx={{ width: 160 }}>
                <TextField
                  select
                  label='コース区分'
                  value={trackConfig}
                  onChange={(e) =>
                    setTrackConfig(e.target.value as 'A' | 'B' | 'C' | 'D' | '')
                  }
                  placeholder='ABCD'
                  fullWidth
                >
                  <MenuItem value=''>未設定</MenuItem>
                  <MenuItem value='A'>A</MenuItem>
                  <MenuItem value='B'>B</MenuItem>
                  <MenuItem value='C'>C</MenuItem>
                  <MenuItem value='D'>D</MenuItem>
                </TextField>
              </Box>
              <Box sx={{ width: 260 }}>
                <TextField
                  select
                  label='馬場想定'
                  value={trackCondition}
                  onChange={(e) => {
                    setTrackCondition(
                      e.target.value as '良' | '稍重' | '重' | '不良' | ''
                    );
                    if (raceErrors.trackCondition) {
                      setRaceErrors((prev) => ({
                        ...prev,
                        trackCondition: undefined,
                      }));
                    }
                  }}
                  required
                  error={Boolean(raceErrors.trackCondition)}
                  helperText={raceErrors.trackCondition}
                  fullWidth
                >
                  <MenuItem value='良'>良</MenuItem>
                  <MenuItem value='稍重'>稍重</MenuItem>
                  <MenuItem value='重'>重</MenuItem>
                  <MenuItem value='不良'>不良</MenuItem>
                </TextField>
              </Box>
            </Box>
          </Stack>

          {/* 出馬情報（簡易版） */}
          <Stack spacing={2}>
            <Typography variant='subtitle1' sx={{ fontWeight: 600 }}>
              出馬情報
            </Typography>
            <Stack spacing={2}>
              {entries.map((entry, index) => (
                <Box
                  key={index}
                  sx={{
                    border: '1px solid rgba(255,255,255,0.12)',
                    borderRadius: 2,
                    p: 2,
                  }}
                >
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                    <Box sx={{ width: 90 }}>
                      <TextField
                        select
                        label='枠'
                        value={entry.frame}
                        onChange={(e) =>
                          handleChangeEntry(index, 'frame')(
                            e.target.value === '' ? '' : Number(e.target.value)
                          )
                        }
                        error={Boolean(entryErrors[index]?.frame)}
                        helperText={entryErrors[index]?.frame}
                        required
                        fullWidth
                      >
                        {Array.from({ length: 8 }, (_, i) => i + 1).map(
                          (value) => (
                            <MenuItem key={value} value={value}>
                              {value}
                            </MenuItem>
                          )
                        )}
                      </TextField>
                    </Box>
                    <Box sx={{ width: 110 }}>
                      <TextField
                        select
                        label='番号'
                        value={entry.number}
                        onChange={(e) =>
                          handleChangeEntry(index, 'number')(
                            e.target.value === '' ? '' : Number(e.target.value)
                          )
                        }
                        error={Boolean(entryErrors[index]?.number)}
                        helperText={entryErrors[index]?.number}
                        required
                        fullWidth
                      >
                        {Array.from({ length: 18 }, (_, i) => i + 1).map(
                          (value) => (
                            <MenuItem key={value} value={value}>
                              {value}
                            </MenuItem>
                          )
                        )}
                      </TextField>
                    </Box>
                    <Box sx={{ minWidth: 260, flex: 1 }}>
                      <Autocomplete
                        freeSolo
                        options={horseCards.map((c) => c.name)}
                        value={entry.horseName}
                        onChange={(_, value) =>
                          handleHorseNameChange(index, value ?? '')
                        }
                        onInputChange={(_, value) =>
                          handleHorseNameChange(index, value)
                        }
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            label='馬名'
                            placeholder='馬名を入力 or 選択'
                            error={Boolean(entryErrors[index]?.horseName)}
                            helperText={entryErrors[index]?.horseName}
                            required
                            fullWidth
                          />
                        )}
                      />
                    </Box>
                    <Box sx={{ width: '100%' }}>
                      <Button
                        size='small'
                        variant='outlined'
                        onClick={() =>
                          setEntryScoresOpen((prev) =>
                            prev.map((open, i) =>
                              i === index ? !open : open
                            )
                          )
                        }
                      >
                        成績を入力
                      </Button>
                      <Collapse in={entryScoresOpen[index] ?? false}>
                        <Box
                          sx={{
                            mt: 2,
                            display: 'flex',
                            flexWrap: 'wrap',
                            gap: 2,
                          }}
                        >
                          {entry.recentRaces.map((race, raceIndex) => (
                            <Box
                              key={raceIndex}
                              sx={{
                                display: 'flex',
                                flexWrap: 'wrap',
                                gap: 1,
                                alignItems: 'flex-start',
                              }}
                            >
                              <Box sx={{ width: 28, pt: 1 }}>
                                <Typography variant='caption'>
                                  {raceIndex + 1}
                                </Typography>
                              </Box>
                              <Box sx={{ width: 90 }}>
                                <TextField
                                  select
                                  label='着順'
                                  value={race.finish}
                                  onChange={(e) => {
                                    const value = e.target.value;
                                    handleChangeEntry(index, 'recentRaces')(
                                      entry.recentRaces.map((r, i) =>
                                        i === raceIndex
                                          ? { ...r, finish: value }
                                          : r
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
                                  value={race.distance ?? ''}
                                  onChange={(e) => {
                                    const value = e.target.value;
                                    handleChangeEntry(index, 'recentRaces')(
                                      entry.recentRaces.map((r, i) =>
                                        i === raceIndex
                                          ? { ...r, distance: value }
                                          : r
                                      )
                                    );
                                  }}
                                  fullWidth
                                  InputProps={{
                                    endAdornment: (
                                      <InputAdornment position='end'>
                                        m
                                      </InputAdornment>
                                    ),
                                  }}
                                />
                              </Box>
                              <Box sx={{ width: 90 }}>
                                <TextField
                                  select
                                  label='馬場'
                                  value={race.track ?? ''}
                                  onChange={(e) => {
                                    const value = e.target.value;
                                    handleChangeEntry(index, 'recentRaces')(
                                      entry.recentRaces.map((r, i) =>
                                        i === raceIndex
                                          ? { ...r, track: value }
                                          : r
                                      )
                                    );
                                  }}
                                  fullWidth
                                >
                                  <MenuItem value=''>未設定</MenuItem>
                                  <MenuItem value='芝'>芝</MenuItem>
                                  <MenuItem value='ダート'>ダート</MenuItem>
                                </TextField>
                              </Box>
                              <Box sx={{ width: 90 }}>
                                <TextField
                                  select
                                  label='ペース'
                                  value={race.pace}
                                  onChange={(e) => {
                                    const value = e.target.value;
                                    handleChangeEntry(index, 'recentRaces')(
                                      entry.recentRaces.map((r, i) =>
                                        i === raceIndex
                                          ? { ...r, pace: value }
                                          : r
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
                              <Box sx={{ width: 140 }}>
                                <TextField
                                  label='コーナー順位'
                                  value={race.cornerPassage}
                                  onChange={(e) => {
                                    const value = e.target.value;
                                    handleChangeEntry(index, 'recentRaces')(
                                      entry.recentRaces.map((r, i) =>
                                        i === raceIndex
                                          ? { ...r, cornerPassage: value }
                                          : r
                                      )
                                    );
                                  }}
                                  placeholder='例: 10-5-5-1'
                                  fullWidth
                                  error={Boolean(
                                    entryErrors[index]?.recentRaces?.[raceIndex]
                                      ?.cornerPassage
                                  )}
                                  helperText={
                                    entryErrors[index]?.recentRaces?.[raceIndex]
                                      ?.cornerPassage
                                  }
                                />
                              </Box>
                              <Box sx={{ width: 120 }}>
                                <TextField
                                  select
                                  label='クラス'
                                  value={race.raceClass ?? ''}
                                  onChange={(e) => {
                                    const value = e.target.value;
                                    handleChangeEntry(index, 'recentRaces')(
                                      entry.recentRaces.map((r, i) =>
                                        i === raceIndex
                                          ? { ...r, raceClass: value }
                                          : r
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
                                </TextField>
                              </Box>
                            </Box>
                          ))}
                        </Box>
                      </Collapse>
                    </Box>
                  </Box>
                </Box>
              ))}

              <Box>
                <Button variant='outlined' onClick={handleAddEntry}>
                  行を追加
                </Button>
              </Box>
            </Stack>
          </Stack>

        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>閉じる</Button>
        <Button variant='contained' onClick={handleDiagnose}>
          診断する
        </Button>
      </DialogActions>
    </Dialog>
  );
};
