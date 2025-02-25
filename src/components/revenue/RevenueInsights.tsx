import { Typography, Box, Paper, Skeleton, IconButton } from '@mui/material';
import { RevenueInsight } from '../../types';
import { useState, useRef, useEffect } from 'react';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';

interface RevenueInsightsProps {
  insights: RevenueInsight[] | undefined;
  isLoading: boolean;
}

export default function RevenueInsights({ insights, isLoading }: RevenueInsightsProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

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
    if (containerRef.current && insights) {
      // Each card takes up 100% of container width
      const containerWidth = containerRef.current.offsetWidth;
      containerRef.current.scrollTo({
        left: currentIndex * containerWidth,
        behavior: 'smooth'
      });
    }
  }, [currentIndex, insights]);

  // Reset index when insights change
  useEffect(() => {
    setCurrentIndex(0);
  }, [insights]);

  const renderSkeletons = () => (
    Array(4).fill(0).map((_, index) => (
      <Box 
        key={`skeleton-${index}`}
        sx={{ 
          width: '100%',
          flex: '0 0 100%',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <Paper
          elevation={2}
          sx={{
            p: 3,
            borderRadius: 2,
            width: '90%',
            bgcolor: 'background.paper',
            border: '1px solid',
            borderColor: 'divider',
          }}
        >
          <Skeleton variant="text" width="60%" height={24} sx={{ mb: 1 }} />
          <Skeleton variant="text" width="100%" />
          <Skeleton variant="text" width="100%" />
          <Skeleton variant="text" width="80%" />
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
        overflow: 'hidden'
      }}>
      <Box
        ref={containerRef}
        sx={{
          display: 'flex',
          overflowX: 'auto',
          pb: 2,
          scrollBehavior: 'smooth',
          position: 'relative',
          msOverflowStyle: 'none',  // Hide scrollbar in IE/Edge
          scrollbarWidth: 'none',   // Hide scrollbar in Firefox
          '&::-webkit-scrollbar': { // Hide scrollbar in Chrome/Safari
            display: 'none'
          },
          width: '100%'
        }}
      >
        {isLoading ? renderSkeletons() : insights?.map((item, index) => (
          <Box 
            key={index} 
            sx={{ 
              width: '100%',
              flex: '0 0 100%',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
          <Paper
            elevation={2}
            sx={{
              p: 3,
              borderRadius: 2,
              width: '90%',
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
            <Typography variant="body1">
              {item.insight}
            </Typography>
          </Paper>
          </Box>
        ))}
      </Box>
      </Box>
      {insights && insights.length > 0 && (
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
