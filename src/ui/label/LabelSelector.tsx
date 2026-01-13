import { useMemo, useState } from 'react';
import {
  Autocomplete,
  TextField,
  Chip,
  Box,
  Stack,
  Button,
} from '@mui/material';
import { Label } from '../../domain/schema';
import { useDomainStore } from '../../stores/useDomainStore';

type Props = {
  value: Label[];
  onChange: (labels: Label[]) => void;
};

export const LabelSelector = ({ value, onChange }: Props) => {
  const labels = useDomainStore((s) => s.labels);
  const addLabel = useDomainStore((s) => s.addLabel);

  /** 検索文字列（制御） */
  const [inputValue, setInputValue] = useState('');

  /**
   * 選択済みラベルを除外
   */
  const selectableLabels = useMemo(() => {
    const selectedIds = new Set(value.map((l) => l.id));
    return labels.filter((l) => !selectedIds.has(l.id));
  }, [labels, value]);

  /**
   * 新規作成可能か
   */
  const canCreate = useMemo(() => {
    const name = inputValue.trim();
    if (!name) return false;

    return !labels.some((l) => l.name.toLowerCase() === name.toLowerCase());
  }, [inputValue, labels]);

  /**
   * 作成 & 即付与
   */
  const createAndAttach = () => {
    const name = inputValue.trim();
    if (!name || !canCreate) return;

    const id = crypto.randomUUID();
    addLabel({ id, name });

    const created = useDomainStore.getState().labels.find((l) => l.id === id);

    if (created) {
      onChange([...value, created]);
    }

    // 選択後は検索欄をクリア
    setInputValue('');
  };

  return (
    <Box>
      <Autocomplete<Label, false, false, true>
        options={selectableLabels}
        freeSolo
        value={null}
        inputValue={inputValue}
        onInputChange={(_, newValue) => {
          setInputValue(newValue);
        }}
        onChange={(_, newValue) => {
          if (!newValue) return;

          // 既存ラベル選択
          if (typeof newValue !== 'string') {
            onChange([...value, newValue]);
            setInputValue('');
            return;
          }

          // Enter による作成
          createAndAttach();
        }}
        getOptionLabel={(option) =>
          typeof option === 'string' ? option : option.name
        }
        filterOptions={(options, params) => {
          const input = params.inputValue.trim().toLowerCase();
          if (!input) return options;

          return options.filter((o) => o.name.toLowerCase().includes(input));
        }}
        renderOption={(props, option) => (
          <Box
            component='li'
            {...props}
            sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
          >
            <Box
              sx={{
                width: 10,
                height: 10,
                borderRadius: '50%',
                bgcolor: option.color,
              }}
            />
            {option.name}
          </Box>
        )}
        renderInput={(params) => (
          <TextField
            {...params}
            label='ラベル'
            placeholder='検索 or 作成'
            slotProps={{
              input: {
                ...params.InputProps,
                endAdornment: (
                  <>
                    {canCreate && (
                      <Button
                        size='small'
                        onClick={createAndAttach}
                        sx={{ mr: 1, whiteSpace: 'nowrap' }}
                      >
                        作成
                      </Button>
                    )}
                    {params.InputProps.endAdornment}
                  </>
                ),
              },
            }}
          />
        )}
      />

      {/* 選択済みラベル */}
      {value.length > 0 && (
        <Stack
          direction='row'
          spacing={1}
          useFlexGap
          flexWrap='wrap'
          sx={{ mt: 1 }}
        >
          {value.map((label) => (
            <Chip
              key={label.id}
              label={label.name}
              onDelete={() => onChange(value.filter((l) => l.id !== label.id))}
              variant='outlined'
              sx={{
                borderColor: label.color,
                color: label.color,
                backgroundColor: `${label.color}12`,
                fontWeight: 500,
              }}
            />
          ))}
        </Stack>
      )}
    </Box>
  );
};
