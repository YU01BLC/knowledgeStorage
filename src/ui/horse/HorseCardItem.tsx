import {
  Card,
  CardContent,
  Stack,
  Typography,
  Box,
  useTheme,
  alpha,
  Button,
  Collapse,
} from '@mui/material';
import { useState } from 'react';
import { HorseCard } from '../../domain/horseSchema';
import { HorseCardEditDialog } from './HorseCardEditDialog';

type Props = {
  card: HorseCard;
};

export const HorseCardItem = ({ card }: Props) => {
  const theme = useTheme();
  const [editOpen, setEditOpen] = useState(false);
  const [resultsOpen, setResultsOpen] = useState(false);

  const hasRecentRaces = card.recentRaces.some((race) =>
    Object.values(race).some((value) => value.trim() !== '')
  );

  return (
    <>
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
            <Stack
              direction='row'
              alignItems='center'
              justifyContent='space-between'
              gap={1}
            >
              <Typography variant='subtitle1' sx={{ fontWeight: 700 }}>
                {card.name}
              </Typography>
              <Button
                size='small'
                variant='outlined'
                onClick={() => setEditOpen(true)}
              >
                編集
              </Button>
            </Stack>

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
              生産
            </Typography>
            {card.offspringNames.length > 0 ? (
              <Stack direction='row' spacing={0.5} alignItems='center' sx={{ mt: 0.5 }}>
                <Box
                  sx={{
                    px: 0.75,
                    py: 0.25,
                    borderRadius: 999,
                    display: 'inline-block',
                    bgcolor: alpha(theme.palette.primary.main, 0.15),
                    color: theme.palette.primary.main,
                    fontSize: '0.75rem',
                  }}
                >
                  {card.offspringNames[0]}
                </Box>
                {card.offspringNames.length > 1 && (
                  <Typography variant='caption' color='text.secondary'>
                    +{card.offspringNames.length - 1}
                  </Typography>
                )}
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

            <Box>
              <Typography variant='caption' color='text.secondary'>
                成績
              </Typography>
              <Box sx={{ mt: 0.5 }}>
                <Button
                  size='small'
                  variant='outlined'
                  onClick={() => setResultsOpen((prev) => !prev)}
                >
                  {resultsOpen ? '成績を隠す' : '成績を表示'}
                </Button>
              </Box>
              <Collapse in={resultsOpen}>
                <Stack spacing={0.5} sx={{ mt: 1 }}>
                  {hasRecentRaces ? (
                    card.recentRaces.map((race, index) => (
                      <Typography
                        key={index}
                        variant='body2'
                        color='text.secondary'
                      >
                        {`${index + 1}走前: ${
                          [
                            race.finish && `着順${race.finish}`,
                            race.distance && `${race.distance}m`,
                            race.trackType,
                            race.track && `馬場${race.track}`,
                            race.pace && `ペース${race.pace}`,
                            race.cornerPassage && `通過${race.cornerPassage}`,
                            race.raceClass && `クラス${race.raceClass}`,
                          ]
                            .filter(Boolean)
                            .join(' / ') || '未入力'
                        }`}
                      </Typography>
                    ))
                  ) : (
                    <Typography variant='body2' color='text.secondary'>
                      未入力
                    </Typography>
                  )}
                </Stack>
              </Collapse>
            </Box>
          </Stack>
        </CardContent>
      </Card>

      <HorseCardEditDialog
        open={editOpen}
        card={card}
        onClose={() => setEditOpen(false)}
      />
    </>
  );
};
