import { Grid, Stack } from '@mui/material';
import { KnowledgeCard } from './card';
import { useDomainStore } from '../../stores/useDomainStore';

export const KnowledgeCardList = () => {
  const { cards, selectedLabelIds, searchText } = useDomainStore();

  const normalizedSearch = searchText.trim();

  const filteredCards = cards.filter((card) => {
    // 🔍 検索（前後一致）
    const textMatch =
      normalizedSearch === '' || card.title.includes(normalizedSearch);
    // 🏷 ラベルフィルタ（1つでも一致すればOK）
    const labelMatch =
      selectedLabelIds.length === 0 ||
      card.labelIds.some((id) => selectedLabelIds.includes(id));

    return textMatch && labelMatch;
  });

  return (
    <Stack spacing={3}>
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
