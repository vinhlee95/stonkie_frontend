import { Typography, Box, Paper, Skeleton } from '@mui/material';
import { RevenueInsight } from '../../types';

interface RevenueInsightsProps {
  insights: RevenueInsight[] | undefined;
  isLoading: boolean;
}

export default function RevenueInsights({ insights, isLoading }: RevenueInsightsProps) {
  const renderSkeletons = () => (
    Array(4).fill(0).map((_, index) => (
      <Paper
        key={`skeleton-${index}`}
        elevation={2}
        sx={{
          p: 3,
          borderRadius: 2,
          minWidth: '300px',
          maxWidth: '400px',
          flex: '0 0 auto',
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
    ))
  )

  return (
    <div>
      <Typography variant="h6" sx={{ mb: 2 }}>
        💡 Insights
      </Typography>
      <Box
        sx={{
          display: 'flex',
          gap: 2,
          overflowX: 'auto',
          pb: 2,
          scrollBehavior: 'smooth',
          position: 'relative',
          '&::after': {
            content: '""',
            position: 'absolute',
            right: 0,
            top: 0,
            bottom: 8,
            width: '60px',
            background: 'linear-gradient(to right, transparent, background.paper)',
            pointerEvents: 'none',
            zIndex: 1
          },
          '::-webkit-scrollbar': {
            height: 8,
            bgcolor: 'background.paper',
            borderRadius: 4,
          },
          '::-webkit-scrollbar-thumb': {
            bgcolor: 'grey.400',
            borderRadius: 2,
            '&:hover': {
              bgcolor: 'grey.500'
            }
          },
          '::-webkit-scrollbar-track': {
            bgcolor: 'grey.100',
            borderRadius: 4
          },
          mx: -2, // Negative margin to allow full-width scrolling
          px: 2, // Padding to offset negative margin
        }}
      >
        {isLoading ? renderSkeletons() : insights?.map((item, index) => (
          <Paper
            key={index}
            elevation={2}
            sx={{
              p: 3,
              borderRadius: 2,
              minWidth: '300px',
              maxWidth: '400px',
              flex: '0 0 auto',
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
        ))}
      </Box>
    </div>
  );
}
