import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Avatar,
  Grid,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Alert,
  Chip,
  LinearProgress,
  Fade,
} from '@mui/material';
import {
  People,
  ShoppingBag,
  AttachMoney,
  Warning,
  Pending,
  TrendingUp,
  Notifications,
  Inventory,
  LocalShipping,
  Today,
  Error,
  ReportProblem,
} from '@mui/icons-material';
import { getAll, getById } from '../../services/firestore';
import { useAuth } from '../../contexts/AuthContext';

interface ProductRow {
  id: string;
  name: string;
  description?: string;
  price: number;
  quantity: number;
  category?: string;
  sku?: string;
  image?: string;
  createdAt?: any;
}

interface UserRow {
  id: string;
  email?: string;
  role?: string;
  uid?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  createdAt?: any;
}

interface Order {
  id: string;
  uid: string;
  createdAt?: any;
  items: any[];
  total: number;
  fullName: string;
  phone: string;
  address: string;
  status?: string;
  trackingNumber?: string;
}

interface PickingRecord {
  id: string;
  uid: string;
  createdAt?: any;
  items: any[];
  orderId: string;
  status?: string;
  pickerName?: string;
  pickedAt?: any;
}

interface LowStockNotification {
  id: string;
  type: 'สต็อกต่ำ' | 'สต็อกหมด';
  productName: string;
  notificationDate: Date;
  remainingStock: number;
  productId: string;
  pickedAt?: any;
}

interface KPICard {
  title: string;
  value: string | number;
  change: number;
  changeText: string;
  icon: React.ReactNode;
  color: 'success' | 'warning' | 'error' | 'info';
}

const OverviewTab = () => {
  const { currentUser } = useAuth();
  const [lowStockItems, setLowStockItems] = useState<ProductRow[]>([]);
  const [outOfStockItems, setOutOfStockItems] = useState<ProductRow[]>([]);
  const [stockNotifications, setStockNotifications] = useState<LowStockNotification[]>([]);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [pickingRecords, setPickingRecords] = useState<PickingRecord[]>([]);
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stockAlertPage, setStockAlertPage] = useState(0);
  const [stockAlertRowsPerPage, setStockAlertRowsPerPage] = useState(5);
  const [stats, setStats] = useState({
    totalUsers: 0,
    todayOrders: 0,
    totalOrders: 0,
    totalProducts: 0,
    pendingShipments: 0,
    dailyRevenue: 0,
    stockAlerts: 0,
    pendingOrders: 0,
    conversionRate: 0,
  });

  // ตรวจสอบสต็อกต่ำและสต็อกหมด (จาก NotificationsTab)
  const checkStockAlerts = async () => {
    try {
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

      return notifications;
    } catch (e) {
      console.error('Failed to check stock alerts', e);
      return [];
    }
  };

  // โหลดข้อมูลสถิติ
  const loadStats = async () => {
    try {
      const [usersData, ordersData, productsData, pickingData] = await Promise.all([
        getAll('users'),
        getAll('orders'),
        getAll('products'),
        getAll('picking') // เปลี่ยนเป็น collection 'picking'
      ]);

      const users = usersData as UserRow[];
      const orders = ordersData as Order[];
      const products = productsData as ProductRow[];
      const picking = pickingData as PickingRecord[];

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const todayOrders = orders.filter(order => {
        const orderDate = order.createdAt?.toDate ? order.createdAt.toDate() : new Date(order.createdAt);
        return orderDate >= today;
      });

      const pendingOrders = orders.filter(order => 
        order.status === 'รอดำเนินการ' || order.status === 'กำลังดำเนินการ'
      );

      // คำนวณสินค้ารอการจัดส่งจากแอดมิน (จาก collection picking สถานะ "แจ้งเบิก")
      const pendingShipments = picking.filter(record => 
        record.status === 'แจ้งเบิก'
      );

      // คำนวณรายรับต่อวัน (จากออเดอร์วันนี้)
      const dailyRevenue = todayOrders.reduce((sum, order) => sum + (order.total || 0), 0);

      const conversionRate = users.length > 0 ? 
        ((orders.length / users.length) * 100).toFixed(1) : '0';

      // ดึงข้อมูลการแจ้งเตือนสต็อกจากฟังก์ชันเดียวกับ NotificationsTab
      const stockNotifications = await checkStockAlerts();
      const stockAlertsCount = stockNotifications.length;

      setStats({
        totalUsers: users.length,
        todayOrders: todayOrders.length,
        totalOrders: orders.length,
        totalProducts: products.length,
        pendingShipments: pendingShipments.length,
        dailyRevenue,
        stockAlerts: stockAlertsCount, // ใช้จำนวนจาก notifications
        pendingOrders: pendingOrders.length,
        conversionRate: parseFloat(conversionRate as string),
      });

      setUsers(users);
      setRecentOrders(orders.slice(0, 5));
      setPickingRecords(picking); // เก็บข้อมูลการเบิกสินค้าไว้ใช้งาน
    } catch (e) {
      console.error('Failed to load stats', e);
    }
  };

  // จัดการการเปลี่ยนหน้าสำหรับแจ้งเตือนสต็อก
  const handleStockAlertPageChange = (event: React.MouseEvent<HTMLButtonElement> | null, newPage: number) => {
    setStockAlertPage(newPage);
  };

  const handleStockAlertRowsPerPageChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setStockAlertRowsPerPage(parseInt(event.target.value, 10));
    setStockAlertPage(0);
  };

  // รีเฟรชข้อมูล
  const handleRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  // โหลดข้อมูลทั้งหมด
  const loadData = async () => {
    setLoading(true);
    const stockNotifications = await checkStockAlerts();
    
    // เก็บข้อมูล notifications ไว้แสดงในตาราง
    setStockNotifications(stockNotifications);
    
    // แปลง notifications เป็นรูปแบบเดิมเพื่อความเข้ากันได้
    const lowStock: ProductRow[] = [];
    const outOfStock: ProductRow[] = [];
    
    stockNotifications.forEach(notification => {
      const product: ProductRow = {
        id: notification.productId,
        name: notification.productName,
        quantity: notification.remainingStock,
        description: '',
        price: 0,
      };
      
      if (notification.type === 'สต็อกหมด') {
        outOfStock.push(product);
      } else {
        lowStock.push(product);
      }
    });
    
    setLowStockItems(lowStock);
    setOutOfStockItems(outOfStock);
    await loadStats();
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  // KPI Cards Data - แถวที่ 1: 3 อันหลัก
  const topKpiCards: KPICard[] = [
    {
      title: 'ผู้ใช้ทั้งหมด',
      value: stats.totalUsers,
      change: 12,
      changeText: 'จากสัปดาห์ที่แล้ว',
      icon: <People />,
      color: 'success',
    },
    {
      title: 'ออเดอร์วันนี้',
      value: stats.todayOrders,
      change: 8,
      changeText: 'จากเมื่อวาน',
      icon: <ShoppingBag />,
      color: 'info',
    },
    {
      title: 'ออเดอร์ทั้งหมด',
      value: stats.totalOrders,
      change: 15,
      changeText: 'จากเดือนที่แล้ว',
      icon: <AttachMoney />,
      color: 'success',
    },
  ];

  // KPI Cards Data - แถวที่ 2: 3 อันเพิ่มเติม
  const bottomKpiCards: KPICard[] = [
    {
      title: 'จำนวนสินค้าทั้งหมด',
      value: stats.totalProducts,
      change: 5,
      changeText: 'จากเดือนที่แล้ว',
      icon: <Inventory />,
      color: 'info',
    },
    {
      title: 'รอการจัดส่งจากแอดมิน',
      value: stats.pendingShipments,
      change: -3,
      changeText: 'ต้องดำเนินการ',
      icon: <LocalShipping />,
      color: 'warning',
    },
    {
      title: 'รายรับต่อวัน',
      value: `฿${stats.dailyRevenue.toLocaleString()}`,
      change: 20,
      changeText: 'จากเมื่อวาน',
      icon: <Today />,
      color: 'success',
    },
  ];

  // KPI Card Component
  const KPICardComponent = ({ card }: { card: KPICard }) => {
    return (
      <Card 
        sx={{ 
          fontWeight: 700, 
          color: 'white',
          textShadow: '0 2px 4px rgba(0,0,0,0.3)',
          boxShadow: '0 8px 32px rgba(30, 58, 138, 0.15)',
          transition: 'all 0.3s ease',
          '&:hover': {
            transform: 'translateY(-8px)',
            boxShadow: '0 16px 48px rgba(30, 58, 138, 0.25)',
            background: 'rgba(255,255,255,1)',
          },
        }}
      >
        <CardContent sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Avatar 
              sx={{ 
                bgcolor: `${card.color}.main`, 
                width: 48, 
                height: 48,
                mr: 2,
                boxShadow: '0 4px 12px rgba(30, 58, 138, 0.2)'
              }}
            >
              {card.icon}
            </Avatar>
            <Typography variant="h6" color="text.secondary" sx={{ fontSize: '1.1rem', fontWeight: 600 }}>
              {card.title}
            </Typography>
          </Box>
          
          <Typography variant="h2" sx={{ fontWeight: 800, mb: 1, color: '#1e40af', fontSize: '2.5rem' }}>
            {card.value}
          </Typography>
          
          <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.95rem' }}>
            {card.changeText}
          </Typography>
        </CardContent>
      </Card>
    );
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #1e3a8a 0%, #1e40af 25%, #2563eb 50%, #3b82f6 75%, #60a5fa 100%)',
        position: 'relative',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'linear-gradient(135deg, rgba(30, 58, 138, 0.95) 0%, rgba(59, 130, 246, 0.9) 100%)',
          zIndex: -1,
        }
      }}
    >
      {/* Header */}
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        mb: 4,
        px: { xs: 2, sm: 3, md: 4 },
        pt: 3
      }}>
        <Typography 
          variant="h4" 
          sx={{ 
            fontWeight: 700, 
            color: 'white',
            textShadow: '0 2px 4px rgba(0,0,0,0.3)'
          }}
        >
          Admin Dashboard
        </Typography>
        </Box>

      {loading ? (
        <Box sx={{ 
          width: '100%', 
          px: { xs: 2, sm: 3, md: 4 }
        }}>
          <LinearProgress sx={{ bgcolor: 'rgba(255,255,255,0.2)' }} />
        </Box>
      ) : (
        <Fade in={!loading}>
          <Box sx={{ px: { xs: 2, sm: 3, md: 4 } }}>
            {/* KPI Cards Row 1 - 3 อันหลัก */}
            <Box sx={{ 
              display: 'grid', 
              gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' },
              gap: 3,
              mb: 3
            }}>
              {topKpiCards.map((card, index) => (
                <Box key={index}>
                  <KPICardComponent card={card} />
                </Box>
              ))}
            </Box>

            {/* KPI Cards Row 2 - 3 อันเพิ่มเติม */}
            <Box sx={{ 
              display: 'grid', 
              gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' },
              gap: 3,
              mb: 4
            }}>
              {bottomKpiCards.map((card, index) => (
                <Box key={index}>
                  <KPICardComponent card={card} />
                </Box>
              ))}
            </Box>

            {/* ส่วนแจ้งเตือนสต็อกและออเดอร์ล่าสุด */}
            <Box sx={{ 
              display: 'grid', 
              gridTemplateColumns: { xs: '1fr', lg: '1fr 1fr' },
              gap: 3,
              mb: 4
            }}>
              {/* Stock Alerts */}
              <Paper sx={{ 
                p: 3,
                background: 'rgba(255,255,255,0.98)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255,255,255,0.3)',
                boxShadow: '0 8px 32px rgba(30, 58, 138, 0.15)'
              }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box sx={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      width: 36,
                      height: 36,
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, #ff6b6b 0%, #ff4757 100%)',
                      boxShadow: '0 4px 12px rgba(255, 71, 87, 0.3)',
                      animation: 'pulse 2s infinite'
                    }}>
                      <Notifications sx={{ color: 'white', fontSize: 18 }} />
                    </Box>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      แจ้งเตือนสต็อก
                    </Typography>
                    {stats.stockAlerts > 0 && (
                      <Chip 
                        label={`${stats.stockAlerts} รายการ`}
                        size="small"
                        sx={{
                          backgroundColor: '#ff4757',
                          color: 'white',
                          fontWeight: 600,
                          fontSize: '0.75rem',
                          height: 24,
                          '& .MuiChip-label': {
                            px: 1
                          }
                        }}
                      />
                    )}
                  </Box>
                </Box>
                
                {stats.stockAlerts === 0 ? (
                  <Alert 
                    severity="success" 
                    sx={{ 
                      mb: 2,
                      background: 'linear-gradient(135deg, #d4edda 0%, #c3e6cb 100%)',
                      border: '1px solid rgba(40, 167, 69, 0.2)'
                    }}
                  >
                    ✅ สต็อกสินค้าทุกรายการอยู่ในระดับปกติ
                  </Alert>
                ) : (
                  <TableContainer>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell sx={{ fontWeight: 600 }}>สินค้า</TableCell>
                          <TableCell sx={{ fontWeight: 600 }}>คงเหลือ</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {stockNotifications
                          .slice(stockAlertPage * stockAlertRowsPerPage, stockAlertPage * stockAlertRowsPerPage + stockAlertRowsPerPage)
                          .map((notification) => (
                            <TableRow key={notification.id}>
                              <TableCell>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                  {/* ไอคอนแจ้งเตือนที่โดดเด่น */}
                                  {notification.type === 'สต็อกหมด' ? (
                                    <Box sx={{ 
                                      display: 'flex', 
                                      alignItems: 'center', 
                                      justifyContent: 'center',
                                      width: 40,
                                      height: 40,
                                      borderRadius: '50%',
                                      background: 'linear-gradient(135deg, #ff4757 0%, #ff3742 100%)',
                                      boxShadow: '0 4px 12px rgba(255, 71, 87, 0.3)',
                                      animation: 'pulse 2s infinite'
                                    }}>
                                      <Error sx={{ color: 'white', fontSize: 20 }} />
                                    </Box>
                                  ) : (
                                    <Box sx={{ 
                                      display: 'flex', 
                                      alignItems: 'center', 
                                      justifyContent: 'center',
                                      width: 40,
                                      height: 40,
                                      borderRadius: '50%',
                                      background: 'linear-gradient(135deg, #ffa502 0%, #ff7675 100%)',
                                      boxShadow: '0 4px 12px rgba(255, 165, 2, 0.3)',
                                      animation: 'pulse 2s infinite'
                                    }}>
                                      <ReportProblem sx={{ color: 'white', fontSize: 20 }} />
                                    </Box>
                                  )}
                                  
                                  {/* ข้อมูลสินค้า */}
                                  <Box>
                                    <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.9rem' }}>
                                      {notification.productName}
                                    </Typography>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                                      {notification.type === 'สต็อกหมด' ? (
                                        <Chip 
                                          label="สินค้าหมด"
                                          size="small"
                                          sx={{
                                            backgroundColor: '#ff4757',
                                            color: 'white',
                                            fontWeight: 600,
                                            fontSize: '0.7rem',
                                            height: 20,
                                            '& .MuiChip-label': {
                                              px: 1
                                            }
                                          }}
                                        />
                                      ) : (
                                        <Chip 
                                          label="สินค้าต่ำ"
                                          size="small"
                                          sx={{
                                            backgroundColor: '#ffa502',
                                            color: 'white',
                                            fontWeight: 600,
                                            fontSize: '0.7rem',
                                            height: 20,
                                            '& .MuiChip-label': {
                                              px: 1
                                            }
                                          }}
                                        />
                                      )}
                                      <Typography variant="caption" color="text.secondary">
                                        {notification.notificationDate.toLocaleDateString('th-TH')}
                                      </Typography>
                                    </Box>
                                  </Box>
                                </Box>
                              </TableCell>
                              <TableCell>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                  <Typography 
                                    variant="body2" 
                                    sx={{ 
                                      fontWeight: 700,
                                      fontSize: '1rem',
                                      color: notification.type === 'สต็อกหมด' ? '#ff4757' : '#ffa502'
                                    }}
                                  >
                                    {notification.remainingStock}
                                  </Typography>
                                  <Typography variant="body2" color="text.secondary">
                                    ชิ้น
                                  </Typography>
                                </Box>
                              </TableCell>
                            </TableRow>
                          ))}
                      </TableBody>
                    </Table>
                    <TablePagination
                      rowsPerPageOptions={[5, 10, 25]}
                      component="div"
                      count={stockNotifications.length}
                      rowsPerPage={stockAlertRowsPerPage}
                      page={stockAlertPage}
                      onPageChange={handleStockAlertPageChange}
                      onRowsPerPageChange={handleStockAlertRowsPerPageChange}
                      labelRowsPerPage="รายการต่อหน้า"
                      labelDisplayedRows={({ from, to, count }: { from: number; to: number; count: number }) => `${from}-${to} จาก ${count}`}
                    />
                  </TableContainer>
                )}
              </Paper>

              {/* Recent Orders */}
              <Paper sx={{ 
                p: 3,
                background: 'rgba(255,255,255,0.98)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255,255,255,0.3)',
                boxShadow: '0 8px 32px rgba(30, 58, 138, 0.15)'
              }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    📋 ออเดอร์ล่าสุด ({recentOrders.length} รายการ)
                  </Typography>
                </Box>
                
                {recentOrders.length === 0 ? (
                  <Alert 
                    severity="info"
                    sx={{ 
                      background: 'linear-gradient(135deg, #d1ecf1 0%, #bee5eb 100%)',
                      border: '1px solid rgba(23, 162, 184, 0.2)'
                    }}
                  >
                    ยังไม่มีออเดอร์ล่าสุด
                  </Alert>
                ) : (
                  <TableContainer>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell sx={{ fontWeight: 600 }}>ออเดอร์ #</TableCell>
                          <TableCell sx={{ fontWeight: 600 }}>ลูกค้า</TableCell>
                          <TableCell sx={{ fontWeight: 600 }}>จำนวนเงิน</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {recentOrders.map((order) => (
                          <TableRow key={order.id}>
                            <TableCell>
                              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                #{order.id.slice(-4)}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2">
                                {order.fullName}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2" sx={{ fontWeight: 600, color: 'success.main' }}>
                                ฿{order.total.toLocaleString()}
                              </Typography>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}
              </Paper>
            </Box>
          </Box>
        </Fade>
      )}
    </Box>
  );
};

export default OverviewTab;
