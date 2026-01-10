type SearchInputProps = {
  value: string;
  onChange: (value: string) => void;
};

export const SearchInput = ({ value, onChange }: SearchInputProps) => {
  return (
    <input
      type='text'
      placeholder='検索（レース名・メモなど）'
      value={value}
      onChange={(e) => onChange(e.target.value)}
      style={{
        padding: '6px 8px',
        minWidth: 240,
        border: '1px solid #d1d5db',
        borderRadius: 4,
      }}
    />
  );
};
