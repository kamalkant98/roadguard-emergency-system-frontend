import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  LinearProgress,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Chip,
  useTheme,
  alpha,
} from '@mui/material';
import {
  Build as BuildIcon,
  CheckCircle as CheckCircleIcon,
  AccessTime as TimeIcon,
  Star as StarIcon,
  LocalGasStation as FuelIcon,
  Navigation as NavIcon,
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import TrekkingMap from '../Common/trackerMap' 

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const theme = useTheme();
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    completed: 0,
    pending: 0,
    rating: 0,
  });

  const [recentRequests, setRecentRequests] = useState([
    {
      id: 1,
      type: 'Flat Tire',
      status: 'completed',
      date: '2024-01-15',
      amount: 499,
    },
    {
      id: 2,
      type: 'Battery Jump',
      status: 'completed',
      date: '2024-01-10',
      amount: 399,
    },
    {
      id: 3,
      type: 'Fuel Delivery',
      status: 'pending',
      date: '2024-01-05',
      amount: 599,
    },
  ]);

  const StatCard = ({ title, value, icon, color }) => (
    <Card sx={{ borderRadius: 3, height: '100%' }}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Typography variant="body2" color="text.secondary">
              {title}
            </Typography>
            <Typography variant="h3" sx={{ fontWeight: 700, mt: 1 }}>
              {value}
            </Typography>
          </Box>
          <Avatar sx={{ bgcolor: alpha(color, 0.1), color: color, width: 56, height: 56 }}>
            {icon}
          </Avatar>
        </Box>
      </CardContent>
    </Card>
  );

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'success';
      case 'pending': return 'warning';
      case 'cancelled': return 'error';
      default: return 'default';
    }
  };

  return (
    <Box>
      {/* Welcome Section */}
      <Card sx={{ borderRadius: 3, mb: 4, bgcolor: alpha(theme.palette.primary.main, 0.05) }}>
        <CardContent sx={{ p: 4 }}>
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
            Welcome back, {user?.full_name?.split(' ')[0]}! 👋
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            Ready to get help on the road? We're available 24/7 for all your roadside assistance needs.
          </Typography>
          <Button
            variant="contained"
            size="large"
            startIcon={<BuildIcon />}
            onClick={() => navigate('/breakdown/new')}
            sx={{ py: 1.5, px: 4 }}
          >
            Request Breakdown Assistance
          </Button>
        </CardContent>
      </Card>

      {/* Stats Grid */}
      {/* <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Requests"
            value={stats.total}
            icon={<BuildIcon />}
            color={theme.palette.primary.main}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Completed"
            value={stats.completed}
            icon={<CheckCircleIcon />}
            color={theme.palette.success.main}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Pending"
            value={stats.pending}
            icon={<TimeIcon />}
            color={theme.palette.warning.main}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Rating"
            value={stats.rating}
            icon={<StarIcon />}
            color={theme.palette.secondary.main}
          />
        </Grid>
      </Grid> */}

      {/* Quick Actions */}
      {/* <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card sx={{ borderRadius: 3 }}>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                Recent Requests
              </Typography>
              <List>
                {recentRequests.map((request) => (
                  <ListItem
                    key={request.id}
                    sx={{ px: 0, borderBottom: `1px solid ${theme.palette.divider}` }}
                  >
                    <ListItemAvatar>
                      <Avatar sx={{ bgcolor: alpha(theme.palette.primary.main, 0.1) }}>
                        <FuelIcon />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={request.type}
                      secondary={new Date(request.date).toLocaleDateString()}
                    />
                    <Box sx={{ textAlign: 'right' }}>
                      <Typography variant="body2" fontWeight={600}>
                        ₹{request.amount}
                      </Typography>
                      <Chip
                        label={request.status}
                        size="small"
                        color={getStatusColor(request.status)}
                        sx={{ mt: 0.5 }}
                      />
                    </Box>
                  </ListItem>
                ))}
              </List>
              <Button
                fullWidth
                variant="outlined"
                onClick={() => navigate('/history')}
                sx={{ mt: 2 }}
              >
                View All History
              </Button>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card sx={{ borderRadius: 3 }}>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                Quick Tips
              </Typography>
              <List>
                <ListItem sx={{ px: 0 }}>
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: alpha(theme.palette.info.main, 0.1) }}>
                      <NavIcon />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary="Enable Location"
                    secondary="Allow location access for faster service"
                  />
                </ListItem>
                <ListItem sx={{ px: 0 }}>
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: alpha(theme.palette.warning.main, 0.1) }}>
                      <CheckCircleIcon />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary="Emergency SOS"
                    secondary="Press and hold for emergency assistance"
                  />
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid> */}

      
      <TrekkingMap/>
    </Box>

    
  );
};

export default Dashboard;