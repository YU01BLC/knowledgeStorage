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
  labelName: string;
  onConfirm: () => void;
  onCancel: () => void;
};

export const ConfirmDeleteDialog = ({
  open,
  labelName,
  onConfirm,
  onCancel,
}: Props) => {
  return (
    <Dialog open={open} onClose={onCancel}>
      <DialogTitle>ラベル削除</DialogTitle>
      <DialogContent>
        <Typography>「{labelName}」を削除しますか？</Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={onCancel}>キャンセル</Button>
        <Button color='error' onClick={onConfirm}>
          削除
        </Button>
      </DialogActions>
    </Dialog>
  );
};
