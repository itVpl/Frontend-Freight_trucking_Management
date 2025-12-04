import { Box, CircularProgress, Typography } from '@mui/material';
import { keyframes } from '@mui/system';

// Premium animations
const pulse = keyframes`
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
`;

const rotate = keyframes`
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
`;

const PageLoader = ({ message = 'Loading...' }) => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '60vh',
        gap: 3,
      }}
    >
      {/* Premium Loader */}
      <Box sx={{ position: 'relative', display: 'inline-flex' }}>
        {/* Outer ring */}
        <CircularProgress
          variant="determinate"
          value={100}
          size={80}
          thickness={2}
          sx={{
            color: '#e0e0e0',
            position: 'absolute',
          }}
        />
        {/* Animated ring */}
        <CircularProgress
          size={80}
          thickness={2}
          sx={{
            color: '#1976d2',
            animation: `${rotate} 1.4s linear infinite`,
          }}
        />
        {/* Inner pulsing circle */}
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 40,
            height: 40,
            borderRadius: '50%',
            backgroundColor: '#1976d2',
            animation: `${pulse} 1.4s ease-in-out infinite`,
          }}
        />
      </Box>

      {/* Loading text */}
      <Typography
        variant="h6"
        sx={{
          color: '#1976d2',
          fontWeight: 500,
          animation: `${pulse} 1.4s ease-in-out infinite`,
        }}
      >
        {message}
      </Typography>
    </Box>
  );
};

export default PageLoader;
