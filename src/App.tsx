import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Box, CircularProgress } from '@mui/material';
import Dashboard from './pages/customer/Dashboard';
import Profile from './pages/customer/Profile';
import Cart from './pages/customer/Cart';
import Orders from './pages/customer/Orders';
import PickingConfirm from './pages/staff/PickingConfirm';
import AdminDashboard from './pages/admin/AdminDashboard';
import StaffDashboard from './pages/staff/StaffDashboard';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ReactElement } from 'react';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

const ProtectedRoute = ({ children }: { children: ReactElement }) => {
  const { currentUser, loading } = useAuth();

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

const RoleBasedDashboard = () => {
  const { role } = useAuth();

  if (role === 'admin') return <AdminDashboard />;
  if (role === 'staff') return <StaffDashboard />;

  // default
  return <Dashboard />;
};

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route
              path="/"
              element={(
                <ProtectedRoute>
                  <RoleBasedDashboard />
                </ProtectedRoute>
              )}
            />
            <Route
              path="/profile"
              element={(
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              )}
            />
            <Route
              path="/cart"
              element={(
                <ProtectedRoute>
                  <Cart />
                </ProtectedRoute>
              )}
            />
            <Route
              path="/orders"
              element={(
                <ProtectedRoute>
                  <Orders />
                </ProtectedRoute>
              )}
            />
            <Route
              path="/staff/pick/:orderId"
              element={(
                <ProtectedRoute>
                  <PickingConfirm />
                </ProtectedRoute>
              )}
            />
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
