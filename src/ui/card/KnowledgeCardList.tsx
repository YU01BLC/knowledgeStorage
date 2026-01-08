import { Grid } from '@mui/material';
import { Knowledge } from '../../domain/knowledge';
import { KnowledgeCard } from './KnowledgeCard';

type Props = {
  items: Knowledge[];
};

export const KnowledgeCardList = ({ items }: Props) => {
  return (
    <Grid container spacing={2}>
      {items.map((item) => (
        <Grid size={{ xs: 12, sm: 6, md: 4 }} key={item.id}>
          <KnowledgeCard knowledge={item} />
        </Grid>
      ))}
    </Grid>
  );
};
