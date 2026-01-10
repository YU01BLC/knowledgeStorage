import { Box, TextField, IconButton, Chip } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { useState } from 'react';
import { Label } from '../../domain/schema';
import { useDomainStore } from '../../stores/useDomainStore';
import { ConfirmDeleteDialog } from '../label/ConfirmDeleteDialog';

type Props = {
  label: Label;
};

export const LabelRow = ({ label }: Props) => {
  const { updateLabel, deleteLabel } = useDomainStore();

  const [editing, setEditing] = useState(false);
  const [draftName, setDraftName] = useState(label.name);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const commit = () => {
    const trimmed = draftName.trim();

    if (!trimmed) {
      setConfirmOpen(true);
      return;
    }

    if (trimmed !== label.name) {
      updateLabel({ ...label, name: trimmed });
    }

    setEditing(false);
  };

  const cancel = () => {
    setDraftName(label.name);
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
            label={label.name}
            onClick={() => setEditing(true)}
            variant='outlined'
            sx={{
              borderColor: label.color,
              color: label.color,
            }}
          />
        )}
      </Box>

      <ConfirmDeleteDialog
        open={confirmOpen}
        labelName={label.name}
        onCancel={() => {
          setConfirmOpen(false);
          cancel();
        }}
        onConfirm={() => {
          deleteLabel(label.id);
          setConfirmOpen(false);
        }}
      />
    </>
  );
};
