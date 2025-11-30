import React from 'react';
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
} from '@mui/material';

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
  return (
    <>
      <Typography variant="h4" gutterBottom>
        การเบิกสินค้า
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
        รายการที่สตาฟแจ้งเบิกสินค้าแล้ว รอดำเนินการจัดส่ง
      </Typography>
      
      {loadingPickingRecords ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 200 }}>
          <CircularProgress />
        </Box>
      ) : pickingRecords.length === 0 ? (
        <Typography variant="body2" color="text.secondary">
          ยังไม่มีรายการเบิกสินค้า
        </Typography>
      ) : (
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>ชื่อพนักงาน</TableCell>
                <TableCell>ลูกค้า</TableCell>
                <TableCell>ที่อยู่จัดส่ง</TableCell>
                <TableCell>วันที่เบิก</TableCell>
                <TableCell>ยอดรวม</TableCell>
                <TableCell>ขนส่ง</TableCell>
                <TableCell>เลขพัสดุ</TableCell>
                <TableCell>สถานะ</TableCell>
                <TableCell>จัดการ</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {pickingRecords.map((record) => (
                <TableRow key={record.id}>
                  <TableCell>{record.staffName}</TableCell>
                  <TableCell>{record.customerInfo.fullName}</TableCell>
                  <TableCell sx={{ maxWidth: 200, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {record.customerInfo.address}
                  </TableCell>
                  <TableCell>
                    {record.pickedAt?.toDate?.().toLocaleDateString('th-TH') ||
                      record.pickedAt?.toLocaleDateString?.('th-TH') ||
                      '-'}
                  </TableCell>
                  <TableCell>
                    {record.total.toLocaleString('th-TH', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </TableCell>
                  <TableCell>
                    {record.shippingMethod || (
                      <Typography variant="body2" color="text.secondary">
                        ยังไม่ระบุ
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    {record.trackingNumber || (
                      <Typography variant="body2" color="text.secondary">
                        ยังไม่มี
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={record.status}
                      color={
                        record.status === 'จัดส่งสำเร็จ'
                          ? 'success'
                          : record.status === 'จัดส่งแล้ว'
                          ? 'success'
                          : record.status === 'กำลังจัดส่ง'
                          ? 'warning'
                          : 'default'
                      }
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    {record.status === 'จัดส่งแล้ว' ? (
                      <Button variant="contained" color="success" size="small" onClick={() => onMarkAsDelivered(record)}>
                        ยืนยันส่งสำเร็จ
                      </Button>
                    ) : record.status === 'จัดส่งสำเร็จ' ? (
                      <Chip label="ส่งสำเร็จแล้ว" color="success" size="small" />
                    ) : (
                      <Button variant="outlined" size="small" onClick={() => onEditPicking(record)}>
                        จัดการขนส่ง
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Edit Picking Dialog */}
      <Dialog open={!!editingPicking} onClose={onCancelEdit} fullWidth maxWidth="sm">
        <DialogTitle>จัดการขนส่ง</DialogTitle>
        <DialogContent sx={{ pt: 2, display: 'grid', gap: 2 }}>
          <FormControl fullWidth>
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
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={onCancelEdit}>ยกเลิก</Button>
          <Button onClick={onSavePicking} variant="contained">
            บันทึก
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default PickingTab;
