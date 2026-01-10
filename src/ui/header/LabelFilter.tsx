import { useState } from 'react';
import TuneIcon from '@mui/icons-material/Tune';
import { IconButton, Popover, Box, Chip, Typography } from '@mui/material';

type Label = {
  id: string;
  name: string;
  color: string;
};

type Props = {
  labels: Label[];
  selectedLabelIds: string[];
  onChange: (ids: string[]) => void;
};

export const LabelFilter = ({ labels, selectedLabelIds, onChange }: Props) => {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

  const open = Boolean(anchorEl);

  const toggleLabel = (id: string) => {
    if (selectedLabelIds.includes(id)) {
      onChange(selectedLabelIds.filter((l) => l !== id));
    } else {
      onChange([...selectedLabelIds, id]);
    }
  };

  return (
    <>
      <IconButton onClick={(e) => setAnchorEl(e.currentTarget)}>
        <TuneIcon />
      </IconButton>

      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={() => setAnchorEl(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Box p={2} maxWidth={320}>
          <Typography variant='subtitle2' mb={1}>
            ラベルフィルター
          </Typography>

          <Box display='flex' flexWrap='wrap' gap={1}>
            {labels.map((label) => {
              const selected = selectedLabelIds.includes(label.id);
              return (
                <Chip
                  key={label.id}
                  label={label.name}
                  clickable
                  onClick={() => toggleLabel(label.id)}
                  sx={{
                    backgroundColor: selected ? label.color : 'transparent',
                    color: selected ? '#000' : undefined,
                    border: selected ? 'none' : `1px solid ${label.color}`,
                  }}
                />
              );
            })}
          </Box>
        </Box>
      </Popover>
    </>
  );
};
