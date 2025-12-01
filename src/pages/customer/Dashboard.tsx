import { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Button,
  TextField,
  Card,
  CardContent,
  CardMedia,
  CardActions,
  IconButton,
  Badge,
  Menu,
  MenuItem,
  Avatar,
  useTheme,
  alpha,
  Container,
  Fab,
  Paper,
  Chip,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { getAll } from '../../services/firestore';
import {
  AccountCircle,
  ShoppingCart,
  Search,
  Store,
  LocalOffer,
  Star,
  Inventory2,
  ShoppingBag,
  Logout,
  Person,
  Receipt,
} from '@mui/icons-material';

interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  quantity: number;
  imageUrl?: string;
}

function Dashboard() {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const theme = useTheme();
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState('');
  const [cartCount, setCartCount] = useState(0);
  const [profileMenuAnchor, setProfileMenuAnchor] = useState<null | HTMLElement>(null);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const data = await getAll('products');
        const normalized = (data as any[]).map((p) => ({
          id: p.id,
          name: p.name || '',
          description: p.description || '',
          price: Number(p.price) || 0,
          quantity: Number(p.quantity) || 0,
          imageUrl: p.imageUrl || '',
        }));
        setProducts(normalized);
      } catch (e) {
        console.error('Failed to load products for customer dashboard', e);
      }
    };

    loadProducts();
  }, []);

  const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setProfileMenuAnchor(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setProfileMenuAnchor(null);
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Failed to logout', error);
    }
  };

  const handleAddToCart = (product: Product) => {
    // เก็บจำนวนรวมของสินค้าในตะกร้าไว้แสดงบนไอคอน
    setCartCount((c) => c + 1);

    // บันทึกรายการสินค้าใน localStorage เพื่อใช้ในหน้าตะกร้า
    try {
      const raw = localStorage.getItem('cartItems');
      const current: any[] = raw ? JSON.parse(raw) : [];
      const existingIndex = current.findIndex((item) => item.id === product.id);

      if (existingIndex >= 0) {
        current[existingIndex].quantity = (current[existingIndex].quantity || 0) + 1;
      } else {
        current.push({
          id: product.id,
          name: product.name,
          price: product.price,
          quantity: 1,
        });
      }

      localStorage.setItem('cartItems', JSON.stringify(current));
    } catch (e) {
      console.error('Failed to update cartItems in localStorage', e);
    }
  };

  const filtered = products.filter((p) => {
    const q = search.toLowerCase();
    return (
      p.name.toLowerCase().includes(q) ||
      (p.description || '').toLowerCase().includes(q)
    );
  });

  // Pagination state
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(12);

  const handleChangePage = (event: React.MouseEvent<HTMLButtonElement> | null, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // รายการที่จะแสดงในหน้าปัจจุบัน
  const displayedProducts = filtered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  return (
    <Container maxWidth="xl" sx={{ py: 4, px: { xs: 2, sm: 3 } }}>
      {/* Header */}
      <Paper
        sx={{
          p: 3,
          mb: 4,
          background: 'linear-gradient(135deg, #1E3A8A 0%, #3B82F6 50%, #60A5FA 100%)',
          color: 'white',
          borderRadius: 4,
          position: 'relative',
          overflow: 'hidden',
          boxShadow: '0 10px 40px rgba(30, 58, 138, 0.3)',
          border: '1px solid rgba(255,255,255,0.2)',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            right: 0,
            width: '300px',
            height: '300px',
            background: 'radial-gradient(circle, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0.05) 50%, transparent 70%)',
            borderRadius: '50%',
            transform: 'translate(30%, -30%)'
          },
          '&::after': {
            content: '""',
            position: 'absolute',
            bottom: -50,
            left: -50,
            width: '200px',
            height: '200px',
            background: 'radial-gradient(circle, rgba(255,255,255,0.08) 0%, transparent 60%)',
            borderRadius: '50%'
          }
        }}
      >
        <Box sx={{ position: 'relative', zIndex: 1 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Avatar
                sx={{
                  width: 56,
                  height: 56,
                  background: 'linear-gradient(135deg, rgba(255,255,255,0.3) 0%, rgba(255,255,255,0.1) 100%)',
                  mr: 2,
                  boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
                  border: '2px solid rgba(255,255,255,0.3)'
                }}
              >
                <Store sx={{ color: 'white', fontSize: 32 }} />
              </Avatar>
              <Box>
                <Typography variant="h3" sx={{ fontWeight: 800, mb: 0.5, textShadow: '0 2px 4px rgba(0,0,0,0.3)' }}>
                  ร้านค้าออนไลน์
                </Typography>
                <Typography variant="body1" sx={{ opacity: 0.95, fontWeight: 500 }}>
                  สินค้าคุณภาพ ราคาย่อมเยา
                </Typography>
              </Box>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Fab
                size="small"
                color="secondary"
                onClick={() => navigate('/cart')}
                sx={{
                  background: 'rgba(255,255,255,0.2)',
                  color: 'white',
                  '&:hover': {
                    background: 'rgba(255,255,255,0.3)'
                  }
                }}
              >
                <Badge badgeContent={cartCount} color="error">
                  <ShoppingCart />
                </Badge>
              </Fab>
              <IconButton
                size="small"
                onClick={handleProfileMenuOpen}
                sx={{
                  color: 'white',
                  background: 'rgba(255,255,255,0.1)',
                  '&:hover': {
                    background: 'rgba(255,255,255,0.2)'
                  }
                }}
              >
                <AccountCircle />
              </IconButton>
              <Button
                variant="outlined"
                onClick={handleLogout}
                sx={{
                  borderColor: 'rgba(255,255,255,0.5)',
                  color: 'white',
                  '&:hover': {
                    borderColor: 'white',
                    background: 'rgba(255,255,255,0.1)'
                  }
                }}
              >
                <Logout sx={{ fontSize: 18, mr: 1 }} />
                ออกจากระบบ
              </Button>
            </Box>
          </Box>
        </Box>
      </Paper>

      {/* Profile Dropdown Menu */}
      <Menu
        anchorEl={profileMenuAnchor}
        open={Boolean(profileMenuAnchor)}
        onClose={handleProfileMenuClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        PaperProps={{
          sx: {
            mt: 1,
            borderRadius: 2,
            boxShadow: '0 8px 32px rgba(0,0,0,0.15)'
          }
        }}
      >
        <MenuItem onClick={() => { handleProfileMenuClose(); navigate('/profile'); }}>
          <Person sx={{ mr: 2, color: '#1E3A8A' }} />
          โปรไฟล์
        </MenuItem>
        <MenuItem onClick={() => { handleProfileMenuClose(); navigate('/orders'); }}>
          <Receipt sx={{ mr: 2, color: '#1E3A8A' }} />
          คำสั่งซื้อของฉัน
        </MenuItem>
      </Menu>

      {/* Search Section */}
      <Paper
        sx={{
          p: 3,
          mb: 4,
          background: 'white',
          borderRadius: 4,
          boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
          border: '1px solid rgba(30, 58, 138, 0.1)'
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Search sx={{ color: '#1E3A8A', mr: 2, fontSize: 24 }} />
          <Typography variant="h6" sx={{ fontWeight: 600, color: '#1E3A8A' }}>
            ค้นหาสินค้า
          </Typography>
        </Box>
        <TextField
          fullWidth
          placeholder="พิมพ์ชื่อสินค้า หรือคำที่เกี่ยวข้อง..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: 3,
              '&:hover fieldset': {
                borderColor: '#3B82F6'
              },
              '&.Mui-focused fieldset': {
                borderColor: '#1E3A8A'
              }
            }
          }}
          InputProps={{
            startAdornment: <Search sx={{ color: '#6B7280', mr: 1 }} />,
          }}
        />
      </Paper>

      {/* Products Grid */}
      <Paper
        sx={{
          p: 3,
          background: 'rgba(255,255,255,0.8)',
          backdropFilter: 'blur(10px)',
          borderRadius: 4,
          border: '1px solid rgba(255,255,255,0.3)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
          mb: 4
        }}
      >
        <Box
          sx={{
            display: 'grid',
            gap: 2,
            gridTemplateColumns: {
              xs: '1fr',
              sm: 'repeat(2, minmax(0, 1fr))',
              md: 'repeat(3, minmax(0, 1fr))',
              lg: 'repeat(4, minmax(0, 1fr))'
            },
          }}
        >
        {displayedProducts.map((product) => (
          <Card
            key={product.id}
            sx={{
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              borderRadius: 3,
              boxShadow: '0 8px 32px rgba(0,0,0,0.25)',
              border: '1px solid rgba(30, 58, 138, 0.1)',
              transition: 'all 0.3s ease',
              transform: 'perspective(1000px) rotateX(0deg)',
              '&:hover': {
                transform: 'perspective(1000px) rotateX(-2deg) translateY(-8px)',
                boxShadow: '0 20px 60px rgba(0,0,0,0.4)',
                border: '1px solid rgba(30, 58, 138, 0.2)'
              }
            }}
          >
            {product.imageUrl ? (
              <CardMedia
                component="img"
                height="180"
                image={product.imageUrl}
                alt={product.name}
                sx={{ objectFit: 'cover' }}
              />
            ) : (
              <Box
                sx={{
                  height: 180,
                  background: 'linear-gradient(135deg, #F3F4F6 0%, #E5E7EB 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <Inventory2 sx={{ fontSize: 48, color: '#9CA3AF' }} />
              </Box>
            )}
            <CardContent sx={{ flexGrow: 1, p: 1.5 }}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5, color: '#1E293B' }} noWrap>
                {product.name}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5, height: 36, overflow: 'hidden', fontSize: '0.875rem' }}>
                {product.description || 'ไม่มีรายละเอียดสินค้า'}
              </Typography>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                <Typography variant="h6" sx={{ fontWeight: 700, color: '#1E3A8A' }}>
                  ฿{product.price.toFixed(2)}
                </Typography>
                <Chip
                  size="small"
                  label={`คงเหลือ ${product.quantity}`}
                  color={product.quantity > 5 ? 'success' : product.quantity > 0 ? 'warning' : 'error'}
                  variant="outlined"
                />
              </Box>
            </CardContent>
            <CardActions sx={{ p: 1.5, pt: 0 }}>
              <Button
                fullWidth
                variant="contained"
                onClick={() => handleAddToCart(product)}
                disabled={product.quantity <= 0}
                sx={{
                  background: product.quantity > 0 
                    ? 'linear-gradient(135deg, #1E3A8A 0%, #3B82F6 100%)'
                    : 'linear-gradient(135deg, #9CA3AF 0%, #6B7280 100%)',
                  color: 'white',
                  borderRadius: 2,
                  py: 1,
                  fontWeight: 600,
                  fontSize: '0.875rem',
                  '&:hover': {
                    background: product.quantity > 0
                      ? 'linear-gradient(135deg, #1E40AF 0%, #2563EB 100%)'
                      : 'linear-gradient(135deg, #6B7280 0%, #4B5563 100%)'
                  }
                }}
              >
                {product.quantity > 0 ? (
                  <>
                    <ShoppingCart sx={{ mr: 1, fontSize: 18 }} />
                    เพิ่มลงตะกร้า
                  </>
                ) : (
                  'สินค้าหมด'
                )}
              </Button>
            </CardActions>
          </Card>
        ))}
      </Box>
      </Paper>

      {/* Pagination */}
      {filtered.length > 8 && (
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center',
          py: 3,
          gap: 1
        }}>
          <IconButton
            onClick={(e) => handleChangePage(e, page - 1)}
            disabled={page === 0}
            sx={{ 
              color: page === 0 ? '#ccc' : '#1E3A8A',
              '&:hover': { backgroundColor: 'rgba(30, 58, 138, 0.1)' }
            }}
          >
            {'<'}
          </IconButton>
          
          {Array.from({ length: Math.ceil(filtered.length / rowsPerPage) }, (_, index) => (
            <IconButton
              key={index}
              onClick={(e) => handleChangePage(e, index)}
              sx={{
                color: page === index ? '#1E3A8A' : '#666',
                backgroundColor: page === index ? 'rgba(30, 58, 138, 0.1)' : 'transparent',
                '&:hover': { backgroundColor: 'rgba(30, 58, 138, 0.1)' },
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
            disabled={page >= Math.ceil(filtered.length / rowsPerPage) - 1}
            sx={{ 
              color: page >= Math.ceil(filtered.length / rowsPerPage) - 1 ? '#ccc' : '#1E3A8A',
              '&:hover': { backgroundColor: 'rgba(30, 58, 138, 0.1)' }
            }}
          >
            {'>'}
          </IconButton>
        </Box>
      )}

      {/* Empty State */}
      {filtered.length === 0 && (
        <Paper
          sx={{
            p: 6,
            textAlign: 'center',
            background: 'white',
            borderRadius: 4,
            border: '2px dashed #E5E7EB'
          }}
        >
          <Search sx={{ fontSize: 64, color: '#9CA3AF', mb: 2 }} />
          <Typography variant="h6" sx={{ color: '#6B7280', mb: 1 }}>
            ไม่พบสินค้าที่ตรงกับคำค้นหา
          </Typography>
          <Typography variant="body2" color="text.secondary">
            ลองค้นหาด้วยคำอื่นหรือตรวจสอบการสะกดคำ
          </Typography>
        </Paper>
      )}
    </Container>
  );
}

export default Dashboard;