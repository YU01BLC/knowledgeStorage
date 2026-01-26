import { Box, Typography } from '@mui/material';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import { formatDateTimeDetailed, formatRelativeTime } from '../../utils/dateUtils';

type DateTimeDisplayProps = {
  updatedAt: number;
  createdAt: number;
};

export const DateTimeDisplay = ({
  updatedAt,
  createdAt,
}: DateTimeDisplayProps) => {
  const updatedAtDate = formatDateTimeDetailed(updatedAt);
  const createdAtDate = formatDateTimeDetailed(createdAt);
  const relativeTime = formatRelativeTime(updatedAt);

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: 1,
        pt: 1,
        borderTop: (theme) => `1px solid ${theme.palette.divider}`,
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <AccessTimeIcon
          sx={{ fontSize: 16, color: 'text.secondary', opacity: 0.7 }}
        />
        <Typography variant='body2' color='text.secondary'>
          <strong>更新:</strong> {updatedAtDate} ({relativeTime})
        </Typography>
      </Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <AccessTimeIcon
          sx={{ fontSize: 16, color: 'text.secondary', opacity: 0.7 }}
        />
        <Typography variant='body2' color='text.secondary'>
          <strong>作成:</strong> {createdAtDate}
        </Typography>
      </Box>
    </Box>
  );
};
