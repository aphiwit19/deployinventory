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
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { getAll } from '../../services/firestore';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';

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

  return (
    <Box sx={{ p: 3 }}>
      {/* Top bar with logout */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'flex-end',
          mb: 2,
        }}
      >
        <IconButton color="primary" sx={{ mr: 1 }} onClick={() => navigate('/cart')}>
          <Badge color="secondary" badgeContent={cartCount} showZero>
            <ShoppingCartIcon />
          </Badge>
        </IconButton>
        <IconButton
          color="primary"
          sx={{ mr: 1 }}
          onClick={handleProfileMenuOpen}
        >
          <AccountCircleIcon />
        </IconButton>
        <Button variant="outlined" color="primary" onClick={handleLogout}>
          ออกจากระบบ
        </Button>
      </Box>

      {/* Profile Dropdown Menu */}
      <Menu
        anchorEl={profileMenuAnchor}
        open={Boolean(profileMenuAnchor)}
        onClose={handleProfileMenuClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <MenuItem onClick={() => { handleProfileMenuClose(); navigate('/profile'); }}>
          โปรไฟล์
        </MenuItem>
        <MenuItem onClick={() => { handleProfileMenuClose(); navigate('/orders'); }}>
          คำสั่งซื้อของฉัน
        </MenuItem>
      </Menu>

      {/* Welcome section */}
      <Box
        sx={{
          mb: 3,
          p: 3,
          borderRadius: 2,
          background: 'linear-gradient(135deg, #e3f2fd 0%, #ffffff 100%)',
        }}
      >
        <Typography variant="h5" sx={{ fontWeight: 600, mb: 1 }}>
          ยินดีต้อนรับลูกค้า
        </Typography>
        <Typography variant="body1" color="text.secondary">
          เลือกชมสินค้าและเพิ่มลงตะกร้าได้จากรายการด้านล่าง
        </Typography>
      </Box>

      {/* Search */}
      <Box sx={{ mb: 3 }}>
        <TextField
          fullWidth
          label="ค้นหาสินค้า"
          placeholder="พิมพ์ชื่อสินค้า หรือคำที่เกี่ยวข้อง"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </Box>

      {/* Product list: grid 1/2/3 columns */}
      <Box
        sx={{
          display: 'grid',
          gap: 2,
          gridTemplateColumns: {
            xs: '1fr',
            sm: 'repeat(2, minmax(0, 1fr))',
            md: 'repeat(3, minmax(0, 1fr))',
          },
        }}
      >
        {filtered.map((product) => (
          <Box key={product.id}>
            <Card sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
              {product.imageUrl && (
                <CardMedia
                  component="img"
                  height="160"
                  image={product.imageUrl}
                  alt={product.name}
                />
              )}
              <CardContent sx={{ flexGrow: 1 }}>
                <Typography variant="h6" gutterBottom noWrap>
                  {product.name}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }} noWrap>
                  {product.description}
                </Typography>
                <Typography variant="subtitle1" color="primary">
                  {product.price.toFixed(2)} บาท
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  จำนวนคงเหลือ: {product.quantity}
                </Typography>
              </CardContent>
              <CardActions sx={{ justifyContent: 'flex-end', p: 2 }}>
                <Button
                  variant="contained"
                  onClick={() => handleAddToCart(product)}
                  disabled={product.quantity <= 0}
                >
                  {product.quantity > 0 ? 'เพิ่มลงตะกร้า' : 'สินค้าหมด'}
                </Button>
              </CardActions>
            </Card>
          </Box>
        ))}
      </Box>

      {filtered.length === 0 && (
        <Box sx={{ mt: 3 }}>
          <Typography align="center" color="text.secondary">
            ไม่พบสินค้าที่ตรงกับคำค้นหา
          </Typography>
        </Box>
      )}
    </Box>
  );
}

export default Dashboard;