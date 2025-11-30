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
  Select,
  MenuItem,
  CircularProgress,
} from '@mui/material';

type UserRole = 'customer' | 'staff' | 'admin';

interface UserRow {
  id: string;
  email?: string;
  role?: UserRole;
  uid?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  createdAt?: any;
}

interface PermissionsTabProps {
  users: UserRow[];
  loadingUsers: boolean;
  savingId: string | null;
  onRoleChange: (user: UserRow, newRole: UserRole) => void;
}

const PermissionsTab: React.FC<PermissionsTabProps> = ({
  users,
  loadingUsers,
  savingId,
  onRoleChange,
}) => {
  return (
    <>
      <Typography variant="h4" gutterBottom>
        จัดการสิทธิ์ผู้ใช้
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
        เลือก role ให้กับผู้ใช้แต่ละคน (customer / staff / admin)
      </Typography>

      {loadingUsers ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>ชื่อ</TableCell>
              <TableCell>อีเมล</TableCell>
              <TableCell>เบอร์โทร</TableCell>
              <TableCell>สมัครเมื่อ</TableCell>
              <TableCell align="right">บทบาท</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id} hover>
                <TableCell>
                  {user.firstName && user.lastName
                    ? `${user.firstName} ${user.lastName}`
                    : user.email || '-'}
                </TableCell>
                <TableCell>{user.email || '-'}</TableCell>
                <TableCell>{user.phone || '-'}</TableCell>
                <TableCell>
                  {user.createdAt?.toDate?.().toLocaleDateString('th-TH') ||
                   (typeof user.createdAt === 'string' ? new Date(user.createdAt).toLocaleDateString('th-TH') : '-') ||
                   '-'}
                </TableCell>
                <TableCell align="right">
                  <Select
                    size="small"
                    value={user.role || 'customer'}
                    onChange={(e) =>
                      onRoleChange(user, e.target.value as UserRole)
                    }
                    disabled={savingId === user.id}
                    sx={{ minWidth: 140 }}
                  >
                    <MenuItem value="customer">ลูกค้า (customer)</MenuItem>
                    <MenuItem value="staff">พนักงาน (staff)</MenuItem>
                    <MenuItem value="admin">แอดมิน (admin)</MenuItem>
                  </Select>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </>
  );
};

export default PermissionsTab;
