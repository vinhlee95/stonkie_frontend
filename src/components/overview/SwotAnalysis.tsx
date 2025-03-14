import { useQuery } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';
import { Box, Typography, Skeleton, useMediaQuery, useTheme } from '@mui/material';
import { BACKEND_URL } from '../../utils/db';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/scrollbar';
import 'swiper/css/free-mode';

interface SwotData {
  strength: string[];
  weakness: string[];
  opportunity: string[];
  threat: string[];
}

interface SwotResponse {
  status: string;
  data: SwotData;
}

const SwotAnalysis = () => {
  const { ticker } = useParams<{ ticker: string }>();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const { data, isLoading, error } = useQuery<SwotResponse>({
    queryKey: ['swot', ticker],
    queryFn: async () => {
      const response = await fetch(`${BACKEND_URL}/api/companies/${ticker}/swot`);
      if (!response.ok) {
        throw new Error('Failed to fetch SWOT analysis');
      }
      return response.json();
    },
    staleTime: 1000 * 60 * 5, // cache the data for 5 minutes
  });

  const swotData = data?.data;

  // Define SWOT categories with their respective styles
  const swotCategories = [
    {
      title: 'Strengths',
      items: swotData?.strength,
      icon: '💪',
      bgColor: '#e8f5e9', // Light green background
      titleColor: '#2e7d32', // Green text
    },
    {
      title: 'Weaknesses',
      items: swotData?.weakness,
      icon: '⚠️',
      bgColor: '#ffebee', // Light red background
      titleColor: '#c62828', // Red text
    },
    {
      title: 'Opportunities',
      items: swotData?.opportunity,
      icon: '🚀',
      bgColor: '#e3f2fd', // Light blue background
      titleColor: '#1565c0', // Blue text
    },
    {
      title: 'Threats',
      items: swotData?.threat,
      icon: '🛑',
      bgColor: '#fff8e1', // Light yellow background
      titleColor: '#f57f17', // Amber text
    },
  ];

  // Render a single SWOT category card
  const renderSwotCard = (category: typeof swotCategories[0]) => (
    <Box
      sx={{
        bgcolor: category.bgColor,
        borderRadius: 2,
        p: 2,
        height: '100%',
        minHeight: '200px',
        maxHeight: '320px',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Typography 
        variant="h6" 
        sx={{ 
          color: category.titleColor, 
          mb: 2,
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          fontWeight: 'bold'
        }}
      >
        <span>{category.icon}</span> {category.title}
      </Typography>
      
      <Box sx={{ flexGrow: 1 }}>
        {category.items?.map((item, index) => (
          <p key={index} style={{marginTop: 0}}>{item}</p>
        ))}
      </Box>
    </Box>
  );

  // Categories for SWOT analysis with their styling information for skeleton UI
  const skeletonCategories = [
    {
      type: 'strength',
      title: 'Strengths',
      bgColor: '#e8f5e9', // Light green background
      icon: '💪',
    },
    {
      type: 'weakness',
      title: 'Weaknesses',
      bgColor: '#ffebee', // Light red background
      icon: '⚠️',
    },
    {
      type: 'opportunity',
      title: 'Opportunities',
      bgColor: '#e3f2fd', // Light blue background
      icon: '🚀',
    },
    {
      type: 'threat',
      title: 'Threats',
      bgColor: '#fff8e1', // Light yellow background
      icon: '🛑',
    },
  ];
  
  return (
    <Box>
      {isMobile ? (
        // Mobile view - Use Swiper carousel
        <Swiper
          modules={[Pagination]}
          pagination={{ clickable: true }}
          spaceBetween={10}
          slidesPerView={1.2}
          grabCursor={true}
          style={{
            minHeight: '200px',
            maxHeight: '320px',
          }}
        >
          {isLoading ? (
            // Skeleton UI for mobile
            skeletonCategories.map((category, index) => (
              <SwiperSlide key={`swot-skeleton-${index}`}>
                <Box
                  sx={{
                    bgcolor: category.bgColor,
                    borderRadius: 2,
                    p: 2,
                    height: '100%',
                    minHeight: '200px',
                    maxHeight: '320px',
                    display: 'flex',
                    flexDirection: 'column',
                  }}
                >
                  <Typography 
                    variant="h6" 
                    sx={{ 
                      mb: 2,
                      fontWeight: 'bold',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1
                    }}
                  >
                    {category.icon} {category.title}
                  </Typography>
                  
                  <Box sx={{ flexGrow: 1 }}>
                    <Skeleton variant="text" width="100%" height={24} sx={{ mb: 1 }} />
                    <Skeleton variant="text" width="90%" height={24} sx={{ mb: 1 }} />
                    <Skeleton variant="text" width="95%" height={24} sx={{ mb: 1 }} />
                  </Box>
                </Box>
              </SwiperSlide>
            ))
          ) : (
            // Actual data
            swotCategories.map((category, index) => (
              <SwiperSlide key={`swot-slide-${index}`}>
                {renderSwotCard(category)}
              </SwiperSlide>
            ))
          )}
        </Swiper>
      ) : (
        // Desktop view - Use native grid layout with horizontal scroll
        <Box
          sx={{
            display: 'flex',
            gap: 2,
            overflowY: 'hidden',
            overflowX: 'auto',
          }}
        >
          {isLoading ? (
            // Skeleton UI for desktop
            skeletonCategories.map((category, index) => (
              <Box 
                key={`swot-skeleton-${index}`}
                sx={{ 
                  minWidth: '450px', 
                  flexBasis: 'calc(25% - 24px)',
                  flexShrink: 0,
                }}
              >
                <Box
                  sx={{
                    bgcolor: category.bgColor,
                    borderRadius: 2,
                    p: 2,
                    height: '100%',
                    minHeight: '200px',
                    maxHeight: '320px',
                    display: 'flex',
                    flexDirection: 'column',
                  }}
                >
                  <Typography 
                    variant="h6" 
                    sx={{ 
                      mb: 2,
                      fontWeight: 'bold',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1
                    }}
                  >
                    {category.icon} {category.title}
                  </Typography>
                  
                  <Box sx={{ flexGrow: 1 }}>
                    <Skeleton variant="text" width="100%" height={24} sx={{ mb: 1 }} />
                    <Skeleton variant="text" width="90%" height={24} sx={{ mb: 1 }} />
                    <Skeleton variant="text" width="95%" height={24} sx={{ mb: 1 }} />
                  </Box>
                </Box>
              </Box>
            ))
          ) : (
            // Actual data
            swotCategories.map((category, index) => (
              <Box 
                key={`swot-grid-${index}`}
                sx={{ 
                  minWidth: '450px', 
                  flexBasis: 'calc(25% - 24px)',
                  flexShrink: 0,
                }}
              >
                {renderSwotCard(category)}
              </Box>
            ))
          )}
        </Box>
      )}
    </Box>
  );
};

export default SwotAnalysis;
