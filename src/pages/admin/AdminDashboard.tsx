import { useEffect, useState } from 'react';
import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import {
  Box,
  Typography,
  List,
  ListItemButton,
  ListItemText,
  ListItemIcon,
  Divider,
  Paper,
  CircularProgress,
  Button,
  Avatar,
  Tooltip,
  IconButton,
  useTheme,
  alpha,
} from '@mui/material';
import {
  Dashboard,
  Inventory,
  LocalShipping,
  History,
  Notifications,
  Category,
  Security,
  Person,
  Logout,
  Brightness7,
  Settings,
} from '@mui/icons-material';
import { getAll, update, add, remove, getById } from '../../services/firestore';
import { uploadImage, generateImagePath } from '../../services/storage';
import { useNavigate } from 'react-router-dom';
import OverviewTab from './OverviewTab';
import ProductsTab from './ProductsTab';
import PermissionsTab from './PermissionsTab';
import PickingTab from './PickingTab';
import StockHistoryTab from './StockHistoryTab';
import NotificationsTab from './NotificationsTab';
import Profile from './Profile';

type AdminTab = 'overview' | 'products' | 'permissions' | 'picking' | 'stockHistory' | 'profile' | 'notifications';

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
  const theme = useTheme();
  const [tab, setTab] = useState<AdminTab>('overview');
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [products, setProducts] = useState<ProductRow[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [creatingProduct, setCreatingProduct] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
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
    imageFile: null as File | null,
  });
  const [newProduct, setNewProduct] = useState({
    name: '',
    description: '',
    price: '',
    quantity: '',
    imageUrl: '',
    imageFile: null as File | null,
  });
  const [incrementForm, setIncrementForm] = useState({
    productId: '',
    quantity: '1',
  });
  const [filteredProductId, setFilteredProductId] = useState<string | null>(null);

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

  const handleNewProductImageChange = (file: File | null) => {
    setNewProduct((prev) => ({ ...prev, imageFile: file }));
  };

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProduct.name.trim()) return;

    const price = Number(newProduct.price) || 0;
    const quantity = Number(newProduct.quantity) || 0;
    let imageUrl = newProduct.imageUrl.trim();

    try {
      setCreatingProduct(true);
      
      // Upload image if exists
      if (newProduct.imageFile) {
        setUploadingImage(true);
        const imagePath = generateImagePath(newProduct.imageFile.name);
        imageUrl = await uploadImage(newProduct.imageFile, imagePath);
        setUploadingImage(false);
      }

      // create new product
      const created: any = await add('products', {
        name: newProduct.name.trim(),
        description: newProduct.description.trim(),
        price,
        quantity,
        imageUrl,
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
      setNewProduct({ name: '', description: '', price: '', quantity: '', imageUrl: '', imageFile: null });
    } catch (e) {
      console.error('Failed to create product', e);
    } finally {
      setCreatingProduct(false);
      setUploadingImage(false);
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
      imageFile: null,
    });
  };

  const handleEditFormChange = (
    field: keyof typeof editForm,
    value: string,
  ) => {
    setEditForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleEditImageChange = (file: File | null) => {
    setEditForm((prev) => ({ ...prev, imageFile: file }));
  };

  const handleSaveEditProduct = async () => {
    if (!editingProduct) return;

    const price = Number(editForm.price) || 0;
    const quantity = Number(editForm.quantity) || 0;
    const currentQuantity = editingProduct.quantity || 0;
    const quantityDiff = quantity - currentQuantity; // คำนวณความต่าง
    let imageUrl = editForm.imageUrl.trim();

    try {
      // Upload new image if exists
      if (editForm.imageFile) {
        setUploadingImage(true);
        const imagePath = generateImagePath(editForm.imageFile.name);
        imageUrl = await uploadImage(editForm.imageFile, imagePath);
        setUploadingImage(false);
      }

      await update('products', editingProduct.id, {
        name: editForm.name.trim(),
        description: editForm.description.trim(),
        price,
        quantity,
        imageUrl,
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
                imageUrl,
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
    } finally {
      setUploadingImage(false);
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

  const handleNavigateToProduct = (productId: string) => {
    // ไปที่ tab สินค้าและกรองเฉพาะสินค้านั้น
    setTab('products');
    setFilteredProductId(productId); // ตั้งค่า productId ที่ต้องการกรอง
    
    // หาสินค้าที่ต้องการ
    const product = products.find(p => p.id === productId);
    if (product) {
      console.log('Navigate to product:', product.name);
    }
  };

  const handleNavigateToProductOld = (productId: string) => {
    // ไปที่ tab สินค้าและเลือกสินค้านั้น
    setTab('products');
    
    // หาสินค้าที่ต้องการ
    const product = products.find(p => p.id === productId);
    if (product) {
      // เปิด dialog เพิ่มจำนวนสินค้าเดิม
      handleIncrementQuantity(product);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (e) {
      console.error('Failed to logout', e);
    }
  };

  // ตรวจสอบสต็อกต่ำกว่า 20% และสินค้าหมด
  const checkLowStock = async () => {
    try {
      const allProducts = await getAll('products');
      const notifications: (ProductRow & { type: 'สต็อกต่ำ' | 'สต็อกหมด' })[] = [];
      
      (allProducts as ProductRow[]).forEach(product => {
        const currentStock = product.quantity || 0;
        const minStockThreshold = Math.ceil(product.quantity * 0.2); // 20% ของจำนวนเดิม
        
        if (currentStock === 0) {
          // สินค้าหมด
          notifications.push({
            ...product,
            type: 'สต็อกหมด'
          });
        } else if (currentStock <= minStockThreshold) {
          // สินค้าต่ำกว่า 20% แต่ยังไม่หมด
          notifications.push({
            ...product,
            type: 'สต็อกต่ำ'
          });
        }
      });
      
      return notifications;
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

      case 'notifications':
        return <NotificationsTab onNavigateToProduct={handleNavigateToProduct} />;

      case 'products':
        return (
          <ProductsTab
            products={products}
            loadingProducts={loadingProducts}
            creatingProduct={creatingProduct}
            uploadingImage={uploadingImage}
            editingProduct={editingProduct}
            newProduct={newProduct}
            editForm={editForm}
            incrementForm={incrementForm}
            filteredProductId={filteredProductId}
            onClearFilter={() => setFilteredProductId(null)}
            onNewProductChange={handleNewProductChange}
            onNewProductImageChange={handleNewProductImageChange}
            onCreateProduct={handleCreateProduct}
            onIncrementQuantity={handleIncrementQuantity}
            onIncrementFormChange={handleIncrementFormChange}
            onSaveIncrement={handleSaveIncrement}
            onDeleteProduct={handleDeleteProduct}
            onStartEditProduct={startEditProduct}
            onEditFormChange={handleEditFormChange}
            onEditImageChange={handleEditImageChange}
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

  // Menu items configuration
  const menuItems = [
    { id: 'overview', label: 'แดชบอร์ดรวม', icon: <Dashboard /> },
    { id: 'picking', label: 'การเบิก', icon: <LocalShipping /> },
    { id: 'stockHistory', label: 'ประวัติสต็อก', icon: <History /> },
    { id: 'notifications', label: 'รายการแจ้งเตือน', icon: <Notifications /> },
    { id: 'products', label: 'สินค้า', icon: <Category /> },
    { id: 'permissions', label: 'จัดการสิทธิ์', icon: <Security /> },
    { id: 'profile', label: 'โปรไฟล์', icon: <Person /> },
  ];

  return (
    <>
      {/* Sidebar - Fixed */}
      <Box
        sx={{
          width: 280,
          background: 'linear-gradient(180deg, #1e40af 0%, #3730a3 100%)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
          position: 'fixed',
          top: 0,
          left: 0,
          height: '100vh',
          zIndex: 1000,
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
            pointerEvents: 'none',
          }
        }}
      >
        {/* Header */}
        <Box sx={{ 
          p: 3, 
          borderBottom: '1px solid rgba(255,255,255,0.1)',
          position: 'relative',
          zIndex: 1
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Avatar
              sx={{
                width: 48,
                height: 48,
                background: 'linear-gradient(135deg, #60a5fa 0%, #3b82f6 100%)',
                boxShadow: '0 4px 12px rgba(96, 165, 250, 0.3)',
                mr: 2
              }}
            >
              <Brightness7 sx={{ color: 'white' }} />
            </Avatar>
            <Box>
              <Typography 
                variant="h6" 
                sx={{ 
                  fontWeight: 700, 
                  color: 'white',
                  textShadow: '0 2px 4px rgba(0,0,0,0.2)'
                }}
              >
                Admin Panel
              </Typography>
              <Typography 
                variant="caption" 
                sx={{ 
                  color: 'rgba(255,255,255,0.7)',
                  fontSize: '0.75rem'
                }}
              >
                ระบบจัดการครบวงจร
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* Navigation Menu */}
        <Box sx={{ flex: 1, py: 2, position: 'relative', zIndex: 1 }}>
          {menuItems.map((item) => (
            <ListItemButton
              key={item.id}
              selected={tab === item.id}
              onClick={() => setTab(item.id as AdminTab)}
              sx={{
                mx: 2,
                mb: 1,
                borderRadius: 2,
                px: 2,
                py: 1.5,
                color: tab === item.id ? 'white' : 'rgba(255,255,255,0.8)',
                background: tab === item.id 
                  ? 'linear-gradient(135deg, rgba(96, 165, 250, 0.3) 0%, rgba(59, 130, 246, 0.2) 100%)'
                  : 'transparent',
                border: tab === item.id 
                  ? '1px solid rgba(96, 165, 250, 0.5)'
                  : '1px solid transparent',
                transition: 'all 0.3s ease',
                '&:hover': {
                  background: 'linear-gradient(135deg, rgba(96, 165, 250, 0.2) 0%, rgba(59, 130, 246, 0.1) 100%)',
                  color: 'white',
                  transform: 'translateX(4px)',
                  border: '1px solid rgba(96, 165, 250, 0.3)',
                },
                '& .MuiListItemIcon-root': {
                  color: tab === item.id ? '#60a5fa' : 'rgba(255,255,255,0.7)',
                  transition: 'all 0.3s ease',
                },
                '&:hover .MuiListItemIcon-root': {
                  color: '#60a5fa',
                }
              }}
            >
              <ListItemIcon sx={{ minWidth: 40 }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText 
                primary={item.label}
                primaryTypographyProps={{
                  fontSize: '0.9rem',
                  fontWeight: tab === item.id ? 600 : 500,
                  sx: {
                    textShadow: tab === item.id ? '0 2px 4px rgba(0,0,0,0.2)' : 'none'
                  }
                }}
              />
            </ListItemButton>
          ))}
        </Box>

        {/* User Profile Section */}
        <Box sx={{ 
          p: 2, 
          borderTop: '1px solid rgba(255,255,255,0.1)',
          position: 'relative',
          zIndex: 1
        }}>
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            p: 2,
            background: 'rgba(255,255,255,0.05)',
            borderRadius: 2,
            border: '1px solid rgba(255,255,255,0.1)',
            backdropFilter: 'blur(10px)'
          }}>
            <Avatar
              sx={{
                width: 36,
                height: 36,
                background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                boxShadow: '0 4px 12px rgba(245, 158, 11, 0.3)',
                mr: 2
              }}
            >
              <Person sx={{ fontSize: 20, color: 'white' }} />
            </Avatar>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography 
                variant="body2" 
                sx={{ 
                  color: 'white',
                  fontWeight: 600,
                  fontSize: '0.85rem',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
                }}
              >
                {currentUser?.email}
              </Typography>
              <Typography 
                variant="caption" 
                sx={{ 
                  color: 'rgba(255,255,255,0.7)',
                  fontSize: '0.7rem'
                }}
              >
                ผู้ดูแลระบบ
              </Typography>
            </Box>
            <Tooltip title="ออกจากระบบ">
              <IconButton
                onClick={handleLogout}
                size="small"
                sx={{
                  color: 'rgba(255,255,255,0.7)',
                  '&:hover': {
                    color: 'white',
                    background: 'rgba(239, 68, 68, 0.2)',
                  }
                }}
              >
                <Logout sx={{ fontSize: 18 }} />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
      </Box>

    {/* Main content */}
    <Box sx={{ 
      flex: 1, 
      p: 0,
      marginLeft: '280px', // เว้นที่ให้ sidebar
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      position: 'relative'
    }}>
      {renderContent()}
    </Box>
  </>  
);
};

export default AdminDashboard;