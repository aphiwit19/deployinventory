import { FormEvent, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, TextField, Button, Typography, Paper, Container } from '@mui/material';
import { register } from '../../services/auth';
import { add } from '../../services/firestore';
import { Timestamp } from 'firebase/firestore';

const Register = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('รหัสผ่านไม่ตรงกัน');
      return;
    }

    try {
      setLoading(true);
      const cred = await register(email, password);
      await add('users', {
        uid: cred.user.uid,
        email: cred.user.email,
        createdAt: Timestamp.now(),
        role: 'customer',
      });
      navigate('/');
    } catch (err) {
      console.error(err);
      setError('สมัครสมาชิกไม่สำเร็จ');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #e3f2fd 0%, #f5f5f5 100%)',
        px: 2,
      }}
    >
      <Container maxWidth="xs">
        <Paper
          elevation={4}
          sx={{
            p: 4,
            borderRadius: 3,
            backdropFilter: 'blur(8px)',
          }}
        >
          <Box sx={{ mb: 3, textAlign: 'center' }}>
            <Typography variant="h5" component="h1" sx={{ fontWeight: 600, mb: 0.5 }}>
              สมัครสมาชิกใหม่
            </Typography>
            <Typography variant="body2" color="text.secondary">
              สร้างบัญชีเพื่อเริ่มใช้งานระบบจัดการสต็อกของคุณ
            </Typography>
          </Box>

          {error && (
            <Typography color="error" align="center" sx={{ mb: 2 }}>
              {error}
            </Typography>
          )}

          <Box component="form" onSubmit={handleSubmit}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="อีเมล"
              name="email"
              autoComplete="email"
              autoFocus
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="รหัสผ่าน"
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="confirmPassword"
              label="ยืนยันรหัสผ่าน"
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, py: 1.2 }}
              disabled={loading}
            >
              {loading ? 'กำลังสมัคร...' : 'สมัครสมาชิก'}
            </Button>
            <Button
              fullWidth
              sx={{ mt: 1.5, py: 1 }}
              variant="text"
              onClick={() => navigate('/login')}
            >
              มีบัญชีแล้ว? เข้าสู่ระบบ
            </Button>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default Register;
