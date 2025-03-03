import { Typography, Box, Paper, Skeleton } from '@mui/material';
import { useMediaQuery, useTheme } from '@mui/material';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination } from 'swiper/modules';
import TipsAndUpdatesOutlinedIcon from '@mui/icons-material/TipsAndUpdatesOutlined';
import ShowChartIcon from '@mui/icons-material/ShowChart';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import AirlineSeatFlatSharpIcon from '@mui/icons-material/AirlineSeatFlatSharp'
import MonetizationOnOutlinedIcon from '@mui/icons-material/MonetizationOnOutlined';
import { useMemo } from 'react';
import 'swiper/css';
import 'swiper/css/pagination';

interface RevenueInsightsProps {
  insights?: string[];
}

export default function RevenueInsights({ insights }: RevenueInsightsProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const desktopCardStyles = {
    p: 0,
    pt: 2,
    pb: 2,
    width: '500px',
    maxHeight: '280px',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    borderRadius: 2,
  };

  const mobileCardStyles = {
    p: 0,
    pt: 1.5,
    pb: 1.5,
    maxHeight: '250px',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    borderRadius: 2,
  };

  const cardStyles = isMobile ? mobileCardStyles : desktopCardStyles;

  const scrollableContentStyles = {
    flex: 1,
    overflow: 'auto',
    px: 2,
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
  };

  const positions = useMemo(() => [
    // Bottom right
    { right: -20, bottom: -20, left: 'auto', top: 'auto', rotate: -15 },
    { right: -30, bottom: -10, left: 'auto', top: 'auto', rotate: -25 },
    // Top right
    { right: -25, top: -20, left: 'auto', bottom: 'auto', rotate: 15 },
    { right: -15, top: -25, left: 'auto', bottom: 'auto', rotate: 25 },
    // Bottom left
    { left: -20, bottom: -20, right: 'auto', top: 'auto', rotate: 15 },
    { left: -25, bottom: -15, right: 'auto', top: 'auto', rotate: 25 },
    // Top left
    { left: -15, top: -20, right: 'auto', bottom: 'auto', rotate: -25 },
    { left: -25, top: -15, right: 'auto', bottom: 'auto', rotate: -15 },
  ], []);

  const backgroundIcons = useMemo(() => [
    ShowChartIcon,
    TipsAndUpdatesOutlinedIcon,
    TrendingUpIcon,
    MonetizationOnOutlinedIcon,
    AirlineSeatFlatSharpIcon
  ], []);

  const getPositionAndIcon = useMemo(() => (index: number) => {
    return {
      position: positions[index],
      Icon: backgroundIcons[index],
    };
  }, [positions, backgroundIcons]);

  const renderPlaceholderCard = (index: number) => {
    const { position, Icon } = getPositionAndIcon(index);
    return (
      <Paper
        elevation={1}
        sx={{
          ...cardStyles,
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <Box sx={{
          position: 'absolute',
          right: position.right,
          bottom: position.bottom,
          left: position.left,
          top: position.top,
          opacity: theme.palette.mode === 'light' ? 0.15 : 0.12,
          transform: `rotate(${position.rotate}deg)`,
          color: theme.palette.mode === 'light'
            ? theme.palette.primary.light
            : theme.palette.primary.main,
          '& svg': {
            fontSize: '150px',
          }
        }}>
          <Icon />
        </Box>
        <Box sx={{ px: 2, py: 2 }}>
          <Skeleton variant="text" width="80%" height={28} sx={{ mb: 2 }} />
        </Box>
        <Box sx={scrollableContentStyles}>
          <Skeleton variant="text" width="100%" height={24} />
          <Skeleton variant="text" width="90%" height={24} />
          <Skeleton variant="text" width="95%" height={24} />
          <Skeleton variant="text" width="85%" height={24} />
          <Skeleton variant="text" width="90%" height={24} />
        </Box>
      </Paper>
    );
  };

  const renderInsightCard = (insight: string, index: number) => {
    const { position, Icon } = getPositionAndIcon(index);
    return (
      <Paper
        elevation={1}
        sx={{
          ...cardStyles,
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <Box sx={{
          position: 'absolute',
          right: position.right,
          bottom: position.bottom,
          left: position.left,
          top: position.top,
          opacity: theme.palette.mode === 'light' ? 0.15 : 0.12,
          transform: `rotate(${position.rotate}deg)`,
          color: theme.palette.mode === 'light'
            ? theme.palette.primary.light
            : theme.palette.primary.main,
          '& svg': {
            fontSize: '150px',
          }
        }}>
          <Icon />
        </Box>
        <Box sx={scrollableContentStyles}>
          <Typography
            sx={{
              fontSize: '1rem',
              lineHeight: 1.5,
              position: 'relative',
              zIndex: 1,
            }}
          >
            {insight}
          </Typography>
        </Box>
      </Paper>
    );
  };

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
              {renderPlaceholderCard(0)}
            </SwiperSlide>
          ) : (
            insights.map((insight, index) => (
              <SwiperSlide key={index}>
                {renderInsightCard(insight, index)}
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
    }}>
      <Box sx={{
        display: 'flex',
        gap: 3,
        overflowX: 'auto',
        px: 3,
        pb: 2,
        pl: 0,
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
        {Array(5).fill(null).map((_, i) => {
          const insight = insights?.[i];
          return (
            <Box key={i}>
              {insight ? renderInsightCard(insight, i) : renderPlaceholderCard(i)}
            </Box>
          );
        })}
      </Box>
    </Box>
  );
}
