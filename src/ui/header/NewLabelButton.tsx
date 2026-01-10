type NewLabelButtonProps = {
  onClick: () => void;
};

export const NewLabelButton = ({ onClick }: NewLabelButtonProps) => {
  return (
    <button
      onClick={onClick}
      style={{
        padding: '6px 10px',
        borderRadius: 4,
        border: '1px solid #2563eb',
        backgroundColor: '#2563eb',
        color: '#ffffff',
        cursor: 'pointer',
      }}
    >
      + ラベル作成
    </button>
  );
};
