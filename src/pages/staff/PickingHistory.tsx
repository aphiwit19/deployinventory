import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Paper,
  Avatar,
  IconButton,
  Tooltip,
  useTheme,
} from '@mui/material';
import { useAuth } from '../../contexts/AuthContext';
import { queryDocs, getAll } from '../../services/firestore';
import HistoryIcon from '@mui/icons-material/History';
import AssignmentIcon from '@mui/icons-material/Assignment';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import RefreshIcon from '@mui/icons-material/Refresh';
import PersonIcon from '@mui/icons-material/Person';

interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  imageUrl?: string;
}

interface PickingRecord {
  id: string;
  orderId: string;
  staffId: string;
  staffName: string;
  items: OrderItem[];
  total: number;
  customerInfo: {
    fullName: string;
    phone: string;
    address: string;
  };
  pickedAt: any;
  status: string;
  trackingNumber?: string;
  shippingNotes?: string;
}

const PickingHistory = () => {
  const { currentUser } = useAuth();
  const theme = useTheme();
  const [pickingHistory, setPickingHistory] = useState<PickingRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  // Pagination state
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const handleChangePage = (event: React.MouseEvent<HTMLButtonElement> | null, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // รายการที่จะแสดงในหน้าปัจจุบัน
  const displayedHistory = pickingHistory.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadPickingHistory();
    setRefreshing(false);
  };

  const loadPickingHistory = async () => {
    if (!currentUser) return;
    
    try {
      // ดึงประวัติการเบิกของ staff คนนั้นๆ
      const myPicking = await queryDocs('picking', 'staffId', '==', currentUser.uid);
      setPickingHistory(myPicking as PickingRecord[]);
      
      // ดึงออเดอร์ที่ถูกมอบหมายให้ตัวเองแต่ยังไม่ได้เบิก
      const allOrders = await getAll('orders');
      const assignedOrders = (allOrders as any[]).filter(
        (order) => order.assignedTo === currentUser.uid && order.status === 'รอดำเนินการ'
      );
      
      // แปลงออเดอร์ที่มอบหมายให้เป็นรูปแบบ picking record
      const assignedRecords = assignedOrders.map(order => ({
        id: order.id,
        orderId: order.id,
        staffId: currentUser.uid,
        staffName: currentUser.email || 'พนักงาน',
        items: order.items,
        total: order.total,
        customerInfo: {
          fullName: order.fullName,
          phone: order.phone,
          address: order.address,
        },
        pickedAt: order.assignedAt,
        status: 'มอบหมายแล้ว',
        trackingNumber: '',
        shippingNotes: '',
      }));
      
      // รวมประวัติเดิมกับออเดอร์ที่มอบหมายใหม่
      setPickingHistory([...assignedRecords, ...myPicking as PickingRecord[]]);
    } catch (e) {
      console.error('Failed to load picking history', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPickingHistory();

    // เพิ่มการรีเฟรชทุก 30 วินาที
    const intervalId = setInterval(() => {
      loadPickingHistory();
    }, 30000);

    return () => clearInterval(intervalId);
  }, [currentUser]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
        <CircularProgress sx={{ color: theme.palette.primary.main }} />
      </Box>
    );
  }

  return (
    <Box sx={{ 
      p: { xs: 2, sm: 3 }, 
      minHeight: 'calc(100vh - 64px)',
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* Header Section */}
      <Box sx={{ mb: 3 }}>
        <Typography 
          variant="h4" 
          sx={{ 
            fontWeight: 700, 
            fontFamily: '"Playfair Display", serif',
            background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.light})`,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            mb: 1
          }}
        >
          ประวัติการเบิกสินค้า
        </Typography>
        <Typography variant="body1" color="text.secondary">
          รายการการเบิกสินค้าและออเดอร์ที่คุณได้รับมอบหมาย
        </Typography>
      </Box>

      {/* History Table */}
      {pickingHistory.length === 0 ? (
        <Paper 
          sx={{ 
            p: 6, 
            textAlign: 'center',
            borderRadius: 3,
            backgroundColor: 'background.paper',
            border: `1px solid ${theme.palette.divider}`,
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center'
          }}
        >
          <Avatar sx={{ 
            width: 80, 
            height: 80, 
            mx: 'auto', 
            mb: 2,
            backgroundColor: 'action.disabledBackground',
            color: 'action.disabled'
          }}>
            <HistoryIcon sx={{ fontSize: 40 }} />
          </Avatar>
          <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
            ไม่มีประวัติการเบิกสินค้า
          </Typography>
          <Typography variant="body2" color="text.secondary">
            ยังไม่มีประวัติการเบิกสินค้าหรือออเดอร์ที่ได้รับมอบหมาย
          </Typography>
        </Paper>
      ) : (
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          <TableContainer 
            sx={{ 
              height: 'auto',
              maxHeight: 'calc(100vh - 200px)',
              border: '1px solid #e0e0e0',
              borderRadius: 1,
              '&::-webkit-scrollbar': {
                width: '8px',
              },
              '&::-webkit-scrollbar-track': {
                backgroundColor: '#f1f1f1',
              },
              '&::-webkit-scrollbar-thumb': {
                backgroundColor: '#888',
                borderRadius: '4px',
              },
              '&::-webkit-scrollbar-thumb:hover': {
                backgroundColor: '#555',
              },
            }}
          >
            <Table 
              stickyHeader
              sx={{
                borderCollapse: 'separate',
                borderSpacing: 0,
                height: 'auto',
                '& .MuiTableCell-root': {
                  borderBottom: 'none',
                },
              }}
            >
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 600, backgroundColor: '#f5f5f5', borderBottom: '2px solid #e0e0e0' }}>เลขที่ออเดอร์</TableCell>
                <TableCell sx={{ fontWeight: 600, backgroundColor: '#f5f5f5', borderBottom: '2px solid #e0e0e0' }}>ลูกค้า</TableCell>
                <TableCell sx={{ fontWeight: 600, backgroundColor: '#f5f5f5', borderBottom: '2px solid #e0e0e0' }}>ที่อยู่</TableCell>
                <TableCell sx={{ fontWeight: 600, backgroundColor: '#f5f5f5', borderBottom: '2px solid #e0e0e0' }}>รายการสินค้า</TableCell>
                <TableCell sx={{ fontWeight: 600, backgroundColor: '#f5f5f5', borderBottom: '2px solid #e0e0e0' }}>ยอดรวม</TableCell>
                <TableCell sx={{ fontWeight: 600, backgroundColor: '#f5f5f5', borderBottom: '2px solid #e0e0e0' }}>วันที่เบิก</TableCell>
                <TableCell sx={{ fontWeight: 600, backgroundColor: '#f5f5f5', borderBottom: '2px solid #e0e0e0' }}>สถานะ</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {displayedHistory.map((record) => {
                const isCompleted = record.status === 'จัดส่งแล้ว' || record.status === 'เสร็จสิ้น';
                const isAssigned = record.status === 'มอบหมายแล้ว';
                const isInProgress = record.status === 'แจ้งเบิก';
                
                return (
                  <TableRow 
                    key={record.id}
                    sx={{
                      backgroundColor: isCompleted ? 'rgba(16, 185, 129, 0.05)' : 
                                     isAssigned ? 'rgba(245, 158, 11, 0.05)' : 
                                     isInProgress ? 'rgba(59, 130, 246, 0.05)' : 'inherit',
                      '&:hover': {
                        backgroundColor: isCompleted ? 'rgba(16, 185, 129, 0.1)' : 
                                       isAssigned ? 'rgba(245, 158, 11, 0.1)' : 
                                       isInProgress ? 'rgba(59, 130, 246, 0.1)' : 'rgba(0, 0, 0, 0.04)',
                      },
                    }}
                  >
                    <TableCell sx={{ borderBottom: '1px solid #e0e0e0' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          #{record.orderId.slice(-6)}
                        </Typography>
                        {isCompleted && <span style={{ color: '#10B981', fontSize: '0.75rem' }}>✅</span>}
                        {isAssigned && <span style={{ color: '#F59E0B', fontSize: '0.75rem' }}>📋</span>}
                        {isInProgress && <span style={{ color: '#3B82F6', fontSize: '0.75rem' }}>🔄</span>}
                      </Box>
                    </TableCell>
                    <TableCell sx={{ borderBottom: '1px solid #e0e0e0' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Avatar sx={{ width: 24, height: 24, backgroundColor: 'action.disabledBackground' }}>
                          <PersonIcon sx={{ fontSize: 14 }} />
                        </Avatar>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {record.customerInfo.fullName}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell sx={{ maxWidth: 200, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', borderBottom: '1px solid #e0e0e0' }}>
                      <Typography variant="body2" color="text.secondary">
                        {record.customerInfo.address}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ borderBottom: '1px solid #e0e0e0' }}>
                      <Box sx={{ maxHeight: 80, overflowY: 'auto' }}>
                        {record.items.map((item, index) => (
                          <Typography key={item.id || index} variant="body2" sx={{ fontSize: '0.875rem', py: 0.25 }}>
                            • {item.name} x{item.quantity}
                          </Typography>
                        ))}
                      </Box>
                    </TableCell>
                    <TableCell sx={{ borderBottom: '1px solid #e0e0e0' }}>
                      <Typography variant="body1" sx={{ fontWeight: 700, color: '#1E3A8A' }}>
                        ฿{record.total.toLocaleString()}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ borderBottom: '1px solid #e0e0e0' }}>
                      <Typography variant="body2" color="text.secondary">
                        {record.pickedAt?.toDate?.().toLocaleDateString('th-TH') ||
                          record.pickedAt?.toLocaleDateString?.('th-TH') ||
                          '-'}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ borderBottom: '1px solid #e0e0e0' }}>
                      <Chip
                        label={record.status}
                        color={
                          record.status === 'จัดส่งแล้ว' || record.status === 'เสร็จสิ้น'
                            ? 'success'
                            : record.status === 'แจ้งเบิก'
                            ? 'primary'
                            : record.status === 'มอบหมายแล้ว'
                            ? 'warning'
                            : 'default'
                        }
                        size="small"
                        sx={{ 
                          fontWeight: 600,
                          '& .MuiChip-label': {
                            px: 1
                          }
                        }}
                      />
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
            </Table>
          </TableContainer>
          {pickingHistory.length > 5 && (
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'center', 
              alignItems: 'center',
              borderTop: '1px solid #E2E8F0',
              py: 2,
              gap: 1,
              mt: 1
            }}>
              <IconButton
                onClick={(e) => handleChangePage(e, page - 1)}
                disabled={page === 0}
                sx={{ 
                  color: page === 0 ? '#ccc' : '#6366F1',
                  '&:hover': { backgroundColor: 'rgba(99, 102, 241, 0.1)' }
                }}
              >
                {'<'}
              </IconButton>
              
              {Array.from({ length: Math.ceil(pickingHistory.length / rowsPerPage) }, (_, index) => (
                <IconButton
                  key={index}
                  onClick={(e) => handleChangePage(e, index)}
                  sx={{
                    color: page === index ? '#6366F1' : '#666',
                    backgroundColor: page === index ? 'rgba(99, 102, 241, 0.1)' : 'transparent',
                    '&:hover': { backgroundColor: 'rgba(99, 102, 241, 0.1)' },
                    fontSize: '0.875rem',
                    fontWeight: page === index ? 600 : 400,
                    minWidth: 32,
                    height: 32
                  }}
                >
                  {index + 1}
                </IconButton>
              ))}
              
              <IconButton
                onClick={(e) => handleChangePage(e, page + 1)}
                disabled={page >= Math.ceil(pickingHistory.length / rowsPerPage) - 1}
                sx={{ 
                  color: page >= Math.ceil(pickingHistory.length / rowsPerPage) - 1 ? '#ccc' : '#6366F1',
                  '&:hover': { backgroundColor: 'rgba(99, 102, 241, 0.1)' }
                }}
              >
                {'>'}
              </IconButton>
            </Box>
          )}
        </Box>
      )}
    </Box>
  );
};

export default PickingHistory;
