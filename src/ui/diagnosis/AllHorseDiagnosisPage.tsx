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
} from '@mui/material';
import { useState } from 'react';
import { AllHorseDiagnosisDialog, ResultRow } from './AllHorseDiagnosisDialog';
import { useUIStore } from '../../stores/useUIStore';

export const AllHorseDiagnosisPage = () => {
  const { diagnosisModalOpen, setDiagnosisModalOpen } = useUIStore();
  const [results, setResults] = useState<ResultRow[]>([]);

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
        </Box>

        {results.length > 0 && (
          <Stack spacing={1}>
            <Typography variant='subtitle1' sx={{ fontWeight: 600 }}>
              診断結果
            </Typography>
            <Table size='small'>
              <TableHead>
                <TableRow>
                  <TableCell>評価(S~D)</TableCell>
                  <TableCell>番号</TableCell>
                  <TableCell>馬名</TableCell>
                  <TableCell>根拠</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {results.map((row, idx) => (
                  <TableRow key={idx}>
                    <TableCell>{row.rating}</TableCell>
                    <TableCell>{row.number}</TableCell>
                    <TableCell>{row.horseName}</TableCell>
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
        onDiagnose={(nextResults) => setResults(nextResults)}
      />
    </Box>
  );
};
