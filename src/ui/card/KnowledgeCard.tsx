import { Card, CardContent, Typography, Stack, Chip, Box } from '@mui/material';
import { Knowledge } from '../../domain/knowledge';

type Props = {
  knowledge: Knowledge;
};

export const KnowledgeCard = ({ knowledge }: Props) => {
  return (
    <Card
      sx={{
        height: '100%',
        cursor: 'pointer',
        transition: '0.2s',
        '&:hover': {
          transform: 'translateY(-2px)',
        },
      }}
    >
      <CardContent>
        <Stack spacing={1.5}>
          {/* Title */}
          <Typography variant='h6' noWrap>
            {knowledge.title}
          </Typography>

          {/* Description */}
          <Typography
            variant='body2'
            color='text.secondary'
            sx={{
              overflow: 'hidden',
              display: '-webkit-box',
              WebkitLineClamp: 3,
              WebkitBoxOrient: 'vertical',
            }}
          >
            {knowledge.description}
          </Typography>

          {/* Labels */}
          <Stack direction='row' spacing={1} pt={1} flexWrap='wrap'>
            {knowledge.labels.map((label) => (
              <Chip key={label} label={label} size='small' variant='outlined' />
            ))}
          </Stack>

          {/* Footer */}
          <Box textAlign='right'>
            <Typography variant='caption' color='text.secondary'>
              updated: {knowledge.updatedAt}
            </Typography>
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
};
