import { Grid, Stack } from '@mui/material';
import { useDomainStore } from '../../stores/useDomainStore';
import { HorseCardItem } from './HorseCardItem';
import { normalizeKana } from '../../utils/kana';

export const HorseCardList = () => {
  const { horseCards, searchText } = useDomainStore();

  const normalizedSearch = normalizeKana(searchText);

  const filteredCards = horseCards.filter((card) => {
    if (!normalizedSearch) return true;
    return normalizeKana(card.name).includes(normalizedSearch);
  });

  return (
    <Stack spacing={3}>
      {filteredCards.length === 0 ? (
        <Stack alignItems='center' spacing={2} sx={{ py: 8 }}>
          <p>馬情報カードがありません</p>
        </Stack>
      ) : (
        <Grid container spacing={2}>
          {filteredCards.map((card) => (
            <Grid size={{ xs: 12, sm: 6, md: 3 }} key={card.id}>
              <HorseCardItem card={card} />
            </Grid>
          ))}
        </Grid>
      )}
    </Stack>
  );
};
