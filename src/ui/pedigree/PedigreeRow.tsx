import { Box, TextField, IconButton, Chip } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { useState } from 'react';
import { Pedigree } from '../../domain/pedigreeSchema';
import { useDomainStore } from '../../stores/useDomainStore';
import { ConfirmDialog } from '../card/ConfirmDialog';

type Props = {
  pedigree: Pedigree;
};

export const PedigreeRow = ({ pedigree }: Props) => {
  const { updatePedigree, deletePedigree } = useDomainStore();
  const [editing, setEditing] = useState(false);
  const [draftName, setDraftName] = useState(pedigree.name);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const commit = async () => {
    const trimmed = draftName.trim();
    if (!trimmed) {
      setConfirmOpen(true);
      return;
    }

    if (trimmed !== pedigree.name) {
      await updatePedigree({ ...pedigree, name: trimmed });
    }
    setEditing(false);
  };

  const cancel = () => {
    setDraftName(pedigree.name);
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
            label={pedigree.name}
            onClick={() => setEditing(true)}
            variant='outlined'
          />
        )}
      </Box>

      <ConfirmDialog
        open={confirmOpen}
        title='血統削除'
        message={`「${pedigree.name}」を削除しますか？`}
        confirmLabel='削除'
        onConfirm={async () => {
          await deletePedigree(pedigree.id);
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
