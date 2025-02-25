import { Typography, Box, Paper, Skeleton, IconButton } from '@mui/material';
import { RevenueInsight } from '../../types';
import { useState, useRef, useEffect } from 'react';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
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

  useEffect(() => {
    if (containerRef.current && insights && isMobile) {
      // Each card takes up 100% of container width
      const containerWidth = containerRef.current.offsetWidth;
      containerRef.current.scrollTo({
        left: currentIndex * containerWidth,
        behavior: 'smooth'
      });
    }
  }, [currentIndex, insights, isMobile]);

  // Reset index when insights change
  useEffect(() => {
    setCurrentIndex(0);
  }, [insights]);

  const renderSkeletons = () => (
    Array(4).fill(0).map((_, index) => (
      <Box 
        key={`skeleton-${index}`}
        sx={{ 
          width: { xs: '100%', md: 'auto' },
          flex: { xs: '0 0 100%', md: '0 0 auto' },
          minWidth: { md: '400px' },
          maxWidth: { md: '400px' },
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          px: { xs: 0, md: 0.5 }
        }}
      >
        <Paper
          elevation={2}
          sx={{
            px: { xs: 3, md: 2 },
            py: { xs: 3, md: 0 },
            borderRadius: 2,
            width: { xs: '90%', md: '400px' },
            height: { md: '200px' },
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            bgcolor: 'background.paper',
            border: '1px solid',
            borderColor: 'divider',
          }}
        >
          <Box sx={{ width: '100%' }}>
            <Skeleton variant="text" width="85%" height={24} sx={{ mb: 1 }} />
            <Skeleton variant="text" width="100%" />
            <Skeleton variant="text" width="90%" />
            <Skeleton variant="text" width="95%" />
            <Skeleton variant="text" width="88%" />
          </Box>
        </Paper>
      </Box>
    ))
  )

  return (
    <div>
      <Typography variant="h6" sx={{ mb: 2 }}>
        💡 Insights
      </Typography>
      <Box sx={{ 
        width: '100%',
        position: 'relative',
        overflow: { xs: 'hidden', md: 'visible' }
      }}>
      <Box
        ref={containerRef}
        sx={{
          display: 'flex',
          flexWrap: 'nowrap',
          gap: { xs: 0, md: 2 },
          overflowX: 'auto',
          scrollBehavior: 'smooth',
          position: 'relative',
          msOverflowStyle: { xs: 'none', md: 'auto' },
          scrollbarWidth: { xs: 'none', md: 'auto' },
          '&::-webkit-scrollbar': {
            display: 'none'
          },
          justifyContent: 'flex-start',
          width: '100%'
        }}
      >
        {isLoading ? renderSkeletons() : insights?.map((item, index) => (
          <Box 
            key={index} 
            sx={{ 
              width: { xs: '100%', md: 'auto' },
              flex: { xs: '0 0 100%', md: '0 0 auto' },
              minWidth: { md: '300px' },
              maxWidth: { md: '500px' },
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              px: { xs: 0, md: 0.5 }
            }}
          >
            <Paper
              elevation={2}
              sx={{
                px: { xs: 3, md: 2 },
                py: { xs: 3, md: 0 },
                borderRadius: 2,
                width: { xs: '90%', md: 'auto' },
                height: { md: '200px' },
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                bgcolor: 'background.paper',
                border: '1px solid',
                borderColor: 'divider',
                '&:hover': {
                  boxShadow: 6,
                  transform: 'translateY(-2px)',
                  transition: 'all 0.2s ease-in-out',
                  borderColor: 'primary.main'
                }
              }}
            >
              <Typography 
                variant="body1" 
                sx={{
                  whiteSpace: { md: 'normal' }
                }}
              >
                {item.insight}
              </Typography>
            </Paper>
          </Box>
        ))}
      </Box>
      </Box>
      {insights && insights.length > 0 && isMobile && (
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center',
          gap: 2, 
          mt: 1
        }}>
          <IconButton 
            onClick={handlePrevious}
            disabled={currentIndex === 0}
            sx={{ 
              bgcolor: 'background.paper',
              border: '1px solid',
              borderColor: 'divider',
              width: 32,
              height: 32,
              p: 0.5,
              transition: 'all 0.2s ease-in-out',
              '&:hover': {
                bgcolor: 'action.hover',
                transform: 'scale(1.1)'
              },
              '&:disabled': {
                opacity: 0.5,
                bgcolor: 'action.disabledBackground'
              }
            }}
          >
            <ChevronLeftIcon fontSize="small" />
          </IconButton>
          <Typography variant="body2" color="text.secondary" sx={{ minWidth: 40, textAlign: 'center' }}>
            {currentIndex + 1} / {insights.length}
          </Typography>
          <IconButton 
            onClick={handleNext}
            disabled={currentIndex === insights.length - 1}
            sx={{ 
              bgcolor: 'background.paper',
              border: '1px solid',
              borderColor: 'divider',
              width: 32,
              height: 32,
              p: 0.5,
              transition: 'all 0.2s ease-in-out',
              '&:hover': {
                bgcolor: 'action.hover',
                transform: 'scale(1.1)'
              },
              '&:disabled': {
                opacity: 0.5,
                bgcolor: 'action.disabledBackground'
              }
            }}
          >
            <ChevronRightIcon fontSize="small" />
          </IconButton>
        </Box>
      )}
    </div>
  );
}
