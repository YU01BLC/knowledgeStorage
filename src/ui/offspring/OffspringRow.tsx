import { Box, TextField, IconButton, Chip } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { useState } from 'react';
import { Offspring } from '../../domain/offspringSchema';
import { useDomainStore } from '../../stores/useDomainStore';
import { ConfirmDialog } from '../card/ConfirmDialog';

type Props = {
  offspring: Offspring;
};

export const OffspringRow = ({ offspring }: Props) => {
  const { updateOffspring, deleteOffspring } = useDomainStore();
  const [editing, setEditing] = useState(false);
  const [draftName, setDraftName] = useState(offspring.name);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const commit = async () => {
    const trimmed = draftName.trim();
    if (!trimmed) {
      setConfirmOpen(true);
      return;
    }

    if (trimmed !== offspring.name) {
      await updateOffspring({ ...offspring, name: trimmed });
    }
    setEditing(false);
  };

  const cancel = () => {
    setDraftName(offspring.name);
    setEditing(false);
  };

  return (
    <>
      <Box>
        {editing ? (
          <Box display='flex' alignItems='center'>
            <TextField
              size='small'
              value={draftName}
              autoFocus
              onChange={(e) => setDraftName(e.target.value)}
              onBlur={cancel}
              onKeyDown={(e) => {
                if (e.key === 'Enter') commit();
                if (e.key === 'Escape') cancel();
              }}
            />
            <IconButton
              size='small'
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => setConfirmOpen(true)}
            >
              <CloseIcon fontSize='small' />
            </IconButton>
          </Box>
        ) : (
          <Chip
            label={offspring.name}
            onClick={() => setEditing(true)}
            variant='outlined'
          />
        )}
      </Box>

      <ConfirmDialog
        open={confirmOpen}
        title='生産削除'
        message={`「${offspring.name}」を削除しますか？`}
        confirmLabel='削除'
        onConfirm={async () => {
          await deleteOffspring(offspring.id);
          setConfirmOpen(false);
        }}
        onCancel={() => {
          setConfirmOpen(false);
          cancel();
        }}
      />
    </>
  );
};
