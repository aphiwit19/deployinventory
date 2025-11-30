import { useEffect, useState } from 'react';
import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import {
  Box,
  Typography,
  List,
  ListItemButton,
  ListItemText,
  Divider,
  Paper,
  CircularProgress,
  Button,
} from '@mui/material';
import { getAll, update, add, remove, getById } from '../../services/firestore';
import { useNavigate } from 'react-router-dom';
import OverviewTab from './OverviewTab';
import ProductsTab from './ProductsTab';
import PermissionsTab from './PermissionsTab';
import PickingTab from './PickingTab';
import StockHistoryTab from './StockHistoryTab';
import Profile from './Profile';

type AdminTab = 'overview' | 'products' | 'permissions' | 'picking' | 'stockHistory' | 'profile';

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

interface ProductRow {
  id: string;
  name: string;
  description?: string;
  price: number;
  quantity: number;
  imageUrl?: string;
}

interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  imageUrl?: string;
}

interface Order {
  id: string;
  uid: string;
  createdAt?: any;
  items: OrderItem[];
  total: number;
  fullName: string;
  phone: string;
  address: string;
  status?: string;
  trackingNumber?: string;
}

interface PickingRecord {
  id: string;
  orderId: string;
  staffId: string;
  staffName: string;
  items: OrderItem[];
  total: number;
  customerInfo: {
    fullName: string;
    phone: string;
    address: string;
  };
  pickedAt: any;
  status: string;
  trackingNumber: string;
  shippingMethod: string;
  shippingNotes: string;
}

const AdminDashboard = () => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState<AdminTab>('overview');
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [products, setProducts] = useState<ProductRow[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [creatingProduct, setCreatingProduct] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ProductRow | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [pickingRecords, setPickingRecords] = useState<PickingRecord[]>([]);
  const [loadingPickingRecords, setLoadingPickingRecords] = useState(false);
  const [editingPicking, setEditingPicking] = useState<PickingRecord | null>(null);
  const [pickingForm, setPickingForm] = useState({
    trackingNumber: '',
    shippingMethod: '',
  });
  const [editForm, setEditForm] = useState({
    name: '',
    description: '',
    price: '',
    quantity: '',
    imageUrl: '',
  });
  const [newProduct, setNewProduct] = useState({
    name: '',
    description: '',
    price: '',
    quantity: '',
    imageUrl: '',
  });
  const [incrementForm, setIncrementForm] = useState({
    productId: '',
    quantity: '1',
  });

  useEffect(() => {
    const loadUsers = async () => {
      try {
        setLoadingUsers(true);
        const data = await getAll('users');
        setUsers(data as UserRow[]);
      } catch (e) {
        console.error('Failed to load users for permissions', e);
      } finally {
        setLoadingUsers(false);
      }
    };

    const loadProducts = async () => {
      try {
        setLoadingProducts(true);
        const data = await getAll('products');
        // normalize numeric fields
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
        console.error('Failed to load products', e);
      } finally {
        setLoadingProducts(false);
      }
    };

    const loadOrders = async () => {
      try {
        setLoadingOrders(true);
        const allOrders = await getAll('orders');
        const activeOrders = (allOrders as Order[]).filter(
          (o) => o.status !== 'จัดส่งสำเร็จ'
        );
        setOrders(activeOrders);
      } catch (e) {
        console.error('Failed to load orders for admin', e);
      } finally {
        setLoadingOrders(false);
      }
    };

    const loadPickingRecords = async () => {
      try {
        setLoadingPickingRecords(true);
        const records = await getAll('picking');
        setPickingRecords(records as PickingRecord[]);
      } catch (e) {
        console.error('Failed to load picking records', e);
        // ถ้า collection ยังไม่มี ให้ set เป็น array ว่าง
        setPickingRecords([]);
      } finally {
        setLoadingPickingRecords(false);
      }
    };

    loadUsers();
    loadProducts();
    loadOrders();
    loadPickingRecords();
  }, []);

  const handleRoleChange = async (user: UserRow, newRole: UserRole) => {
    if (!user.id) return;

    const previousRole = user.role;
    setUsers((prev) =>
      prev.map((u) => (u.id === user.id ? { ...u, role: newRole } : u)),
    );

    try {
      setSavingId(user.id);
      await update('users', user.id, { role: newRole });
    } catch (e) {
      console.error('Failed to update user role', e);
      // rollback on error
      setUsers((prev) =>
        prev.map((u) => (u.id === user.id ? { ...u, role: previousRole } : u)),
      );
    } finally {
      setSavingId(null);
    }
  };

  const handleNewProductChange = (
    field: keyof typeof newProduct,
    value: string,
  ) => {
    setNewProduct((prev) => ({ ...prev, [field]: value }));
  };

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProduct.name.trim()) return;

    const price = Number(newProduct.price) || 0;
    const quantity = Number(newProduct.quantity) || 0;

    try {
      setCreatingProduct(true);
      // create new product
      const created: any = await add('products', {
        name: newProduct.name.trim(),
        description: newProduct.description.trim(),
        price,
        quantity,
        imageUrl: newProduct.imageUrl.trim(),
        createdAt: new Date().toISOString(),
      });

      setProducts((prev) => [
        ...prev,
        {
          id: created.id,
          name: created.name,
          description: created.description,
          price: created.price,
          quantity: created.quantity,
          imageUrl: created.imageUrl,
        },
      ]);

      // บันทึกประวัติการเพิ่มสินค้าใหม่
      if (quantity > 0) {
        await add('stockTransactions', {
          type: 'stock_in',
          productId: created.id,
          productName: created.name,
          quantity: quantity, // บวกเพราะเพิ่มสต็อก
          remainingStock: quantity,
          reason: `เพิ่มสินค้าใหม่ ${created.name}`,
          referenceId: created.id,
          staffId: currentUser?.uid || '',
          staffName: 'แอดมิน',
          createdAt: new Date()
        });
      }

      // reset create form state
      setNewProduct({ name: '', description: '', price: '', quantity: '', imageUrl: '' });
    } catch (e) {
      console.error('Failed to create product', e);
    } finally {
      setCreatingProduct(false);
    }
  };

  const handleIncrementQuantity = (product: ProductRow) => {
    setIncrementForm({
      productId: product.id,
      quantity: '1',
    });
  };

  const handleIncrementFormChange = (value: string) => {
    setIncrementForm((prev) => ({ ...prev, quantity: value }));
  };

  const handleSaveIncrement = async () => {
    const quantity = Number(incrementForm.quantity) || 0;
    if (quantity <= 0 || !incrementForm.productId) return;

    const product = products.find(p => p.id === incrementForm.productId);
    if (!product) return;

    const currentQty = product.quantity || 0;
    const newQty = currentQty + quantity;

    try {
      await update('products', incrementForm.productId, { quantity: newQty });
      
      setProducts((prev) =>
        prev.map((p) => (p.id === incrementForm.productId ? { ...p, quantity: newQty } : p)),
      );
      
      // บันทึกประวัติการเพิ่มสต็อก
      await add('stockTransactions', {
        type: 'stock_in',
        productId: incrementForm.productId,
        productName: product.name,
        quantity: quantity,
        remainingStock: newQty,
        reason: `เพิ่มสต็อก ${product.name} (${quantity} ชิ้น)`,
        referenceId: incrementForm.productId,
        staffId: currentUser?.uid || '',
        staffName: 'แอดมิน',
        createdAt: new Date()
      });

      // รีเซ็ตฟอร์ม
      setIncrementForm({ productId: '', quantity: '1' });
    } catch (e) {
      console.error('Failed to increment quantity', e);
    }
  };

  const handleDeleteProduct = async (product: ProductRow) => {
    if (!window.confirm(`ต้องการลบสินค้า "${product.name}" ใช่หรือไม่?`)) return;

    const previous = products;
    setProducts((prev) => prev.filter((p) => p.id !== product.id));

    try {
      await remove('products', product.id);
    } catch (e) {
      console.error('Failed to delete product', e);
      // rollback
      setProducts(previous);
    }
  };

  const startEditProduct = (product: ProductRow) => {
    setEditingProduct(product);
    setEditForm({
      name: product.name,
      description: product.description || '',
      price: String(product.price),
      quantity: String(product.quantity),
      imageUrl: product.imageUrl || '',
    });
  };

  const handleEditFormChange = (
    field: keyof typeof editForm,
    value: string,
  ) => {
    setEditForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSaveEditProduct = async () => {
    if (!editingProduct) return;

    const price = Number(editForm.price) || 0;
    const quantity = Number(editForm.quantity) || 0;
    const currentQuantity = editingProduct.quantity || 0;
    const quantityDiff = quantity - currentQuantity; // คำนวณความต่าง

    try {
      await update('products', editingProduct.id, {
        name: editForm.name.trim(),
        description: editForm.description.trim(),
        price,
        quantity,
        imageUrl: editForm.imageUrl.trim(),
      });

      setProducts((prev) =>
        prev.map((p) =>
          p.id === editingProduct.id
            ? {
                ...p,
                name: editForm.name.trim(),
                description: editForm.description.trim(),
                price,
                quantity,
                imageUrl: editForm.imageUrl.trim(),
              }
            : p,
        ),
      );

      // บันทึกประวัติการปรับจำนวนสต็อก
      if (quantityDiff !== 0) {
        await add('stockTransactions', {
          type: quantityDiff > 0 ? 'stock_in' : 'stock_out',
          productId: editingProduct.id,
          productName: editingProduct.name,
          quantity: quantityDiff, // บวกถ้าเพิ่ม, ติดลบถ้าลด
          remainingStock: quantity,
          reason: `ปรับจำนวนสต็อก ${editingProduct.name} (${currentQuantity} → ${quantity})`,
          referenceId: editingProduct.id,
          staffId: currentUser?.uid || '',
          staffName: 'แอดมิน',
          createdAt: new Date()
        });
      }

      setEditingProduct(null);
    } catch (e) {
      console.error('Failed to update product', e);
    }
  };

  const handlePickingFormChange = (field: keyof typeof pickingForm, value: string) => {
    setPickingForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSavePicking = async () => {
    if (!editingPicking) return;

    try {
      await update('picking', editingPicking.id, {
        trackingNumber: pickingForm.trackingNumber.trim(),
        shippingMethod: pickingForm.shippingMethod.trim(),
        status: pickingForm.trackingNumber ? 'จัดส่งแล้ว' : 'รอดำเนินการ',
      });

      // อัปเดตสถานะใน orders ด้วย
      if (pickingForm.trackingNumber) {
        await update('orders', editingPicking.orderId, {
          trackingNumber: pickingForm.trackingNumber.trim(),
          shippingMethod: pickingForm.shippingMethod.trim(),
          status: 'กำลังจัดส่ง',
        });

        // ลดสต็อกสินค้าจริง!
        for (const item of editingPicking.items) {
          const product = await getById('products', item.id) as ProductRow | null;
          if (product) {
            const currentQuantity = product.quantity || 0;
            const orderQuantity = item.quantity;
            const newQuantity = currentQuantity - orderQuantity;
            
            if (newQuantity >= 0) {
              await update('products', item.id, {
                quantity: newQuantity
              });
              console.log(`ลดสต็อก ${item.name}: ${currentQuantity} → ${newQuantity}`);
              
              // บันทึกประวัติการเคลื่อนไหว
              await add('stockTransactions', {
                type: 'stock_out',
                productId: item.id,
                productName: item.name,
                quantity: -item.quantity, // ติดลบเพราะออก
                remainingStock: newQuantity,
                reason: `จัดส่งออเดอร์ ${editingPicking.orderId}`,
                referenceId: editingPicking.orderId,
                staffId: currentUser?.uid || '',
                staffName: 'แอดมิน',
                createdAt: new Date()
              });
            } else {
              console.warn(`สต็อกไม่พอสำหรับ ${item.name}: มี ${currentQuantity}, ต้องการ ${orderQuantity}`);
            }
          }
        }
      }

      setPickingRecords((prev) =>
        prev.map((p) =>
          p.id === editingPicking.id
            ? {
                ...p,
                trackingNumber: pickingForm.trackingNumber.trim(),
                shippingMethod: pickingForm.shippingMethod.trim(),
                status: pickingForm.trackingNumber ? 'จัดส่งแล้ว' : 'รอดำเนินการ',
              }
            : p,
        ),
      );
      setEditingPicking(null);
      setPickingForm({ trackingNumber: '', shippingMethod: '' });
    } catch (e) {
      console.error('Failed to update picking record', e);
    }
  };

  const handleMarkAsDelivered = async (record: PickingRecord) => {
    try {
      // อัปเดตสถานะใน orders เป็น 'จัดส่งสำเร็จ'
      await update('orders', record.orderId, {
        status: 'จัดส่งสำเร็จ',
      });

      // อัปเดตสถานะใน picking เป็น 'จัดส่งสำเร็จ'
      await update('picking', record.id, {
        status: 'จัดส่งสำเร็จ',
      });

      // อัปเดต state ในหน้าแอดมิน
      setPickingRecords((prev) =>
        prev.map((p) =>
          p.id === record.id ? { ...p, status: 'จัดส่งสำเร็จ' } : p
        )
      );

      // ลบออเดอร์ที่ส่งสำเร็จออกจากรายการแอดมิน
      setOrders((prev) => prev.filter((o) => o.id !== record.orderId));
    } catch (e) {
      console.error('Failed to mark as delivered', e);
    }
  };

  const handleEditPicking = (record: PickingRecord) => {
    setEditingPicking(record);
    setPickingForm({
      trackingNumber: record.trackingNumber || '',
      shippingMethod: record.shippingMethod || '',
    });
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (e) {
      console.error('Failed to logout', e);
    }
  };

  // ตรวจสอบสต็อกต่ำกว่า 20%
  const checkLowStock = async () => {
    try {
      const allProducts = await getAll('products');
      const lowStockItems = (allProducts as ProductRow[]).filter(product => {
        const currentStock = product.quantity || 0;
        const minStockThreshold = Math.ceil(product.quantity * 0.2); // 20% ของจำนวนเดิม
        return currentStock <= minStockThreshold && currentStock > 0; // ต่ำกว่า 20% แต่ยังไม่หมด
      });
      return lowStockItems;
    } catch (e) {
      console.error('Failed to check low stock', e);
      return [];
    }
  };

  const renderContent = () => {
    switch (tab) {
      case 'overview':
        return <OverviewTab />;

      case 'picking':
        return (
          <PickingTab
            pickingRecords={pickingRecords}
            loadingPickingRecords={loadingPickingRecords}
            editingPicking={editingPicking}
            pickingForm={pickingForm}
            onEditPicking={handleEditPicking}
            onPickingFormChange={handlePickingFormChange}
            onSavePicking={handleSavePicking}
            onCancelEdit={() => setEditingPicking(null)}
            onMarkAsDelivered={handleMarkAsDelivered}
          />
        );

      case 'stockHistory':
        return <StockHistoryTab />;

      case 'products':
        return (
          <ProductsTab
            products={products}
            loadingProducts={loadingProducts}
            creatingProduct={creatingProduct}
            editingProduct={editingProduct}
            newProduct={newProduct}
            editForm={editForm}
            incrementForm={incrementForm}
            onNewProductChange={handleNewProductChange}
            onCreateProduct={handleCreateProduct}
            onIncrementQuantity={handleIncrementQuantity}
            onIncrementFormChange={handleIncrementFormChange}
            onSaveIncrement={handleSaveIncrement}
            onDeleteProduct={handleDeleteProduct}
            onStartEditProduct={startEditProduct}
            onEditFormChange={handleEditFormChange}
            onSaveEditProduct={handleSaveEditProduct}
            onCancelEdit={() => setEditingProduct(null)}
          />
        );

      case 'permissions':
        return (
          <PermissionsTab
            users={users}
            loadingUsers={loadingUsers}
            savingId={savingId}
            onRoleChange={handleRoleChange}
          />
        );

      case 'profile':
        return <Profile />;

      default:
        return <OverviewTab />;
    }
  };

  return (
    <>
      <Box
        sx={{
          display: 'flex',
          minHeight: '100vh',
          backgroundColor: '#f5f5f5',
        }}
      >
        {/* Sidebar */}
        <Box
          sx={{
            width: 240,
            backgroundColor: '#ffffff',
            borderRight: '1px solid #e0e0e0',
          }}
        >
          <Box sx={{ p: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Admin Panel
            </Typography>
          </Box>
          <Divider />
          <List component="nav">
            <ListItemButton
              selected={tab === 'overview'}
              onClick={() => setTab('overview')}
            >
              <ListItemText primary="แดชบอร์ดรวม" />
            </ListItemButton>
            <ListItemButton
              selected={tab === 'picking'}
              onClick={() => setTab('picking')}
            >
              <ListItemText primary="การเบิก" />
            </ListItemButton>
            <ListItemButton
              selected={tab === 'stockHistory'}
              onClick={() => setTab('stockHistory')}
            >
              <ListItemText primary="ประวัติสต็อก" />
            </ListItemButton>
            <ListItemButton
              selected={tab === 'products'}
              onClick={() => setTab('products')}
            >
              <ListItemText primary="สินค้า" />
            </ListItemButton>
            <ListItemButton
              selected={tab === 'permissions'}
              onClick={() => setTab('permissions')}
            >
              <ListItemText primary="จัดการสิทธิ์" />
            </ListItemButton>
            <ListItemButton
              selected={tab === 'profile'}
              onClick={() => setTab('profile')}
            >
              <ListItemText primary="โปรไฟล์" />
            </ListItemButton>
          </List>
          <Divider />
          <Box sx={{ p: 2 }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              ผู้ใช้: {currentUser?.email}
            </Typography>
            <Button
              variant="outlined"
              color="error"
              size="small"
              onClick={handleLogout}
              fullWidth
            >
              ออกจากระบบ
            </Button>
          </Box>
        </Box>

        {/* Main content */}
        <Box sx={{ flex: 1, p: 3 }}>
          <Paper sx={{ p: 3 }} elevation={2}>
            {renderContent()}
          </Paper>
        </Box>
      </Box>

    </>

  );
};

export default AdminDashboard;