import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Button,
  Paper,
  CircularProgress,
  Avatar,
  useTheme,
  alpha,
  Grid,
  Chip,
} from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import {
  Notifications,
  Warning,
  Error,
  Search,
  Refresh,
  Inventory,
  CalendarToday,
  ArrowForward,
} from '@mui/icons-material';
import { getAll } from '../../services/firestore';

interface LowStockNotification {
  id: string;
  type: 'สต็อกต่ำ' | 'สต็อกหมด';
  productName: string;
  notificationDate: Date;
  remainingStock: number;
  productId: string;
}

interface ProductRow {
  id: string;
  name: string;
  quantity: number;
}

interface NotificationsTabProps {
  onNavigateToProduct: (productId: string) => void;
}

const NotificationsTab: React.FC<NotificationsTabProps> = ({ onNavigateToProduct }) => {
  const [notifications, setNotifications] = useState<LowStockNotification[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadLowStockNotifications();
  }, []);

  const loadLowStockNotifications = async () => {
    try {
      setLoading(true);
      
      // เรียกใช้ฟังก์ชัน checkLowStock (จำลองการทำงาน)
      const allProducts = await getAll('products') as ProductRow[];
      const notifications: LowStockNotification[] = [];
      
      allProducts.forEach(product => {
        const currentStock = product.quantity || 0;
        const minStockThreshold = Math.ceil(product.quantity * 0.2); // 20% ของจำนวนเดิม
        
        if (currentStock === 0) {
          // สินค้าหมด
          notifications.push({
            id: product.id,
            type: 'สต็อกหมด',
            productName: product.name,
            notificationDate: new Date(),
            remainingStock: 0,
            productId: product.id,
          });
        } else if (currentStock <= minStockThreshold) {
          // สินค้าต่ำกว่า 20% แต่ยังไม่หมด
          notifications.push({
            id: product.id,
            type: 'สต็อกต่ำ',
            productName: product.name,
            notificationDate: new Date(),
            remainingStock: currentStock,
            productId: product.id,
          });
        }
      });

      setNotifications(notifications);
    } catch (e) {
      console.error('Failed to load low stock notifications', e);
    } finally {
      setLoading(false);
    }
  };

  const filteredNotifications = notifications.filter((notification) => {
    if (searchTerm && !notification.productName.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }
    return true;
  });

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'สต็อกหมด':
        return <Error sx={{ fontSize: 16 }} />;
      case 'สต็อกต่ำ':
        return <Warning sx={{ fontSize: 16 }} />;
      default:
        return <Notifications sx={{ fontSize: 16 }} />;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'สต็อกหมด':
        return '#DC2626'; // แดงเข้ม
      case 'สต็อกต่ำ':
        return '#F59E0B'; // ส้ม
      default:
        return '#6B7280'; // เทา
    }
  };

  const getNotificationBgColor = (type: string) => {
    switch (type) {
      case 'สต็อกหมด':
        return 'linear-gradient(135deg, #FEE2E2 0%, #FECACA 100%)';
      case 'สต็อกต่ำ':
        return 'linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%)';
      default:
        return 'linear-gradient(135deg, #F3F4F6 0%, #E5E7EB 100%)';
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('th-TH', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const handleRowClick = (notification: LowStockNotification) => {
    // ไปหน้าสินค้าและเลือกสินค้านั้น
    onNavigateToProduct(notification.productId);
  };

  const refreshNotifications = () => {
    loadLowStockNotifications();
  };

  if (loading) {
    return (
      <Paper
        sx={{
          p: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #F8FAFC 0%, #F1F5F9 100%)',
          border: '1px solid #E2E8F0',
          borderRadius: 3,
          minHeight: 400
        }}
      >
        <CircularProgress
          size={60}
          thickness={4}
          sx={{
            color: '#F59E0B',
            mb: 2
          }}
        />
        <Typography variant="body1" color="text.secondary" sx={{ fontWeight: 500 }}>
          กำลังโหลดข้อมูล...
        </Typography>
      </Paper>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header Section */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Avatar
            sx={{
              width: 48,
              height: 48,
              background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
              mr: 2,
              boxShadow: '0 4px 12px rgba(245, 158, 11, 0.3)'
            }}
          >
            <Notifications sx={{ color: 'white', fontSize: 24 }} />
          </Avatar>
          <Box>
            <Typography
              variant="h4"
              sx={{
                fontWeight: 700,
                background: 'linear-gradient(135deg, #D97706 0%, #F59E0B 100%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                mb: 0.5
              }}
            >
              รายการแจ้งเตือน
            </Typography>
            <Typography variant="body1" color="text.secondary">
              ตรวจสอบสินค้าที่มีสต็อกต่ำหรือหมด
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Filter Section */}
      <Paper
        sx={{
          p: 3,
          mb: 4,
          background: 'white',
          border: '1px solid #E2E8F0',
          borderRadius: 3,
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <Avatar
            sx={{
              width: 32,
              height: 32,
              background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
              mr: 2
            }}
          >
            <Search sx={{ color: 'white', fontSize: 16 }} />
          </Avatar>
          <Typography variant="h6" sx={{ fontWeight: 600, color: '#1E293B' }}>
            ตัวกรองข้อมูล
          </Typography>
        </Box>
        
        <Grid container spacing={3} alignItems="center">
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              label="ค้นหาชื่อสินค้า"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: <Search sx={{ color: '#6B7280', mr: 1 }} />,
                sx: { borderRadius: 2 }
              }}
            />
          </Grid>
          
          <Grid size={{ xs: 12, md: 6 }}>
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
              <Button
                variant="outlined"
                startIcon={<Refresh />}
                onClick={refreshNotifications}
                sx={{
                  borderColor: '#F59E0B',
                  color: '#F59E0B',
                  '&:hover': {
                    borderColor: '#D97706',
                    background: alpha('#F59E0B', 0.04)
                  }
                }}
              >
                รีเฟรช
              </Button>
              
              <Chip
                label={`พบ ${filteredNotifications.length} รายการ`}
                sx={{
                  background: 'linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%)',
                  color: '#D97706',
                  border: '1px solid #FCD34D',
                  fontWeight: 500
                }}
              />
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Table Section */}
      <Paper
        sx={{
          background: 'white',
          border: '1px solid #E2E8F0',
          borderRadius: 3,
          overflow: 'hidden',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
        }}
      >
        <TableContainer sx={{ maxHeight: 600 }}>
          <Table sx={{ minWidth: 800 }}>
            <TableHead>
              <TableRow
                sx={{
                  background: 'linear-gradient(135deg, #F8FAFC 0%, #F1F5F9 100%)'
                }}
              >
                <TableCell
                  sx={{
                    fontWeight: 600,
                    color: '#374151',
                    fontSize: '0.875rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em'
                  }}
                >
                  ประเภท
                </TableCell>
                <TableCell
                  sx={{
                    fontWeight: 600,
                    color: '#374151',
                    fontSize: '0.875rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em'
                  }}
                >
                  ชื่อสินค้า
                </TableCell>
                <TableCell
                  sx={{
                    fontWeight: 600,
                    color: '#374151',
                    fontSize: '0.875rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em'
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <CalendarToday sx={{ fontSize: 16, mr: 1 }} />
                    วันที่
                  </Box>
                </TableCell>
                <TableCell
                  sx={{
                    fontWeight: 600,
                    color: '#374151',
                    fontSize: '0.875rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em'
                  }}
                >
                  จำนวนที่เหลือ
                </TableCell>
                <TableCell
                  sx={{
                    fontWeight: 600,
                    color: '#374151',
                    fontSize: '0.875rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em'
                  }}
                >
                  จัดการ
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredNotifications.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 8 }}>
                    <Avatar
                      sx={{
                        width: 80,
                        height: 80,
                        bgcolor: '#E2E8F0',
                        mx: 'auto',
                        mb: 2
                      }}
                    >
                      <Notifications sx={{ fontSize: 40, color: '#64748B' }} />
                    </Avatar>
                    <Typography variant="h6" sx={{ color: '#475569', mb: 1 }}>
                      ไม่พบรายการแจ้งเตือน
                    </Typography>
                    <Typography variant="body2" color="#64748B">
                      ไม่พบรายการแจ้งเตือนสต็อกต่ำในขณะนี้
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                filteredNotifications.map((notification, index) => (
                  <TableRow
                    key={notification.id}
                    sx={{
                      '&:hover': {
                        backgroundColor: alpha('#F59E0B', 0.04)
                      },
                      backgroundColor: index % 2 === 0 ? '#FAFAFA' : 'white',
                      cursor: 'pointer'
                    }}
                    onClick={() => handleRowClick(notification)}
                  >
                    <TableCell sx={{ py: 2 }}>
                      <Chip
                        label={notification.type}
                        size="small"
                        icon={getNotificationIcon(notification.type)}
                        sx={{
                          background: getNotificationBgColor(notification.type),
                          color: getNotificationColor(notification.type),
                          border: `1px solid ${alpha(getNotificationColor(notification.type), 0.3)}`,
                          fontWeight: 500,
                          '& .MuiChip-icon': {
                            fontSize: 16,
                            color: getNotificationColor(notification.type)
                          }
                        }}
                      />
                    </TableCell>
                    <TableCell sx={{ py: 2 }}>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {notification.productName}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ py: 2 }}>
                      <Typography variant="body2">
                        {formatDate(notification.notificationDate)}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ py: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Avatar
                          sx={{
                            width: 24,
                            height: 24,
                            background: notification.remainingStock === 0
                              ? 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)'
                              : 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
                            mr: 1
                          }}
                        >
                          <Inventory sx={{ color: 'white', fontSize: 14 }} />
                        </Avatar>
                        <Typography
                          variant="body2"
                          sx={{
                            fontWeight: 600,
                            color: notification.remainingStock === 0 ? '#DC2626' : '#D97706'
                          }}
                        >
                          {notification.remainingStock} ชิ้น
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell sx={{ py: 2 }}>
                      <Button
                        variant="text"
                        size="small"
                        endIcon={<ArrowForward />}
                        sx={{
                          color: '#F59E0B',
                          '&:hover': {
                            background: alpha('#F59E0B', 0.04)
                          }
                        }}
                      >
                        ดูสินค้า
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
};

export default NotificationsTab;
