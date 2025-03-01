import React from 'react'
import { Typography, Box, Paper, Skeleton, IconButton, CircularProgress } from '@mui/material';
import { RevenueInsight } from '../../types';
import { useState, useRef, useEffect } from 'react';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import TipsAndUpdatesIcon from '@mui/icons-material/TipsAndUpdates';
import AutoGraphIcon from '@mui/icons-material/AutoGraph';
import TimelineIcon from '@mui/icons-material/Timeline';
import ShowChartIcon from '@mui/icons-material/ShowChart';
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

  // Auto-advance to new insights as they arrive
  useEffect(() => {
    if (insights && insights.length > 0 && currentIndex === insights.length - 2) {
      setCurrentIndex(insights.length - 1);
    }
  }, [insights?.length]);

  return (
    <Box sx={{ position: 'relative', width: '100%' }}>
      <Box
        ref={containerRef}
        sx={{
          display: 'flex',
          gap: 2,
          overflowX: isMobile ? 'auto' : 'visible',
          scrollSnapType: 'x mandatory',
          '&::-webkit-scrollbar': { display: 'none' },
          msOverflowStyle: 'none',
          scrollbarWidth: 'none',
        }}
      >
        {isLoading && insights?.length === 0 ? (
          <Paper
            elevation={2}
            sx={{
              p: 3,
              minWidth: isMobile ? '100%' : 'auto',
              flex: 1,
              scrollSnapAlign: 'start',
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
                minWidth: isMobile ? '100%' : 'auto',
                flex: 1,
                scrollSnapAlign: 'start',
                opacity: currentIndex === index ? 1 : isMobile ? 1 : 0.6,
                transform: currentIndex === index ? 'scale(1)' : isMobile ? 'scale(1)' : 'scale(0.95)',
                transition: 'all 0.3s ease',
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <TipsAndUpdatesIcon sx={{ mr: 1 }} />
                <Typography variant="h6">Insight {index + 1}</Typography>
              </Box>
              <Typography>{insight.insight}</Typography>
            </Paper>
          ))
        )}
        
        {isLoading && insights && insights.length > 0 && (
          <Paper
            elevation={2}
            sx={{
              p: 3,
              minWidth: isMobile ? '100%' : 'auto',
              flex: 1,
              scrollSnapAlign: 'start',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <TipsAndUpdatesIcon sx={{ mr: 1 }} />
              <Typography variant="h6">Generating more insights...</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', py: 2 }}>
              <CircularProgress size={24} />
            </Box>
          </Paper>
        )}
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
            }}
          >
            <ChevronRightIcon />
          </IconButton>
        </>
      )}
    </Box>
  );
}
