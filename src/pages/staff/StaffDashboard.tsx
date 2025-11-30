import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import {
  Box,
  Typography,
  List,
  ListItemButton,
  ListItemText,
  Divider,
  Paper,
  Button,
} from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import OrdersTab from './OrdersTab';
import PickingHistory from './PickingHistory';
import Profile from './Profile';

type StaffTab = 'dashboard' | 'orders' | 'history' | 'profile';

const StaffDashboard = () => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [tab, setTab] = useState<StaffTab>(location.state?.tab === 'orders' ? 'orders' : 'dashboard');

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (e) {
      console.error('Failed to logout', e);
    }
  };

  const renderContent = () => {
    switch (tab) {
      case 'dashboard':
        return (
          <>
            <Typography variant="h4" gutterBottom>
              ภาพรวม
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Overview of your daily tasks as staff. You can extend this section with key metrics, quick links, or notifications for staff operations.
            </Typography>
          </>
        );

      case 'orders':
        return <OrdersTab />;

      case 'history':
        return <PickingHistory />;

      case 'profile':
        return <Profile />;

      default:
        return null;
    }
  };

  return (
    <Box
      sx={{
        display: 'flex',
        minHeight: '100vh',
        backgroundColor: '#f5f5f5',
      }}
    >
      {/* Sidebar */}
      <Box
        sx={{
          width: 240,
          backgroundColor: '#ffffff',
          borderRight: '1px solid #e0e0e0',
        }}
      >
        <Box sx={{ p: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Staff Panel
          </Typography>
        </Box>
        <Divider />
        <List component="nav">
          <ListItemButton
            selected={tab === 'dashboard'}
            onClick={() => setTab('dashboard')}
          >
            <ListItemText primary="ภาพรวม" />
          </ListItemButton>
          <ListItemButton
            selected={tab === 'orders'}
            onClick={() => setTab('orders')}
          >
            <ListItemText primary="จัดการคำสั่งซื้อ" />
          </ListItemButton>
          <ListItemButton
            selected={tab === 'history'}
            onClick={() => setTab('history')}
          >
            <ListItemText primary="ประวัติการจัดการคำสั่งซื้อ" />
          </ListItemButton>
          <ListItemButton
            selected={tab === 'profile'}
            onClick={() => setTab('profile')}
          >
            <ListItemText primary="โปรไฟล์" />
          </ListItemButton>
        </List>
        <Divider />
        <Box sx={{ p: 2 }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            ผู้ใช้: {currentUser?.email}
          </Typography>
          <Button
            variant="outlined"
            color="error"
            size="small"
            onClick={handleLogout}
            fullWidth
          >
            ออกจากระบบ
          </Button>
        </Box>
      </Box>

      {/* Main content */}
      <Box sx={{ flex: 1, p: 3 }}>
        <Paper sx={{ p: 3 }} elevation={2}>
          {renderContent()}
        </Paper>
      </Box>
    </Box>
  );
};

export default StaffDashboard;
