import { Typography, Box, Paper, Skeleton } from '@mui/material';
import { RevenueInsight } from '../../types';
import { useRef } from 'react';
import { useMediaQuery, useTheme } from '@mui/material';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';

interface RevenueInsightsProps {
  insights?: RevenueInsight[];
  isLoading?: boolean;
}

export default function RevenueInsights({ insights, isLoading }: RevenueInsightsProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const desktopCardStyles = {
    p: 2,
    width: '500px',
    maxHeight: '250px',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
  };

  const mobileCardStyles = {
    p: 2
  };

  const cardStyles = isMobile ? mobileCardStyles : desktopCardStyles;

  const renderPlaceholderCard = () => (
    <Paper
      elevation={2}
      sx={cardStyles}
    >
      <Skeleton variant="text" width="80%" height={28} sx={{ mb: 2 }} />
      <Box sx={{ flex: 1, overflow: 'auto' }}>
        <Skeleton variant="text" width="100%" height={24} />
        <Skeleton variant="text" width="90%" height={24} />
        <Skeleton variant="text" width="95%" height={24} />
        <Skeleton variant="text" width="85%" height={24} />
        <Skeleton variant="text" width="90%" height={24} />
      </Box>
    </Paper>
  );

  const renderInsightCard = (insight: RevenueInsight) => (
    <Paper
      elevation={2}
      sx={cardStyles}
    >
      <Box sx={{ 
        flex: 1,
        overflow: 'auto',
        '&::-webkit-scrollbar': {
          width: '6px',
        },
        '&::-webkit-scrollbar-track': {
          background: 'transparent',
        },
        '&::-webkit-scrollbar-thumb': {
          background: theme.palette.grey[300],
          borderRadius: '3px',
          '&:hover': {
            background: theme.palette.grey[400],
          },
        },
      }}>
        <Typography 
          sx={{ 
            fontSize: '1rem',
            lineHeight: 1.5,
          }}
        >
          {insight.insight}
        </Typography>
      </Box>
    </Paper>
  );

  if (isMobile) {
    return (
      <Box sx={{ position: 'relative', width: '100%' }}>
        <Swiper
          modules={[Pagination]}
          spaceBetween={16}
          slidesPerView={1}
          pagination={{ clickable: true }}
          style={{ 
            padding: '16px 0 32px 0',
            cursor: 'grab',
            width: '100%'
          }}
        >
          {!insights?.length ? (
            <SwiperSlide>
              {renderPlaceholderCard()}
            </SwiperSlide>
          ) : (
            insights.map((insight, index) => (
              <SwiperSlide key={index}>
                {renderInsightCard(insight)}
              </SwiperSlide>
            ))
          )}
        </Swiper>
      </Box>
    );
  }

  return (
    <Box sx={{ 
      position: 'relative',
      width: '100%',
      height: '300px',
      mb: 4,
    }}>
      <Box sx={{
        display: 'flex',
        gap: 3,
        overflowX: 'auto',
        px: 3,
        pb: 2,
        '&::-webkit-scrollbar': {
          height: '6px',
        },
        '&::-webkit-scrollbar-track': {
          background: 'transparent',
        },
        '&::-webkit-scrollbar-thumb': {
          background: theme.palette.grey[300],
          borderRadius: '3px',
          '&:hover': {
            background: theme.palette.grey[400],
          },
        },
      }}>
        {!insights?.length ? (
          Array(3).fill(null).map((_, i) => (
            <Box key={i}>
              {renderPlaceholderCard()}
            </Box>
          ))
        ) : (
          insights.map((insight, index) => (
            <Box key={index}>
              {renderInsightCard(insight)}
            </Box>
          ))
        )}
      </Box>
    </Box>
  );
}
