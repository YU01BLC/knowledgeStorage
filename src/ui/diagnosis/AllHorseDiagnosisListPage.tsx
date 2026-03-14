import { Box, Button, Stack, Typography, Paper } from '@mui/material';
import { useDomainStore } from '../../stores/useDomainStore';
import { useUIStore } from '../../stores/useUIStore';

export const AllHorseDiagnosisListPage = () => {
  const diagnosisRecords = useDomainStore((state) => state.diagnosisRecords);
  const setCurrentPage = useUIStore((state) => state.setCurrentPage);
  const setActiveDiagnosisId = useUIStore((state) => state.setActiveDiagnosisId);
  const setDiagnosisModalOpen = useUIStore(
    (state) => state.setDiagnosisModalOpen
  );

  const sortedRecords = [...diagnosisRecords].sort(
    (a, b) => b.createdAt - a.createdAt
  );

  return (
    <Box sx={{ width: '100%' }}>
      <Stack spacing={2}>
        <Stack
          direction='row'
          spacing={2}
          alignItems='center'
          justifyContent='space-between'
        >
          <Typography variant='h6'>全頭診断</Typography>
          <Button
            variant='outlined'
            onClick={() => {
              setActiveDiagnosisId(null);
              setCurrentPage('diagnosis-result');
              setDiagnosisModalOpen(true);
            }}
          >
            新規診断
          </Button>
        </Stack>

        {sortedRecords.length === 0 ? (
          <Typography color='text.secondary'>
            診断履歴がありません。
          </Typography>
        ) : (
          <Stack spacing={2}>
            {sortedRecords.map((record) => (
              <Paper
                key={record.id}
                sx={{
                  p: 2,
                  borderRadius: 2,
                  cursor: 'pointer',
                  border: '1px solid rgba(255,255,255,0.12)',
                }}
                onClick={() => {
                  setActiveDiagnosisId(record.id);
                  setCurrentPage('diagnosis-result');
                }}
              >
                <Stack spacing={0.5}>
                  <Typography variant='subtitle1' sx={{ fontWeight: 600 }}>
                    {record.raceInfo.raceName || 'レース名未設定'}
                  </Typography>
                  <Typography variant='body2' color='text.secondary'>
                    {record.raceInfo.date || '日付未設定'} ・
                    {record.raceInfo.course || '会場未設定'}
                  </Typography>
                </Stack>
              </Paper>
            ))}
          </Stack>
        )}
      </Stack>
    </Box>
  );
};
