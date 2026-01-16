import { useState } from 'react';
import { Button } from '@mui/material';
import { CardCreateDialog } from '../card/CardCreateDialog';

export const CardCreateButton = () => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button variant='contained' onClick={() => setOpen(true)}>
        カード作成
      </Button>

      <CardCreateDialog open={open} onClose={() => setOpen(false)} />
    </>
  );
};
