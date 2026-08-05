import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Search,
  Plus,
  Edit2,
  Trash2,
  Send,
  Printer,
  DollarSign,
  Package,
  Clock,
  CheckCircle2,
  Truck,
  Filter,
  X,
  Lock,
  LogOut,
  RefreshCw,
  Mail,
  FileText,
  AlertCircle,
  TrendingUp,
  UserCheck,
  Calendar,
  Layers,
  Power,
} from 'lucide-react';
import {
  fetchAllOrdersForAdmin,
  createOrderInDatabase,
  updateOrderStatusInDatabase,
  addTimelineEntryToDatabase,
  updateOrderDetailsInDatabase,
  deleteOrderFromDatabase,
  sendOrderNotificationEmail,
} from '../lib/supabase';
import { Order, OrderStatus, FulfillmentMethod, PaymentStatus } from '../types';
import PrintOrderModal from '../components/PrintOrderModal';
import { BRAND_IMAGES } from '../data/content';
import { getHarvestBatches, saveHarvestBatches, HarvestBatch } from '../lib/harvestBatches';

export default function AdminDashboardPage() {
  // Navigation tab
  const [activeTab, setActiveTab] = useState<'orders' | 'batches'>('orders');

  // Auth state
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [adminUserEmail, setAdminUserEmail] = useState('admin@bastanzibeef.com');

  // Orders state
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');

  // Harvest Batches state
  const [harvestBatches, setHarvestBatches] = useState<HarvestBatch[]>([]);
  const [newBatchName, setNewBatchName] = useState('');
  const [newBatchDelivery, setNewBatchDelivery] = useState('');

  // Modal states
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [timelineModalOpen, setTimelineModalOpen] = useState(false);
  const [printModalOpen, setPrintModalOpen] = useState(false);

  // Selected Order for modals
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // Form states for modals
  const [newOrderStatus, setNewOrderStatus] = useState<OrderStatus>('Order Received');
  const [statusNoteInput, setStatusNoteInput] = useState('');
  const [timelineNoteInput, setTimelineNoteInput] = useState('');

  // Form state for Order Creation / Editing
  const [orderForm, setOrderForm] = useState({
    first_name: '',
    last_name: '',
    email: '',
    address: '',
    city: '',
    state: 'AZ',
    zip_code: '',
    beef_share: 'Full Beef Share (400-450 lbs)',
    estimated_weight: '425 lbs',
    total_price: 4800,
    payment_status: 'Deposit Paid' as PaymentStatus,
    fulfillment_method: 'Delivery' as FulfillmentMethod,
    pickup_date: '',
    delivery_date: '2026-09-15',
    current_status: 'Order Received' as OrderStatus,
    notes: '21-day dry aging requested.',
  });

  const [notificationBanner, setNotificationBanner] = useState('');

  // Check existing admin session & load batches
  useEffect(() => {
    setHarvestBatches(getHarvestBatches());
    const session = localStorage.getItem('bastanzi_admin_auth');
    if (session === 'true') {
      setIsAuthenticated(true);
      loadAdminOrders();
    }
  }, []);

  const loadAdminOrders = async () => {
    setLoading(true);
    try {
      const data = await fetchAllOrdersForAdmin();
      setOrders(data);
    } catch (err) {
      console.error('Failed to load admin orders:', err);
    } finally {
      setLoading(false);
    }
  };

  // Harvest Batches Handlers
  const handleAddBatch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBatchName.trim()) return;
    const newBatch: HarvestBatch = {
      id: 'batch-' + Date.now(),
      name: newBatchName.trim(),
      active: true,
      estimatedDelivery: newBatchDelivery.trim() || undefined,
    };
    const updated = [...harvestBatches, newBatch];
    setHarvestBatches(updated);
    saveHarvestBatches(updated);
    setNewBatchName('');
    setNewBatchDelivery('');
    showBanner(`✨ Harvest batch "${newBatch.name}" added and activated.`);
  };

  const handleToggleBatchActive = (id: string) => {
    const updated = harvestBatches.map((b) => (b.id === id ? { ...b, active: !b.active } : b));
    setHarvestBatches(updated);
    saveHarvestBatches(updated);
    showBanner('Harvest batch active status updated.');
  };

  const handleDeleteBatch = (id: string) => {
    if (harvestBatches.length <= 1) {
      alert('At least one harvest batch must remain active.');
      return;
    }
    const updated = harvestBatches.filter((b) => b.id !== id);
    setHarvestBatches(updated);
    saveHarvestBatches(updated);
    showBanner('Harvest batch removed.');
  };

  // Handle Login
  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');

    // Demo admin credentials or valid email
    if (
      (loginEmail.toLowerCase() === 'admin@bastanzibeef.com' && loginPassword === 'bastanzi2026') ||
      loginEmail.includes('@')
    ) {
      setIsAuthenticated(true);
      setAdminUserEmail(loginEmail || 'admin@bastanzibeef.com');
      localStorage.setItem('bastanzi_admin_auth', 'true');
      loadAdminOrders();
    } else {
      setAuthError('Invalid credentials. Use admin@bastanzibeef.com / bastanzi2026');
    }
  };

  const handleDemoLogin = () => {
    setLoginEmail('admin@bastanzibeef.com');
    setLoginPassword('bastanzi2026');
    setIsAuthenticated(true);
    setAdminUserEmail('admin@bastanzibeef.com');
    localStorage.setItem('bastanzi_admin_auth', 'true');
    loadAdminOrders();
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('bastanzi_admin_auth');
  };

  const showBanner = (msg: string) => {
    setNotificationBanner(msg);
    setTimeout(() => setNotificationBanner(''), 4000);
  };

  // Dashboard Metrics
  const totalOrdersCount = orders.length;
  const pendingOrdersCount = orders.filter((o) =>
    ['order received', 'reservation confirmed'].includes(o.current_status.toLowerCase())
  ).length;
  const processingOrdersCount = orders.filter((o) =>
    ['payment confirmed', 'preparing beef share', 'quality inspection', 'packaged'].includes(
      o.current_status.toLowerCase()
    )
  ).length;
  const readyOrdersCount = orders.filter((o) =>
    ['ready for pickup', 'out for delivery'].includes(o.current_status.toLowerCase())
  ).length;
  const deliveredOrdersCount = orders.filter((o) =>
    ['delivered', 'picked up'].includes(o.current_status.toLowerCase())
  ).length;
  const totalRevenueSum = orders.reduce((acc, o) => acc + (Number(o.total_price) || 0), 0);

  // Search & Filter Orders
  const filteredOrders = orders.filter((o) => {
    const custName = o.customer
      ? `${o.customer.first_name} ${o.customer.last_name}`.toLowerCase()
      : '';
    const custEmail = o.customer?.email.toLowerCase() || '';
    const custPhone = o.customer?.phone?.toLowerCase() || '';
    const num = o.order_number.toLowerCase();
    const query = searchQuery.toLowerCase().trim();

    const matchesSearch =
      !query ||
      num.includes(query) ||
      custName.includes(query) ||
      custEmail.includes(query) ||
      custPhone.includes(query);

    if (!matchesSearch) return false;

    if (statusFilter === 'All') return true;
    if (statusFilter === 'Pending')
      return ['order received', 'reservation confirmed'].includes(o.current_status.toLowerCase());
    if (statusFilter === 'Processing')
      return ['payment confirmed', 'preparing beef share', 'quality inspection', 'packaged'].includes(
        o.current_status.toLowerCase()
      );
    if (statusFilter === 'Ready')
      return ['ready for pickup', 'out for delivery'].includes(o.current_status.toLowerCase());
    if (statusFilter === 'Delivered')
      return ['delivered', 'picked up'].includes(o.current_status.toLowerCase());

    return true;
  });

  // Handle Order Creation
  const handleCreateOrderSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const res = await createOrderInDatabase({
      ...orderForm,
    });

    if (res.success && res.order) {
      showBanner(`✨ Order #${res.order.order_number} created successfully! Notification email sent.`);
      setCreateModalOpen(false);
      loadAdminOrders();
    } else {
      alert('Failed to create order. Please try again.');
    }
    setLoading(false);
  };

  // Open Edit Modal
  const openEditModal = (order: Order) => {
    setSelectedOrder(order);
    setOrderForm({
      first_name: order.customer?.first_name || '',
      last_name: order.customer?.last_name || '',
      email: order.customer?.email || '',
      phone: order.customer?.phone || '',
      address: order.customer?.address || '',
      city: order.customer?.city || '',
      state: order.customer?.state || 'TX',
      zip_code: order.customer?.zip_code || '',
      beef_share: order.beef_share,
      estimated_weight: order.estimated_weight,
      total_price: Number(order.total_price),
      payment_status: order.payment_status as PaymentStatus,
      fulfillment_method: order.fulfillment_method as FulfillmentMethod,
      pickup_date: order.pickup_date,
      delivery_date: order.delivery_date,
      current_status: order.current_status as OrderStatus,
      notes: order.notes,
    });
    setEditModalOpen(true);
  };

  // Handle Order Edit Submit
  const handleEditOrderSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrder) return;

    setLoading(true);
    const res = await updateOrderDetailsInDatabase(
      selectedOrder.id,
      {
        beef_share: orderForm.beef_share,
        estimated_weight: orderForm.estimated_weight,
        total_price: orderForm.total_price,
        payment_status: orderForm.payment_status,
        fulfillment_method: orderForm.fulfillment_method,
        pickup_date: orderForm.pickup_date,
        delivery_date: orderForm.delivery_date,
        current_status: orderForm.current_status,
        notes: orderForm.notes,
        customer_id: selectedOrder.customer_id,
      },
      {
        first_name: orderForm.first_name,
        last_name: orderForm.last_name,
        email: orderForm.email,
        phone: orderForm.phone,
        address: orderForm.address,
        city: orderForm.city,
        state: orderForm.state,
        zip_code: orderForm.zip_code,
      }
    );

    if (res.success) {
      showBanner(`✅ Order #${selectedOrder.order_number} updated.`);
      setEditModalOpen(false);
      loadAdminOrders();
    }
    setLoading(false);
  };

  // Handle Status Change Submit
  const handleStatusChangeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrder) return;

    setLoading(true);
    const res = await updateOrderStatusInDatabase(
      selectedOrder.id,
      newOrderStatus,
      statusNoteInput,
      adminUserEmail
    );

    if (res.success) {
      showBanner(
        `🚀 Order #${selectedOrder.order_number} status updated to "${newOrderStatus}". Email notification dispatched!`
      );
      setStatusModalOpen(false);
      setStatusNoteInput('');
      loadAdminOrders();
    }
    setLoading(false);
  };

  // Handle Custom Timeline Entry Submit
  const handleTimelineSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrder || !timelineNoteInput) return;

    setLoading(true);
    const res = await addTimelineEntryToDatabase(
      selectedOrder.id,
      selectedOrder.current_status,
      timelineNoteInput,
      adminUserEmail
    );

    if (res.success) {
      showBanner(`📝 Timeline entry added for Order #${selectedOrder.order_number}`);
      setTimelineModalOpen(false);
      setTimelineNoteInput('');
      loadAdminOrders();
    }
    setLoading(false);
  };

  // Handle Manual Email Trigger
  const handleSendEmailNotification = async (order: Order) => {
    setLoading(true);
    await sendOrderNotificationEmail(order, order.current_status, order.notes);
    showBanner(`📧 Email notification sent to ${order.customer?.email}`);
    setLoading(false);
  };

  // Handle Delete Order
  const handleDeleteOrder = async (order: Order) => {
    if (confirm(`Are you sure you want to PERMANENTLY DELETE Order #${order.order_number}?`)) {
      setLoading(true);
      await deleteOrderFromDatabase(order.id);
      showBanner(`🗑️ Order #${order.order_number} deleted.`);
      loadAdminOrders();
      setLoading(false);
    }
  };

  // -------------------------------------------------------------
  // Unauthenticated Admin Login Screen
  // -------------------------------------------------------------
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#07110a] text-stone-100 flex items-center justify-center p-4">
        <div className="bg-[#0f2217] border border-amber-500/30 rounded-2xl p-8 max-w-md w-full shadow-2xl space-y-6">
          <div className="text-center space-y-2">
            <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-amber-500 to-amber-200 p-0.5 mx-auto shadow-lg">
              <img
                src={BRAND_IMAGES.logo}
                alt="Bastanzi Crest"
                className="w-full h-full object-cover rounded-full bg-[#0c1a12]"
              />
            </div>
            <h1 className="font-serif text-2xl font-bold text-amber-100 uppercase tracking-wide">
              Admin Portal Login
            </h1>
            <p className="text-stone-400 text-xs uppercase tracking-widest font-mono">
              Bastanzi Premium Beef Co. • Order Management
            </p>
          </div>

          <form onSubmit={handleAdminLogin} className="space-y-4">
            <div className="space-y-1">
              <label className="block text-xs font-serif uppercase tracking-wider text-amber-200">
                Admin Email Address
              </label>
              <input
                type="email"
                required
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                placeholder="admin@bastanzibeef.com"
                className="w-full bg-[#07110a] border border-emerald-800 rounded-xl px-4 py-3 text-stone-100 text-sm focus:outline-none focus:border-amber-400"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-serif uppercase tracking-wider text-amber-200">
                Password
              </label>
              <input
                type="password"
                required
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full bg-[#07110a] border border-emerald-800 rounded-xl px-4 py-3 text-stone-100 text-sm focus:outline-none focus:border-amber-400"
              />
            </div>

            {authError && (
              <p className="text-xs text-red-400 font-medium bg-red-950/60 p-2.5 rounded border border-red-500/30">
                {authError}
              </p>
            )}

            <button
              type="submit"
              className="w-full py-3.5 bg-gradient-to-r from-amber-500 to-amber-400 hover:brightness-110 text-emerald-950 font-serif font-bold uppercase tracking-widest rounded-xl transition-all shadow-lg cursor-pointer"
            >
              Authenticate & Access Dashboard
            </button>

            <button
              type="button"
              onClick={handleDemoLogin}
              className="w-full py-2.5 bg-emerald-950 hover:bg-emerald-900 text-amber-300 font-serif text-xs uppercase tracking-wider rounded-xl border border-emerald-800 transition-colors cursor-pointer"
            >
              ✨ One-Click Demo Admin Access
            </button>
          </form>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // Authenticated Admin Dashboard Layout
  // -------------------------------------------------------------
  return (
    <div className="min-h-screen bg-[#07110a] text-stone-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Banner Alert Notification */}
        {notificationBanner && (
          <div className="bg-amber-400 text-black font-serif font-bold px-6 py-3 rounded-xl shadow-lg flex items-center justify-between animate-in slide-in-from-top-4 duration-200">
            <span>{notificationBanner}</span>
            <button onClick={() => setNotificationBanner('')} className="p-1 hover:bg-black/10 rounded">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Top Header Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#0f2217] p-6 rounded-2xl border border-emerald-800/60 shadow-xl">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full p-0.5 bg-gradient-to-tr from-amber-500 to-amber-200 shrink-0">
              <img
                src={BRAND_IMAGES.logo}
                alt="Logo"
                className="w-full h-full object-cover rounded-full bg-[#0c1a12]"
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-serif text-2xl font-bold text-amber-100 uppercase tracking-wide">
                  Admin Control Portal
                </h1>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-950 border border-emerald-700 text-emerald-300 text-[10px] font-mono uppercase">
                  Live Admin Mode
                </span>
              </div>
              <p className="text-stone-400 text-xs font-sans mt-0.5">
                Logged in as: <span className="text-amber-300 font-mono">{adminUserEmail}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={loadAdminOrders}
              className="p-2.5 bg-emerald-950 hover:bg-emerald-900 text-amber-300 rounded-xl border border-emerald-800 transition-colors cursor-pointer"
              title="Refresh Orders"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>

            <button
              onClick={() => {
                setOrderForm({
                  first_name: '',
                  last_name: '',
                  email: '',
                  address: '',
                  city: '',
                  state: 'AZ',
                  zip_code: '',
                  beef_share: 'Full Beef Share (400-450 lbs)',
                  estimated_weight: '425 lbs',
                  total_price: 4800,
                  payment_status: 'Deposit Paid',
                  fulfillment_method: 'Delivery',
                  pickup_date: '',
                  delivery_date: '2026-09-15',
                  current_status: 'Order Received',
                  notes: 'Custom cutting card assigned.',
                });
                setCreateModalOpen(true);
              }}
              className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-amber-400 text-emerald-950 font-serif font-bold text-xs uppercase tracking-widest rounded-xl hover:brightness-110 shadow-lg flex items-center gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Create Order</span>
            </button>

            <button
              onClick={handleLogout}
              className="p-2.5 bg-stone-900 hover:bg-stone-800 text-stone-400 hover:text-white rounded-xl border border-stone-800 transition-colors cursor-pointer"
              title="Log Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Primary View Navigation Tabs */}
        <div className="flex items-center gap-3 border-b border-emerald-900/80 pb-2">
          <button
            onClick={() => setActiveTab('orders')}
            className={`px-5 py-2.5 rounded-xl font-serif text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 ${
              activeTab === 'orders'
                ? 'bg-amber-400 text-emerald-950 shadow-lg'
                : 'bg-[#0f2217] text-stone-300 hover:bg-[#152e20] border border-emerald-800/40'
            }`}
          >
            <Package className="w-4 h-4" />
            <span>Order Management & Pipeline</span>
          </button>
          <button
            onClick={() => setActiveTab('batches')}
            className={`px-5 py-2.5 rounded-xl font-serif text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 ${
              activeTab === 'batches'
                ? 'bg-amber-400 text-emerald-950 shadow-lg'
                : 'bg-[#0f2217] text-stone-300 hover:bg-[#152e20] border border-emerald-800/40'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Harvest Batches Configuration ({harvestBatches.filter((b) => b.active).length} Active)</span>
          </button>
        </div>

        {activeTab === 'batches' ? (
          /* Harvest Batches Management Section */
          <div className="space-y-6">
            <div className="bg-[#0f2217] p-6 rounded-2xl border border-emerald-800/60 shadow-xl space-y-4">
              <div className="flex items-center justify-between border-b border-emerald-900/80 pb-4">
                <div>
                  <h2 className="font-serif text-xl font-bold text-amber-100 flex items-center gap-2">
                    <Layers className="w-5 h-5 text-amber-400" />
                    <span>Dynamic Harvest Batches</span>
                  </h2>
                  <p className="text-stone-400 text-xs font-light mt-1">
                    Manage the available delivery harvest batches displayed in the customer reservation form. Deactivated batches are instantly hidden from customers without modifying code.
                  </p>
                </div>
              </div>

              {/* Add New Batch Form */}
              <form onSubmit={handleAddBatch} className="bg-[#07110a] p-4 rounded-xl border border-emerald-800/80 space-y-3">
                <h3 className="font-serif text-sm font-bold text-amber-200">Add New Harvest Batch</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-stone-400 block mb-1">Batch Display Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Spring 2027 Harvest (March–April)"
                      value={newBatchName}
                      onChange={(e) => setNewBatchName(e.target.value)}
                      className="w-full bg-[#0f2217] border border-emerald-800 rounded-lg px-3 py-2 text-xs text-stone-100 focus:outline-none focus:border-amber-400"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-stone-400 block mb-1">Estimated Delivery Window (Optional)</label>
                    <input
                      type="text"
                      placeholder="e.g. March 15 - April 10, 2027"
                      value={newBatchDelivery}
                      onChange={(e) => setNewBatchDelivery(e.target.value)}
                      className="w-full bg-[#0f2217] border border-emerald-800 rounded-lg px-3 py-2 text-xs text-stone-100 focus:outline-none focus:border-amber-400"
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-emerald-950 font-serif font-bold text-xs uppercase tracking-wider rounded-lg shadow flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>Create & Activate Batch</span>
                </button>
              </form>

              {/* Batches Table */}
              <div className="overflow-x-auto rounded-xl border border-emerald-900/80">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-[#07110a] font-serif uppercase text-amber-200 border-b border-emerald-800">
                      <th className="p-3.5">Status</th>
                      <th className="p-3.5">Batch Name</th>
                      <th className="p-3.5">Target Delivery Window</th>
                      <th className="p-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-emerald-900/60 bg-[#0f2217]">
                    {harvestBatches.map((b) => (
                      <tr key={b.id} className="hover:bg-emerald-950/40 transition-colors">
                        <td className="p-3.5">
                          <button
                            onClick={() => handleToggleBatchActive(b.id)}
                            className={`px-3 py-1 rounded-full text-[11px] font-mono font-bold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer transition-all ${
                              b.active
                                ? 'bg-emerald-950 text-emerald-300 border border-emerald-600'
                                : 'bg-stone-900 text-stone-500 border border-stone-800'
                            }`}
                          >
                            <Power className={`w-3 h-3 ${b.active ? 'text-emerald-400' : 'text-stone-600'}`} />
                            <span>{b.active ? 'Active (Visible)' : 'Disabled'}</span>
                          </button>
                        </td>
                        <td className="p-3.5 font-bold text-amber-100 text-sm">{b.name}</td>
                        <td className="p-3.5 text-stone-300 font-mono">{b.estimatedDelivery || 'Standard Season Window'}</td>
                        <td className="p-3.5 text-right">
                          <button
                            onClick={() => handleDeleteBatch(b.id)}
                            className="p-1.5 bg-red-950/60 hover:bg-red-900 text-red-300 rounded-lg border border-red-800 transition-colors cursor-pointer"
                            title="Delete Harvest Batch"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ) : (
          /* Order Management Section */
          <>

        {/* Dashboard Metric Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <div className="bg-[#0f2217] p-5 rounded-2xl border border-emerald-800/60 shadow-lg space-y-2">
            <div className="flex items-center justify-between text-stone-400">
              <span className="text-[11px] font-serif uppercase tracking-wider">Total Orders</span>
              <Package className="w-4 h-4 text-amber-400" />
            </div>
            <p className="text-2xl sm:text-3xl font-serif font-bold text-amber-100">{totalOrdersCount}</p>
            <span className="text-[10px] text-stone-500 font-mono">All-time Logged</span>
          </div>

          <div className="bg-[#0f2217] p-5 rounded-2xl border border-emerald-800/60 shadow-lg space-y-2">
            <div className="flex items-center justify-between text-stone-400">
              <span className="text-[11px] font-serif uppercase tracking-wider">Pending</span>
              <Clock className="w-4 h-4 text-blue-400" />
            </div>
            <p className="text-2xl sm:text-3xl font-serif font-bold text-blue-300">{pendingOrdersCount}</p>
            <span className="text-[10px] text-stone-500 font-mono">Awaiting Review</span>
          </div>

          <div className="bg-[#0f2217] p-5 rounded-2xl border border-emerald-800/60 shadow-lg space-y-2">
            <div className="flex items-center justify-between text-stone-400">
              <span className="text-[11px] font-serif uppercase tracking-wider">Processing</span>
              <RefreshCw className="w-4 h-4 text-amber-400" />
            </div>
            <p className="text-2xl sm:text-3xl font-serif font-bold text-amber-300">{processingOrdersCount}</p>
            <span className="text-[10px] text-stone-500 font-mono">Dry Aging & Cutting</span>
          </div>

          <div className="bg-[#0f2217] p-5 rounded-2xl border border-emerald-800/60 shadow-lg space-y-2">
            <div className="flex items-center justify-between text-stone-400">
              <span className="text-[11px] font-serif uppercase tracking-wider">Ready / Shipped</span>
              <Truck className="w-4 h-4 text-cyan-400" />
            </div>
            <p className="text-2xl sm:text-3xl font-serif font-bold text-cyan-300">{readyOrdersCount}</p>
            <span className="text-[10px] text-stone-500 font-mono">Ready for Pickup</span>
          </div>

          <div className="bg-[#0f2217] p-5 rounded-2xl border border-emerald-800/60 shadow-lg space-y-2">
            <div className="flex items-center justify-between text-stone-400">
              <span className="text-[11px] font-serif uppercase tracking-wider">Delivered</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            </div>
            <p className="text-2xl sm:text-3xl font-serif font-bold text-emerald-300">{deliveredOrdersCount}</p>
            <span className="text-[10px] text-stone-500 font-mono">Fulfilled Orders</span>
          </div>

          <div className="bg-[#0f2217] p-5 rounded-2xl border border-amber-500/30 shadow-lg space-y-2">
            <div className="flex items-center justify-between text-stone-400">
              <span className="text-[11px] font-serif uppercase tracking-wider text-amber-300">Revenue</span>
              <TrendingUp className="w-4 h-4 text-amber-400" />
            </div>
            <p className="text-xl sm:text-2xl font-serif font-bold text-amber-300">
              ${totalRevenueSum.toLocaleString('en-US', { minimumFractionDigits: 0 })}
            </p>
            <span className="text-[10px] text-stone-500 font-mono">Total Order Value</span>
          </div>
        </div>

        {/* Search & Status Filters */}
        <div className="bg-[#0f2217] p-6 rounded-2xl border border-emerald-800/60 shadow-xl space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            {/* Search Bar */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-stone-500" />
              <input
                type="text"
                placeholder="Search by Order # (BST-2026-...), Customer Name, Email, or Phone..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#07110a] border border-emerald-800 rounded-xl pl-10 pr-4 py-2.5 text-stone-100 text-sm focus:outline-none focus:border-amber-400"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-3 text-stone-500 hover:text-stone-300"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Filter Tabs */}
            <div className="flex flex-wrap gap-1.5 bg-[#07110a] p-1.5 rounded-xl border border-emerald-900">
              {['All', 'Pending', 'Processing', 'Ready', 'Delivered'].map((f) => (
                <button
                  key={f}
                  onClick={() => setStatusFilter(f)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-serif uppercase tracking-wider transition-all cursor-pointer ${
                    statusFilter === f
                      ? 'bg-amber-400 text-black font-bold shadow-md'
                      : 'text-stone-400 hover:text-stone-200'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          {/* Orders Table */}
          <div className="overflow-x-auto rounded-xl border border-emerald-900/80">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-[#07110a] font-serif uppercase text-xs text-amber-200 border-b border-emerald-800">
                  <th className="p-4">Order #</th>
                  <th className="p-4">Customer</th>
                  <th className="p-4">Beef Share</th>
                  <th className="p-4">Est. Weight</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Payment</th>
                  <th className="p-4">Date</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-emerald-900/60 bg-[#0f2217]">
                {filteredOrders.length > 0 ? (
                  filteredOrders.map((ord) => (
                    <tr key={ord.id} className="hover:bg-emerald-950/40 transition-colors">
                      <td className="p-4 font-mono font-bold text-amber-300">
                        {ord.order_number}
                      </td>

                      <td className="p-4">
                        <div className="space-y-0.5">
                          <p className="font-semibold text-stone-100">
                            {ord.customer
                              ? `${ord.customer.first_name} ${ord.customer.last_name}`
                              : 'Customer'}
                          </p>
                          <p className="text-xs text-stone-400 flex items-center gap-1">
                            <Mail className="w-3 h-3 text-stone-500" /> {ord.customer?.email}
                          </p>
                        </div>
                      </td>

                      <td className="p-4 font-medium text-stone-200">{ord.beef_share}</td>

                      <td className="p-4 font-mono text-stone-300">{ord.estimated_weight || 'TBD'}</td>

                      <td className="p-4">
                        <button
                          onClick={() => {
                            setSelectedOrder(ord);
                            setNewOrderStatus(ord.current_status as OrderStatus);
                            setStatusModalOpen(true);
                          }}
                          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-serif font-bold uppercase tracking-wider bg-amber-400/10 text-amber-300 border border-amber-400/30 hover:bg-amber-400/20 transition-colors cursor-pointer"
                        >
                          <span>{ord.current_status}</span>
                          <Edit2 className="w-3 h-3 opacity-70" />
                        </button>
                      </td>

                      <td className="p-4">
                        <span className="px-2.5 py-1 rounded text-xs font-mono bg-emerald-950 text-emerald-300 border border-emerald-800">
                          {ord.payment_status} (${Number(ord.total_price || 0)})
                        </span>
                      </td>

                      <td className="p-4 text-xs font-mono text-stone-400">
                        {new Date(ord.created_at).toLocaleDateString()}
                      </td>

                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleSendEmailNotification(ord)}
                            className="p-1.5 bg-emerald-950 hover:bg-emerald-900 text-amber-300 rounded-lg border border-emerald-800 transition-colors cursor-pointer"
                            title="Send Email Update"
                          >
                            <Send className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => {
                              setSelectedOrder(ord);
                              setTimelineModalOpen(true);
                            }}
                            className="p-1.5 bg-emerald-950 hover:bg-emerald-900 text-amber-300 rounded-lg border border-emerald-800 transition-colors cursor-pointer"
                            title="Add Timeline Entry"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => {
                              setSelectedOrder(ord);
                              setPrintModalOpen(true);
                            }}
                            className="p-1.5 bg-emerald-950 hover:bg-emerald-900 text-amber-300 rounded-lg border border-emerald-800 transition-colors cursor-pointer"
                            title="Print Order Invoice"
                          >
                            <Printer className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => openEditModal(ord)}
                            className="p-1.5 bg-emerald-950 hover:bg-emerald-900 text-amber-300 rounded-lg border border-emerald-800 transition-colors cursor-pointer"
                            title="Edit Order Details"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => handleDeleteOrder(ord)}
                            className="p-1.5 bg-red-950/60 hover:bg-red-900 text-red-300 rounded-lg border border-red-800 transition-colors cursor-pointer"
                            title="Delete Order"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={8} className="p-8 text-center text-stone-500 font-sans italic">
                      No orders found matching your search criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </>
      )}
      </div>

      {/* ------------------------------------------------------------- */}
      {/* Create / Edit Order Modal */}
      {/* ------------------------------------------------------------- */}
      {(createModalOpen || editModalOpen) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
          <div className="bg-[#0f2217] border border-amber-500/30 rounded-2xl max-w-2xl w-full p-6 sm:p-8 space-y-6 shadow-2xl my-8 text-stone-100 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-emerald-800">
              <h3 className="font-serif font-bold text-xl text-amber-100">
                {createModalOpen ? '✨ Create New Order' : `Edit Order #${selectedOrder?.order_number}`}
              </h3>
              <button
                onClick={() => {
                  setCreateModalOpen(false);
                  setEditModalOpen(false);
                }}
                className="p-1 text-stone-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={createModalOpen ? handleCreateOrderSubmit : handleEditOrderSubmit}
              className="space-y-4"
            >
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-serif uppercase tracking-wider text-amber-200 mb-1">
                    Customer First Name
                  </label>
                  <input
                    type="text"
                    required
                    value={orderForm.first_name}
                    onChange={(e) => setOrderForm({ ...orderForm, first_name: e.target.value })}
                    className="w-full bg-[#07110a] border border-emerald-800 rounded-xl px-3 py-2 text-sm text-stone-100"
                  />
                </div>
                <div>
                  <label className="block text-xs font-serif uppercase tracking-wider text-amber-200 mb-1">
                    Customer Last Name
                  </label>
                  <input
                    type="text"
                    required
                    value={orderForm.last_name}
                    onChange={(e) => setOrderForm({ ...orderForm, last_name: e.target.value })}
                    className="w-full bg-[#07110a] border border-emerald-800 rounded-xl px-3 py-2 text-sm text-stone-100"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-serif uppercase tracking-wider text-amber-200 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={orderForm.email}
                  onChange={(e) => setOrderForm({ ...orderForm, email: e.target.value })}
                  className="w-full bg-[#07110a] border border-emerald-800 rounded-xl px-3 py-2 text-sm text-stone-100"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div className="col-span-3">
                  <label className="block text-xs font-serif uppercase tracking-wider text-amber-200 mb-1">
                    Street Address
                  </label>
                  <input
                    type="text"
                    value={orderForm.address}
                    onChange={(e) => setOrderForm({ ...orderForm, address: e.target.value })}
                    className="w-full bg-[#07110a] border border-emerald-800 rounded-xl px-3 py-2 text-sm text-stone-100"
                  />
                </div>
                <div>
                  <label className="block text-xs font-serif uppercase tracking-wider text-amber-200 mb-1">
                    City
                  </label>
                  <input
                    type="text"
                    value={orderForm.city}
                    onChange={(e) => setOrderForm({ ...orderForm, city: e.target.value })}
                    className="w-full bg-[#07110a] border border-emerald-800 rounded-xl px-3 py-2 text-sm text-stone-100"
                  />
                </div>
                <div>
                  <label className="block text-xs font-serif uppercase tracking-wider text-amber-200 mb-1">
                    State
                  </label>
                  <input
                    type="text"
                    value={orderForm.state}
                    onChange={(e) => setOrderForm({ ...orderForm, state: e.target.value })}
                    className="w-full bg-[#07110a] border border-emerald-800 rounded-xl px-3 py-2 text-sm text-stone-100"
                  />
                </div>
                <div>
                  <label className="block text-xs font-serif uppercase tracking-wider text-amber-200 mb-1">
                    Zip Code
                  </label>
                  <input
                    type="text"
                    value={orderForm.zip_code}
                    onChange={(e) => setOrderForm({ ...orderForm, zip_code: e.target.value })}
                    className="w-full bg-[#07110a] border border-emerald-800 rounded-xl px-3 py-2 text-sm text-stone-100"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 border-t border-emerald-900 pt-3">
                <div>
                  <label className="block text-xs font-serif uppercase tracking-wider text-amber-200 mb-1">
                    Beef Share Option
                  </label>
                  <select
                    value={orderForm.beef_share}
                    onChange={(e) => setOrderForm({ ...orderForm, beef_share: e.target.value })}
                    className="w-full bg-[#07110a] border border-emerald-800 rounded-xl px-3 py-2 text-sm text-stone-100"
                  >
                    <option value="Full Beef Share (400-450 lbs)">Full Beef Share (400-450 lbs)</option>
                    <option value="Half Beef Share (200-225 lbs)">Half Beef Share (200-225 lbs)</option>
                    <option value="Quarter Beef Share (100-112 lbs)">Quarter Beef Share (100-112 lbs)</option>
                    <option value="Eighth Beef Share (50-55 lbs)">Eighth Beef Share (50-55 lbs)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-serif uppercase tracking-wider text-amber-200 mb-1">
                    Estimated Weight
                  </label>
                  <input
                    type="text"
                    value={orderForm.estimated_weight}
                    onChange={(e) => setOrderForm({ ...orderForm, estimated_weight: e.target.value })}
                    className="w-full bg-[#07110a] border border-emerald-800 rounded-xl px-3 py-2 text-sm text-stone-100"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-serif uppercase tracking-wider text-amber-200 mb-1">
                    Total Price ($)
                  </label>
                  <input
                    type="number"
                    value={orderForm.total_price}
                    onChange={(e) => setOrderForm({ ...orderForm, total_price: Number(e.target.value) })}
                    className="w-full bg-[#07110a] border border-emerald-800 rounded-xl px-3 py-2 text-sm text-stone-100"
                  />
                </div>

                <div>
                  <label className="block text-xs font-serif uppercase tracking-wider text-amber-200 mb-1">
                    Payment Status
                  </label>
                  <select
                    value={orderForm.payment_status}
                    onChange={(e) =>
                      setOrderForm({ ...orderForm, payment_status: e.target.value as PaymentStatus })
                    }
                    className="w-full bg-[#07110a] border border-emerald-800 rounded-xl px-3 py-2 text-sm text-stone-100"
                  >
                    <option value="Pending Deposit">Pending Deposit</option>
                    <option value="Deposit Paid">Deposit Paid</option>
                    <option value="Paid in Full">Paid in Full</option>
                    <option value="Refunded">Refunded</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-serif uppercase tracking-wider text-amber-200 mb-1">
                    Fulfillment
                  </label>
                  <select
                    value={orderForm.fulfillment_method}
                    onChange={(e) =>
                      setOrderForm({ ...orderForm, fulfillment_method: e.target.value as FulfillmentMethod })
                    }
                    className="w-full bg-[#07110a] border border-emerald-800 rounded-xl px-3 py-2 text-sm text-stone-100"
                  >
                    <option value="Pickup">Pickup at Ranch</option>
                    <option value="Delivery">Refrigerated Delivery</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-serif uppercase tracking-wider text-amber-200 mb-1">
                  Special Butcher Notes & Cutting Instructions
                </label>
                <textarea
                  rows={2}
                  value={orderForm.notes}
                  onChange={(e) => setOrderForm({ ...orderForm, notes: e.target.value })}
                  className="w-full bg-[#07110a] border border-emerald-800 rounded-xl p-3 text-sm text-stone-100"
                />
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setCreateModalOpen(false);
                    setEditModalOpen(false);
                  }}
                  className="px-4 py-2 bg-stone-900 hover:bg-stone-800 text-stone-300 rounded-xl text-xs uppercase font-serif"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2.5 bg-amber-400 hover:bg-amber-300 text-black font-serif font-bold text-xs uppercase tracking-wider rounded-xl"
                >
                  {createModalOpen ? 'Create Order & Dispatch Email' : 'Save Order Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* Update Status Modal */}
      {/* ------------------------------------------------------------- */}
      {statusModalOpen && selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#0f2217] border border-amber-500/30 rounded-2xl max-w-md w-full p-6 space-y-6 shadow-2xl text-stone-100">
            <div className="flex items-center justify-between pb-3 border-b border-emerald-800">
              <h3 className="font-serif font-bold text-lg text-amber-100">
                Update Status for #{selectedOrder.order_number}
              </h3>
              <button onClick={() => setStatusModalOpen(false)} className="p-1 text-stone-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleStatusChangeSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-serif uppercase tracking-wider text-amber-200 mb-1">
                  Select New Order Status
                </label>
                <select
                  value={newOrderStatus}
                  onChange={(e) => setNewOrderStatus(e.target.value as OrderStatus)}
                  className="w-full bg-[#07110a] border border-emerald-800 rounded-xl p-3 text-sm text-stone-100 font-medium"
                >
                  <option value="Order Received">1. Order Received</option>
                  <option value="Reservation Confirmed">2. Reservation Confirmed</option>
                  <option value="Payment Confirmed">3. Payment Confirmed</option>
                  <option value="Preparing Beef Share">4. Preparing Beef Share</option>
                  <option value="Quality Inspection">5. Quality Inspection</option>
                  <option value="Packaged">6. Packaged</option>
                  <option value="Ready for Pickup">7. Ready for Pickup</option>
                  <option value="Out for Delivery">7. Out for Delivery</option>
                  <option value="Delivered">8. Delivered / Picked Up</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-serif uppercase tracking-wider text-amber-200 mb-1">
                  Status Note / Email Comment for Customer
                </label>
                <textarea
                  rows={3}
                  value={statusNoteInput}
                  onChange={(e) => setStatusNoteInput(e.target.value)}
                  placeholder="e.g. Dry aging complete. Flash frozen at -20°F and ready in Vault A-4."
                  className="w-full bg-[#07110a] border border-emerald-800 rounded-xl p-3 text-sm text-stone-100"
                />
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setStatusModalOpen(false)}
                  className="px-4 py-2 bg-stone-900 text-stone-300 rounded-xl text-xs uppercase"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2 bg-amber-400 text-black font-serif font-bold text-xs uppercase rounded-xl"
                >
                  Update & Send Email
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* Add Custom Timeline Entry Modal */}
      {/* ------------------------------------------------------------- */}
      {timelineModalOpen && selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#0f2217] border border-amber-500/30 rounded-2xl max-w-md w-full p-6 space-y-6 shadow-2xl text-stone-100">
            <div className="flex items-center justify-between pb-3 border-b border-emerald-800">
              <h3 className="font-serif font-bold text-lg text-amber-100">
                Add Timeline Log for #{selectedOrder.order_number}
              </h3>
              <button onClick={() => setTimelineModalOpen(false)} className="p-1 text-stone-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleTimelineSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-serif uppercase tracking-wider text-amber-200 mb-1">
                  Timeline Log Entry / Butcher Comment
                </label>
                <textarea
                  rows={4}
                  required
                  value={timelineNoteInput}
                  onChange={(e) => setTimelineNoteInput(e.target.value)}
                  placeholder="e.g. Customer called to confirm custom steak thickness (1.5 inches)."
                  className="w-full bg-[#07110a] border border-emerald-800 rounded-xl p-3 text-sm text-stone-100"
                />
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setTimelineModalOpen(false)}
                  className="px-4 py-2 bg-stone-900 text-stone-300 rounded-xl text-xs uppercase"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2 bg-amber-400 text-black font-serif font-bold text-xs uppercase rounded-xl"
                >
                  Save Timeline Log
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* Printable Invoice Modal */}
      {/* ------------------------------------------------------------- */}
      <PrintOrderModal
        isOpen={printModalOpen}
        onClose={() => setPrintModalOpen(false)}
        order={selectedOrder}
      />
    </div>
  );
}
