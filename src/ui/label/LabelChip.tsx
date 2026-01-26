import { Chip, ChipProps } from '@mui/material';
import { Label } from '../../domain/schema';

type LabelChipProps = {
  label: Label;
  onDelete?: () => void;
  selected?: boolean;
  size?: 'small' | 'medium';
} & Omit<ChipProps, 'label' | 'onDelete' | 'size'>;

export const LabelChip = ({
  label,
  onDelete,
  selected = false,
  size = 'small',
  ...chipProps
}: LabelChipProps) => {
  return (
    <Chip
      label={label.name}
      size={size}
      variant='outlined'
      onDelete={onDelete}
      sx={{
        borderColor: label.color,
        color: label.color,
        backgroundColor: selected
          ? label.color
          : onDelete
            ? `${label.color}12`
            : `${label.color}08`,
        fontWeight: 500,
        '&:hover': {
          backgroundColor: selected ? label.color : `${label.color}15`,
          borderColor: label.color,
        },
        ...(selected && {
          color: '#000',
          border: 'none',
        }),
        ...chipProps.sx,
      }}
      {...chipProps}
    />
  );
};
