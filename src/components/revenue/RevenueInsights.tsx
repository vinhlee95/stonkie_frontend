import { Typography, Box, Paper, Skeleton, IconButton, CircularProgress } from '@mui/material';
import { RevenueInsight } from '../../types';
import { useState, useRef, useEffect } from 'react';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import TipsAndUpdatesIcon from '@mui/icons-material/TipsAndUpdates';
import { useMediaQuery, useTheme } from '@mui/material';

interface RevenueInsightsProps {
  insights: RevenueInsight[] | undefined;
  isLoading: boolean;
}

export default function RevenueInsights({ insights, isLoading }: RevenueInsightsProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  };

  const handleNext = () => {
    if (insights && currentIndex < insights.length - 1) {
      setCurrentIndex(prev => prev + 1);
    }
  };

  // Auto-advance to new insights as they arrive
  useEffect(() => {
    if (insights && insights.length > 0 && currentIndex === insights.length - 2) {
      setCurrentIndex(insights.length - 1);
    }
  }, [insights?.length]);

  return (
    <Box sx={{ 
      position: 'relative',
      width: '100%',
      height: { xs: 'auto', md: '300px' }, 
      display: 'flex',
      alignItems: 'center'
    }}>
      <Box
        ref={containerRef}
        sx={{
          display: 'flex',
          gap: 2,
          height: '100%',
          width: '100%',
          overflowX: isMobile ? 'auto' : 'hidden', 
          overflowY: 'hidden',
          scrollSnapType: 'x mandatory',
          '&::-webkit-scrollbar': { display: 'none' },
          msOverflowStyle: 'none',
          scrollbarWidth: 'none',
          position: 'relative',
        }}
      >
        <Box sx={{
          display: 'flex',
          gap: 2,
          transition: 'transform 0.3s ease',
          transform: isMobile ? 'none' : `translateX(-${currentIndex * 42}%)`, 
          width: isMobile ? 'auto' : 'fit-content',
          height: '100%',
        }}>
          {isLoading && insights?.length === 0 ? (
            <Paper
              elevation={2}
              sx={{
                p: 3,
                width: isMobile ? '100%' : '40%',
                minWidth: isMobile ? '100%' : '40%',
                flex: isMobile ? 1 : 'none',
                scrollSnapAlign: 'start',
                height: { xs: 'auto', md: '280px' },
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <TipsAndUpdatesIcon sx={{ mr: 1 }} />
                <Skeleton width={200} />
              </Box>
              <Skeleton />
              <Skeleton />
              <Skeleton />
            </Paper>
          ) : (
            insights?.map((insight, index) => (
              <Paper
                key={index}
                elevation={2}
                sx={{
                  p: 3,
                  width: isMobile ? '100%' : '40%',
                  minWidth: isMobile ? '100%' : '40%',
                  flex: isMobile ? 1 : 'none',
                  scrollSnapAlign: 'start',
                  height: { xs: 'auto', md: '280px' },
                  opacity: currentIndex === index ? 1 : isMobile ? 1 : 0.6,
                  transform: `scale(${currentIndex === index ? 1 : isMobile ? 1 : 0.95})`,
                  transition: 'all 0.3s ease',
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <TipsAndUpdatesIcon sx={{ mr: 1 }} />
                  <Typography variant="h6">Insight {index + 1}</Typography>
                </Box>
                <Typography 
                  sx={{ 
                    flex: 1,
                    overflow: 'auto',
                    '&::-webkit-scrollbar': {
                      width: '8px',
                    },
                    '&::-webkit-scrollbar-track': {
                      background: theme.palette.background.default,
                      borderRadius: '4px',
                    },
                    '&::-webkit-scrollbar-thumb': {
                      background: theme.palette.primary.main,
                      borderRadius: '4px',
                      '&:hover': {
                        background: theme.palette.primary.dark,
                      },
                    },
                  }}
                >
                  {insight.insight}
                </Typography>
              </Paper>
            ))
          )}
          
          {isLoading && insights && insights.length > 0 && (
            <Paper
              elevation={2}
              sx={{
                p: 3,
                width: isMobile ? '100%' : '40%',
                minWidth: isMobile ? '100%' : '40%',
                flex: isMobile ? 1 : 'none',
                scrollSnapAlign: 'start',
                height: { xs: 'auto', md: '280px' },
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <TipsAndUpdatesIcon sx={{ mr: 1 }} />
                <Typography variant="h6">Generating more insights...</Typography>
              </Box>
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                flex: 1
              }}>
                <CircularProgress size={24} />
              </Box>
            </Paper>
          )}
        </Box>
      </Box>

      {!isMobile && insights && insights.length > 1 && (
        <>
          <IconButton
            onClick={handlePrevious}
            disabled={currentIndex === 0}
            sx={{
              position: 'absolute',
              left: -20,
              top: '50%',
              transform: 'translateY(-50%)',
              bgcolor: 'background.paper',
              boxShadow: 2,
              '&:hover': {
                bgcolor: 'background.paper',
              },
            }}
          >
            <ChevronLeftIcon />
          </IconButton>
          <IconButton
            onClick={handleNext}
            disabled={currentIndex === insights.length - 1}
            sx={{
              position: 'absolute',
              right: -20,
              top: '50%',
              transform: 'translateY(-50%)',
              bgcolor: 'background.paper',
              boxShadow: 2,
              '&:hover': {
                bgcolor: 'background.paper',
              },
            }}
          >
            <ChevronRightIcon />
          </IconButton>
        </>
      )}
    </Box>
  );
}
