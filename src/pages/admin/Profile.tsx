import { useEffect, useState } from 'react';
import { Box, Typography, TextField, Button, CircularProgress, Paper, MenuItem, FormControl, InputLabel, Select } from '@mui/material';
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
  const [docId, setDocId] = useState<string | null>(null);
  const [form, setForm] = useState<AdminProfileForm>({
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

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 600, mx: 'auto', p: 3 }}>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 600 }}>
        โปรไฟล์ผู้ดูแลระบบ
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        จัดการข้อมูลส่วนตัวและข้อมูลการทำงานของคุณ
      </Typography>

      <Paper sx={{ p: 3 }} elevation={1}>
        <form onSubmit={handleSubmit}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {/* ข้อมูลส่วนตัว */}
            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
                ข้อมูลส่วนตัว
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                <TextField
                  label="ชื่อจริง"
                  value={form.firstName}
                  onChange={handleChange('firstName')}
                  fullWidth
                  required
                />
                <TextField
                  label="นามสกุล"
                  value={form.lastName}
                  onChange={handleChange('lastName')}
                  fullWidth
                  required
                />
              </Box>
              <TextField
                label="เบอร์โทรศัพท์"
                value={form.phone}
                onChange={handleChange('phone')}
                fullWidth
                required
              />
            </Box>

            {/* ข้อมูลการทำงาน */}
            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
                ข้อมูลการทำงาน
              </Typography>
              <FormControl fullWidth>
                <InputLabel>ตำแหน่ง</InputLabel>
                <Select
                  value={form.position}
                  onChange={handleChange('position')}
                  label="ตำแหน่ง"
                  required
                >
                  {positions.map((pos) => (
                    <MenuItem key={pos} value={pos}>
                      {pos}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>

            {/* ข้อมูลระบบ */}
            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
                ข้อมูลระบบ
              </Typography>
              <TextField
                label="Email"
                value={form.email}
                disabled
                fullWidth
                helperText="Email จากระบบไม่สามารถแก้ไขได้"
              />
            </Box>

            {/* ปุ่มบันทึก */}
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', mt: 2 }}>
              <Button
                type="submit"
                variant="contained"
                disabled={saving}
                startIcon={saving && <CircularProgress size={20} />}
                sx={{ minWidth: 120 }}
              >
                {saving ? 'กำลังบันทึก...' : 'บันทึกข้อมูล'}
              </Button>
            </Box>
          </Box>
        </form>
      </Paper>
    </Box>
  );
};

export default Profile;
