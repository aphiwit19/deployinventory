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
  TablePagination,
  TextField,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Avatar,
  useTheme,
  alpha,
  Grid,
  Paper,
  Chip,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import {
  Inventory,
  Search,
  Add,
  Edit,
  Delete,
  Image,
  AttachMoney,
  Clear,
  FilterAlt,
} from '@mui/icons-material';
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

  // กรองสินค้าตาม filteredProductId
  const filteredProducts = filteredProductId 
    ? products.filter(p => p.id === filteredProductId)
    : products;

  // สินค้าที่จะแสดงในหน้าปัจจุบัน
  const displayedProducts = filteredProducts.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
  return (
    <Box sx={{ p: 3 }}>
      {/* Header Section */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Avatar
            sx={{
              width: 48,
              height: 48,
              background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
              mr: 2,
              boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)'
            }}
          >
            <Inventory sx={{ color: 'white', fontSize: 24 }} />
          </Avatar>
          <Box>
            <Typography
              variant="h4"
              sx={{
                fontWeight: 700,
                background: 'linear-gradient(135deg, #047857 0%, #10B981 100%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                mb: 0.5
              }}
            >
              จัดการสินค้า
            </Typography>
            <Typography variant="body1" color="text.secondary">
              เพิ่ม แก้ไข และจัดการสินค้าในระบบ
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Filter Info */}
      {filteredProductId && (
        <Paper
          sx={{
            p: 2,
            mb: 3,
            background: 'linear-gradient(135deg, #EFF6FF 0%, #DBEAFE 100%)',
            border: '1px solid #BFDBFE',
            borderRadius: 2,
            display: 'flex',
            alignItems: 'center',
            gap: 2
          }}
        >
          <Avatar sx={{ bgcolor: '#3B82F6' }}>
            <FilterAlt sx={{ fontSize: 16 }} />
          </Avatar>
          <Typography variant="body2" color="#1E40AF" sx={{ fontWeight: 500 }}>
            กำลังแสดงสินค้าเดียว: {displayedProducts[0]?.name || 'ไม่พบสินค้า'}
          </Typography>
          {onClearFilter && (
            <Button
              size="small"
              onClick={onClearFilter}
              sx={{
                borderColor: '#3B82F6',
                color: '#3B82F6',
                '&:hover': {
                  borderColor: '#1D4ED8',
                  background: alpha('#3B82F6', 0.04)
                }
              }}
            >
              แสดงทั้งหมด
            </Button>
          )}
        </Paper>
      )}
      
      {/* Create Product Section */}
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
              background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
              mr: 2
            }}
          >
            <Add sx={{ color: 'white', fontSize: 16 }} />
          </Avatar>
          <Typography variant="h6" sx={{ fontWeight: 600, color: '#1E293B' }}>
            เพิ่มสินค้าใหม่
          </Typography>
        </Box>
        
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 3 }}>
            <TextField
              fullWidth
              label="ชื่อสินค้า"
              value={newProduct.name}
              onChange={(e) => onNewProductChange('name', e.target.value)}
              required
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 3 }}>
            <TextField
              fullWidth
              label="ราคา"
              type="number"
              value={newProduct.price}
              onChange={(e) => onNewProductChange('price', e.target.value)}
              inputProps={{ min: 0, step: 0.01 }}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 3 }}>
            <TextField
              fullWidth
              label="จำนวน"
              type="number"
              value={newProduct.quantity}
              onChange={(e) => onNewProductChange('quantity', e.target.value)}
              inputProps={{ min: 0, step: 1 }}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 3 }}>
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
                  sx={{
                    height: '56px',
                    borderColor: '#10B981',
                    color: '#10B981',
                    '&:hover': {
                      borderColor: '#059669',
                      background: alpha('#10B981', 0.04)
                    },
                    '& .MuiOutlinedInput-root': { borderRadius: 2 }
                  }}
                >
                  {uploadingImage ? 'กำลังอัปโหลด...' : (newProduct.imageFile ? newProduct.imageFile.name : 'อัปโหลดรูปภาพ')}
                </Button>
              </label>
              {newProduct.imageFile && (
                <Button
                  size="small"
                  onClick={() => onNewProductImageChange(null)}
                  sx={{ mt: 1, width: '100%', color: '#EF4444' }}
                  startIcon={<Clear />}
                >
                  ลบรูป
                </Button>
              )}
            </Box>
          </Grid>
        </Grid>
        
        <TextField
          label="คำอธิบายสินค้า"
          value={newProduct.description}
          onChange={(e) => onNewProductChange('description', e.target.value)}
          multiline
          minRows={2}
          fullWidth
          sx={{ mt: 3, '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
        />
        
        <Button
          variant="contained"
          onClick={onCreateProduct}
          disabled={creatingProduct || uploadingImage || !newProduct.name.trim()}
          startIcon={creatingProduct ? <CircularProgress size={20} /> : <AddIcon />}
          sx={{
            mt: 3,
            background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
            boxShadow: '0 2px 4px rgba(16, 185, 129, 0.3)',
            '&:hover': {
              background: 'linear-gradient(135deg, #059669 0%, #047857 100%)'
            }
          }}
        >
          {creatingProduct ? 'กำลังเพิ่ม...' : 'เพิ่มสินค้า'}
        </Button>
      </Paper>

      {/* Products Table */}
      {loadingProducts ? (
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
              color: '#10B981',
              mb: 2
            }}
          />
          <Typography variant="body1" color="text.secondary" sx={{ fontWeight: 500 }}>
            กำลังโหลดข้อมูล...
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
                    คำอธิบาย
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
                      ราคา
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
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Image sx={{ fontSize: 16, mr: 1 }} />
                      รูปภาพ
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
                    จัดการ
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {displayedProducts.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center" sx={{ py: 8 }}>
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
                        ไม่พบสินค้า
                      </Typography>
                      <Typography variant="body2" color="#64748B">
                        ยังไม่มีสินค้าในระบบ หรือไม่พบข้อมูลที่ค้นหา
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  displayedProducts.map((product, index) => (
                    <TableRow
                      key={product.id}
                      sx={{
                        '&:hover': {
                          backgroundColor: alpha('#10B981', 0.04)
                        },
                        backgroundColor: index % 2 === 0 ? '#FAFAFA' : 'white'
                      }}
                    >
                      <TableCell sx={{ py: 2 }}>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {product.name}
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
                          {product.description || '-'}
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
                          ฿{product.price.toFixed(2)}
                        </Typography>
                      </TableCell>
                      <TableCell sx={{ py: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Avatar
                            sx={{
                              width: 24,
                              height: 24,
                              background: product.quantity > 0
                                ? 'linear-gradient(135deg, #10B981 0%, #059669 100%)'
                                : 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)',
                              mr: 1
                            }}
                          >
                            <Inventory sx={{ color: 'white', fontSize: 14 }} />
                          </Avatar>
                          <Typography
                            variant="body2"
                            sx={{
                              fontWeight: 600,
                              color: product.quantity > 0 ? '#059669' : '#DC2626'
                            }}
                          >
                            {product.quantity} ชิ้น
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell sx={{ py: 2 }}>
                        {product.imageUrl ? (
                          <Box
                            component="img"
                            src={product.imageUrl}
                            alt={product.name}
                            sx={{
                              width: 48,
                              height: 48,
                              objectFit: 'cover',
                              borderRadius: 2,
                              border: '1px solid #E2E8F0'
                            }}
                          />
                        ) : (
                          <Avatar
                            sx={{
                              width: 48,
                              height: 48,
                              bgcolor: '#F3F4F6',
                              color: '#6B7280'
                            }}
                          >
                            <Image />
                          </Avatar>
                        )}
                      </TableCell>
                      <TableCell sx={{ py: 2 }}>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <IconButton
                            size="small"
                            onClick={() => onIncrementQuantity(product)}
                            sx={{
                              background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                              color: 'white',
                              '&:hover': {
                                background: 'linear-gradient(135deg, #059669 0%, #047857 100%)'
                              }
                            }}
                          >
                            <AddIcon fontSize="small" />
                          </IconButton>
                          <IconButton
                            size="small"
                            onClick={() => onStartEditProduct(product)}
                            sx={{
                              background: 'linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)',
                              color: 'white',
                              '&:hover': {
                                background: 'linear-gradient(135deg, #1D4ED8 0%, #1E40AF 100%)'
                              }
                            }}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                          <IconButton
                            size="small"
                            onClick={() => onDeleteProduct(product)}
                            sx={{
                              background: 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)',
                              color: 'white',
                              '&:hover': {
                                background: 'linear-gradient(135deg, #DC2626 0%, #B91C1C 100%)'
                              }
                            }}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
          {filteredProducts.length > 5 && (
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
                  color: page === 0 ? '#ccc' : '#10B981',
                  '&:hover': { backgroundColor: 'rgba(16, 185, 129, 0.1)' }
                }}
              >
                {'<'}
              </IconButton>
              
              {Array.from({ length: Math.ceil(filteredProducts.length / rowsPerPage) }, (_, index) => (
                <IconButton
                  key={index}
                  onClick={(e) => handleChangePage(e, index)}
                  sx={{
                    color: page === index ? '#10B981' : '#666',
                    backgroundColor: page === index ? 'rgba(16, 185, 129, 0.1)' : 'transparent',
                    '&:hover': { backgroundColor: 'rgba(16, 185, 129, 0.1)' },
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
                disabled={page >= Math.ceil(filteredProducts.length / rowsPerPage) - 1}
                sx={{ 
                  color: page >= Math.ceil(filteredProducts.length / rowsPerPage) - 1 ? '#ccc' : '#10B981',
                  '&:hover': { backgroundColor: 'rgba(16, 185, 129, 0.1)' }
                }}
              >
                {'>'}
              </IconButton>
            </Box>
          )}
        </Paper>
      )}

      {/* Edit Product Dialog */}
      <Dialog
        open={!!editingProduct}
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
            <Edit sx={{ color: 'white', fontSize: 20 }} />
          </Avatar>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 600, color: '#1E293B' }}>
              แก้ไขสินค้า
            </Typography>
            <Typography variant="body2" color="#64748B">
              แก้ไขข้อมูลสินค้าในระบบ
            </Typography>
          </Box>
        </DialogTitle>
        <DialogContent sx={{ pt: 3, display: 'grid', gap: 3 }}>
          <TextField
            label="ชื่อสินค้า"
            value={editForm.name}
            onChange={(e) => onEditFormChange('name', e.target.value)}
            required
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
          />
          <TextField
            label="คำอธิบายสินค้า"
            value={editForm.description}
            onChange={(e) => onEditFormChange('description', e.target.value)}
            multiline
            minRows={2}
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
          />
          <TextField
            label="ราคา"
            type="number"
            value={editForm.price}
            onChange={(e) => onEditFormChange('price', e.target.value)}
            inputProps={{ min: 0, step: 0.01 }}
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
          />
          <TextField
            label="จำนวน"
            type="number"
            value={editForm.quantity}
            onChange={(e) => onEditFormChange('quantity', e.target.value)}
            inputProps={{ min: 0, step: 1 }}
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
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
                sx={{
                  height: '56px',
                  borderColor: '#3B82F6',
                  color: '#3B82F6',
                  '&:hover': {
                    borderColor: '#1D4ED8',
                    background: alpha('#3B82F6', 0.04)
                  },
                  '& .MuiOutlinedInput-root': { borderRadius: 2 }
                }}
              >
                {uploadingImage ? 'กำลังอัปโหลด...' : (editForm.imageFile ? editForm.imageFile.name : 'อัปโหลดรูปภาพใหม่')}
              </Button>
            </label>
            {editForm.imageFile && (
              <Button
                size="small"
                onClick={() => onEditImageChange(null)}
                sx={{ mt: 1, width: '100%', color: '#EF4444' }}
                startIcon={<Clear />}
              >
                ลบรูป
              </Button>
            )}
          </Box>
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
            onClick={onSaveEditProduct}
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

      {/* Increment Quantity Dialog */}
      <Dialog
        open={!!incrementForm.productId}
        onClose={() => onIncrementFormChange('1')}
        maxWidth="sm"
        fullWidth
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
              background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
              mr: 2
            }}
          >
            <Add sx={{ color: 'white', fontSize: 20 }} />
          </Avatar>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 600, color: '#1E293B' }}>
              เพิ่มจำนวนสินค้า
            </Typography>
            <Typography variant="body2" color="#64748B">
              ปรับจำนวนสต็อกของสินค้า
            </Typography>
          </Box>
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          <TextField
            label="จำนวนที่ต้องการเพิ่ม"
            type="number"
            value={incrementForm.quantity}
            onChange={(e) => onIncrementFormChange(e.target.value)}
            fullWidth
            inputProps={{ min: 1, step: 1 }}
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
          />
        </DialogContent>
        <DialogActions sx={{ p: 3, borderTop: '1px solid #E2E8F0' }}>
          <Button
            onClick={() => onIncrementFormChange('1')}
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
            onClick={onSaveIncrement}
            variant="contained"
            sx={{
              background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
              boxShadow: '0 2px 4px rgba(16, 185, 129, 0.3)',
              '&:hover': {
                background: 'linear-gradient(135deg, #059669 0%, #047857 100%)'
              }
            }}
          >
            เพิ่มสต็อก
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ProductsTab;
