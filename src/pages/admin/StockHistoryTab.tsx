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
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { getAll } from '../../services/firestore';
import { th } from 'date-fns/locale';

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

  const filteredTransactions = transactions.filter((transaction) => {
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
  });

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

  const getReasonColor = (reason: string) => {
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
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={th}>
      <Box>
        <Typography variant="h4" gutterBottom>
          ประวัติการเข้า-ออกสินค้า
        </Typography>

        {/* ตัวกรอง */}
        <Paper sx={{ p: 2, mb: 3 }}>
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 2, mb: 2 }}>
            <TextField
              label="ค้นหาชื่อสินค้า"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            
            <FormControl>
              <InputLabel>ประเภทรายการ</InputLabel>
              <Select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value as any)}
              >
                <MenuItem value="all">ทั้งหมด</MenuItem>
                <MenuItem value="stock_in">เข้า</MenuItem>
                <MenuItem value="stock_out">ออก</MenuItem>
              </Select>
            </FormControl>
          </Box>

          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 2, mb: 2 }}>
            <DatePicker
              label="วันที่เริ่มต้น"
              value={startDate}
              onChange={(newValue: Date | null) => setStartDate(newValue)}
              slotProps={{ textField: { size: 'small' } }}
            />
            
            <DatePicker
              label="วันที่สิ้นสุด"
              value={endDate}
              onChange={(newValue: Date | null) => setEndDate(newValue)}
              slotProps={{ textField: { size: 'small' } }}
            />

            <Button variant="outlined" onClick={clearFilters} sx={{ alignSelf: 'end' }}>
              ล้างตัวกรอง
            </Button>
          </Box>
        </Paper>

        {/* สรุปยอด */}
        <Paper sx={{ p: 2, mb: 3, bgcolor: '#f5f5f5' }}>
          <Typography variant="h6" gutterBottom>
            สรุปยอด
          </Typography>
          <Box sx={{ display: 'flex', gap: 3 }}>
            <Typography color="success.main">
              <strong>เข้าทั้งหมด:</strong> {totalIn} ชิ้น
            </Typography>
            <Typography color="error.main">
              <strong>ออกทั้งหมด:</strong> {totalOut} ชิ้น
            </Typography>
            <Typography color="primary.main">
              <strong>สุทธิ:</strong> {totalIn - totalOut} ชิ้น
            </Typography>
          </Box>
        </Paper>

        {/* ตารางรายการ */}
        <TableContainer component={Paper}>
          <Table>
            <TableHead sx={{ bgcolor: '#f5f5f5' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 600 }}>วันที่</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>สินค้า</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>ประเภทรายการ</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>จำนวน</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>อ้างอิง</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredTransactions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                    <Typography color="text.secondary">
                      ไม่พบข้อมูลรายการ
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                filteredTransactions.map((transaction) => (
                  <TableRow key={transaction.id} hover>
                    <TableCell>{formatDate(transaction.createdAt)}</TableCell>
                    <TableCell>{transaction.productName}</TableCell>
                    <TableCell>
                      <Typography
                        component="span"
                        sx={{
                          color: getReasonColor(transaction.reason),
                          fontWeight: 500,
                        }}
                      >
                        {transaction.reason}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography
                        sx={{
                          color: transaction.type === 'stock_in' ? 'success.main' : 'error.main',
                          fontWeight: 600,
                        }}
                      >
                        {transaction.type === 'stock_in' ? '+' : ''}{transaction.quantity}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                        {transaction.referenceId}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    </LocalizationProvider>
  );
};

export default StockHistoryTab;
