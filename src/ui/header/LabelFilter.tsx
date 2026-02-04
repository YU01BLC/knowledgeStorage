import { useState } from 'react';
import TuneIcon from '@mui/icons-material/Tune';
import ClearAllIcon from '@mui/icons-material/ClearAll';
import {
  IconButton,
  Popover,
  Box,
  Chip,
  Typography,
  TextField,
} from '@mui/material';
import { Label } from '../../domain/schema';

type Props = {
  labels: Label[];
  selectedLabelIds: string[];
  onChange: (ids: string[]) => void;
};

export const LabelFilter = ({ labels, selectedLabelIds, onChange }: Props) => {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [labelSearch, setLabelSearch] = useState('');

  const open = Boolean(anchorEl);
  const normalizedSearch = labelSearch.trim().toLowerCase();
  const filteredLabels = labels.filter((label) =>
    normalizedSearch === ''
      ? true
      : label.name.toLowerCase().includes(normalizedSearch)
  );

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
        onClose={() => {
          setAnchorEl(null);
          setLabelSearch('');
        }}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Box p={2} maxWidth={320}>
          <Box display='flex' alignItems='center' gap={1} mb={1}>
            <TextField
              size='small'
              placeholder='ラベルを検索'
              value={labelSearch}
              onChange={(e) => setLabelSearch(e.target.value)}
              sx={{ flex: 1, minWidth: 160 }}
            />
            {selectedLabelIds.length > 0 && (
              <IconButton
                size='small'
                onClick={() => onChange([])}
                aria-label='ラベル選択をクリア'
              >
                <ClearAllIcon fontSize='small' />
              </IconButton>
            )}
          </Box>

          <Box display='flex' flexWrap='wrap' gap={1} mb={2}>
            {filteredLabels.map((label) => {
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

            {labels.length > 0 && filteredLabels.length === 0 && (
              <Typography variant='caption' color='text.secondary'>
                該当するラベルがありません
              </Typography>
            )}
          </Box>

 
        </Box>
      </Popover>
    </>
  );
};
