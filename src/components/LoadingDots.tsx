import { Box } from '@mui/material';

const LoadingDots = () => (
  <Box sx={{ display: 'flex', gap: 1 }}>
    {[1, 2, 3].map((dot) => (
      <Box
        key={dot}
        sx={{
          width: 8,
          height: 8,
          backgroundColor: 'grey.400',
          borderRadius: '50%',
          animation: 'pulse 1.5s infinite',
          animationDelay: `${(dot - 1) * 0.2}s`,
          '@keyframes pulse': {
            '0%, 100%': {
              transform: 'scale(0.8)',
              opacity: 0.5,
            },
            '50%': {
              transform: 'scale(1.2)',
              opacity: 1,
            },
          },
        }}
      />
    ))}
  </Box>
);

export default LoadingDots; 