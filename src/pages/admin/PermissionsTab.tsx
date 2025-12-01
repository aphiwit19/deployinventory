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
  Select,
  MenuItem,
  CircularProgress,
  Avatar,
  useTheme,
  alpha,
  Paper,
  Chip,
  IconButton,
} from '@mui/material';
import {
  AdminPanelSettings,
  Person,
  Email,
  Phone,
  CalendarToday,
  Security,
  ManageAccounts,
  Group,
  Business,
} from '@mui/icons-material';

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

  // รายการที่จะแสดงในหน้าปัจจุบัน
  const displayedUsers = users.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  const getRoleIcon = (role?: UserRole) => {
    switch (role) {
      case 'admin':
        return <AdminPanelSettings sx={{ fontSize: 16 }} />;
      case 'staff':
        return <ManageAccounts sx={{ fontSize: 16 }} />;
      case 'customer':
        return <Person sx={{ fontSize: 16 }} />;
      default:
        return <Person sx={{ fontSize: 16 }} />;
    }
  };

  const getRoleColor = (role?: UserRole) => {
    switch (role) {
      case 'admin':
        return '#DC2626'; // แดงเข้ม
      case 'staff':
        return '#2563EB'; // ฟ้า
      case 'customer':
        return '#10B981'; // เขียว
      default:
        return '#6B7280'; // เทา
    }
  };

  const getRoleBgColor = (role?: UserRole) => {
    switch (role) {
      case 'admin':
        return 'linear-gradient(135deg, #FEE2E2 0%, #FECACA 100%)';
      case 'staff':
        return 'linear-gradient(135deg, #EFF6FF 0%, #DBEAFE 100%)';
      case 'customer':
        return 'linear-gradient(135deg, #D1FAE5 0%, #6EE7B7 100%)';
      default:
        return 'linear-gradient(135deg, #F3F4F6 0%, #E5E7EB 100%)';
    }
  };

  const formatDate = (date: any) => {
    if (!date) return '-';
    try {
      const dateObj = date?.toDate?.() || (typeof date === 'string' ? new Date(date) : new Date());
      return dateObj.toLocaleDateString('th-TH', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      });
    } catch {
      return '-';
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header Section */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Avatar
            sx={{
              width: 48,
              height: 48,
              background: 'linear-gradient(135deg, #DC2626 0%, #B91C1C 100%)',
              mr: 2,
              boxShadow: '0 4px 12px rgba(220, 38, 38, 0.3)'
            }}
          >
            <Security sx={{ color: 'white', fontSize: 24 }} />
          </Avatar>
          <Box>
            <Typography
              variant="h4"
              sx={{
                fontWeight: 700,
                background: 'linear-gradient(135deg, #B91C1C 0%, #DC2626 100%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                mb: 0.5
              }}
            >
              จัดการสิทธิ์ผู้ใช้
            </Typography>
            <Typography variant="body1" color="text.secondary">
              กำหนดบทบาทและสิทธิ์ให้กับผู้ใช้ในระบบ
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Users Table */}
      {loadingUsers ? (
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
              color: '#DC2626',
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
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Person sx={{ fontSize: 16, mr: 1 }} />
                      ชื่อ
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
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Email sx={{ fontSize: 16, mr: 1 }} />
                      อีเมล
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
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Phone sx={{ fontSize: 16, mr: 1 }} />
                      เบอร์โทร
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
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <CalendarToday sx={{ fontSize: 16, mr: 1 }} />
                      สมัครเมื่อ
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
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Security sx={{ fontSize: 16, mr: 1 }} />
                      บทบาท
                    </Box>
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {users.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} align="center" sx={{ py: 8 }}>
                      <Avatar
                        sx={{
                          width: 80,
                          height: 80,
                          bgcolor: '#E2E8F0',
                          mx: 'auto',
                          mb: 2
                        }}
                      >
                        <Group sx={{ fontSize: 40, color: '#64748B' }} />
                      </Avatar>
                      <Typography variant="h6" sx={{ color: '#475569', mb: 1 }}>
                        ไม่พบผู้ใช้
                      </Typography>
                      <Typography variant="body2" color="#64748B">
                        ยังไม่มีผู้ใช้ในระบบ
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  displayedUsers.map((user, index) => (
                    <TableRow
                      key={user.id}
                      sx={{
                        '&:hover': {
                          backgroundColor: alpha('#DC2626', 0.04)
                        },
                        backgroundColor: index % 2 === 0 ? '#FAFAFA' : 'white'
                      }}
                    >
                      <TableCell sx={{ py: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Avatar
                            sx={{
                              width: 32,
                              height: 32,
                              background: getRoleBgColor(user.role),
                              color: getRoleColor(user.role),
                              mr: 2
                            }}
                          >
                            {getRoleIcon(user.role)}
                          </Avatar>
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            {user.firstName && user.lastName
                              ? `${user.firstName} ${user.lastName}`
                              : user.email || '-'}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell sx={{ py: 2 }}>
                        <Typography variant="body2">
                          {user.email || '-'}
                        </Typography>
                      </TableCell>
                      <TableCell sx={{ py: 2 }}>
                        <Typography variant="body2">
                          {user.phone || '-'}
                        </Typography>
                      </TableCell>
                      <TableCell sx={{ py: 2 }}>
                        <Typography variant="body2">
                          {formatDate(user.createdAt)}
                        </Typography>
                      </TableCell>
                      <TableCell sx={{ py: 2 }}>
                        <Select
                          size="small"
                          value={user.role || 'customer'}
                          onChange={(e) =>
                            onRoleChange(user, e.target.value as UserRole)
                          }
                          disabled={savingId === user.id}
                          sx={{
                            minWidth: 160,
                            '& .MuiOutlinedInput-root': {
                              borderRadius: 2,
                              borderColor: getRoleColor(user.role),
                              '&:hover': {
                                borderColor: getRoleColor(user.role)
                              }
                            }
                          }}
                        >
                          <MenuItem value="customer">
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Person sx={{ fontSize: 16, color: '#10B981' }} />
                              <Box>
                                <Typography variant="body2" sx={{ fontWeight: 500 }}>ลูกค้า</Typography>
                                <Typography variant="caption" color="text.secondary">customer</Typography>
                              </Box>
                            </Box>
                          </MenuItem>
                          <MenuItem value="staff">
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <ManageAccounts sx={{ fontSize: 16, color: '#2563EB' }} />
                              <Box>
                                <Typography variant="body2" sx={{ fontWeight: 500 }}>พนักงาน</Typography>
                                <Typography variant="caption" color="text.secondary">staff</Typography>
                              </Box>
                            </Box>
                          </MenuItem>
                          <MenuItem value="admin">
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <AdminPanelSettings sx={{ fontSize: 16, color: '#DC2626' }} />
                              <Box>
                                <Typography variant="body2" sx={{ fontWeight: 500 }}>แอดมิน</Typography>
                                <Typography variant="caption" color="text.secondary">admin</Typography>
                              </Box>
                            </Box>
                          </MenuItem>
                        </Select>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
          {users.length > 5 && (
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
                  color: page === 0 ? '#ccc' : '#DC2626',
                  '&:hover': { backgroundColor: 'rgba(220, 38, 38, 0.1)' }
                }}
              >
                {'<'}
              </IconButton>
              
              {Array.from({ length: Math.ceil(users.length / rowsPerPage) }, (_, index) => (
                <IconButton
                  key={index}
                  onClick={(e) => handleChangePage(e, index)}
                  sx={{
                    color: page === index ? '#DC2626' : '#666',
                    backgroundColor: page === index ? 'rgba(220, 38, 38, 0.1)' : 'transparent',
                    '&:hover': { backgroundColor: 'rgba(220, 38, 38, 0.1)' },
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
                disabled={page >= Math.ceil(users.length / rowsPerPage) - 1}
                sx={{ 
                  color: page >= Math.ceil(users.length / rowsPerPage) - 1 ? '#ccc' : '#DC2626',
                  '&:hover': { backgroundColor: 'rgba(220, 38, 38, 0.1)' }
                }}
              >
                {'>'}
              </IconButton>
            </Box>
          )}
        </Paper>
      )}
    </Box>
  );
};

export default PermissionsTab;
