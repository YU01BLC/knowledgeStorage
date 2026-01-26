import { useState } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Stack,
  Box,
  Divider,
  useTheme,
  alpha,
} from '@mui/material';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import ArticleIcon from '@mui/icons-material/Article';
import { Card as CardType } from '../../domain/schema';
import { useDomainStore } from '../../stores/useDomainStore';
import { CardDetailDialog } from './CardDetailDialog';
import { formatRelativeTime, formatDateTime } from '../../utils/dateUtils';
import { LabelChip } from '../label/LabelChip';
import { MAX_BODY_LINES, CARD_HEIGHT } from './constants';

type Props = {
  card: CardType;
};

export const KnowledgeCard = ({ card }: Props) => {
  const { labels } = useDomainStore();
  const theme = useTheme();
  const [detailOpen, setDetailOpen] = useState(false);

  const cardLabels = labels.filter((label) => card.labelIds.includes(label.id));
  const updatedAtDate = formatDateTime(card.updatedAt);
  const relativeTime = formatRelativeTime(card.updatedAt);

  const bodyText = card.body || '内容がありません';

  return (
    <>
      <Card
        elevation={2}
        onClick={() => setDetailOpen(true)}
        sx={{
          height: CARD_HEIGHT,
          width: '100%',
          maxWidth: '100%',
          minWidth: 0,
          display: 'flex',
          flexDirection: 'column',
          cursor: 'pointer',
          position: 'relative',
          overflow: 'hidden',
          background:
            theme.palette.mode === 'dark'
              ? `linear-gradient(145deg, ${
                  theme.palette.background.paper
                } 0%, ${alpha(theme.palette.primary.main, 0.05)} 100%)`
              : `linear-gradient(145deg, ${
                  theme.palette.background.paper
                } 0%, ${alpha(theme.palette.primary.main, 0.02)} 100%)`,
          border: `1px solid ${alpha(theme.palette.divider, 0.8)}`,
          borderRadius: 3,
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          boxShadow: `0 2px 8px ${alpha(
            theme.palette.common.black,
            theme.palette.mode === 'dark' ? 0.3 : 0.1
          )}`,
          '&:hover': {
            elevation: 8,
            transform: 'translateY(-8px) scale(1.01)',
            boxShadow: `0 12px 24px ${alpha(
              theme.palette.common.black,
              theme.palette.mode === 'dark' ? 0.4 : 0.15
            )}`,
            borderColor: alpha(theme.palette.primary.main, 0.5),
            background:
              theme.palette.mode === 'dark'
                ? `linear-gradient(145deg, ${
                    theme.palette.background.paper
                  } 0%, ${alpha(theme.palette.primary.main, 0.1)} 100%)`
                : `linear-gradient(145deg, ${
                    theme.palette.background.paper
                  } 0%, ${alpha(theme.palette.primary.main, 0.05)} 100%)`,
          },
        }}
      >
        <CardContent
          sx={{
            flexGrow: 1,
            display: 'flex',
            flexDirection: 'column',
            p: 2.5,
            height: '100%',
            overflow: 'hidden',
            width: '100%',
            minWidth: 0,
            boxSizing: 'border-box',
          }}
        >
          <Stack
            spacing={2}
            sx={{
              height: '100%',
              overflow: 'hidden',
              width: '100%',
              minWidth: 0,
            }}
          >
            {/* Title with Icon */}
            <Box
              sx={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: 1.5,
                pb: 0.5,
                minWidth: 0,
                width: '100%',
              }}
            >
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 36,
                  height: 36,
                  borderRadius: 2,
                  backgroundColor: alpha(theme.palette.primary.main, 0.1),
                  flexShrink: 0,
                }}
              >
                <ArticleIcon
                  sx={{
                    fontSize: 20,
                    color: 'primary.main',
                  }}
                />
              </Box>
              <Typography
                variant='h6'
                component='h3'
                sx={{
                  fontWeight: 700,
                  lineHeight: 1.4,
                  overflow: 'hidden',
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  flex: 1,
                  fontSize: '1.1rem',
                  minWidth: 0,
                }}
              >
                {card.title.length > 30
                  ? `${card.title.slice(0, 30)}…`
                  : card.title}
              </Typography>
            </Box>

            <Divider sx={{ my: 0.5 }} />

            {/* Body with fixed height */}
            <Box
              sx={{
                flexGrow: 1,
                minHeight: 0,
                display: 'flex',
                flexDirection: 'column',
                position: 'relative',
                width: '100%',
                minWidth: 0,
              }}
            >
              <Box
                sx={{
                  position: 'relative',
                  flex: 1,
                  width: '100%',
                  minWidth: 0,
                }}
              >
                <Typography
                  variant='body2'
                  color='text.secondary'
                  sx={{
                    overflow: 'hidden',
                    display: '-webkit-box',
                    WebkitLineClamp: MAX_BODY_LINES,
                    WebkitBoxOrient: 'vertical',
                    lineHeight: 1.7,
                    wordBreak: 'break-word',
                    wordWrap: 'break-word',
                    overflowWrap: 'break-word',
                    flex: 1,
                    whiteSpace: 'normal',
                    minWidth: 0,
                    width: '100%',
                  }}
                >
                  {bodyText}
                </Typography>
              </Box>
            </Box>

            {/* Labels */}
            {cardLabels.length > 0 && (
              <Stack
                direction='row'
                spacing={1}
                useFlexGap
                flexWrap='wrap'
                sx={{ mt: 'auto', pt: 1 }}
              >
                {cardLabels.map((label) => (
                  <LabelChip key={label.id} label={label} />
                ))}
              </Stack>
            )}

            {/* Footer */}
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-end',
                gap: 0.5,
                pt: 1,
                borderTop: `1px solid ${theme.palette.divider}`,
                mt: 'auto',
              }}
            >
              <AccessTimeIcon
                sx={{ fontSize: 14, color: 'text.secondary', opacity: 0.7 }}
              />
              <Typography
                variant='caption'
                color='text.secondary'
                title={updatedAtDate}
                sx={{ fontSize: '0.75rem' }}
              >
                {relativeTime}
              </Typography>
            </Box>
          </Stack>
        </CardContent>
      </Card>

      <CardDetailDialog
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
        card={card}
      />
    </>
  );
};
