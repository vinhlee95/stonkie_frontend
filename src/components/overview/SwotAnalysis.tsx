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
  const isDarkMode = theme.palette.mode === 'dark';
  
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
      bgColor: isDarkMode ? '#1e3320' : '#e8f5e9', // Dark/light green background
      titleColor: isDarkMode ? '#81c784' : '#2e7d32', // Green text adjusted for dark mode
    },
    {
      title: 'Weaknesses',
      items: swotData?.weakness,
      icon: '⚠️',
      bgColor: isDarkMode ? '#321e1e' : '#ffebee', // Dark/light red background
      titleColor: isDarkMode ? '#ef9a9a' : '#c62828', // Red text adjusted for dark mode
    },
    {
      title: 'Opportunities',
      items: swotData?.opportunity,
      icon: '🚀',
      bgColor: isDarkMode ? '#1a2c3d' : '#e3f2fd', // Dark/light blue background
      titleColor: isDarkMode ? '#64b5f6' : '#1565c0', // Blue text adjusted for dark mode
    },
    {
      title: 'Threats',
      items: swotData?.threat,
      icon: '🛑',
      bgColor: isDarkMode ? '#2e2a1e' : '#fff8e1', // Dark/light yellow background
      titleColor: isDarkMode ? '#ffd54f' : '#f57f17', // Amber text adjusted for dark mode
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
      bgColor: isDarkMode ? '#1e3320' : '#e8f5e9', // Dark/light green background
      icon: '💪',
    },
    {
      type: 'weakness',
      title: 'Weaknesses',
      bgColor: isDarkMode ? '#321e1e' : '#ffebee', // Dark/light red background
      icon: '⚠️',
    },
    {
      type: 'opportunity',
      title: 'Opportunities',
      bgColor: isDarkMode ? '#1a2c3d' : '#e3f2fd', // Dark/light blue background
      icon: '🚀',
    },
    {
      type: 'threat',
      title: 'Threats',
      bgColor: isDarkMode ? '#2e2a1e' : '#fff8e1', // Dark/light yellow background
      icon: '��',
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
