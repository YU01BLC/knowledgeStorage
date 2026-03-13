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
import { useMemo, useState } from 'react';
import { z } from 'zod';
import { AllHorseDiagnosisDialog } from './AllHorseDiagnosisDialog';
import { useUIStore } from '../../stores/useUIStore';
import { DiagnosisPayload, ResultRow } from './types';

export const AllHorseDiagnosisPage = () => {
  const { diagnosisModalOpen, setDiagnosisModalOpen } = useUIStore();
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

  const scriptText = useMemo(() => {
    return [
      'あなたはプロレベルの競馬分析AIです。',
      '人気や知名度ではなく「今回の条件で最もパフォーマンスが最大化する馬」を抽出してください。',
      '',
      '============================',
      '【絶対遵守事項】',
      '・必ず全馬のrecentRaces最大3走をすべて走査する。',
      '・distanceは必ず数値比較する（推測禁止）。',
      '・同距離実績があるか必ず確認する。',
      '・地方競馬成績も中央と同等に分析対象とする。',
      '・cornerPassageは必ず数値として解析する。',
      '・(出遅れ)(◯角不利)(接触)などの不利情報を必ず検出する。',
      '・人気・オッズは一切評価に含めない。',
      '',
      '============================',
      '【分析フロー】',
      '',
      'Step0: コース特性整理',
      '・会場、回り（右左）、直線長さ、坂有無、小回りかどうかを整理。',
      '・求められる能力（持続力・瞬発力・パワー）を明示。',
      '',
      'Step1: 脚質分類',
      '・recentRaces最大3走のcornerPassage平均位置で分類。',
      '・平均2.9以下=逃げ',
      '・3〜6=先行',
      '・7〜10=差し',
      '・11以上=追込',
      '',
      'Step2: 想定ペース算出',
      '・逃げ＋先行の合計頭数 ÷ 出走頭数 を計算。',
      '・50%以上 → ハイ',
      '・30〜49% → ミドル',
      '・29%以下 → スロー',
      '',
      'Step3: 展開適性（30点）',
      '・ハイ→差し追込有利',
      '・スロー→逃げ先行有利',
      '・展開逆行好走は加点対象。',
      '',
      'Step4: 距離適性（25点）',
      '・今回距離と過去距離差を必ず数値計算。',
      '・同距離3着以内は高評価。',
      '・後半3ポジション以上上昇して好走→距離延長プラス。',
      '・先行失速→距離延長マイナス。',
      '',
      'Step5: 血統×コース適性（15点）',
      '・小回り＋坂→持続力型・パワー型血統評価。',
      '・直線長い→瞬発力型評価。',
      '・ダート血統で芝は減点。',
      '',
      'Step6: 直近内容精査（15点）',
      '・cornerPassage順位推移を数値解析。',
      '',
      '【出遅れ補正】',
      '・単発出遅れ＋高レベル好走は評価上昇。',
      '・直近3走中2回以上出遅れは出遅れ癖として減点。',
      '・逃げ/先行脚質で出遅れ癖は展開リスクとしてさらに減点。',
      '',
      '【不利補正】',
      '・(◯角不利)(接触)＋後半3ポジション以上上昇→能力評価。',
      '・低レベル戦では過剰評価しない。',
      '',
      '【レースレベル数値（中央＋地方統一）】',
      'G1=10',
      'G2=9',
      'G3=8',
      'L=7',
      'OP=6',
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
      '・高レベル戦での不利好走は強評価。',
      '・未勝利/新馬での不利好走は小評価。',
      '',
      'Step7: 基礎能力（10点）',
      '・重賞実績を確認。',
      '',
      'Step8: 安定性（5点）',
      '・直近3走平均着順算出。',
      '・二桁着順多い馬は減点。',
      '',
      '============================',
      '【固定配点厳守】',
      '展開30 / 距離25 / 血統15 / 直近内容15 / 基礎能力10 / 安定性5',
      '必ず数値算出後にランク変換。',
      '',
      '【ランク基準】',
      '90以上=S（最大2頭）',
      '75-89=A（最大4頭）',
      '60-74=B',
      '45-59=C',
      '44以下=D',
      '',
      '============================',
      '【出力完全制約】',
      '・入力JSON内の全出走馬を必ず評価。',
      '・results配列数は出走頭数と一致。',
      '・馬番号重複禁止。',
      '・同一入力は同一出力を返すこと。',
      '',
      '============================',
      '【reason記載順】',
      '①展開想定',
      '②脚質一致',
      '③距離適性',
      '④血統適性',
      '⑤不利補正含む直近内容',
      '⑥総括',
      '・内部加点表記禁止。',
      '・reasonは各項目を改行して出力すること（例: ①...\\n②... の形式）。',
      '・S評価は120文字以上。',
      '',
      '============================',
      '以下のJSONを分析し、次のJSONスキーマに厳密一致させること。',
      '',
      '{ "results": [ { "rating": "S|A|B|C|D", "number": 1, "horseName": "馬名", "reason": "具体的根拠" } ] }',
      '',
      '出力はJSONのみ。説明文は禁止。',
    ].join('\\n');
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
      setPromptOpen(false);
      setResultJson('');
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
    applyResultText(resultJson);
  };

  return (
    <Box sx={{ p: 2 }}>
      <Stack spacing={2}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Typography variant='h6'>全頭診断</Typography>
          <Button
            variant='outlined'
            onClick={() => setDiagnosisModalOpen(true)}
          >
            条件を編集
          </Button>
          <Button
            variant='outlined'
            onClick={() => setPromptOpen(true)}
          >
            JSON読み込み
          </Button>
        </Box>

        {results.length > 0 && (
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
                    <TableCell>{row.reason}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Stack>
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
