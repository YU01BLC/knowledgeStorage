import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
} from '@mui/material';

type Props = {
  open: boolean;
  cardTitle: string;
  onConfirm: () => void;
  onCancel: () => void;
};

export const CardDeleteConfirmDialog = ({
  open,
  cardTitle,
  onConfirm,
  onCancel,
}: Props) => {
  return (
    <Dialog open={open} onClose={onCancel}>
      <DialogTitle>カード削除</DialogTitle>
      <DialogContent>
        <Typography>「{cardTitle}」を削除しますか？</Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={onCancel}>キャンセル</Button>
        <Button color='error' variant='contained' onClick={onConfirm}>
          削除
        </Button>
      </DialogActions>
    </Dialog>
  );
};

