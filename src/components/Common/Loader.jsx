import React from 'react';
import {
  Box,
  CircularProgress,
  Typography,
  Backdrop,
  useTheme,
  alpha,
} from '@mui/material';
import { Build as BuildIcon } from '@mui/icons-material';

// Full screen loader
export const FullScreenLoader = ({ open = true, text = 'Loading...' }) => {
  const theme = useTheme();

  return (
    <Backdrop
      sx={{
        color: '#fff',
        zIndex: (theme) => theme.zIndex.drawer + 1,
        backgroundColor: alpha(theme.palette.background.default, 0.9),
        backdropFilter: 'blur(4px)',
      }}
      open={open}
    >
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 2,
        }}
      >
        <Box sx={{ position: 'relative', display: 'inline-flex' }}>
          <CircularProgress
            size={60}
            thickness={4}
            sx={{
              color: theme.palette.primary.main,
            }}
          />
          <Box
            sx={{
              top: 0,
              left: 0,
              bottom: 0,
              right: 0,
              position: 'absolute',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <BuildIcon
              sx={{
                fontSize: 28,
                color: theme.palette.primary.main,
                animation: 'pulse 1.5s ease-in-out infinite',
                '@keyframes pulse': {
                  '0%': {
                    transform: 'scale(0.8)',
                    opacity: 0.5,
                  },
                  '50%': {
                    transform: 'scale(1)',
                    opacity: 1,
                  },
                  '100%': {
                    transform: 'scale(0.8)',
                    opacity: 0.5,
                  },
                },
              }}
            />
          </Box>
        </Box>
        <Typography
          variant="body1"
          sx={{
            color: theme.palette.text.primary,
            fontWeight: 500,
            animation: 'fadeInOut 1.5s ease-in-out infinite',
            '@keyframes fadeInOut': {
              '0%': {
                opacity: 0.5,
              },
              '50%': {
                opacity: 1,
              },
              '100%': {
                opacity: 0.5,
              },
            },
          }}
        >
          {text}
        </Typography>
      </Box>
    </Backdrop>
  );
};

// Center loader for content area
export const CenterLoader = ({ size = 40, text = 'Loading...' }) => {
  const theme = useTheme();

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '400px',
        width: '100%',
      }}
    >
      <Box sx={{ position: 'relative', display: 'inline-flex', mb: 2 }}>
        <CircularProgress
          size={size}
          thickness={4}
          sx={{
            color: theme.palette.primary.main,
          }}
        />
        <Box
          sx={{
            top: 0,
            left: 0,
            bottom: 0,
            right: 0,
            position: 'absolute',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <BuildIcon
            sx={{
              fontSize: size * 0.45,
              color: theme.palette.primary.main,
              animation: 'pulse 1.5s ease-in-out infinite',
              '@keyframes pulse': {
                '0%': {
                  transform: 'scale(0.8)',
                  opacity: 0.5,
                },
                '50%': {
                  transform: 'scale(1)',
                  opacity: 1,
                },
                '100%': {
                  transform: 'scale(0.8)',
                  opacity: 0.5,
                },
              },
            }}
          />
        </Box>
      </Box>
      <Typography
        variant="body2"
        color="text.secondary"
        sx={{
          animation: 'fadeInOut 1.5s ease-in-out infinite',
          '@keyframes fadeInOut': {
            '0%': { opacity: 0.5 },
            '50%': { opacity: 1 },
            '100%': { opacity: 0.5 },
          },
        }}
      >
        {text}
      </Typography>
    </Box>
  );
};

// Inline loader for buttons
export const ButtonLoader = ({ size = 20 }) => {
  return (
    <CircularProgress
      size={size}
      thickness={5}
      sx={{
        color: 'inherit',
      }}
    />
  );
};

// Skeleton loader for cards
export const CardSkeleton = () => {
  return (
    <Box sx={{ width: '100%' }}>
      {[1, 2, 3].map((item) => (
        <Box key={item} sx={{ mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <CircularProgress size={20} thickness={5} />
            <Box sx={{ ml: 2, flex: 1 }}>
              <Box sx={{ width: '60%', height: 10, bgcolor: 'grey.300', borderRadius: 1, mb: 1 }} />
              <Box sx={{ width: '40%', height: 8, bgcolor: 'grey.200', borderRadius: 1 }} />
            </Box>
          </Box>
        </Box>
      ))}
    </Box>
  );
};

// Page transition loader
export const PageLoader = () => {
  const theme = useTheme();

  return (
    <Box
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: alpha(theme.palette.background.default, 0.95),
        zIndex: 9999,
      }}
    >
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 3,
        }}
      >
        <Box sx={{ position: 'relative' }}>
          <CircularProgress
            size={80}
            thickness={3}
            sx={{
              color: theme.palette.primary.main,
            }}
          />
          <Box
            sx={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
            }}
          >
            <BuildIcon
              sx={{
                fontSize: 35,
                color: theme.palette.primary.main,
                animation: 'spin 2s linear infinite',
                '@keyframes spin': {
                  '0%': {
                    transform: 'rotate(0deg)',
                  },
                  '100%': {
                    transform: 'rotate(360deg)',
                  },
                },
              }}
            />
          </Box>
        </Box>
        <Typography
          variant="h6"
          sx={{
            color: theme.palette.text.primary,
            fontWeight: 600,
          }}
        >
          Loading...
        </Typography>
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{
            animation: 'pulse 1.5s ease-in-out infinite',
            '@keyframes pulse': {
              '0%, 100%': { opacity: 0.5 },
              '50%': { opacity: 1 },
            },
          }}
        >
          Please wait while we load your content
        </Typography>
      </Box>
    </Box>
  );
};

// Dot loader for inline loading
export const DotLoader = () => {
  return (
    <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center' }}>
      {[0, 1, 2].map((index) => (
        <Box
          key={index}
          sx={{
            width: 6,
            height: 6,
            borderRadius: '50%',
            bgcolor: 'primary.main',
            animation: 'bounce 1.4s ease-in-out infinite',
            animationDelay: `${index * 0.16}s`,
            '@keyframes bounce': {
              '0%, 80%, 100%': {
                transform: 'scale(0)',
                opacity: 0.3,
              },
              '40%': {
                transform: 'scale(1)',
                opacity: 1,
              },
            },
          }}
        />
      ))}
    </Box>
  );
};

// Progress loader with percentage
export const ProgressLoader = ({ value = 0, text = 'Loading...' }) => {
  const theme = useTheme();

  return (
    <Box
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: alpha(theme.palette.background.default, 0.95),
        zIndex: 9999,
        flexDirection: 'column',
        gap: 3,
      }}
    >
      <Box sx={{ position: 'relative', display: 'inline-flex' }}>
        <CircularProgress
          variant="determinate"
          value={value}
          size={80}
          thickness={4}
          sx={{ color: theme.palette.primary.main }}
        />
        <Box
          sx={{
            top: 0,
            left: 0,
            bottom: 0,
            right: 0,
            position: 'absolute',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Typography
            variant="h6"
            component="div"
            color="primary"
            sx={{ fontWeight: 600 }}
          >
            {`${Math.round(value)}%`}
          </Typography>
        </Box>
      </Box>
      <Typography variant="body1" color="text.secondary">
        {text}
      </Typography>
    </Box>
  );
};