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
import { useEffect, useState } from 'react';
import { z } from 'zod';
import { useDomainStore } from '../../stores/useDomainStore';
import { normalizeKana } from '../../utils/kana';
import { DiagnosisPayload } from './types';
import { ConfirmDialog } from '../card/ConfirmDialog';

const TRACK_TYPES = ['芝', 'ダート', '障害'] as const;
const COURSE_DIRECTIONS = ['右回り', '左回り', '直線'] as const;
const TRACK_CONFIGS = ['A', 'B', 'C', 'D'] as const;
const TRACK_CONDITIONS = ['良', '稍重', '重', '不良'] as const;
const PACE_OPTIONS = ['ハイ', 'ミドル', 'スロー'] as const;
const RACE_INFO_CLASS_OPTIONS = [
  '新馬',
  '未勝利',
  '1勝',
  '2勝',
  '3勝',
  'OP',
  'L',
  'G3',
  'G2',
  'G1',
] as const;
const RACE_CLASS_OPTIONS = [
  '地方G以下',
  '地方G',
  '地方G3',
  '地方G2',
  '地方G1',
  '新馬',
  '未勝利',
  '1勝',
  '2勝',
  '3勝',
  'OP',
  'L',
  'G3',
  'G2',
  'G1',
] as const;
const FRAME_OPTIONS = Array.from({ length: 8 }, (_, i) => i + 1);
const NUMBER_OPTIONS = Array.from({ length: 18 }, (_, i) => i + 1);
const FINISH_OPTIONS = NUMBER_OPTIONS.map(String);

type Props = {
  open: boolean;
  onClose: () => void;
  onSubmitPayload: (payload: DiagnosisPayload) => void;
  initialData?: DiagnosisPayload | null;
};

type RecentRace = {
  finish: string;
  cornerPassage: string;
  pace: string;
  distance?: string;
  trackType?: string;
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

const cornerPassagePattern =
  /^(?:\d+(?:-\d+){1}|\d+(?:-\d+){2}|\d+(?:-\d+){3})(?:\([^()]+\))?$/;

const createRecentRaces = (): RecentRace[] => [
  {
    finish: '',
    cornerPassage: '',
    pace: '',
    distance: '',
    trackType: '',
    track: '',
    raceClass: '',
  },
  {
    finish: '',
    cornerPassage: '',
    pace: '',
    distance: '',
    trackType: '',
    track: '',
    raceClass: '',
  },
  {
    finish: '',
    cornerPassage: '',
    pace: '',
    distance: '',
    trackType: '',
    track: '',
    raceClass: '',
  },
];

const createEmptyRecentRace = (): RecentRace => ({
  finish: '',
  cornerPassage: '',
  pace: '',
  distance: '',
  trackType: '',
  track: '',
  raceClass: '',
});

const mergeRecentRaces = (
  races: DiagnosisPayload['entries'][number]['recentRaces']
) => {
  const base = createRecentRaces();
  return base.map((item, index) => ({
    ...item,
    ...races[index],
  }));
};

const RaceInfoSchema = z.object({
  date: z.string().min(1),
  course: z.string().min(1),
  raceName: z.string().min(1),
  raceClass: z.enum(RACE_INFO_CLASS_OPTIONS),
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
  onSubmitPayload,
  initialData = null,
}: Props) => {
  const { horseCards } = useDomainStore();
  const syncHorseRecentRaces = useDomainStore(
    (state) => state.syncHorseRecentRaces
  );

  const [date, setDate] = useState('');
  const [course, setCourse] = useState('');
  const [raceName, setRaceName] = useState('');
  const [raceClass, setRaceClass] = useState<
    (typeof RACE_INFO_CLASS_OPTIONS)[number] | ''
  >('');
  const [trackType, setTrackType] = useState<'芝' | 'ダート' | '障害' | ''>('');
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
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [addRaceConfirmIndex, setAddRaceConfirmIndex] = useState<number | null>(
    null
  );

  const STORAGE_KEY = 'all-horse-diagnosis-draft';

  const buildDraftPayload = (): DiagnosisPayload => ({
    raceInfo: {
      date,
      course,
      raceName,
      raceClass,
      trackType,
      distance,
      courseDirection,
      trackConfig: trackConfig === '' ? null : trackConfig,
      trackCondition,
    },
    entries: entries.map((entry) => ({
      frame: entry.frame,
      number: entry.number,
      horseName: entry.horseName,
      horseCardId: entry.horseCardId ?? null,
      horseInfo: null,
      recentRaces: entry.recentRaces.map((race) => ({
        finish: race.finish,
        distance: race.distance ?? '',
        trackType: race.trackType ?? '',
        track: race.track ?? '',
        pace: race.pace,
        cornerPassage: race.cornerPassage,
        raceClass: race.raceClass ?? '',
      })),
    })),
  });

  useEffect(() => {
    if (!open) return;
    if (!initialData) {
      setDate('');
      setCourse('');
      setRaceName('');
      setRaceClass('');
      setTrackType('');
      setDistance('');
      setCourseDirection('');
      setTrackConfig('');
      setTrackCondition('');
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
      setRaceErrors({});
      return;
    }

    setDate(initialData.raceInfo.date ?? '');
    setCourse(initialData.raceInfo.course ?? '');
    setRaceName(initialData.raceInfo.raceName ?? '');
    setRaceClass(
      (initialData.raceInfo.raceClass as
        | (typeof RACE_INFO_CLASS_OPTIONS)[number]
        | '') ?? ''
    );
    setTrackType(
      (initialData.raceInfo.trackType as '芝' | 'ダート' | '障害' | '') ?? ''
    );
    setDistance(initialData.raceInfo.distance ?? '');
    setCourseDirection(
      (initialData.raceInfo.courseDirection as '右回り' | '左回り' | '直線' | '') ??
        ''
    );
    setTrackConfig(
      (initialData.raceInfo.trackConfig as 'A' | 'B' | 'C' | 'D' | '') ?? ''
    );
    setTrackCondition(
      (initialData.raceInfo.trackCondition as '良' | '稍重' | '重' | '不良' | '') ??
        ''
    );

    setEntries(
      initialData.entries.map((entry) => ({
        frame: entry.frame,
        number: entry.number,
        horseName: entry.horseName,
        horseCardId: entry.horseCardId ?? undefined,
        recentRaces: mergeRecentRaces(entry.recentRaces),
      }))
    );
    setEntryErrors([]);
    setEntryScoresOpen(initialData.entries.map(() => false));
    setRaceErrors({});
  }, [open, initialData]);

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
    const matched =
      horseCards.find((c) => c.id === name) ||
      horseCards.find((c) => c.name === name) ||
      horseCards.find(
        (c) => normalizeKana(c.name) === normalizeKana(name)
      );

    setEntries((prev) =>
      prev.map((e, i) =>
        i === index
          ? {
              ...e,
              horseName: name,
              horseCardId: matched?.id,
              recentRaces: matched
                ? createRecentRaces().map((base, idx) => ({
                    ...base,
                    ...(matched.recentRaces[idx] ?? {}),
                  }))
                : e.recentRaces,
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

  const handleAddRecentRace = () => {
    if (addRaceConfirmIndex === null) return;
    setEntries((prev) =>
      prev.map((entry, idx) =>
        idx === addRaceConfirmIndex
          ? {
              ...entry,
              recentRaces: [
                createEmptyRecentRace(),
                ...entry.recentRaces.slice(0, 2),
              ],
            }
          : entry
      )
    );
    setAddRaceConfirmIndex(null);
  };

  const handleDiagnose = async () => {
    const input: RaceInfoInput = {
      date,
      course,
      raceName,
      raceClass: raceClass as RaceInfoInput['raceClass'],
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
          raceErrors.cornerPassage =
            '形式: X-X / X-X-X / X-X-X-X / X-X-X-X(注記)';
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

    const raceInfoPayload: DiagnosisPayload['raceInfo'] = {
      date,
      course,
      raceName,
      raceClass,
      trackType,
      distance,
      courseDirection,
      trackConfig: trackConfig === '' ? null : trackConfig,
      trackCondition,
    };

    const entriesPayload: DiagnosisPayload['entries'] = entries.map((entry) => {
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
            trackType: race.trackType ?? '',
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

    const payload: DiagnosisPayload = {
      raceInfo: raceInfoPayload,
      entries: entriesPayload,
    };

    await syncHorseRecentRaces(
      entries.map((entry) => ({
        horseCardId: entry.horseCardId ?? null,
        horseName: entry.horseName,
        recentRaces: entry.recentRaces,
      }))
    );

    onSubmitPayload(payload);
    onClose();
  };

  const handleSaveDraft = () => {
    try {
      const payload = buildDraftPayload();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
      setSaveMessage('保存しました');
    } catch {
      setSaveMessage('保存に失敗しました');
    }
  };

  const handleApplyDraft = () => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      setSaveMessage('保存データがありません');
      return;
    }
    try {
      const parsed = JSON.parse(raw) as DiagnosisPayload;
      setDate(parsed.raceInfo.date ?? '');
      setCourse(parsed.raceInfo.course ?? '');
      setRaceName(parsed.raceInfo.raceName ?? '');
      setRaceClass(
        (parsed.raceInfo.raceClass as
          | (typeof RACE_INFO_CLASS_OPTIONS)[number]
          | '') ?? ''
      );
      setTrackType(
        (parsed.raceInfo.trackType as '芝' | 'ダート' | '障害' | '') ?? ''
      );
      setDistance(parsed.raceInfo.distance ?? '');
      setCourseDirection(
        (parsed.raceInfo.courseDirection as '右回り' | '左回り' | '直線' | '') ??
          ''
      );
      setTrackConfig(
        (parsed.raceInfo.trackConfig as 'A' | 'B' | 'C' | 'D' | '') ?? ''
      );
      setTrackCondition(
        (parsed.raceInfo.trackCondition as '良' | '稍重' | '重' | '不良' | '') ??
          ''
      );
      setEntries(
        parsed.entries.map((entry) => ({
          frame: entry.frame,
          number: entry.number,
          horseName: entry.horseName,
          horseCardId: entry.horseCardId ?? undefined,
          recentRaces: mergeRecentRaces(entry.recentRaces),
        }))
      );
      setEntryErrors([]);
      setEntryScoresOpen(parsed.entries.map(() => false));
      setRaceErrors({});
      setSaveMessage('反映しました');
    } catch {
      setSaveMessage('保存データの読み込みに失敗しました');
    }
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
    setRaceClass('');
    setAddRaceConfirmIndex(null);
    onClose();
  };

  return (
    <>
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

            {/* 1行目: 日付 / 会場 / レース名 / クラス / コース種別 */}
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
                  label='クラス'
                  value={raceClass}
                  onChange={(e) => {
                    setRaceClass(
                      e.target.value as (typeof RACE_INFO_CLASS_OPTIONS)[number]
                    );
                    if (raceErrors.raceClass) {
                      setRaceErrors((prev) => ({
                        ...prev,
                        raceClass: undefined,
                      }));
                    }
                  }}
                  required
                  error={Boolean(raceErrors.raceClass)}
                  helperText={raceErrors.raceClass}
                  fullWidth
                >
                  {RACE_INFO_CLASS_OPTIONS.map((value) => (
                    <MenuItem key={value} value={value}>
                      {value}
                    </MenuItem>
                  ))}
                </TextField>
              </Box>
              <Box sx={{ width: 160 }}>
                <TextField
                  select
                  label='コース種別'
                  value={trackType}
                  onChange={(e) => {
                    setTrackType(
                      e.target.value as '芝' | 'ダート' | '障害' | ''
                    );
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
                  {TRACK_TYPES.map((value) => (
                    <MenuItem key={value} value={value}>
                      {value}
                    </MenuItem>
                  ))}
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
                  {COURSE_DIRECTIONS.map((value) => (
                    <MenuItem key={value} value={value}>
                      {value}
                    </MenuItem>
                  ))}
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
                  {TRACK_CONFIGS.map((value) => (
                    <MenuItem key={value} value={value}>
                      {value}
                    </MenuItem>
                  ))}
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
                  {TRACK_CONDITIONS.map((value) => (
                    <MenuItem key={value} value={value}>
                      {value}
                    </MenuItem>
                  ))}
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
                        {FRAME_OPTIONS.map((value) => (
                          <MenuItem key={value} value={value}>
                            {value}
                          </MenuItem>
                        ))}
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
                        {NUMBER_OPTIONS.map((value) => (
                          <MenuItem key={value} value={value}>
                            {value}
                          </MenuItem>
                        ))}
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
                        filterOptions={(options, params) => {
                          const input = normalizeKana(params.inputValue);
                          if (!input) return options;
                          return options.filter((name) =>
                            normalizeKana(name).includes(input)
                          );
                        }}
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
                      <Box sx={{ display: 'flex', gap: 1 }}>
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
                        {entryScoresOpen[index] ? (
                          <Button
                            size='small'
                            variant='outlined'
                            onClick={() => setAddRaceConfirmIndex(index)}
                          >
                            成績を追加
                          </Button>
                        ) : null}
                      </Box>
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
                                  {FINISH_OPTIONS.map((value) => (
                                    <MenuItem key={value} value={value}>
                                      {value}
                                    </MenuItem>
                                  ))}
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
                              <Box sx={{ width: 140 }}>
                                <TextField
                                  select
                                  label='コース種別'
                                  value={race.trackType ?? ''}
                                  onChange={(e) => {
                                    const value = e.target.value;
                                    handleChangeEntry(index, 'recentRaces')(
                                      entry.recentRaces.map((r, i) =>
                                        i === raceIndex
                                          ? { ...r, trackType: value }
                                          : r
                                      )
                                    );
                                  }}
                                  fullWidth
                                >
                                  <MenuItem value=''>未設定</MenuItem>
                                  {TRACK_TYPES.map((value) => (
                                    <MenuItem key={value} value={value}>
                                      {value}
                                    </MenuItem>
                                  ))}
                                </TextField>
                              </Box>
                              <Box sx={{ width: 120 }}>
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
                                  {TRACK_CONDITIONS.map((value) => (
                                    <MenuItem key={value} value={value}>
                                      {value}
                                    </MenuItem>
                                  ))}
                                </TextField>
                              </Box>
                              <Box sx={{ width: 110 }}>
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
                                  {PACE_OPTIONS.map((value) => (
                                    <MenuItem key={value} value={value}>
                                      {value}
                                    </MenuItem>
                                  ))}
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
                              <Box sx={{ width: 140 }}>
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
                                  {RACE_CLASS_OPTIONS.map((value) => (
                                    <MenuItem key={value} value={value}>
                                      {value}
                                    </MenuItem>
                                  ))}
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
        {saveMessage && (
          <Typography variant='caption' color='text.secondary' sx={{ mr: 1 }}>
            {saveMessage}
          </Typography>
        )}
        <Button variant='outlined' onClick={handleSaveDraft}>
          一時保存
        </Button>
        <Button variant='outlined' onClick={handleApplyDraft}>
          保存を反映
        </Button>
        <Button onClick={handleClose}>閉じる</Button>
        <Button variant='contained' onClick={handleDiagnose}>
          診断する
        </Button>
        </DialogActions>
      </Dialog>

      <ConfirmDialog
        open={addRaceConfirmIndex !== null}
        title='成績を追加しますか？'
        message='一番古い成績が削除されます。よろしいですか？'
        confirmLabel='追加'
        onConfirm={handleAddRecentRace}
        onCancel={() => setAddRaceConfirmIndex(null)}
      />
    </>
  );
};
