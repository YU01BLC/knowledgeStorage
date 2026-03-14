import { useEffect, useMemo, useState } from 'react';
import { Autocomplete, TextField, Box, Button } from '@mui/material';
import { useDomainStore } from '../../stores/useDomainStore';
import { generateId } from '../../domain/id';
import { Offspring } from '../../domain/offspringSchema';
import { normalizeKana } from '../../utils/kana';

type Props = {
  value: string;
  onChange: (value: string) => void;
  label?: string;
};

export const OffspringSelector = ({ value, onChange, label = '生産' }: Props) => {
  const offspring = useDomainStore((s) => s.offspring);
  const addOffspring = useDomainStore((s) => s.addOffspring);
  const [inputValue, setInputValue] = useState(value);

  const selected = useMemo(
    () => offspring.find((o) => o.name === value) ?? null,
    [offspring, value]
  );

  const canCreate = useMemo(() => {
    const name = inputValue.trim();
    if (!name) return false;
    return !offspring.some(
      (o) => normalizeKana(o.name) === normalizeKana(name)
    );
  }, [inputValue, offspring]);

  const createAndSelect = async () => {
    const name = inputValue.trim();
    if (!canCreate) return;
    await addOffspring({ id: generateId(), name });
    onChange(name);
    setInputValue(name);
  };

  useEffect(() => {
    setInputValue(value);
  }, [value]);

  const commitInput = () => {
    const trimmed = inputValue.trim();
    if (!trimmed) return;
    if (trimmed === value) return;
    onChange(trimmed);
  };

  return (
    <Autocomplete<Offspring, false, false, true>
      options={offspring}
      freeSolo
      value={selected}
      inputValue={inputValue}
      onInputChange={(_, newValue) => setInputValue(newValue)}
      onChange={(_, newValue) => {
        if (!newValue) {
          onChange('');
          return;
        }

        if (typeof newValue !== 'string') {
          onChange(newValue.name);
          setInputValue(newValue.name);
          return;
        }

        createAndSelect();
      }}
      getOptionLabel={(option) =>
        typeof option === 'string' ? option : option.name
      }
      filterOptions={(options, params) => {
        const input = normalizeKana(params.inputValue);
        if (!input) return options;
        return options.filter((o) => normalizeKana(o.name).includes(input));
      }}
      renderOption={(props, option) => {
        const { key, ...rest } = props;
        return (
          <Box component='li' key={key} {...rest}>
            {option.name}
          </Box>
        );
      }}
      renderInput={(params) => (
        <TextField
          {...params}
          label={label}
          placeholder='検索 or 作成'
          onBlur={commitInput}
          InputProps={{
            ...params.InputProps,
            endAdornment: (
              <>
                {canCreate && (
                  <Button
                    size='small'
                    onClick={createAndSelect}
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
  );
};
