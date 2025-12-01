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
  TextField,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { add, update, remove } from '../../services/firestore';

interface ProductRow {
  id: string;
  name: string;
  description?: string;
  price: number;
  quantity: number;
  imageUrl?: string;
}

interface ProductsTabProps {
  products: ProductRow[];
  loadingProducts: boolean;
  creatingProduct: boolean;
  uploadingImage: boolean;
  editingProduct: ProductRow | null;
  newProduct: {
    name: string;
    description: string;
    price: string;
    quantity: string;
    imageUrl: string;
    imageFile: File | null;
  };
  editForm: {
    name: string;
    description: string;
    price: string;
    quantity: string;
    imageUrl: string;
    imageFile: File | null;
  };
  incrementForm: {
    productId: string;
    quantity: string;
  };
  filteredProductId?: string | null;
  onClearFilter?: () => void;
  onNewProductChange: (field: 'name' | 'description' | 'price' | 'quantity' | 'imageUrl', value: string) => void;
  onNewProductImageChange: (file: File | null) => void;
  onCreateProduct: (e: React.FormEvent) => void;
  onIncrementQuantity: (product: ProductRow) => void;
  onIncrementFormChange: (value: string) => void;
  onSaveIncrement: () => void;
  onDeleteProduct: (product: ProductRow) => void;
  onStartEditProduct: (product: ProductRow) => void;
  onEditFormChange: (field: 'name' | 'description' | 'price' | 'quantity' | 'imageUrl', value: string) => void;
  onEditImageChange: (file: File | null) => void;
  onSaveEditProduct: () => void;
  onCancelEdit: () => void;
}

const ProductsTab: React.FC<ProductsTabProps> = ({
  products,
  loadingProducts,
  creatingProduct,
  uploadingImage,
  editingProduct,
  newProduct,
  editForm,
  incrementForm,
  filteredProductId,
  onClearFilter,
  onNewProductChange,
  onNewProductImageChange,
  onCreateProduct,
  onIncrementQuantity,
  onIncrementFormChange,
  onSaveIncrement,
  onDeleteProduct,
  onStartEditProduct,
  onEditFormChange,
  onEditImageChange,
  onSaveEditProduct,
  onCancelEdit,
}) => {
  // กรองสินค้าตาม filteredProductId
  const displayedProducts = filteredProductId 
    ? products.filter(p => p.id === filteredProductId)
    : products;
  return (
    <>
      <Typography variant="h4" gutterBottom>
        จัดการสินค้า
      </Typography>

      {/* แสดงข้อความเมื่อกรองสินค้าเดี่ยว */}
      {filteredProductId && (
        <Box sx={{ mb: 2, p: 2, bgcolor: '#f0f7ff', borderRadius: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="body2" color="primary">
            กำลังแสดงสินค้าเดียว: {displayedProducts[0]?.name || 'ไม่พบสินค้า'}
          </Typography>
          {onClearFilter && (
            <Button size="small" onClick={onClearFilter}>
              แสดงทั้งหมด
            </Button>
          )}
        </Box>
      )}
      
      {/* Create Product Form */}
      <Box sx={{ mb: 3, p: 2, border: '1px solid #e0e0e0', borderRadius: 1 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          เพิ่มสินค้าใหม่
        </Typography>
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 2, mb: 2 }}>
          <TextField
            label="ชื่อสินค้า"
            value={newProduct.name}
            onChange={(e) => onNewProductChange('name', e.target.value)}
            required
          />
          <TextField
            label="ราคา"
            type="number"
            value={newProduct.price}
            onChange={(e) => onNewProductChange('price', e.target.value)}
            inputProps={{ min: 0, step: 0.01 }}
          />
          <TextField
            label="จำนวน"
            type="number"
            value={newProduct.quantity}
            onChange={(e) => onNewProductChange('quantity', e.target.value)}
            inputProps={{ min: 0, step: 1 }}
          />
          <Box>
            <input
              type="file"
              accept="image/*"
              id="product-image-upload"
              style={{ display: 'none' }}
              onChange={(e) => onNewProductImageChange(e.target.files?.[0] || null)}
            />
            <label htmlFor="product-image-upload">
              <Button
                variant="outlined"
                component="span"
                startIcon={<CloudUploadIcon />}
                disabled={uploadingImage}
                fullWidth
                sx={{ height: '56px' }}
              >
                {uploadingImage ? 'กำลังอัปโหลด...' : (newProduct.imageFile ? newProduct.imageFile.name : 'อัปโหลดรูปภาพ')}
              </Button>
            </label>
            {newProduct.imageFile && (
              <Button
                size="small"
                onClick={() => onNewProductImageChange(null)}
                sx={{ mt: 1, width: '100%' }}
              >
                ลบรูป
              </Button>
            )}
          </Box>
        </Box>
        <TextField
          label="คำอธิบายสินค้า"
          value={newProduct.description}
          onChange={(e) => onNewProductChange('description', e.target.value)}
          multiline
          minRows={2}
          fullWidth
          sx={{ mb: 2 }}
        />
        <Button
          variant="contained"
          onClick={onCreateProduct}
          disabled={creatingProduct || uploadingImage || !newProduct.name.trim()}
          startIcon={creatingProduct ? <CircularProgress size={20} /> : <AddIcon />}
        >
          {creatingProduct ? 'กำลังเพิ่ม...' : 'เพิ่มสินค้า'}
        </Button>
      </Box>

      {/* Products Table */}
      {loadingProducts ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>ชื่อสินค้า</TableCell>
                <TableCell>คำอธิบาย</TableCell>
                <TableCell align="right">ราคา</TableCell>
                <TableCell align="right">จำนวน</TableCell>
                <TableCell>รูปภาพ</TableCell>
                <TableCell align="right">จัดการ</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {displayedProducts.map((product) => (
                <TableRow key={product.id} hover>
                  <TableCell>{product.name}</TableCell>
                  <TableCell>{product.description}</TableCell>
                  <TableCell align="right">{product.price.toFixed(2)}</TableCell>
                  <TableCell align="right">{product.quantity}</TableCell>
                  <TableCell>
                    {product.imageUrl ? (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Box
                          component="img"
                          src={product.imageUrl}
                          alt={product.name}
                          sx={{ width: 48, height: 48, objectFit: 'cover', borderRadius: 1, border: '1px solid #e0e0e0' }}
                        />
                      </Box>
                    ) : (
                      '-'
                    )}
                  </TableCell>
                  <TableCell align="right">
                    <IconButton
                      size="small"
                      color="primary"
                      onClick={() => onIncrementQuantity(product)}
                    >
                      <AddIcon />
                    </IconButton>
                    <IconButton
                      size="small"
                      color="inherit"
                      onClick={() => onStartEditProduct(product)}
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => onDeleteProduct(product)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Edit Product Dialog */}
      <Dialog open={!!editingProduct} onClose={onCancelEdit} fullWidth maxWidth="sm">
        <DialogTitle>แก้ไขสินค้า</DialogTitle>
        <DialogContent sx={{ pt: 2, display: 'grid', gap: 2 }}>
          <TextField
            label="ชื่อสินค้า"
            value={editForm.name}
            onChange={(e) => onEditFormChange('name', e.target.value)}
            required
          />
          <TextField
            label="คำอธิบายสินค้า"
            value={editForm.description}
            onChange={(e) => onEditFormChange('description', e.target.value)}
            multiline
            minRows={2}
          />
          <TextField
            label="ราคา"
            type="number"
            value={editForm.price}
            onChange={(e) => onEditFormChange('price', e.target.value)}
            inputProps={{ min: 0, step: 0.01 }}
          />
          <TextField
            label="จำนวน"
            type="number"
            value={editForm.quantity}
            onChange={(e) => onEditFormChange('quantity', e.target.value)}
            inputProps={{ min: 0, step: 1 }}
          />
          <Box>
            <input
              type="file"
              accept="image/*"
              id="edit-image-upload"
              style={{ display: 'none' }}
              onChange={(e) => onEditImageChange(e.target.files?.[0] || null)}
            />
            <label htmlFor="edit-image-upload">
              <Button
                variant="outlined"
                component="span"
                startIcon={<CloudUploadIcon />}
                disabled={uploadingImage}
                fullWidth
                sx={{ height: '56px' }}
              >
                {uploadingImage ? 'กำลังอัปโหลด...' : (editForm.imageFile ? editForm.imageFile.name : 'อัปโหลดรูปภาพใหม่')}
              </Button>
            </label>
            {editForm.imageFile && (
              <Button
                size="small"
                onClick={() => onEditImageChange(null)}
                sx={{ mt: 1, width: '100%' }}
              >
                ลบรูป
              </Button>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={onCancelEdit}>ยกเลิก</Button>
          <Button onClick={onSaveEditProduct} variant="contained">
            บันทึก
          </Button>
        </DialogActions>
      </Dialog>

      {/* Increment Quantity Dialog */}
      <Dialog 
        open={!!incrementForm.productId} 
        onClose={() => onIncrementFormChange('1')}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>เพิ่มจำนวนสินค้า</DialogTitle>
        <DialogContent>
          <TextField
            label="จำนวนที่ต้องการเพิ่ม"
            type="number"
            value={incrementForm.quantity}
            onChange={(e) => onIncrementFormChange(e.target.value)}
            fullWidth
            inputProps={{ min: 1, step: 1 }}
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => onIncrementFormChange('1')}>ยกเลิก</Button>
          <Button onClick={onSaveIncrement} variant="contained">
            เพิ่มสต็อก
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default ProductsTab;
