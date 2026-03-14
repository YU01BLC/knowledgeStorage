import {
  Box,
  Button,
  Stack,
  Typography,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TableSortLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Snackbar,
  Alert,
} from '@mui/material';
import { useEffect, useMemo, useState } from 'react';
import { z } from 'zod';
import { AllHorseDiagnosisDialog } from './AllHorseDiagnosisDialog';
import { useUIStore } from '../../stores/useUIStore';
import { DiagnosisPayload, ResultRow } from './types';
import { useDomainStore } from '../../stores/useDomainStore';

export const AllHorseDiagnosisPage = () => {
  const {
    diagnosisModalOpen,
    setDiagnosisModalOpen,
    activeDiagnosisId,
    setActiveDiagnosisId,
    setCurrentPage,
  } = useUIStore();
  const diagnosisRecords = useDomainStore((state) => state.diagnosisRecords);
  const saveDiagnosisRecord = useDomainStore(
    (state) => state.saveDiagnosisRecord,
  );
  const [results, setResults] = useState<ResultRow[]>([]);
  const [payload, setPayload] = useState<DiagnosisPayload | null>(null);
  const [promptOpen, setPromptOpen] = useState(false);
  const [resultJson, setResultJson] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [sortKey, setSortKey] = useState<'rating' | 'number'>('number');

  const sortedResults = useMemo(() => {
    const order = ['S', 'A', 'B', 'C', 'D'];
    return [...results].sort((a, b) => {
      if (sortKey === 'rating') {
        return order.indexOf(a.rating) - order.indexOf(b.rating);
      }
      return a.number - b.number;
    });
  }, [results, sortKey]);

  const resultSchema = useMemo(
    () =>
      z.object({
        results: z.array(
          z.object({
            rating: z.enum(['S', 'A', 'B', 'C', 'D']),
            number: z.union([z.number().int(), z.string()]),
            horseName: z.string().min(1),
            reason: z.string().min(1),
          }),
        ),
      }),
    [],
  );

  useEffect(() => {
    if (!activeDiagnosisId) {
      setResults([]);
      setPayload(null);
      return;
    }

    const record = diagnosisRecords.find(
      (item) => item.id === activeDiagnosisId,
    );
    if (!record) {
      setResults([]);
      setPayload(null);
      return;
    }

    setResults(
      record.results.map((row) => ({
        rating: row.rating,
        number:
          typeof row.number === 'string' ? Number(row.number) : row.number,
        horseName: row.horseName,
        reason: row.reason,
      })),
    );
    setPayload({
      ...record.payload,
      raceInfo: {
        ...record.payload.raceInfo,
        trackConfig: record.payload.raceInfo.trackConfig ?? null,
      },
      entries: record.payload.entries.map((entry) => ({
        ...entry,
        horseCardId: entry.horseCardId ?? null,
        horseInfo: entry.horseInfo
          ? {
              sire: entry.horseInfo.sire ?? null,
              dam: entry.horseInfo.dam ?? null,
              damSire: entry.horseInfo.damSire ?? null,
              offspringNames: entry.horseInfo.offspringNames ?? [],
            }
          : null,
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
  }, [activeDiagnosisId, diagnosisRecords]);

  const scriptText = useMemo(() => {
    return [
      'あなたはプロレベルの競馬分析AIです。',
      '人気や知名度ではなく「今回の条件で最もパフォーマンスが最大化する馬」を抽出してください。',

      '============================',
      '【絶対遵守事項】',
      '・必ず全馬のrecentRaces最大3走をすべて走査する。',
      '・distanceは必ず数値比較する（推測禁止）。',
      '・cornerPassageは必ず数値として解析する。',
      '・地方競馬成績も中央と同等に分析対象とする。',
      '・(出遅れ)(接触)(不利)などの不利情報を必ず検出する。',
      '・人気・オッズは一切評価に含めない。',
      '・入力データに存在しない情報（上がり・着差など）は使用禁止。',

      '============================',
      '【分析フロー】',

      'Step0: コース特性整理',
      '・raceInfo.course / trackType / courseDirection / distance を確認。',
      '・コースの特徴を整理する（小回り・直線長さ・坂有無）。',
      '・必要能力（持続力・瞬発力・パワー）を明示。',

      '============================',
      'Step1: 脚質分類（最重要）',
      '・recentRaces最大3走のcornerPassage平均位置で脚質を分類。',
      '',
      '平均位置',
      '2.9以下 → 逃げ',
      '3〜6 → 先行',
      '7〜10 → 差し',
      '11以上 → 追込',

      '============================',
      'Step2: 想定ペース算出',
      '・逃げ＋先行の頭数 ÷ 出走頭数 を計算。',
      '',
      '50%以上 → ハイペース',
      '30〜49% → ミドルペース',
      '29%以下 → スローペース',

      '============================',
      'Step3: 展開適性（30点・最重要）',
      '',
      'ハイペース',
      '→ 差し・追込有利',
      '',
      'スローペース',
      '→ 逃げ・先行有利',
      '',
      '評価ロジック',
      '・脚質が展開と一致 → 強加点',
      '・脚質が逆行 → 減点',
      '・展開逆行で好走歴あり → 加点',

      '============================',
      'Step4: 血統 × コース適性（20点）',
      '',
      'コース特性と血統の適合性を評価。',
      '',
      '小回り・コーナー多い',
      '→ 持続力型血統評価',
      '',
      '直線長い',
      '→ 瞬発力型血統評価',
      '',
      'ダート血統が芝出走',
      '→ 減点',

      '============================',
      'Step5: 距離適性（20点）',
      '',
      '・今回距離と過去距離を必ず数値比較する。',
      '',
      '評価基準',
      '・同距離好走歴 → 加点',
      '・距離延長',
      '  後半3ポジション以上上昇好走 → プラス',
      '  先行失速 → マイナス',
      '',
      '・距離短縮',
      '  先行好走 → プラス',
      '  差し届かず → プラス',

      '============================',
      'Step6: 直近内容精査（15点）',
      '',
      'cornerPassage順位推移を必ず分析する。',
      '',
      '評価基準',
      '・後半3ポジション以上順位上昇 → 末脚評価',
      '・展開逆行で好走 → 強評価',
      '',
      '【出遅れ補正】',
      '・単発出遅れ＋好走 → 加点',
      '・直近3走中2回以上出遅れ → 出遅れ癖として減点',
      '・逃げ/先行脚質で出遅れ癖 → 追加減点',
      '',
      '【不利補正】',
      '・(接触)(不利)＋順位上昇 → 能力評価',
      '・低レベル戦での不利は過剰評価しない',

      '============================',
      'Step7: クラス整合チェック（10点・補助評価）',
      '',
      'レースクラスを数値化して評価。',
      '',
      '中央G1=10',
      '中央G2=9',
      '中央G3=8',
      '中央L=7',
      '中央OP=6',
      '3勝=5',
      '2勝=4',
      '1勝=3',
      '未勝利=2',
      '新馬=1',
      '地方G1=8',
      '地方G2=7',
      '地方G3=6',
      '地方G=5',
      '地方G以下=3',
      '',
      '評価原則',
      '・クラスだけで評価しない',
      '・近走内容の裏付けとして使用',
      '',
      '減点条件',
      '・直近3走すべて今回より2段階以上下',
      '・G1連続大敗',
      '',
      '加点条件',
      '・同格レース好走歴',
      '・格上挑戦でも展開逆行好走',

      '============================',
      'Step8: 安定性（5点）',
      '',
      '直近3走平均着順を算出。',
      '',
      '平均着順',
      '3以内 → 高評価',
      '4〜7 → 標準',
      '8以上 → 減点',

      '============================',
      '【世代混合補正】',
      '',
      '・キャリア3戦以下の馬は成長余地としてクラス減点を最大半減。',
      '・6歳以上で直近成績下降傾向なら軽度減点。',

      '============================',
      '【配点】',
      '',
      '展開適性 30',
      '血統適性 20',
      '距離適性 20',
      '直近内容 15',
      'クラス整合 10',
      '安定性 5',
      '',
      '合計100点',

      '============================',
      '【ランク基準】',

      '90以上 S（最大2頭）',
      '75-89 A（最大4頭）',
      '60-74 B',
      '45-59 C',
      '44以下 D',

      '============================',
      '【出力制約】',

      '・全出走馬を必ず評価する。',
      '・results配列数は出走頭数と一致。',
      '・馬番号重複禁止。',
      '・同一入力は同一出力を返す。',

      '============================',
      '【reason記載順】',

      '①展開想定',
      '②脚質一致',
      '③血統適性',
      '④距離適性',
      '⑤直近内容',
      '⑥クラス整合',
      '⑦総括',

      '・内部配点やスコアは記載禁止。',
      '・各項目は改行して説明。',
      '・S評価は120文字以上。',

      '============================',
      '出力は以下JSONスキーマに厳密一致',

      '{ "results": [ { "rating": "S|A|B|C|D", "number": 1, "horseName": "馬名", "reason": "具体的根拠" } ] }',

      'JSONのみ出力。説明文は禁止。',
    ].join('\n');
  }, []);

  const payloadText = useMemo(
    () => (payload ? JSON.stringify(payload, null, 2) : ''),
    [payload],
  );

  const handleCopy = async (text: string) => {
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      setErrorMessage('クリップボードへのコピーに失敗しました');
    }
  };

  const applyResultText = (text: string) => {
    try {
      const parsed = resultSchema.parse(JSON.parse(text));
      const nextResults: ResultRow[] = parsed.results.map((row) => ({
        rating: row.rating,
        number:
          typeof row.number === 'string' ? Number(row.number) : row.number,
        horseName: row.horseName,
        reason: row.reason,
      }));
      if (nextResults.some((row) => Number.isNaN(row.number))) {
        throw new Error('番号が数値ではありません');
      }
      setResults(nextResults);
      setResultJson(text);
    } catch (error) {
      setResults([]);
      setErrorMessage('JSONの形式が正しくありません');
    }
  };

  const handleApplyResult = () => {
    if (!resultJson.trim()) {
      setErrorMessage('JSONが空です');
      return;
    }
    if (!payload) {
      setErrorMessage('入力データがありません');
      return;
    }

    let parsedResults: ResultRow[];
    try {
      const parsed = resultSchema.parse(JSON.parse(resultJson));
      parsedResults = parsed.results.map((row) => ({
        rating: row.rating,
        number:
          typeof row.number === 'string' ? Number(row.number) : row.number,
        horseName: row.horseName,
        reason: row.reason,
      }));
      if (parsedResults.some((row) => Number.isNaN(row.number))) {
        throw new Error('番号が数値ではありません');
      }
    } catch (error) {
      setErrorMessage('JSONの形式が正しくありません');
      return;
    }

    saveDiagnosisRecord({
      id: activeDiagnosisId ?? undefined,
      payload,
      results: parsedResults,
    })
      .then((recordId) => {
        setActiveDiagnosisId(recordId);
        setResults(parsedResults);
        setPromptOpen(false);
        setResultJson('');
      })
      .catch((error) => {
        console.error(error);
        setErrorMessage('診断結果の保存に失敗しました');
      });
  };

  return (
    <Box sx={{ p: 2 }}>
      <Stack spacing={2}>
        <Stack
          direction='row'
          spacing={2}
          alignItems='center'
          justifyContent='space-between'
        >
          <Typography variant='h6'>全頭診断</Typography>
          <Stack direction='row' spacing={1}>
            <Button
              variant='outlined'
              onClick={() => setCurrentPage('diagnosis-list')}
            >
              一覧へ戻る
            </Button>
            <Button
              variant='outlined'
              onClick={() => setDiagnosisModalOpen(true)}
            >
              条件を編集
            </Button>
          </Stack>
        </Stack>

        {payload && (
          <Stack spacing={0.5}>
            <Typography variant='subtitle2' sx={{ fontWeight: 600 }}>
              レース情報
            </Typography>
            <Typography variant='body2' color='text.secondary'>
              {[
                payload.raceInfo.date || '日付未設定',
                payload.raceInfo.course || '会場未設定',
                payload.raceInfo.raceName || 'レース名未設定',
                payload.raceInfo.raceClass || 'クラス未設定',
              ].join(' ・ ')}
            </Typography>
            <Typography variant='body2' color='text.secondary'>
              {[
                payload.raceInfo.trackType || 'コース種別未設定',
                payload.raceInfo.distance
                  ? `${payload.raceInfo.distance}m`
                  : '距離未設定',
                payload.raceInfo.courseDirection || '回り未設定',
                payload.raceInfo.trackConfig
                  ? `${payload.raceInfo.trackConfig}コース`
                  : 'コース区分未設定',
                payload.raceInfo.trackCondition || '馬場想定未設定',
              ].join(' ・ ')}
            </Typography>
          </Stack>
        )}

        {results.length > 0 ? (
          <Stack spacing={1}>
            <Typography variant='subtitle1' sx={{ fontWeight: 600 }}>
              診断結果
            </Typography>
            <Table size='small'>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ whiteSpace: 'nowrap' }}>
                    <TableSortLabel
                      active={sortKey === 'rating'}
                      direction='asc'
                      onClick={() => setSortKey('rating')}
                    >
                      評価
                    </TableSortLabel>
                  </TableCell>
                  <TableCell sx={{ whiteSpace: 'nowrap', width: 80 }}>
                    <TableSortLabel
                      active={sortKey === 'number'}
                      direction='asc'
                      onClick={() => setSortKey('number')}
                    >
                      番号
                    </TableSortLabel>
                  </TableCell>
                  <TableCell sx={{ whiteSpace: 'nowrap', width: 180 }}>
                    馬名
                  </TableCell>
                  <TableCell>根拠</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {sortedResults.map((row, idx) => (
                  <TableRow key={idx}>
                    <TableCell>{row.rating}</TableCell>
                    <TableCell sx={{ whiteSpace: 'nowrap' }}>
                      {row.number}
                    </TableCell>
                    <TableCell sx={{ whiteSpace: 'nowrap' }}>
                      {row.horseName}
                    </TableCell>
                    <TableCell sx={{ whiteSpace: 'pre-line' }}>
                      {row.reason}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Stack>
        ) : (
          <Typography color='text.secondary'>
            診断結果がありません。条件を編集して診断してください。
          </Typography>
        )}
      </Stack>

      <AllHorseDiagnosisDialog
        open={diagnosisModalOpen}
        onClose={() => setDiagnosisModalOpen(false)}
        onSubmitPayload={(nextPayload) => {
          setPayload(nextPayload);
          setPromptOpen(true);
          setResultJson('');
        }}
        initialData={payload}
      />

      <Dialog
        open={promptOpen}
        onClose={() => setPromptOpen(false)}
        fullWidth
        maxWidth='md'
      >
        <DialogTitle>AI診断用コピー</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button variant='outlined' onClick={() => handleCopy(scriptText)}>
                スクリプトをコピー
              </Button>
              <Button
                variant='outlined'
                onClick={() => handleCopy(payloadText)}
                disabled={!payloadText}
              >
                入力JSONをコピー
              </Button>
              <Button component='label' variant='outlined'>
                結果JSONを読み込み
                <input
                  type='file'
                  hidden
                  accept='application/json'
                  onChange={async (e) => {
                    const input = e.currentTarget;
                    const file = input.files?.[0];
                    if (!file) return;

                    try {
                      const text = await file.text();
                      applyResultText(text);
                    } catch {
                      setErrorMessage('JSONの読み込みに失敗しました');
                    } finally {
                      input.value = '';
                    }
                  }}
                />
              </Button>
            </Box>
            <TextField
              label='AIの返答JSON'
              value={resultJson}
              onChange={(e) => setResultJson(e.target.value)}
              placeholder='AIの返答JSONを貼り付けてください'
              multiline
              minRows={6}
              fullWidth
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPromptOpen(false)}>閉じる</Button>
          <Button variant='contained' onClick={handleApplyResult}>
            結果を反映
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={Boolean(errorMessage)}
        autoHideDuration={4000}
        onClose={() => setErrorMessage(null)}
      >
        <Alert severity='error' onClose={() => setErrorMessage(null)}>
          {errorMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};
