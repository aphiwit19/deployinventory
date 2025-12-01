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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Paper,
  CircularProgress,
  Avatar,
  useTheme,
  alpha,
  Grid,
  Chip,
  IconButton,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { getAll } from '../../services/firestore';
import { th } from 'date-fns/locale';
import {
  History,
  TrendingUp,
  TrendingDown,
  Search,
  FilterAlt,
  Clear,
  Inventory,
  CalendarToday,
  Add,
  Remove,
  LocalShipping,
} from '@mui/icons-material';

interface StockTransaction {
  id: string;
  type: 'stock_in' | 'stock_out';
  productName: string;
  quantity: number;
  reason: string;
  referenceId: string;
  createdAt: any;
}

const StockHistoryTab: React.FC = () => {
  const [transactions, setTransactions] = useState<StockTransaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'stock_in' | 'stock_out'>('all');
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  
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

  useEffect(() => {
    loadTransactions();
  }, []);

  const loadTransactions = async () => {
    try {
      setLoading(true);
      const data = await getAll('stockTransactions');
      setTransactions(data as StockTransaction[]);
    } catch (e) {
      console.error('Failed to load stock transactions', e);
    } finally {
      setLoading(false);
    }
  };

  const filteredTransactions = transactions
    .filter((transaction) => {
      // ค้นหาชื่อสินค้า
      if (searchTerm && !transaction.productName.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false;
      }

      // กรองประเภท
      if (filterType !== 'all' && transaction.type !== filterType) {
        return false;
      }

      // กรองวันที่
      if (startDate && transaction.createdAt) {
        const transactionDate = new Date(transaction.createdAt.seconds * 1000);
        if (transactionDate < startDate) return false;
      }
      if (endDate && transaction.createdAt) {
        const transactionDate = new Date(transaction.createdAt.seconds * 1000);
        if (transactionDate > endDate) return false;
      }

      return true;
    })
    .sort((a, b) => {
      // เรียงลำดับจากวันที่ล่าสุดอยู่บน
      const dateA = a.createdAt ? new Date(a.createdAt.seconds * 1000).getTime() : 0;
      const dateB = b.createdAt ? new Date(b.createdAt.seconds * 1000).getTime() : 0;
      return dateB - dateA;
    });

  // รายการที่จะแสดงในหน้าปัจจุบัน
  const displayedTransactions = filteredTransactions.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  // คำนวณสรุปยอด
  const totalIn = filteredTransactions
    .filter(t => t.type === 'stock_in')
    .reduce((sum, t) => sum + Math.abs(t.quantity), 0);
  
  const totalOut = filteredTransactions
    .filter(t => t.type === 'stock_out')
    .reduce((sum, t) => sum + Math.abs(t.quantity), 0);

  const formatDate = (timestamp: any) => {
    if (!timestamp) return '-';
    const date = new Date(timestamp.seconds * 1000);
    return date.toLocaleDateString('th-TH', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const getTransactionIcon = (reason: string) => {
    switch (reason) {
      case 'เพิ่มสินค้าใหม่':
        return <Add sx={{ fontSize: 16 }} />;
      case 'เพิ่มสินค้าเดิม':
        return <TrendingUp sx={{ fontSize: 16 }} />;
      case 'จัดส่งสินค้า':
        return <LocalShipping sx={{ fontSize: 16 }} />;
      default:
        return <History sx={{ fontSize: 16 }} />;
    }
  };

  const getTransactionColor = (reason: string) => {
    switch (reason) {
      case 'เพิ่มสินค้าใหม่':
        return '#1976d2'; // ฟ้า
      case 'เพิ่มสินค้าเดิม':
        return '#2e7d32'; // เขียวเข้ม
      case 'จัดส่งสินค้า':
        return '#ed6c02'; // ส้ม
      default:
        return '#757575'; // เทา
    }
  };

  const clearFilters = () => {
    setSearchTerm('');
    setFilterType('all');
    setStartDate(null);
    setEndDate(null);
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
            color: '#3B82F6',
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
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={th}>
      <Box sx={{ p: 3 }}>
        {/* Header Section */}
        <Box sx={{ mb: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Avatar
              sx={{
                width: 48,
                height: 48,
                background: 'linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)',
                mr: 2,
                boxShadow: '0 4px 12px rgba(139, 92, 246, 0.3)'
              }}
            >
              <History sx={{ color: 'white', fontSize: 24 }} />
            </Avatar>
            <Box>
              <Typography
                variant="h4"
                sx={{
                  fontWeight: 700,
                  background: 'linear-gradient(135deg, #6D28D9 0%, #8B5CF6 100%)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  mb: 0.5
                }}
              >
                ประวัติการเข้า-ออกสินค้า
              </Typography>
              <Typography variant="body1" color="text.secondary">
                ติดตามการเคลื่อนไหวของสินค้าทั้งหมดในระบบ
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
                background: 'linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)',
                mr: 2
              }}
            >
              <FilterAlt sx={{ color: 'white', fontSize: 16 }} />
            </Avatar>
            <Typography variant="h6" sx={{ fontWeight: 600, color: '#1E293B' }}>
              ตัวกรองข้อมูล
            </Typography>
          </Box>
          
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, md: 4 }}>
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
            
            <Grid size={{ xs: 12, md: 4 }}>
              <FormControl fullWidth>
                <InputLabel>ประเภทรายการ</InputLabel>
                <Select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value as any)}
                  label="ประเภทรายการ"
                  sx={{ borderRadius: 2 }}
                >
                  <MenuItem value="all">ทั้งหมด</MenuItem>
                  <MenuItem value="stock_in">เข้า</MenuItem>
                  <MenuItem value="stock_out">ออก</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid size={{ xs: 12, md: 4 }}>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <DatePicker
                  label="วันที่เริ่มต้น"
                  value={startDate}
                  onChange={(newValue: Date | null) => setStartDate(newValue)}
                  slotProps={{ textField: { size: 'small', fullWidth: true, sx: { borderRadius: 2 } } }}
                />
                <DatePicker
                  label="วันที่สิ้นสุด"
                  value={endDate}
                  onChange={(newValue: Date | null) => setEndDate(newValue)}
                  slotProps={{ textField: { size: 'small', fullWidth: true, sx: { borderRadius: 2 } } }}
                />
                <Button
                  variant="outlined"
                  onClick={clearFilters}
                  startIcon={<Clear />}
                  sx={{
                    borderColor: '#8B5CF6',
                    color: '#8B5CF6',
                    '&:hover': {
                      borderColor: '#7C3AED',
                      background: alpha('#8B5CF6', 0.04)
                    }
                  }}
                >
                  ล้าง
                </Button>
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
                    สินค้า
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
                    ประเภทรายการ
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
                    จำนวน
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
                    อ้างอิง
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {displayedTransactions.length === 0 ? (
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
                        <Inventory sx={{ fontSize: 40, color: '#64748B' }} />
                      </Avatar>
                      <Typography variant="h6" sx={{ color: '#475569', mb: 1 }}>
                        ไม่พบข้อมูลรายการ
                      </Typography>
                      <Typography variant="body2" color="#64748B">
                        ไม่พบข้อมูลที่ตรงกับเงื่อนไขการค้นหา
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  displayedTransactions.map((transaction, index) => (
                    <TableRow
                      key={transaction.id}
                      sx={{
                        '&:hover': {
                          backgroundColor: alpha('#8B5CF6', 0.04)
                        },
                        backgroundColor: index % 2 === 0 ? '#FAFAFA' : 'white'
                      }}
                    >
                      <TableCell sx={{ py: 2 }}>
                        <Typography variant="body2">
                          {formatDate(transaction.createdAt)}
                        </Typography>
                      </TableCell>
                      <TableCell sx={{ py: 2 }}>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {transaction.productName}
                        </Typography>
                      </TableCell>
                      <TableCell sx={{ py: 2 }}>
                        <Chip
                          label={transaction.reason}
                          size="small"
                          icon={getTransactionIcon(transaction.reason)}
                          sx={{
                            background: alpha(getTransactionColor(transaction.reason), 0.1),
                            color: getTransactionColor(transaction.reason),
                            border: `1px solid ${alpha(getTransactionColor(transaction.reason), 0.3)}`,
                            fontWeight: 500,
                            '& .MuiChip-icon': {
                              fontSize: 16,
                              color: getTransactionColor(transaction.reason)
                            }
                          }}
                        />
                      </TableCell>
                      <TableCell sx={{ py: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Avatar
                            sx={{
                              width: 24,
                              height: 24,
                              background: transaction.type === 'stock_in' 
                                ? 'linear-gradient(135deg, #10B981 0%, #059669 100%)'
                                : 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)',
                              mr: 1
                            }}
                          >
                            {transaction.type === 'stock_in' ? (
                              <Add sx={{ color: 'white', fontSize: 14 }} />
                            ) : (
                              <Remove sx={{ color: 'white', fontSize: 14 }} />
                            )}
                          </Avatar>
                          <Typography
                            variant="body2"
                            sx={{
                              fontWeight: 600,
                              color: transaction.type === 'stock_in' ? '#059669' : '#DC2626'
                            }}
                          >
                            {transaction.type === 'stock_in' ? '+' : ''}{transaction.quantity}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell sx={{ py: 2 }}>
                        <Typography
                          variant="body2"
                          sx={{
                            fontFamily: 'monospace',
                            background: '#F3F4F6',
                            px: 1,
                            py: 0.5,
                            borderRadius: 1,
                            fontSize: '0.813rem'
                          }}
                        >
                          {transaction.referenceId}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
          {filteredTransactions.length > 5 && (
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'center', 
              alignItems: 'center',
              borderTop: '1px solid #E2E8F0',
              py: 2,
              gap: 1
            }}>
              <IconButton
                onClick={(e) => handleChangePage(e, page - 1)}
                disabled={page === 0}
                sx={{ 
                  color: page === 0 ? '#ccc' : '#8B5CF6',
                  '&:hover': { backgroundColor: 'rgba(139, 92, 246, 0.1)' }
                }}
              >
                {'<'}
              </IconButton>
              
              {Array.from({ length: Math.ceil(filteredTransactions.length / rowsPerPage) }, (_, index) => (
                <IconButton
                  key={index}
                  onClick={(e) => handleChangePage(e, index)}
                  sx={{
                    color: page === index ? '#8B5CF6' : '#666',
                    backgroundColor: page === index ? 'rgba(139, 92, 246, 0.1)' : 'transparent',
                    '&:hover': { backgroundColor: 'rgba(139, 92, 246, 0.1)' },
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
                disabled={page >= Math.ceil(filteredTransactions.length / rowsPerPage) - 1}
                sx={{ 
                  color: page >= Math.ceil(filteredTransactions.length / rowsPerPage) - 1 ? '#ccc' : '#8B5CF6',
                  '&:hover': { backgroundColor: 'rgba(139, 92, 246, 0.1)' }
                }}
              >
                {'>'}
              </IconButton>
            </Box>
          )}
        </Paper>
      </Box>
    </LocalizationProvider>
  );
};

export default StockHistoryTab;
