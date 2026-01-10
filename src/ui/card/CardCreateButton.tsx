import { useState } from 'react';
import { Button } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { CardCreateDialog } from './CardCreateDialog';

export const CardCreateButton = () => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button
        variant='contained'
        startIcon={<AddIcon />}
        onClick={() => setOpen(true)}
        sx={{ alignSelf: 'flex-start' }}
      >
        カード作成
      </Button>

      <CardCreateDialog open={open} onClose={() => setOpen(false)} />
    </>
  );
};
