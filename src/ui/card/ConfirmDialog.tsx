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

type Props = {
  open: boolean;
  title: string;
  message: string;
  confirmLabel: string;
  onConfirm: () => void;
  onCancel: () => void;
};

export const ConfirmDialog = ({
  open,
  title,
  message,
  confirmLabel,
  onConfirm,
  onCancel,
}: Props) => {
  return (
    <Dialog
      open={open}
      onClose={onCancel}
      maxWidth="xs"
      fullWidth
    >
      <DialogTitle>
        <Stack direction="row" spacing={1.5} alignItems="center">
          <WarningAmberIcon color="error" />
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
          color="error"
        >
          {confirmLabel}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
