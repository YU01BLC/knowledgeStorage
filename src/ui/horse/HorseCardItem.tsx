import { Card, CardContent, Stack, Typography, Box, useTheme, alpha } from '@mui/material';
import { HorseCard } from '../../domain/horseSchema';

type Props = {
  card: HorseCard;
};

export const HorseCardItem = ({ card }: Props) => {
  const theme = useTheme();

  return (
    <Card
      elevation={1}
      sx={{
        height: '100%',
        cursor: 'default',
        borderRadius: 2,
        border: `1px solid ${alpha(theme.palette.divider, 0.8)}`,
        background:
          theme.palette.mode === 'dark'
            ? alpha(theme.palette.background.paper, 0.9)
            : theme.palette.background.paper,
      }}
    >
      <CardContent sx={{ p: 2 }}>
        <Stack spacing={1.5}>
          <Typography variant='subtitle1' sx={{ fontWeight: 700 }}>
            {card.name}
          </Typography>

          <Box>
            <Typography variant='caption' color='text.secondary'>
              血統
            </Typography>
            <Stack spacing={0.5} sx={{ mt: 0.5 }}>
              {card.sire && (
                <Typography variant='body2'>父: {card.sire}</Typography>
              )}
              {card.dam && (
                <Typography variant='body2'>母: {card.dam}</Typography>
              )}
              {card.damSire && (
                <Typography variant='body2'>母父: {card.damSire}</Typography>
              )}
              {!card.sire && !card.dam && !card.damSire && (
                <Typography variant='body2' color='text.secondary'>
                  未入力
                </Typography>
              )}
            </Stack>
          </Box>

          <Box>
            <Typography variant='caption' color='text.secondary'>
              産駒
            </Typography>
            {card.offspringNames.length > 0 ? (
              <Stack
                direction='row'
                spacing={0.5}
                useFlexGap
                flexWrap='wrap'
                sx={{ mt: 0.5 }}
              >
                {card.offspringNames.map((name) => (
                  <Box
                    key={name}
                    sx={{
                      px: 0.75,
                      py: 0.25,
                      borderRadius: 999,
                      bgcolor: alpha(theme.palette.primary.main, 0.15),
                      color: theme.palette.primary.main,
                      fontSize: '0.75rem',
                    }}
                  >
                    {name}
                  </Box>
                ))}
              </Stack>
            ) : (
              <Typography
                variant='body2'
                color='text.secondary'
                sx={{ mt: 0.5 }}
              >
                未入力
              </Typography>
            )}
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
};

