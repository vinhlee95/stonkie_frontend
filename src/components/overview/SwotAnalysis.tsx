import { useQuery } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';
import { Box, CircularProgress, Typography, useMediaQuery, useTheme } from '@mui/material';
import { BACKEND_URL } from '../../utils/db';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination, Scrollbar, FreeMode } from 'swiper/modules';
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

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error || !data) {
    return (
      <Typography color="error" sx={{ mt: 2 }}>
        Error loading SWOT analysis. Please try again later.
      </Typography>
    );
  }

  const swotData = data.data;

  // Define SWOT categories with their respective styles
  const swotCategories = [
    {
      title: 'Strengths',
      items: swotData.strength,
      icon: '💪',
      bgColor: '#e8f5e9', // Light green background
      titleColor: '#2e7d32', // Green text
    },
    {
      title: 'Weaknesses',
      items: swotData.weakness,
      icon: '⚠️',
      bgColor: '#ffebee', // Light red background
      titleColor: '#c62828', // Red text
    },
    {
      title: 'Opportunities',
      items: swotData.opportunity,
      icon: '🚀',
      bgColor: '#e3f2fd', // Light blue background
      titleColor: '#1565c0', // Blue text
    },
    {
      title: 'Threats',
      items: swotData.threat,
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
        {category.items.map((item, index) => (
          <p key={index} style={{marginTop: 0}}>{item}</p>
        ))}
      </Box>
    </Box>
  );

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
          {swotCategories.map((category, index) => (
            <SwiperSlide key={`swot-slide-${index}`}>
              {renderSwotCard(category)}
            </SwiperSlide>
          ))}
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
          {swotCategories.map((category, index) => (
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
          ))}
        </Box>
      )}
    </Box>
  );
};

export default SwotAnalysis;
