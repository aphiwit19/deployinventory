import React, { useState, useEffect } from 'react';
import { Typography, Box, Paper, Alert, CircularProgress, Chip, Card, CardContent, Grid } from '@mui/material';
import { getAll } from '../../services/firestore';

interface ProductRow {
  id: string;
  name: string;
  description?: string;
  price: number;
  quantity: number;
  imageUrl?: string;
}

const OverviewTab = () => {
  const [lowStockItems, setLowStockItems] = useState<ProductRow[]>([]);
  const [loading, setLoading] = useState(true);

  // ตรวจสอบสต็อกต่ำกว่า 20%
  const checkLowStock = async () => {
    try {
      const allProducts = await getAll('products');
      const lowStockItems = (allProducts as ProductRow[]).filter(product => {
        const currentStock = product.quantity || 0;
        const minStockThreshold = Math.ceil(product.quantity * 0.2); // 20% ของจำนวนเดิม
        return currentStock <= minStockThreshold && currentStock > 0; // ต่ำกว่า 20% แต่ยังไม่หมด
      });
      return lowStockItems;
    } catch (e) {
      console.error('Failed to check low stock', e);
      return [];
    }
  };

  useEffect(() => {
    const loadLowStock = async () => {
      setLoading(true);
      const items = await checkLowStock();
      setLowStockItems(items);
      setLoading(false);
    };
    loadLowStock();
  }, []);

  return (
    <>
      <Typography variant="h4" gutterBottom>
        แดชบอร์ดรวม (Admin)
      </Typography>
      
      {/* 🚨 แจ้งเตือนสต็อกต่ำ */}
      <Paper sx={{ p: 2, mb: 3 }} elevation={2}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          🚨 แจ้งเตือนสต็อกต่ำกว่า 20%
        </Typography>
        
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
            <CircularProgress />
          </Box>
        ) : lowStockItems.length > 0 ? (
          <Alert severity="warning" sx={{ mb: 2 }}>
            พบสินค้า {lowStockItems.length} รายการที่สต็อกต่ำกว่า 20%! ควรเติมสินค้าให้เร็วที่สุด
          </Alert>
        ) : (
          <Alert severity="success">
            ✅ สต็อกสินค้าทุกรายการอยู่ในระดับปกติ
          </Alert>
        )}

        {/* รายการสินค้าที่ต้องเติม */}
        {lowStockItems.length > 0 && (
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
            {lowStockItems.map((product) => (
              <Box key={product.id} sx={{ flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 8px)', md: '1 1 calc(33.333% - 11px)' } }}>
                <Card variant="outlined" sx={{ borderColor: 'warning.main', height: '100%' }}>
                  <CardContent sx={{ p: 2 }}>
                    <Typography variant="h6" sx={{ fontSize: '1rem', mb: 1 }}>
                      {product.name}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="body2" color="text.secondary">
                        คงเหลือ:
                      </Typography>
                      <Chip 
                        label={`${product.quantity} ชิ้น`} 
                        color="warning" 
                        size="small" 
                      />
                    </Box>
                    <Typography variant="body2" color="error" sx={{ mt: 1 }}>
                      ⚠️ ต่ำกว่า 20% แล้ว!
                    </Typography>
                  </CardContent>
                </Card>
              </Box>
            ))}
          </Box>
        )}
      </Paper>

      {/* 📊 สถิติอื่นๆ (สามารถเพิ่มได้) */}
      <Paper sx={{ p: 2 }} elevation={2}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          📊 สถิติระบบ
        </Typography>
        <Typography variant="body2" color="text.secondary">
          สามารถเพิ่มกราฟและสถิติต่างๆ เช่น จำนวนผู้ใช้ ยอดขาย ออเดอร์วันนี้ ได้ในภายหลัง
        </Typography>
      </Paper>
    </>
  );
};

export default OverviewTab;
