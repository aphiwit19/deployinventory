import React from 'react';
import {
  Box,
  Container,
  Typography,
  Link,
  Divider,
  IconButton,
  Stack,
  useTheme,
  alpha,
} from '@mui/material';
import {
  Facebook,
  Twitter,
  Instagram,
  LinkedIn,
  Phone,
  Email,
  LocationOn,
  AccessTime,
} from '@mui/icons-material';
import { useLocation, Link as RouterLink } from 'react-router-dom';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const theme = useTheme();
  const location = useLocation();
  
  // Check if current route is home page only
  const isDashboardPage = location.pathname === '/';

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {/* Main Content */}
      <Box sx={{ flex: 1 }}>
        {children}
      </Box>

      {/* Footer - Only show on dashboard pages */}
      {isDashboardPage && (
        <Box
          component="footer"
          sx={{
            background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 50%, #334155 100%)',
            color: 'white',
            mt: 8,
            position: 'relative',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: 4,
              background: 'linear-gradient(90deg, #3B82F6 0%, #60A5FA 50%, #93C5FD 100%)',
            }
          }}
        >
        {/* Top Wave Pattern */}
        <Box
          sx={{
            position: 'absolute',
            top: 4,
            left: 0,
            right: 0,
            height: 60,
            background: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1440 320'%3E%3Cpath fill='%231E293B' fill-opacity='1' d='M0,96L48,112C96,128,192,160,288,160C384,160,480,128,576,122.7C672,117,768,139,864,138.7C960,139,1056,117,1152,112C1248,107,1344,117,1392,122.7L1440,128L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z'%3E%3C/path%3E%3C/svg%3E")`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            opacity: 0.3,
          }}
        />

        <Container maxWidth="xl" sx={{ pt: 8, pb: 6, position: 'relative', zIndex: 1 }}>
          <Box sx={{ display: 'grid', gap: 4, gridTemplateColumns: { xs: '1fr', md: '2fr 1fr 1.5fr 1.5fr' } }}>
            {/* Company Info */}
            <Box>
              <Box sx={{ mb: 3 }}>
                <Typography
                  variant="h4"
                  sx={{
                    fontWeight: 800,
                    mb: 2,
                    background: 'linear-gradient(135deg, #60A5FA 0%, #93C5FD 100%)',
                    backgroundClip: 'text',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}
                >
                  ร้านค้าของเรา
                </Typography>
                <Typography
                  variant="body2"
                  sx={{ color: alpha('#ffffff', 0.8), lineHeight: 1.6, mb: 3 }}
                >
                  พบกับสินค้าคุณภาพที่คัดสรรมาอย่างดี พร้อมบริการจัดส่งที่รวดเร็วและปลอดภัย
                  เรามุ่งมั่นให้ความพึงพอใจสูงสุดกับลูกค้าทุกท่าน
                </Typography>
                <Stack direction="row" spacing={2}>
                  <IconButton
                    size="small"
                    sx={{
                      color: alpha('#ffffff', 0.7),
                      background: alpha('#ffffff', 0.1),
                      '&:hover': {
                        color: '#60A5FA',
                        background: alpha('#60A5FA', 0.1),
                      },
                    }}
                  >
                    <Facebook />
                  </IconButton>
                  <IconButton
                    size="small"
                    sx={{
                      color: alpha('#ffffff', 0.7),
                      background: alpha('#ffffff', 0.1),
                      '&:hover': {
                        color: '#60A5FA',
                        background: alpha('#60A5FA', 0.1),
                      },
                    }}
                  >
                    <Twitter />
                  </IconButton>
                  <IconButton
                    size="small"
                    sx={{
                      color: alpha('#ffffff', 0.7),
                      background: alpha('#ffffff', 0.1),
                      '&:hover': {
                        color: '#60A5FA',
                        background: alpha('#60A5FA', 0.1),
                      },
                    }}
                  >
                    <Instagram />
                  </IconButton>
                  <IconButton
                    size="small"
                    sx={{
                      color: alpha('#ffffff', 0.7),
                      background: alpha('#ffffff', 0.1),
                      '&:hover': {
                        color: '#60A5FA',
                        background: alpha('#60A5FA', 0.1),
                      },
                    }}
                  >
                    <LinkedIn />
                  </IconButton>
                </Stack>
              </Box>
            </Box>

            {/* Quick Links */}
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 3 }}>
                เมนูลัด
              </Typography>
              <Stack spacing={2}>
                <Link
                  component={RouterLink}
                  to="/"
                  sx={{
                    color: alpha('#ffffff', 0.8),
                    textDecoration: 'none',
                    '&:hover': {
                      color: '#60A5FA',
                    },
                  }}
                >
                  หน้าแรก
                </Link>
                <Link
                  component={RouterLink}
                  to="/cart"
                  sx={{
                    color: alpha('#ffffff', 0.8),
                    textDecoration: 'none',
                    '&:hover': {
                      color: '#60A5FA',
                    },
                  }}
                >
                  ตะกร้าสินค้า
                </Link>
                <Link
                  component={RouterLink}
                  to="/orders"
                  sx={{
                    color: alpha('#ffffff', 0.8),
                    textDecoration: 'none',
                    '&:hover': {
                      color: '#60A5FA',
                    },
                  }}
                >
                  ประวัติคำสั่งซื้อ
                </Link>
                <Link
                  component={RouterLink}
                  to="/profile"
                  sx={{
                    color: alpha('#ffffff', 0.8),
                    textDecoration: 'none',
                    '&:hover': {
                      color: '#60A5FA',
                    },
                  }}
                >
                  โปรไฟล์
                </Link>
              </Stack>
            </Box>

            {/* Customer Service */}
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 3 }}>
                บริการลูกค้า
              </Typography>
              <Stack spacing={2}>
                <Link
                  component={RouterLink}
                  to="#"
                  sx={{
                    color: alpha('#ffffff', 0.8),
                    textDecoration: 'none',
                    '&:hover': {
                      color: '#60A5FA',
                    },
                  }}
                >
                  วิธีการสั่งซื้อ
                </Link>
                <Link
                  component={RouterLink}
                  to="#"
                  sx={{
                    color: alpha('#ffffff', 0.8),
                    textDecoration: 'none',
                    '&:hover': {
                      color: '#60A5FA',
                    },
                  }}
                >
                  การจัดส่งสินค้า
                </Link>
                <Link
                  component={RouterLink}
                  to="#"
                  sx={{
                    color: alpha('#ffffff', 0.8),
                    textDecoration: 'none',
                    '&:hover': {
                      color: '#60A5FA',
                    },
                  }}
                >
                  นโยบายคืนสินค้า
                </Link>
                <Link
                  component={RouterLink}
                  to="#"
                  sx={{
                    color: alpha('#ffffff', 0.8),
                    textDecoration: 'none',
                    '&:hover': {
                      color: '#60A5FA',
                    },
                  }}
                >
                  คำถามที่พบบ่อย
                </Link>
              </Stack>
            </Box>

            {/* Contact Info */}
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 3 }}>
                ติดต่อเรา
              </Typography>
              <Stack spacing={2}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Phone sx={{ color: '#60A5FA', fontSize: 20 }} />
                  <Typography variant="body2" sx={{ color: alpha('#ffffff', 0.8) }}>
                    02-123-4567
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Email sx={{ color: '#60A5FA', fontSize: 20 }} />
                  <Typography variant="body2" sx={{ color: alpha('#ffffff', 0.8) }}>
                    vannessplus@gmail.com
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                  <LocationOn sx={{ color: '#60A5FA', fontSize: 20, mt: 0.5 }} />
                  <Typography variant="body2" sx={{ color: alpha('#ffffff', 0.8) }}>
                    123 ถนนสุขุมวิท แขวงคลองตัน เขตคลองเตน กรุงเทพมหานคร 10110
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <AccessTime sx={{ color: '#60A5FA', fontSize: 20 }} />
                  <Typography variant="body2" sx={{ color: alpha('#ffffff', 0.8) }}>
                    จันทร์ - เสาร์: 9:00 - 18:00 น.
                  </Typography>
                </Box>
              </Stack>
            </Box>
          </Box>

          {/* Bottom Section */}
          <Divider sx={{ borderColor: alpha('#ffffff', 0.1), my: 4 }} />
          
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: 2,
            }}
          >
            <Typography variant="body2" sx={{ color: alpha('#ffffff', 0.6) }}>
              © 2024 ร้านค้าของเรา. สงวนลิขสิทธิ์ทั้งหมด
            </Typography>
            <Stack direction="row" spacing={3}>
              <Link
                component={RouterLink}
                to="#"
                sx={{
                  color: alpha('#ffffff', 0.6),
                  textDecoration: 'none',
                  fontSize: '0.875rem',
                  '&:hover': {
                    color: '#60A5FA',
                  },
                }}
              >
                นโยบายความเป็นส่วนตัว
              </Link>
              <Link
                component={RouterLink}
                to="#"
                sx={{
                  color: alpha('#ffffff', 0.6),
                  textDecoration: 'none',
                  fontSize: '0.875rem',
                  '&:hover': {
                    color: '#60A5FA',
                  },
                }}
              >
                เงื่อนไขการใช้งาน
              </Link>
            </Stack>
          </Box>
        </Container>
      </Box>
      )}
    </Box>
  );
};

export default Layout;
