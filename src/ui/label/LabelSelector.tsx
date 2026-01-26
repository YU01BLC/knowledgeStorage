import { useMemo, useState } from 'react';
import {
  Autocomplete,
  TextField,
  Box,
  Stack,
  Button,
} from '@mui/material';
import { Label } from '../../domain/schema';
import { useDomainStore } from '../../stores/useDomainStore';
import { LabelChip } from './LabelChip';

type Props = {
  value: string[]; // ← labelIds
  onChange: (ids: string[]) => void;
};

export const LabelSelector = ({ value, onChange }: Props) => {
  const labels = useDomainStore((s) => s.labels);
  const addLabel = useDomainStore((s) => s.addLabel);

  /** 検索文字列 */
  const [inputValue, setInputValue] = useState('');

  /** 選択済みラベル */
  const selectedLabels = useMemo(
    () => labels.filter((l) => value.includes(l.id)),
    [labels, value]
  );

  /** 未選択ラベル */
  const selectableLabels = useMemo(
    () => labels.filter((l) => !value.includes(l.id)),
    [labels, value]
  );

  /** 新規作成可能か */
  const canCreate = useMemo(() => {
    const name = inputValue.trim();
    if (!name) return false;

    return !labels.some((l) => l.name.toLowerCase() === name.toLowerCase());
  }, [inputValue, labels]);

  /** 作成 & 即付与 */
  const createAndAttach = () => {
    const name = inputValue.trim();
    if (!canCreate) return;

    const id = crypto.randomUUID();
    addLabel({ id, name });

    onChange([...value, id]);
    setInputValue('');
  };

  return (
    <Box>
      <Autocomplete<Label, false, false, true>
        options={selectableLabels}
        freeSolo
        value={null}
        inputValue={inputValue}
        onInputChange={(_, newValue) => setInputValue(newValue)}
        onChange={(_, newValue) => {
          if (!newValue) return;

          // 既存ラベル
          if (typeof newValue !== 'string') {
            onChange([...value, newValue.id]);
            setInputValue('');
            return;
          }

          // Enter 作成
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
        renderOption={(props, option) => {
          const { key, ...rest } = props; // ← key分離（警告対策）
          return (
            <Box
              component='li'
              key={key}
              {...rest}
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
          );
        }}
        renderInput={(params) => (
          <TextField
            {...params}
            label='ラベル'
            placeholder='検索 or 作成'
            InputProps={{
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
            }}
          />
        )}
      />

      {/* 選択済みラベル（×あり） */}
      {selectedLabels.length > 0 && (
        <Stack
          direction='row'
          spacing={1}
          useFlexGap
          flexWrap='wrap'
          sx={{ mt: 1 }}
        >
          {selectedLabels.map((label) => (
            <LabelChip
              key={label.id}
              label={label}
              onDelete={() => onChange(value.filter((id) => id !== label.id))}
            />
          ))}
        </Stack>
      )}
    </Box>
  );
};
