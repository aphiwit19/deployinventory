import { useEffect, useState } from 'react';
import { 
  Box, 
  Typography, 
  TextField, 
  Button, 
  CircularProgress, 
  Paper, 
  MenuItem, 
  FormControl, 
  InputLabel, 
  Select,
  Avatar,
  useTheme,
  alpha,
  Grid,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
} from '@mui/material';
import {
  Person,
  Email,
  Phone,
  Work,
  Security,
  Save,
  AccountCircle,
  BusinessCenter,
  Settings,
  Edit,
  Close,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { queryDocs, add, update } from '../../services/firestore';

interface AdminProfileForm {
  firstName: string;
  lastName: string;
  phone: string;
  position: string;
  email: string;
}

const positions = [
  'ผู้จัดการ',
  'ผู้ดูแลระบบ',
  'ผู้พัฒนาระบบ',
  'ผู้อำนวยการ',
  'อื่นๆ'
];

const Profile = () => {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [docId, setDocId] = useState<string | null>(null);
  const [form, setForm] = useState<AdminProfileForm>({
    firstName: '',
    lastName: '',
    phone: '',
    position: '',
    email: '',
  });
  const [editForm, setEditForm] = useState<AdminProfileForm>({
    firstName: '',
    lastName: '',
    phone: '',
    position: '',
    email: '',
  });

  useEffect(() => {
    const loadProfile = async () => {
      if (!currentUser) return;

      try {
        // ค้นหาข้อมูล admin จาก collection 'users'
        const users = await queryDocs('users', 'uid', '==', currentUser.uid);
        const userDoc: any | undefined = users[0];

        if (userDoc) {
          setDocId(userDoc.id);
          setForm({
            firstName: userDoc.firstName || '',
            lastName: userDoc.lastName || '',
            phone: userDoc.phone || '',
            position: userDoc.position || '',
            email: userDoc.email || currentUser.email || '',
          });
        } else {
          setForm((prev) => ({
            ...prev,
            email: currentUser.email || '',
          }));
        }
      } catch (e) {
        console.error('Failed to load admin profile', e);
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [currentUser]);

  const handleChange = (field: keyof AdminProfileForm) => (
    e: any
  ) => {
    const value = e.target.value;
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleEditChange = (field: keyof AdminProfileForm) => (
    e: any
  ) => {
    const value = e.target.value;
    setEditForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleEdit = () => {
    setEditForm({ ...form });
    setEditMode(true);
  };

  const handleCancelEdit = () => {
    setEditMode(false);
    setEditForm({
      firstName: '',
      lastName: '',
      phone: '',
      position: '',
      email: '',
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    setSaving(true);
    try {
      const profileData = {
        ...form,
        uid: currentUser.uid,
        role: 'admin',
        updatedAt: new Date(),
      };

      if (docId) {
        // อัปเดตข้อมูลที่มีอยู่
        await update('users', docId, profileData);
      } else {
        // สร้างข้อมูลใหม่
        await add('users', {
          ...profileData,
          createdAt: new Date(),
        });
      }
    } catch (e) {
      console.error('Failed to save admin profile', e);
    } finally {
      setSaving(false);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    setSaving(true);
    try {
      const profileData = {
        ...editForm,
        uid: currentUser.uid,
        role: 'admin',
        updatedAt: new Date(),
      };

      if (docId) {
        await update('users', docId, profileData);
      } else {
        await add('users', {
          ...profileData,
          createdAt: new Date(),
        });
      }

      // Update form with new data
      setForm(editForm);
      setEditMode(false);
    } catch (e) {
      console.error('Failed to save admin profile', e);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
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
          minHeight: 400,
          mx: 3
        }}
      >
        <CircularProgress
          size={60}
          thickness={4}
          sx={{
            color: '#7C3AED',
            mb: 2
          }}
        />
        <Typography variant="body1" color="text.secondary" sx={{ fontWeight: 500 }}>
          กำลังโหลดข้อมูลโปรไฟล์...
        </Typography>
      </Paper>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header Section */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Avatar
            sx={{
              width: 48,
              height: 48,
              background: 'linear-gradient(135deg, #7C3AED 0%, #6D28D9 100%)',
              mr: 2,
              boxShadow: '0 4px 12px rgba(124, 58, 237, 0.3)'
            }}
          >
            <AccountCircle sx={{ color: 'white', fontSize: 24 }} />
          </Avatar>
          <Box>
            <Typography
              variant="h4"
              sx={{
                fontWeight: 700,
                background: 'linear-gradient(135deg, #6D28D9 0%, #7C3AED 100%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                mb: 0.5
              }}
            >
              โปรไฟล์ผู้ดูแลระบบ
            </Typography>
            <Typography variant="body1" color="text.secondary">
              จัดการข้อมูลส่วนตัวและข้อมูลการทำงานของคุณ
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Profile Display */}
      <Paper
        sx={{
          p: 4,
          background: 'white',
          border: '1px solid #E2E8F0',
          borderRadius: 3,
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
          maxWidth: 800,
          mx: 'auto',
          position: 'relative'
        }}
      >
        {/* Edit Button - Top Right Corner */}
        <Button
          variant="contained"
          startIcon={<Edit />}
          onClick={handleEdit}
          sx={{
            position: 'absolute',
            top: 16,
            right: 16,
            background: 'linear-gradient(135deg, #7C3AED 0%, #6D28D9 100%)',
            color: 'white',
            boxShadow: '0 2px 4px rgba(124, 58, 237, 0.3)',
            fontSize: '0.8rem',
            py: 0.75,
            px: 1.5,
            '&:hover': {
              background: 'linear-gradient(135deg, #6D28D9 0%, #5B21B6 100%)',
              boxShadow: '0 4px 8px rgba(124, 58, 237, 0.4)'
            }
          }}
        >
          แก้ไขข้อมูล
        </Button>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {/* ข้อมูลส่วนตัว */}
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Avatar
                sx={{
                  width: 32,
                  height: 32,
                  background: 'linear-gradient(135deg, #7C3AED 0%, #6D28D9 100%)',
                  mr: 2
                }}
              >
                <Person sx={{ color: 'white', fontSize: 16 }} />
              </Avatar>
              <Typography variant="h6" sx={{ fontWeight: 600, color: '#1E293B' }}>
                ข้อมูลส่วนตัว
              </Typography>
            </Box>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, md: 6 }}>
                <Box>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>ชื่อจริง</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 500, p: 1.2, bgcolor: '#F8FAFC', borderRadius: 2 }}>
                    {form.firstName || '-'}
                  </Typography>
                </Box>
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <Box>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>นามสกุล</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 500, p: 1.2, bgcolor: '#F8FAFC', borderRadius: 2 }}>
                    {form.lastName || '-'}
                  </Typography>
                </Box>
              </Grid>
              <Grid size={{ xs: 12 }}>
                <Box>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>เบอร์โทรศัพท์</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 500, p: 1.2, bgcolor: '#F8FAFC', borderRadius: 2, display: 'flex', alignItems: 'center' }}>
                    <Phone sx={{ fontSize: 16, mr: 1, color: '#6B7280' }} />
                    {form.phone || '-'}
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Box>

          <Divider sx={{ my: 1 }} />

          {/* ข้อมูลการทำงาน */}
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Avatar
                sx={{
                  width: 32,
                  height: 32,
                  background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                  mr: 2
                }}
              >
                <BusinessCenter sx={{ color: 'white', fontSize: 16 }} />
              </Avatar>
              <Typography variant="h6" sx={{ fontWeight: 600, color: '#1E293B' }}>
                ข้อมูลการทำงาน
              </Typography>
            </Box>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12 }}>
                <Box>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>ตำแหน่ง</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 500, p: 1.2, bgcolor: '#F8FAFC', borderRadius: 2, display: 'flex', alignItems: 'center' }}>
                    <Work sx={{ fontSize: 16, mr: 1, color: '#059669' }} />
                    {form.position || '-'}
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Box>

          <Divider sx={{ my: 1 }} />

          {/* ข้อมูลระบบ */}
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Avatar
                sx={{
                  width: 32,
                  height: 32,
                  background: 'linear-gradient(135deg, #DC2626 0%, #B91C1C 100%)',
                  mr: 2
                }}
              >
                <Security sx={{ color: 'white', fontSize: 16 }} />
              </Avatar>
              <Typography variant="h6" sx={{ fontWeight: 600, color: '#1E293B' }}>
                ข้อมูลระบบ
              </Typography>
            </Box>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12 }}>
                <Box>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>Email</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 500, p: 1.2, bgcolor: '#F8FAFC', borderRadius: 2, display: 'flex', alignItems: 'center' }}>
                    <Email sx={{ fontSize: 16, mr: 1, color: '#6B7280' }} />
                    {form.email || '-'}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                    Email จากระบบไม่สามารถแก้ไขได้
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Box>
        </Box>
      </Paper>

      {/* Edit Dialog */}
      <Dialog
        open={editMode}
        onClose={handleCancelEdit}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.15)'
          }
        }}
      >
        <DialogTitle sx={{ 
          p: 3,
          background: 'linear-gradient(135deg, #7C3AED 0%, #6D28D9 100%)',
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Avatar
              sx={{
                width: 40,
                height: 40,
                background: 'rgba(255,255,255,0.2)',
                mr: 2
              }}
            >
              <Edit sx={{ color: 'white', fontSize: 20 }} />
            </Avatar>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              แก้ไขข้อมูลโปรไฟล์
            </Typography>
          </Box>
          <IconButton onClick={handleCancelEdit} sx={{ color: 'white' }}>
            <Close />
          </IconButton>
        </DialogTitle>
        <form onSubmit={handleEditSubmit}>
          <DialogContent sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              {/* ข้อมูลส่วนตัว */}
              <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2, color: '#1E293B' }}>
                  ข้อมูลส่วนตัว
                </Typography>
                <Grid container spacing={3}>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <TextField
                      label="ชื่อจริง"
                      value={editForm.firstName}
                      onChange={handleEditChange('firstName')}
                      fullWidth
                      required
                      sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <TextField
                      label="นามสกุล"
                      value={editForm.lastName}
                      onChange={handleEditChange('lastName')}
                      fullWidth
                      required
                      sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                    />
                  </Grid>
                  <Grid size={{ xs: 12 }}>
                    <TextField
                      label="เบอร์โทรศัพท์"
                      value={editForm.phone}
                      onChange={handleEditChange('phone')}
                      fullWidth
                      required
                      InputProps={{
                        startAdornment: <Phone sx={{ color: '#6B7280', mr: 1 }} />
                      }}
                      sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                    />
                  </Grid>
                </Grid>
              </Box>

              {/* ข้อมูลการทำงาน */}
              <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2, color: '#1E293B' }}>
                  ข้อมูลการทำงาน
                </Typography>
                <FormControl fullWidth>
                  <InputLabel>ตำแหน่ง</InputLabel>
                  <Select
                    value={editForm.position}
                    onChange={handleEditChange('position')}
                    label="ตำแหน่ง"
                    required
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2
                      }
                    }}
                  >
                    {positions.map((pos) => (
                      <MenuItem key={pos} value={pos}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Work sx={{ fontSize: 16, color: '#059669' }} />
                          {pos}
                        </Box>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>
            </Box>
          </DialogContent>
          <DialogActions sx={{ p: 3, borderTop: '1px solid #E2E8F0' }}>
            <Button
              onClick={handleCancelEdit}
              sx={{
                color: '#6B7280',
                '&:hover': { bgcolor: '#F3F4F6' }
              }}
            >
              ยกเลิก
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={saving}
              startIcon={saving ? <CircularProgress size={20} /> : <Save />}
              sx={{
                minWidth: 120,
                background: 'linear-gradient(135deg, #7C3AED 0%, #6D28D9 100%)',
                boxShadow: '0 2px 4px rgba(124, 58, 237, 0.3)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #6D28D9 0%, #5B21B6 100%)'
                }
              }}
            >
              {saving ? 'กำลังบันทึก...' : 'บันทึกข้อมูล'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
};

export default Profile;
