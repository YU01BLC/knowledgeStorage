import { Box, TextField, IconButton, Chip } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { useState } from 'react';
import { Label } from '../../domain/schema';
import { useDomainStore } from '../../stores/useDomainStore';
import { ConfirmDialog } from '../card/ConfirmDialog';

type Props = {
  label: Label;
};

export const LabelRow = ({ label }: Props) => {
  const { updateLabel, deleteLabel } = useDomainStore();

  const [editing, setEditing] = useState(false);
  const [draftName, setDraftName] = useState(label.name);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const commit = async () => {
    const trimmed = draftName.trim();

    if (!trimmed) {
      setConfirmOpen(true);
      return;
    }

    if (trimmed !== label.name) {
      await updateLabel({ ...label, name: trimmed });
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

      <ConfirmDialog
        open={confirmOpen}
        title='ラベル削除'
        message={`「${label.name}」を削除しますか？`}
        confirmLabel='削除'
        onConfirm={async () => {
          await deleteLabel(label.id);
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
