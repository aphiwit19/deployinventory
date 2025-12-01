import { useState, useEffect } from 'react';
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
  Grid,
  CircularProgress,
  Avatar,
  Card,
  CardContent,
} from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import OrdersTab from './OrdersTab';
import PickingHistory from './PickingHistory';
import Profile from './Profile';
import { getAll, getById } from '../../services/firestore';
import DashboardIcon from '@mui/icons-material/Dashboard';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import HistoryIcon from '@mui/icons-material/History';
import PersonIcon from '@mui/icons-material/Person';
import LogoutIcon from '@mui/icons-material/Logout';
import StatsCard from '../../components/StatsCard';
import ActivityTimeline from '../../components/ActivityTimeline';
import QuickActions from '../../components/QuickActions';

interface ActivityItem {
  id: string;
  type: 'success' | 'pending' | 'shipping';
  orderId: string;
  productName: string;
  status: string;
  time: string;
  icon: string;
}

type StaffTab = 'dashboard' | 'orders' | 'history' | 'profile';

const StaffDashboard = () => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [tab, setTab] = useState<StaffTab>(location.state?.tab === 'orders' ? 'orders' : 'dashboard');
  const [metrics, setMetrics] = useState({
    todayOrders: 0,
    completedOrders: 0,
    totalOrders: 0,
  });
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [staffProfile, setStaffProfile] = useState<{
    firstName: string;
    lastName: string;
  }>({ firstName: '', lastName: '' });

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (e) {
      console.error('Failed to logout', e);
    }
  };

  useEffect(() => {
    const loadDashboardData = async () => {
      if (tab === 'dashboard') {
        setLoading(true);
        try {
          // Load orders for metrics and activities
          const orders = await getAll('orders');
          
          // Calculate metrics
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          
          // จัดการคำสั่งซื้อ - แยกตามสตาฟที่ login
          const allOrders = orders as any[];
          const currentStaffId = currentUser?.uid;
          
          // ออเดอร์ที่สตาฟคนนี้รับผิดชอบ (ยกเว้นที่เสร็จแล้ว)
          const myOrders = allOrders.filter(o => 
            o.assignedTo === currentStaffId && 
            o.status !== 'เสร็จสิ้น' && 
            o.status !== 'การจัดส่งสำเร็จ'
            // ไม่กรอง 'กำลังเตรียมสินค้า' ออก
          );
          
          // ออเดอร์ที่ยังไม่มีคนรับผิดชอบ (ทุกคนเห็นได้)
          const unassignedOrders = allOrders.filter(o => 
            !o.assignedTo && (
              o.status === 'รอดำเนินการ' || 
              o.status === 'รอการยืนยัน' ||
              o.status === 'กำลังดำเนินการ'
            )
          );
          
          const todayOrders = allOrders.filter(o => {
            const orderDate = o.createdAt?.toDate();
            return orderDate && orderDate >= today;
          }).length;
          
          const myPreparingOrders = myOrders.filter(o => o.status === 'กำลังเตรียมสินค้า').length;
          const myCompletedOrders = myOrders.filter(o => o.status === 'การจัดส่งสำเร็จ').length;
          const totalMyOrders = myOrders.length;

          setMetrics({
            todayOrders: unassignedOrders.length,  // ออเดอร์ที่รอรับงาน
            completedOrders: myPreparingOrders,    // ออเดอร์ที่กำลังทำ
            totalOrders: totalMyOrders,             // ออเดอร์ทั้งหมดของฉัน
          });

          // Load activities from my recent orders
          const recentOrders: ActivityItem[] = [...myOrders, ...unassignedOrders]
            .sort((a, b) => b.createdAt?.toDate() - a.createdAt?.toDate())
            .slice(0, 5)
            .map((order, index): ActivityItem => {
              const firstItem = order.items?.[0] || {};
              let type: 'success' | 'pending' | 'shipping' = 'pending';
              let icon = '⏳';
              
              if (order.status === 'เสร็จสิ้น') {
                type = 'success';
                icon = '✅';
              } else if (order.status === 'กำลังจัดส่ง') {
                type = 'shipping';
                icon = '🚚';
              } else if (order.assignedTo === currentStaffId) {
                type = 'pending';
                icon = '👤'; // ออเดอร์ของฉัน
              }

              return {
                id: order.id,
                type,
                orderId: `Order #${order.id.slice(-6)}`,
                productName: firstItem.name || 'สินค้า',
                status: order.status || 'รอดำเนินการ',
                time: order.createdAt?.toDate()?.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }) || '--:--',
                icon,
              };
            });

          setActivities(recentOrders);

          // Load staff profile from Firebase
          if (currentUser?.uid) {
            try {
              console.log('Loading staff profile for UID:', currentUser.uid);
              const staffDoc = await getById('staff', currentUser.uid);
              console.log('Staff doc found:', staffDoc);
              
              if (staffDoc) {
                const profile = {
                  firstName: (staffDoc as any).firstName || '',
                  lastName: (staffDoc as any).lastName || '',
                };
                console.log('Setting staff profile:', profile);
                setStaffProfile(profile);
              } else {
                console.log('No staff document found for UID:', currentUser.uid);
                // Try loading from 'users' collection as fallback
                try {
                  const userDoc = await getById('users', currentUser.uid);
                  console.log('User doc found:', userDoc);
                  if (userDoc) {
                    const profile = {
                      firstName: (userDoc as any).firstName || '',
                      lastName: (userDoc as any).lastName || '',
                    };
                    console.log('Setting user profile:', profile);
                    setStaffProfile(profile);
                  } else {
                    console.log('No user document found either, using email fallback');
                    // Use email as fallback name
                    const emailName = currentUser?.email?.split('@')[0] || 'Staff';
                    const nameParts = emailName.replace(/[^a-zA-Z]/g, ' ').trim().split(/\s+/);
                    setStaffProfile({
                      firstName: nameParts[0] || 'Staff',
                      lastName: nameParts.slice(1).join(' ') || '',
                    });
                  }
                } catch (userError) {
                  console.log('Error loading from users collection:', userError);
                  // Use email as fallback
                  const emailName = currentUser?.email?.split('@')[0] || 'Staff';
                  const nameParts = emailName.replace(/[^a-zA-Z]/g, ' ').trim().split(/\s+/);
                  setStaffProfile({
                    firstName: nameParts[0] || 'Staff',
                    lastName: nameParts.slice(1).join(' ') || '',
                  });
                }
              }
            } catch (error) {
              console.error('Failed to load staff profile:', error);
              // Use email as fallback
              const emailName = currentUser?.email?.split('@')[0] || 'Staff';
              const nameParts = emailName.replace(/[^a-zA-Z]/g, ' ').trim().split(/\s+/);
              setStaffProfile({
                firstName: nameParts[0] || 'Staff',
                lastName: nameParts.slice(1).join(' ') || '',
              });
            }
          }

        } catch (error) {
          console.error('Failed to load dashboard data:', error);
        } finally {
          setLoading(false);
        }
      }
    };

    loadDashboardData();
  }, [tab, currentUser?.uid]);

  const renderContent = () => {
    switch (tab) {
      case 'dashboard':
        return (
          <>
            {/* Header Section */}
            <Card
              sx={{
                p: 4,
                mb: 4,
                background: 'linear-gradient(135deg, #1E3A8A 0%, #3B82F6 100%)',
                color: 'white',
                position: 'relative',
                overflow: 'hidden',
                border: 'none',
                boxShadow: 4,
              }}
            >
              <Box
                sx={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: 4,
                  background: 'linear-gradient(90deg, #06B6D4, #38BDF8, #06B6D4)',
                  animation: 'shimmer 3s ease infinite',
                }}
              />
              
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                <Avatar
                  sx={{
                    width: 80,
                    height: 80,
                    background: 'rgba(255, 255, 255, 0.2)',
                    position: 'relative',
                    boxShadow: 3,
                    transition: 'transform 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)',
                    '&:hover': {
                      transform: 'scale(1.05) rotate(5deg)',
                      boxShadow: '0 0 40px rgba(59, 130, 246, 0.3)',
                    },
                  }}
                >
                  <PersonIcon sx={{ fontSize: 40 }} />
                  <Box
                    sx={{
                      position: 'absolute',
                      inset: -10,
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, #1E3A8A 0%, #3B82F6 100%)',
                      opacity: 0.3,
                      filter: 'blur(20px)',
                      animation: 'pulse 3s ease infinite',
                    }}
                  />
                </Avatar>
                
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 400, fontFamily: '"DM Sans", sans-serif', mb: 1 }}>
                    สวัสดี, <span style={{ fontWeight: 700, fontFamily: '"Playfair Display", serif' }}>
                      {staffProfile.firstName && staffProfile.lastName 
                        ? `${staffProfile.firstName} ${staffProfile.lastName}` 
                        : 'Staff'}
                    </span>
                  </Typography>
                </Box>
              </Box>
            </Card>

            <Typography variant="h4" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
              ภาพรวมการทำงาน
            </Typography>
            
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 200 }}>
                <CircularProgress />
              </Box>
            ) : (
              <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                  <StatsCard
                    title="จัดการคำสั่งซื้อ"
                    value={metrics.todayOrders}
                    subtitle="รอจัดการคำสั่งซื้อ"
                    icon="📦"
                    gradient="linear-gradient(135deg, #1E3A8A 0%, #3B82F6 50%, #60A5FA 100%)"
                    delay={0}
                  />
                </Grid>

                <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                  <StatsCard
                    title="สำเร็จ"
                    value={metrics.completedOrders}
                    subtitle="ทำรายการเบิกสำเร็จ"
                    icon="✅"
                    gradient="linear-gradient(135deg, #10B981, #6EE7B7)"
                    delay={0.1}
                  />
                </Grid>

                <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                  <StatsCard
                    title="ทั้งหมด"
                    value={metrics.todayOrders + metrics.completedOrders}
                    subtitle="จัดการคำสั่งซื้อทั้งหมด"
                    icon="📋"
                    gradient="linear-gradient(135deg, #F59E0B, #FCD34D)"
                    delay={0.2}
                  />
                </Grid>
              </Grid>
            )}

            {/* Activity Timeline Section */}
            <Box sx={{ mt: 4 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 700, fontFamily: '"Playfair Display", serif' }}>
                  📋 กิจกรรมล่าสุด
                </Typography>
                <Button 
                  variant="text" 
                  sx={{ color: 'primary.main', fontWeight: 600 }}
                  onClick={() => setTab('history')}
                >
                  ดูทั้งหมด →
                </Button>
              </Box>
              
              <Box sx={{ p: 3, backgroundColor: 'background.paper', borderRadius: '18px', border: '1px solid #1E3A8A20' }}>
                {activities.length > 0 ? (
                  <ActivityTimeline activities={activities} />
                ) : (
                  <Typography variant="body2" sx={{ color: 'text.secondary', textAlign: 'center', py: 4 }}>
                    ยังไม่มีกิจกรรมล่าสุด
                  </Typography>
                )}
              </Box>
            </Box>

            {/* Quick Actions Section */}
            <Box sx={{ mt: 4 }}>
              <Typography variant="h6" sx={{ fontWeight: 700, fontFamily: '"Playfair Display", serif', mb: 3 }}>
                🚀 การทำงานด่วน
              </Typography>
              
              <QuickActions
                actions={[
                  {
                    id: 'orders',
                    title: 'จัดการออเดอร์',
                    description: 'ดูและจัดการคำสั่งซื้อ',
                    icon: <ShoppingCartIcon sx={{ fontSize: 28, color: '#1E3A8A' }} />,
                    onClick: () => setTab('orders'),
                  },
                  {
                    id: 'history',
                    title: 'ประวัติการเบิก',
                    description: 'ดูรายการย้อนหลัง',
                    icon: <HistoryIcon sx={{ fontSize: 28, color: '#10B981' }} />,
                    onClick: () => setTab('history'),
                  },
                  {
                    id: 'profile',
                    title: 'ข้อมูลส่วนตัว',
                    description: 'แก้ไขข้อมูลติดต่อ',
                    icon: <PersonIcon sx={{ fontSize: 28, color: '#F59E0B' }} />,
                    onClick: () => setTab('profile'),
                  },
                ]}
              />
            </Box>
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
        position: 'relative',
      }}
    >
      {/* Sidebar */}
      <Box
        sx={{
          position: 'sticky',
          top: 0,
          height: '100vh',
          width: 280,
          background: 'linear-gradient(135deg, #1E3A8A 0%, #3B82F6 100%)',
          color: 'white',
          borderRight: '1px solid rgba(255, 255, 255, 0.1)',
          boxShadow: '4px 0 20px rgba(30, 58, 138, 0.15)',
          overflow: 'hidden',
          zIndex: 1000,
        }}
      >
        {/* Background decoration */}
        <Box
          sx={{
            position: 'absolute',
            top: '-50%',
            right: '-30%',
            width: 300,
            height: 300,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(255, 255, 255, 0.1) 0%, transparent 70%)',
            animation: 'pulse 4s ease infinite',
          }}
        />
        
        <Box sx={{ position: 'relative', zIndex: 1 }}>
          {/* Logo Section */}
          <Box sx={{ p: 3, textAlign: 'center' }}>
            <Box
              sx={{
                width: 70,
                height: 70,
                borderRadius: '18px',
                background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.2), rgba(255, 255, 255, 0.1))',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1.5rem',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                transition: 'transform 0.3s ease',
                '&:hover': {
                  transform: 'scale(1.05) rotate(5deg)',
                },
              }}
            >
              <DashboardIcon sx={{ fontSize: 36 }} />
            </Box>
            <Typography 
              variant="h6" 
              sx={{ 
                fontWeight: 700, 
                fontFamily: '"Playfair Display", serif',
                mb: 1,
                fontSize: '1.4rem',
                background: 'linear-gradient(135deg, #FFFFFF, #E0F2FE)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              Staff Panel
            </Typography>
            <Typography 
              variant="body2" 
              sx={{ 
                opacity: 0.8,
                fontSize: '0.9rem',
                fontWeight: 500,
              }}
            >
              ระบบจัดการสินค้า
            </Typography>
          </Box>
          
          <Divider sx={{ mx: 3, borderColor: 'rgba(255, 255, 255, 0.2)' }} />
          
          {/* Navigation */}
          <List component="nav" sx={{ px: 2, py: 2 }}>
            <ListItemButton
              selected={tab === 'dashboard'}
              onClick={() => setTab('dashboard')}
              sx={{
                borderRadius: '12px',
                mb: 1,
                px: 2,
                py: 1.5,
                transition: 'all 0.3s ease',
                '&.Mui-selected': {
                  background: 'rgba(255, 255, 255, 0.15)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
                  '&:hover': {
                    background: 'rgba(255, 255, 255, 0.2)',
                  },
                },
                '&:hover': {
                  background: 'rgba(255, 255, 255, 0.1)',
                  transform: 'translateX(4px)',
                },
              }}
            >
              <DashboardIcon sx={{ mr: 2, fontSize: 20 }} />
              <ListItemText 
                primary="ภาพรวม" 
                sx={{ 
                  '& .MuiListItemText-primary': { 
                    fontWeight: 600, 
                    fontSize: '0.95rem',
                    fontFamily: '"DM Sans", sans-serif',
                  }
                }}
              />
            </ListItemButton>
            
            <ListItemButton
              selected={tab === 'orders'}
              onClick={() => setTab('orders')}
              sx={{
                borderRadius: '12px',
                mb: 1,
                px: 2,
                py: 1.5,
                transition: 'all 0.3s ease',
                '&.Mui-selected': {
                  background: 'rgba(255, 255, 255, 0.15)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
                  '&:hover': {
                    background: 'rgba(255, 255, 255, 0.2)',
                  },
                },
                '&:hover': {
                  background: 'rgba(255, 255, 255, 0.1)',
                  transform: 'translateX(4px)',
                },
              }}
            >
              <ShoppingCartIcon sx={{ mr: 2, fontSize: 20 }} />
              <ListItemText 
                primary="จัดการคำสั่งซื้อ" 
                sx={{ 
                  '& .MuiListItemText-primary': { 
                    fontWeight: 600, 
                    fontSize: '0.95rem',
                    fontFamily: '"DM Sans", sans-serif',
                  }
                }}
              />
            </ListItemButton>
            
            <ListItemButton
              selected={tab === 'history'}
              onClick={() => setTab('history')}
              sx={{
                borderRadius: '12px',
                mb: 1,
                px: 2,
                py: 1.5,
                transition: 'all 0.3s ease',
                '&.Mui-selected': {
                  background: 'rgba(255, 255, 255, 0.15)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
                  '&:hover': {
                    background: 'rgba(255, 255, 255, 0.2)',
                  },
                },
                '&:hover': {
                  background: 'rgba(255, 255, 255, 0.1)',
                  transform: 'translateX(4px)',
                },
              }}
            >
              <HistoryIcon sx={{ mr: 2, fontSize: 20 }} />
              <ListItemText 
                primary="ประวัติการจัดการ" 
                sx={{ 
                  '& .MuiListItemText-primary': { 
                    fontWeight: 600, 
                    fontSize: '0.95rem',
                    fontFamily: '"DM Sans", sans-serif',
                  }
                }}
              />
            </ListItemButton>
            
            <ListItemButton
              selected={tab === 'profile'}
              onClick={() => setTab('profile')}
              sx={{
                borderRadius: '12px',
                mb: 1,
                px: 2,
                py: 1.5,
                transition: 'all 0.3s ease',
                '&.Mui-selected': {
                  background: 'rgba(255, 255, 255, 0.15)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
                  '&:hover': {
                    background: 'rgba(255, 255, 255, 0.2)',
                  },
                },
                '&:hover': {
                  background: 'rgba(255, 255, 255, 0.1)',
                  transform: 'translateX(4px)',
                },
              }}
            >
              <PersonIcon sx={{ mr: 2, fontSize: 20 }} />
              <ListItemText 
                primary="โปรไฟล์" 
                sx={{ 
                  '& .MuiListItemText-primary': { 
                    fontWeight: 600, 
                    fontSize: '0.95rem',
                    fontFamily: '"DM Sans", sans-serif',
                  }
                }}
              />
            </ListItemButton>
          </List>
          
          <Divider sx={{ mx: 3, borderColor: 'rgba(255, 255, 255, 0.2)', my: 2 }} />
          
          {/* User Section */}
          <Box sx={{ px: 3, pb: 3 }}>
            <Box
              sx={{
                p: 2,
                borderRadius: '12px',
                background: 'rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                textAlign: 'center',
              }}
            >
              <Avatar
                sx={{
                  width: 50,
                  height: 50,
                  margin: '0 auto 1rem',
                  background: 'rgba(255, 255, 255, 0.2)',
                  border: '2px solid rgba(255, 255, 255, 0.3)',
                }}
              >
                <PersonIcon />
              </Avatar>
              <Typography 
                variant="body2" 
                sx={{ 
                  fontWeight: 600,
                  mb: 0.5,
                  fontSize: '0.9rem',
                  fontFamily: '"DM Sans", sans-serif',
                }}
              >
                {currentUser?.email?.split('@')[0] || staffProfile.firstName || 'Staff'}
              </Typography>
              <Typography 
                variant="caption" 
                sx={{ 
                  opacity: 0.8,
                  fontSize: '0.8rem',
                  display: 'block',
                  mb: 2,
                }}
              >
                พนักงาน
              </Typography>
              <Button
                variant="outlined"
                onClick={handleLogout}
                fullWidth
                sx={{
                  borderColor: 'rgba(255, 255, 255, 0.3)',
                  color: 'white',
                  borderRadius: '50px',
                  fontWeight: 600,
                  fontSize: '0.85rem',
                  py: 0.8,
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    background: 'rgba(239, 68, 68, 0.2)',
                    borderColor: 'rgba(239, 68, 68, 0.5)',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 4px 20px rgba(239, 68, 68, 0.2)',
                  },
                }}
              >
                <LogoutIcon sx={{ mr: 1, fontSize: 16 }} />
                ออกจากระบบ
              </Button>
            </Box>
          </Box>
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
