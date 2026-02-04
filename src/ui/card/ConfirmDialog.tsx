import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Stack,
} from '@mui/material';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';

type Props = {
  open: boolean;
  title: string;
  message: string;
  confirmLabel: string;
  tone?: 'warning' | 'info';
  onConfirm: () => void;
  onCancel: () => void;
};

export const ConfirmDialog = ({
  open,
  title,
  message,
  confirmLabel,
  tone = 'warning',
  onConfirm,
  onCancel,
}: Props) => {
  const isInfo = tone === 'info';

  return (
    <Dialog
      open={open}
      onClose={onCancel}
      maxWidth="xs"
      fullWidth
    >
      <DialogTitle>
        <Stack direction="row" spacing={1.5} alignItems="center">
          {isInfo ? (
            <InfoOutlinedIcon color="info" />
          ) : (
            <WarningAmberIcon color="error" />
          )}
          <Typography variant="h6" fontWeight={600}>
            {title}
          </Typography>
        </Stack>
      </DialogTitle>

      <DialogContent>
        <Typography
          variant="body1"
          color="text.secondary"
          sx={{ whiteSpace: 'pre-line', mt: 1 }}
        >
          {message}
        </Typography>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onCancel}>
          キャンセル
        </Button>
        <Button
          onClick={onConfirm}
          variant="contained"
          color={isInfo ? 'primary' : 'error'}
        >
          {confirmLabel}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
