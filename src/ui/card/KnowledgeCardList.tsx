import { Grid, Stack } from '@mui/material';
import { KnowledgeCard } from './KnowledgeCard';
import { useDomainStore } from '../../stores/useDomainStore';

export const KnowledgeCardList = () => {
  const { cards, selectedLabelIds } = useDomainStore();

  // ラベルフィルタリング
  const filteredCards =
    selectedLabelIds.length === 0
      ? cards
      : cards.filter((card) =>
          card.labelIds.some((id) => selectedLabelIds.includes(id))
        );

  return (
    <Stack spacing={3}>
      {/* Card Grid */}
      {filteredCards.length === 0 ? (
        <Stack alignItems='center' spacing={2} sx={{ py: 8 }}>
          <p>カードがありません</p>
        </Stack>
      ) : (
        <Grid container spacing={3}>
          {filteredCards.map((card) => (
            <Grid size={{ xs: 12, sm: 6, md: 4 }} key={card.id}>
              <KnowledgeCard card={card} />
            </Grid>
          ))}
        </Grid>
      )}
    </Stack>
  );
};
