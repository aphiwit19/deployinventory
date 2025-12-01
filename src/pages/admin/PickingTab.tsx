import React, { useState } from 'react';
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Paper,
  Grid,
  Avatar,
  useTheme,
  alpha,
  IconButton,
} from '@mui/material';
import {
  LocalShipping,
  Person,
  CalendarToday,
  AttachMoney,
  CheckCircle,
  Pending,
  Inventory,
} from '@mui/icons-material';

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
  trackingNumber: string;
  shippingMethod: string;
  shippingNotes: string;
}

interface PickingTabProps {
  pickingRecords: PickingRecord[];
  loadingPickingRecords: boolean;
  editingPicking: PickingRecord | null;
  pickingForm: {
    trackingNumber: string;
    shippingMethod: string;
  };
  onEditPicking: (record: PickingRecord) => void;
  onPickingFormChange: (field: 'trackingNumber' | 'shippingMethod', value: string) => void;
  onSavePicking: () => void;
  onCancelEdit: () => void;
  onMarkAsDelivered: (record: PickingRecord) => void;
}

const PickingTab: React.FC<PickingTabProps> = ({
  pickingRecords,
  loadingPickingRecords,
  editingPicking,
  pickingForm,
  onEditPicking,
  onPickingFormChange,
  onSavePicking,
  onCancelEdit,
  onMarkAsDelivered,
}) => {
  const theme = useTheme();
  
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
  const displayedRecords = pickingRecords.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'จัดส่งสำเร็จ':
        return 'success';
      case 'จัดส่งแล้ว':
        return 'success';
      case 'กำลังจัดส่ง':
        return 'warning';
      case 'แจ้งเบิก':
        return 'info';
      default:
        return 'default';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'จัดส่งสำเร็จ':
        return <CheckCircle sx={{ fontSize: 16 }} />;
      case 'จัดส่งแล้ว':
        return <LocalShipping sx={{ fontSize: 16 }} />;
      case 'กำลังจัดส่ง':
        return <LocalShipping sx={{ fontSize: 16 }} />;
      case 'แจ้งเบิก':
        return <Pending sx={{ fontSize: 16 }} />;
      default:
        return <Pending sx={{ fontSize: 16 }} />;
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header Section */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Avatar
            sx={{
              width: 48,
              height: 48,
              background: 'linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)',
              mr: 2,
              boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)'
            }}
          >
            <LocalShipping sx={{ color: 'white', fontSize: 24 }} />
          </Avatar>
          <Box>
            <Typography
              variant="h4"
              sx={{
                fontWeight: 700,
                background: 'linear-gradient(135deg, #1E40AF 0%, #3B82F6 100%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                mb: 0.5
              }}
            >
              การเบิกสินค้า
            </Typography>
            <Typography variant="body1" color="text.secondary">
              รายการที่สตาฟแจ้งเบิกสินค้าแล้ว รอดำเนินการจัดส่ง
            </Typography>
          </Box>
        </Box>
      </Box>
      
      {/* Loading State */}
      {loadingPickingRecords ? (
        <Paper
          sx={{
            p: 8,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(135deg, #F8FAFC 0%, #F1F5F9 100%)',
            border: '1px solid #E2E8F0',
            borderRadius: 3
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
      ) : pickingRecords.length === 0 ? (
        <Paper
          sx={{
            p: 8,
            textAlign: 'center',
            background: 'linear-gradient(135deg, #F8FAFC 0%, #F1F5F9 100%)',
            border: '1px solid #E2E8F0',
            borderRadius: 3
          }}
        >
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
            ยังไม่มีรายการเบิกสินค้า
          </Typography>
          <Typography variant="body2" color="#64748B">
            ไม่พบรายการที่รอการจัดส่งในขณะนี้
          </Typography>
        </Paper>
      ) : (
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
                      <Person sx={{ fontSize: 16, mr: 1 }} />
                      พนักงาน
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
                    ลูกค้า
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
                    ที่อยู่จัดส่ง
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
                      วันที่เบิก
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
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <AttachMoney sx={{ fontSize: 16, mr: 1 }} />
                      ยอดรวม
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
                    ขนส่ง
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
                    เลขพัสดุ
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
                    สถานะ
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
                {displayedRecords.map((record, index) => (
                  <TableRow
                    key={record.id}
                    sx={{
                      '&:hover': {
                        backgroundColor: alpha('#3B82F6', 0.04)
                      },
                      backgroundColor: index % 2 === 0 ? '#FAFAFA' : 'white'
                    }}
                  >
                    <TableCell sx={{ py: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Avatar
                          sx={{
                            width: 32,
                            height: 32,
                            background: 'linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)',
                            mr: 2,
                            fontSize: '0.875rem'
                          }}
                        >
                          {record.staffName?.charAt(0) || 'S'}
                        </Avatar>
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {record.staffName}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell sx={{ py: 2 }}>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {record.customerInfo.fullName}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ py: 2, maxWidth: 200 }}>
                      <Typography
                        variant="body2"
                        sx={{
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          fontSize: '0.813rem'
                        }}
                      >
                        {record.customerInfo.address}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ py: 2 }}>
                      <Typography variant="body2">
                        {record.pickedAt?.toDate?.().toLocaleDateString('th-TH') ||
                          record.pickedAt?.toLocaleDateString?.('th-TH') ||
                          '-'}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ py: 2 }}>
                      <Typography
                        variant="body2"
                        sx={{
                          fontWeight: 600,
                          color: '#059669'
                        }}
                      >
                        ฿{record.total.toLocaleString('th-TH', {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ py: 2 }}>
                      {record.shippingMethod ? (
                        <Chip
                          label={record.shippingMethod}
                          size="small"
                          sx={{
                            background: 'linear-gradient(135deg, #EFF6FF 0%, #DBEAFE 100%)',
                            color: '#1D4ED8',
                            border: '1px solid #BFDBFE',
                            fontWeight: 500
                          }}
                        />
                      ) : (
                        <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.813rem' }}>
                          ยังไม่ระบุ
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell sx={{ py: 2 }}>
                      {record.trackingNumber ? (
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
                          {record.trackingNumber}
                        </Typography>
                      ) : (
                        <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.813rem' }}>
                          ยังไม่มี
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell sx={{ py: 2 }}>
                      <Chip
                        label={record.status}
                        color={getStatusColor(record.status)}
                        size="small"
                        icon={getStatusIcon(record.status)}
                        sx={{
                          fontWeight: 500,
                          '& .MuiChip-icon': {
                            fontSize: 16
                          }
                        }}
                      />
                    </TableCell>
                    <TableCell sx={{ py: 2 }}>
                      {record.status === 'จัดส่งแล้ว' ? (
                        <Button
                          variant="contained"
                          color="success"
                          size="small"
                          onClick={() => onMarkAsDelivered(record)}
                          startIcon={<CheckCircle />}
                          sx={{
                            background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                            boxShadow: '0 2px 4px rgba(16, 185, 129, 0.3)',
                            '&:hover': {
                              background: 'linear-gradient(135deg, #059669 0%, #047857 100%)'
                            }
                          }}
                        >
                          ยืนยันส่งสำเร็จ
                        </Button>
                      ) : record.status === 'จัดส่งสำเร็จ' ? (
                        <Chip
                          label="ส่งสำเร็จแล้ว"
                          color="success"
                          size="small"
                          icon={<CheckCircle />}
                          sx={{ fontWeight: 500 }}
                        />
                      ) : (
                        <Button
                          variant="outlined"
                          size="small"
                          onClick={() => onEditPicking(record)}
                          startIcon={<LocalShipping />}
                          sx={{
                            borderColor: '#3B82F6',
                            color: '#3B82F6',
                            '&:hover': {
                              borderColor: '#1D4ED8',
                              background: alpha('#3B82F6', 0.04)
                            }
                          }}
                        >
                          จัดการขนส่ง
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          {pickingRecords.length > 5 && (
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
                  color: page === 0 ? '#ccc' : '#3B82F6',
                  '&:hover': { backgroundColor: 'rgba(59, 130, 246, 0.1)' }
                }}
              >
                {'<'}
              </IconButton>
              
              {Array.from({ length: Math.ceil(pickingRecords.length / rowsPerPage) }, (_, index) => (
                <IconButton
                  key={index}
                  onClick={(e) => handleChangePage(e, index)}
                  sx={{
                    color: page === index ? '#3B82F6' : '#666',
                    backgroundColor: page === index ? 'rgba(59, 130, 246, 0.1)' : 'transparent',
                    '&:hover': { backgroundColor: 'rgba(59, 130, 246, 0.1)' },
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
                disabled={page >= Math.ceil(pickingRecords.length / rowsPerPage) - 1}
                sx={{ 
                  color: page >= Math.ceil(pickingRecords.length / rowsPerPage) - 1 ? '#ccc' : '#3B82F6',
                  '&:hover': { backgroundColor: 'rgba(59, 130, 246, 0.1)' }
                }}
              >
                {'>'}
              </IconButton>
            </Box>
          )}
        </Paper>
      )}

      {/* Edit Picking Dialog */}
      <Dialog
        open={!!editingPicking}
        onClose={onCancelEdit}
        fullWidth
        maxWidth="sm"
        PaperProps={{
          sx: {
            borderRadius: 3,
            background: 'white',
            border: '1px solid #E2E8F0'
          }
        }}
      >
        <DialogTitle
          sx={{
            background: 'linear-gradient(135deg, #F8FAFC 0%, #F1F5F9 100%)',
            borderBottom: '1px solid #E2E8F0',
            py: 3,
            display: 'flex',
            alignItems: 'center'
          }}
        >
          <Avatar
            sx={{
              width: 40,
              height: 40,
              background: 'linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)',
              mr: 2
            }}
          >
            <LocalShipping sx={{ color: 'white', fontSize: 20 }} />
          </Avatar>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 600, color: '#1E293B' }}>
              จัดการขนส่ง
            </Typography>
            <Typography variant="body2" color="#64748B">
              กรอกข้อมูลการจัดส่งสินค้า
            </Typography>
          </Box>
        </DialogTitle>
        <DialogContent sx={{ pt: 3, display: 'grid', gap: 3 }}>
          <FormControl
            fullWidth
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 2
              }
            }}
          >
            <InputLabel>ขนส่ง</InputLabel>
            <Select
              value={pickingForm.shippingMethod}
              onChange={(e) => onPickingFormChange('shippingMethod', e.target.value)}
              label="ขนส่ง"
            >
              <MenuItem value="EMS">EMS</MenuItem>
              <MenuItem value="ไปรษณีย์ไทย">ไปรษณีย์ไทย</MenuItem>
              <MenuItem value="Kerry">Kerry</MenuItem>
              <MenuItem value="J&T">J&T</MenuItem>
              <MenuItem value="Flash">Flash</MenuItem>
            </Select>
          </FormControl>
          <TextField
            label="เลขพัสดุ"
            value={pickingForm.trackingNumber}
            onChange={(e) => onPickingFormChange('trackingNumber', e.target.value)}
            placeholder="กรอกเลขพัสดุ"
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 2
              }
            }}
          />
        </DialogContent>
        <DialogActions sx={{ p: 3, borderTop: '1px solid #E2E8F0' }}>
          <Button
            onClick={onCancelEdit}
            sx={{
              borderColor: '#D1D5DB',
              color: '#6B7280',
              '&:hover': {
                borderColor: '#9CA3AF',
                background: '#F9FAFB'
              }
            }}
          >
            ยกเลิก
          </Button>
          <Button
            onClick={onSavePicking}
            variant="contained"
            sx={{
              background: 'linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)',
              boxShadow: '0 2px 4px rgba(59, 130, 246, 0.3)',
              '&:hover': {
                background: 'linear-gradient(135deg, #1D4ED8 0%, #1E40AF 100%)'
              }
            }}
          >
            บันทึก
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default PickingTab;
