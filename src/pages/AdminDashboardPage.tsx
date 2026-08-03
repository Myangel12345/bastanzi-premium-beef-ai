import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Lock,
  LogOut,
  AlertTriangle,
  Search,
  Plus,
  Trash2,
  Edit3,
  CheckCircle2,
  Truck,
  Printer,
  Clock,
  User,
  ArrowRight,
  RefreshCw,
  X,
  ShieldAlert,
  Package,
  Star,
  Mail,
  MessageSquare,
  Download,
  Check,
  Eye,
  DollarSign,
} from 'lucide-react';

interface Shipment {
  id: string;
  trackingNumber: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  shareSize: string;
  finish: string;
  status:
    | 'Order received'
    | 'Payment confirmed'
    | 'Processing'
    | 'Beef at processor'
    | 'Packaging'
    | 'Ready for pickup'
    | 'Shipped'
    | 'Out for delivery'
    | 'Delivered';
  origin: string;
  destination: string;
  carrier: string;
  estimatedDelivery: string;
  createdAt: string;
  updated_at?: string;
  updated_by?: string;
  notes?: string;
  totalAmount?: number;
}

interface Product {
  id: string;
  name: string;
  shareSize: string;
  finish: string;
  price: number;
  hangingWeight: string;
  takeHomeWeight: string;
  description: string;
  imageUrl: string;
  inventory: number;
  isOutOfStock: boolean;
  isFeatured: boolean;
  cutsIncluded: string[];
}

interface Testimonial {
  id: string;
  name: string;
  location: string;
  rating: number;
  comment: string;
  sharePurchased: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
}

interface Subscriber {
  id: string;
  email: string;
  createdAt: string;
}

interface ContactMessage {
  id: string;
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  createdAt: string;
  status: 'new' | 'read' | 'replied';
}

const STAGES = [
  'Order received',
  'Payment confirmed',
  'Processing',
  'Beef at processor',
  'Packaging',
  'Ready for pickup',
  'Shipped',
  'Out for delivery',
  'Delivered',
];

export default function AdminDashboardPage() {
  // Session authentication state
  const [token, setToken] = useState<string | null>(() => sessionStorage.getItem('admin_token'));
  const [adminUser, setAdminUser] = useState<{ email: string; role: string } | null>(() => {
    const stored = sessionStorage.getItem('admin_user');
    return stored ? JSON.parse(stored) : null;
  });

  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);

  // Inactivity auto-logout tracking (15 minutes)
  const [lastActivity, setLastActivity] = useState<number>(Date.now());
  const INACTIVITY_LIMIT_MS = 15 * 60 * 1000;

  // Active Tab: 'orders' | 'products' | 'testimonials' | 'subscribers' | 'contact'
  const [activeTab, setActiveTab] = useState<'orders' | 'products' | 'testimonials' | 'subscribers' | 'contact'>('orders');

  // Data Collections
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [contactMessages, setContactMessages] = useState<ContactMessage[]>([]);
  const [loadingData, setLoadingData] = useState(false);

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  // Modals
  const [isAddShipmentOpen, setIsAddShipmentOpen] = useState(false);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [waybillShipment, setWaybillShipment] = useState<Shipment | null>(null);
  const [deleteShipmentConfirm, setDeleteShipmentConfirm] = useState<Shipment | null>(null);

  // New Shipment Form State
  const [shipmentFormData, setShipmentFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zip: '',
    shareSize: 'Quarter',
    finish: 'Pasture-Raised Grain-Finished',
    status: 'Order received' as Shipment['status'],
    notes: '',
  });

  // Product Form State
  const [productFormData, setProductFormData] = useState<Partial<Product>>({
    name: '',
    shareSize: 'Quarter',
    finish: 'Pasture-Raised Grain-Finished',
    price: 1150,
    hangingWeight: '175 - 200 lbs',
    takeHomeWeight: '100 - 115 lbs',
    description: '',
    imageUrl: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&q=80&w=800',
    inventory: 10,
    isOutOfStock: false,
    isFeatured: true,
    cutsIncluded: ['Ribeye Steaks', 'NY Strip Steaks', 'Filet Mignon', '85/15 Ground Beef'],
  });

  useEffect(() => {
    if (token) {
      verifySession(token);
    }
  }, []);

  // Monitor inactivity auto-logout
  useEffect(() => {
    if (!token) return;
    const reset = () => setLastActivity(Date.now());
    const events = ['mousemove', 'keydown', 'click', 'scroll', 'touchstart'];
    events.forEach((e) => window.addEventListener(e, reset));

    const interval = setInterval(() => {
      if (Date.now() - lastActivity > INACTIVITY_LIMIT_MS) {
        handleLogout('Logged out automatically after 15 minutes of inactivity for security.');
      }
    }, 10000);

    return () => {
      events.forEach((e) => window.removeEventListener(e, reset));
      clearInterval(interval);
    };
  }, [token, lastActivity]);

  const verifySession = async (currentToken: string) => {
    try {
      const res = await fetch('/api/admin/verify', {
        headers: { Authorization: `Bearer ${currentToken}` },
      });
      const data = await res.json();
      if (res.ok && data.authenticated) {
        setAdminUser(data.user);
        fetchAllData(currentToken);
      } else {
        handleLogout('Session expired. Please log in again.');
      }
    } catch {
      handleLogout('Connectivity error verifying admin session.');
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setLoginLoading(true);

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: loginEmail, password: loginPassword }),
      });
      const data = await res.json();

      if (res.ok && data.success && data.token) {
        setToken(data.token);
        setAdminUser(data.user);
        sessionStorage.setItem('admin_token', data.token);
        sessionStorage.setItem('admin_user', JSON.stringify(data.user));
        setLoginEmail('');
        setLoginPassword('');
        setLastActivity(Date.now());
        fetchAllData(data.token);
      } else {
        setLoginError(data.error || 'Authentication failed. Please check credentials.');
      }
    } catch {
      setLoginError('Unable to connect to authentication server.');
    } finally {
      setLoginLoading(false);
    }
  };

  const handleLogout = async (reason?: string) => {
    if (token) {
      try {
        await fetch('/api/admin/logout', {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
        });
      } catch {
        // network error
      }
    }
    setToken(null);
    setAdminUser(null);
    sessionStorage.removeItem('admin_token');
    sessionStorage.removeItem('admin_user');
    if (reason) setLoginError(reason);
  };

  const fetchAllData = async (authToken = token) => {
    if (!authToken) return;
    setLoadingData(true);
    try {
      // 1. Fetch Shipments
      const resShipments = await fetch('/api/admin/shipments', { headers: { Authorization: `Bearer ${authToken}` } });
      if (resShipments.ok) {
        const data = await resShipments.json();
        setShipments(data.shipments || []);
      }

      // 2. Fetch Products
      const resProducts = await fetch('/api/admin/products', { headers: { Authorization: `Bearer ${authToken}` } });
      if (resProducts.ok) {
        const data = await resProducts.json();
        setProducts(data.products || []);
      }

      // 3. Fetch Testimonials
      const resTestimonials = await fetch('/api/admin/testimonials', { headers: { Authorization: `Bearer ${authToken}` } });
      if (resTestimonials.ok) {
        const data = await resTestimonials.json();
        setTestimonials(data.testimonials || []);
      }

      // 4. Fetch Subscribers
      const resSubscribers = await fetch('/api/admin/subscribers', { headers: { Authorization: `Bearer ${authToken}` } });
      if (resSubscribers.ok) {
        const data = await resSubscribers.json();
        setSubscribers(data.subscribers || []);
      }

      // 5. Fetch Contact Messages
      const resMessages = await fetch('/api/admin/contact', { headers: { Authorization: `Bearer ${authToken}` } });
      if (resMessages.ok) {
        const data = await resMessages.json();
        setContactMessages(data.messages || []);
      }
    } catch (e) {
      console.warn('Error loading admin data:', e);
    } finally {
      setLoadingData(false);
    }
  };

  // Create / Update Shipment
  const handleSaveShipment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    try {
      const res = await fetch('/api/admin/shipments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(shipmentFormData),
      });
      if (res.ok) {
        setIsAddShipmentOpen(false);
        fetchAllData(token);
      }
    } catch {
      alert('Failed to save shipment');
    }
  };

  const handleUpdateShipmentStage = async (id: string, status: string) => {
    if (!token) return;
    try {
      const res = await fetch('/api/admin/shipments', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ id, status }),
      });
      if (res.ok) fetchAllData(token);
    } catch {
      alert('Failed to update stage');
    }
  };

  const handleDeleteShipment = async (id: string) => {
    if (!token) return;
    try {
      const res = await fetch(`/api/admin/shipments?id=${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setDeleteShipmentConfirm(null);
        fetchAllData(token);
      }
    } catch {
      alert('Failed to delete shipment');
    }
  };

  // Product Management Handlers
  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    try {
      const method = editingProduct ? 'PUT' : 'POST';
      const bodyPayload = editingProduct ? { ...productFormData, id: editingProduct.id } : productFormData;

      const res = await fetch('/api/admin/products', {
        method,
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(bodyPayload),
      });

      if (res.ok) {
        setIsProductModalOpen(false);
        setEditingProduct(null);
        fetchAllData(token);
      }
    } catch {
      alert('Failed to save product');
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!token || !confirm('Delete this product share?')) return;
    try {
      const res = await fetch(`/api/admin/products?id=${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) fetchAllData(token);
    } catch {
      alert('Failed to delete product');
    }
  };

  // Testimonial Approval Handlers
  const handleUpdateTestimonialStatus = async (id: string, status: 'approved' | 'rejected') => {
    if (!token) return;
    try {
      const res = await fetch('/api/admin/testimonials', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ id, status }),
      });
      if (res.ok) fetchAllData(token);
    } catch {
      alert('Failed to update review status');
    }
  };

  // CSV Export for Subscribers
  const handleExportSubscribersCSV = () => {
    if (subscribers.length === 0) return;
    const csvRows = ['ID,Email,SubscribedAt'];
    subscribers.forEach((s) => {
      csvRows.push(`"${s.id}","${s.email}","${s.createdAt}"`);
    });
    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Bastanzi_Subscribers_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  // Filtered lists
  const filteredShipments = shipments.filter((item) => {
    const matchSearch =
      item.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.trackingNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchStatus = statusFilter === 'All' || item.status === statusFilter;
    return matchSearch && matchStatus;
  });

  // Login Screen
  if (!token) {
    return (
      <div className="min-h-screen bg-black text-white pt-28 pb-20 px-4 flex items-center justify-center">
        <div className="w-full max-w-md bg-[#0b140f] border-2 border-amber-500/30 rounded-3xl p-8 shadow-2xl relative">
          <div className="text-center mb-8">
            <div className="inline-flex p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 mb-4">
              <ShieldCheck className="w-10 h-10" />
            </div>
            <h1 className="font-serif text-2xl font-bold text-amber-100">
              Bastanzi Admin Portal
            </h1>
            <p className="text-stone-400 text-xs font-mono mt-1">
              Protected Management & Operations Dashboard
            </p>
          </div>

          {loginError && (
            <div className="p-3 bg-red-950/80 border border-red-500/50 rounded-xl text-red-200 text-xs font-mono mb-6 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0" />
              <span>{loginError}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4 text-xs font-mono">
            <div>
              <label className="block text-amber-400 uppercase mb-1">Administrator Email</label>
              <input
                type="email"
                required
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                placeholder="ADMIN_EMAIL"
                className="w-full p-3 bg-[#060c08] border border-emerald-800/80 rounded-xl text-white focus:outline-none focus:border-amber-400"
              />
            </div>
            <div>
              <label className="block text-amber-400 uppercase mb-1">Master Password</label>
              <input
                type="password"
                required
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                placeholder="ADMIN_PASSWORD"
                className="w-full p-3 bg-[#060c08] border border-emerald-800/80 rounded-xl text-white focus:outline-none focus:border-amber-400"
              />
            </div>

            <button
              type="submit"
              disabled={loginLoading}
              className="w-full py-3.5 bg-amber-500 text-black font-serif font-bold text-xs uppercase tracking-widest rounded-xl hover:brightness-110 transition-all flex items-center justify-center gap-2"
            >
              {loginLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <span>Authenticate</span>}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white pt-24 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Top Navbar */}
        <div className="bg-[#0c1610] border border-amber-500/30 rounded-3xl p-6 shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-amber-500/20 border border-amber-500/40 rounded-2xl text-amber-400">
              <ShieldCheck className="w-7 h-7" />
            </div>
            <div>
              <h1 className="font-serif text-2xl font-bold text-amber-100">
                Bastanzi Beef Operations Portal
              </h1>
              <p className="text-xs text-stone-400 font-mono mt-0.5">
                Logged in as: <strong className="text-amber-300">{adminUser?.email}</strong> • Session Auto-logout: 15m
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => fetchAllData()}
              disabled={loadingData}
              className="p-3 bg-[#14281c] hover:bg-[#1b3626] text-amber-300 border border-emerald-800/60 rounded-xl text-xs font-mono flex items-center gap-2"
            >
              <RefreshCw className={`w-4 h-4 ${loadingData ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Refresh All</span>
            </button>

            <button
              onClick={() => handleLogout()}
              className="px-4 py-3 bg-red-950/80 hover:bg-red-900 text-red-300 border border-red-800/60 rounded-xl text-xs font-mono font-bold flex items-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>
          </div>
        </div>

        {/* Dashboard Section Navigation Tabs */}
        <div className="flex gap-2 overflow-x-auto border-b border-emerald-900/80 pb-2 font-mono text-xs">
          <button
            onClick={() => setActiveTab('orders')}
            className={`px-4 py-2.5 rounded-xl border flex items-center gap-2 whitespace-nowrap transition-all ${
              activeTab === 'orders'
                ? 'bg-amber-500 text-black font-bold border-amber-400'
                : 'bg-[#0d1811] text-stone-300 border-emerald-900 hover:border-amber-500/40'
            }`}
          >
            <Truck className="w-4 h-4" />
            <span>Orders & Tracking ({shipments.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('products')}
            className={`px-4 py-2.5 rounded-xl border flex items-center gap-2 whitespace-nowrap transition-all ${
              activeTab === 'products'
                ? 'bg-amber-500 text-black font-bold border-amber-400'
                : 'bg-[#0d1811] text-stone-300 border-emerald-900 hover:border-amber-500/40'
            }`}
          >
            <Package className="w-4 h-4" />
            <span>Product Catalog ({products.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('testimonials')}
            className={`px-4 py-2.5 rounded-xl border flex items-center gap-2 whitespace-nowrap transition-all ${
              activeTab === 'testimonials'
                ? 'bg-amber-500 text-black font-bold border-amber-400'
                : 'bg-[#0d1811] text-stone-300 border-emerald-900 hover:border-amber-500/40'
            }`}
          >
            <Star className="w-4 h-4" />
            <span>Testimonials ({testimonials.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('subscribers')}
            className={`px-4 py-2.5 rounded-xl border flex items-center gap-2 whitespace-nowrap transition-all ${
              activeTab === 'subscribers'
                ? 'bg-amber-500 text-black font-bold border-amber-400'
                : 'bg-[#0d1811] text-stone-300 border-emerald-900 hover:border-amber-500/40'
            }`}
          >
            <Mail className="w-4 h-4" />
            <span>Subscribers ({subscribers.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('contact')}
            className={`px-4 py-2.5 rounded-xl border flex items-center gap-2 whitespace-nowrap transition-all ${
              activeTab === 'contact'
                ? 'bg-amber-500 text-black font-bold border-amber-400'
                : 'bg-[#0d1811] text-stone-300 border-emerald-900 hover:border-amber-500/40'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            <span>Inquiries ({contactMessages.length})</span>
          </button>
        </div>

        {/* TAB 1: ORDERS & TRACKING MANAGEMENT */}
        {activeTab === 'orders' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-[#0a120c] p-4 rounded-2xl border border-emerald-900/60">
              <div className="relative w-full sm:w-80">
                <Search className="w-4 h-4 text-stone-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search orders by ID, email, name..."
                  className="w-full pl-10 pr-4 py-2 bg-[#050a06] border border-emerald-800/60 rounded-xl text-xs text-white placeholder-stone-500 focus:outline-none focus:border-amber-400 font-mono"
                />
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  onClick={() => setIsAddShipmentOpen(true)}
                  className="px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-400 text-black font-serif font-bold text-xs uppercase tracking-wider rounded-xl hover:brightness-110 flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>Create Order</span>
                </button>
              </div>
            </div>

            <div className="bg-[#0b140f] border border-amber-500/20 rounded-3xl overflow-hidden shadow-2xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-sans">
                  <thead className="bg-[#060c08] text-amber-400 font-mono uppercase text-[10px] tracking-wider border-b border-emerald-900/60">
                    <tr>
                      <th className="py-3.5 px-4">Order ID & Tracking</th>
                      <th className="py-3.5 px-4">Customer Info</th>
                      <th className="py-3.5 px-4">Share Size</th>
                      <th className="py-3.5 px-4">9-Stage Tracking Status</th>
                      <th className="py-3.5 px-4">Audit Log</th>
                      <th className="py-3.5 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-emerald-900/40">
                    {filteredShipments.map((shipment) => (
                      <tr key={shipment.id} className="hover:bg-[#102016]">
                        <td className="py-4 px-4 font-mono">
                          <div className="font-bold text-amber-300">{shipment.id}</div>
                          <div className="text-[10px] text-stone-400">{shipment.trackingNumber}</div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="font-bold text-white">{shipment.name}</div>
                          <div className="text-[10px] text-stone-400 font-mono">{shipment.email}</div>
                          <div className="text-[10px] text-stone-500">{shipment.phone}</div>
                        </td>
                        <td className="py-4 px-4 font-mono text-stone-300">
                          <div>{shipment.shareSize} Beef Share</div>
                          <div className="text-[10px] text-stone-400">{shipment.finish}</div>
                        </td>
                        <td className="py-4 px-4">
                          <select
                            value={shipment.status}
                            onChange={(e) => handleUpdateShipmentStage(shipment.id, e.target.value)}
                            className="bg-[#07110a] border border-amber-500/40 text-amber-300 font-mono text-[11px] font-bold p-1.5 rounded-lg focus:outline-none"
                          >
                            {STAGES.map((stg) => (
                              <option key={stg} value={stg} className="bg-black text-white">
                                {stg}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="py-4 px-4 font-mono text-[10px] text-stone-400">
                          <div>{new Date(shipment.updated_at || shipment.createdAt).toLocaleString()}</div>
                          <div className="text-amber-400">{shipment.updated_by || 'system'}</div>
                        </td>
                        <td className="py-4 px-4 text-right space-x-2">
                          <button
                            onClick={() => setWaybillShipment(shipment)}
                            className="p-1.5 bg-[#14281c] text-amber-300 rounded-lg border border-emerald-800"
                            title="Print Waybill"
                          >
                            <Printer className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setDeleteShipmentConfirm(shipment)}
                            className="p-1.5 bg-red-950 text-red-300 rounded-lg border border-red-800"
                            title="Delete Order"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: PRODUCT MANAGEMENT */}
        {activeTab === 'products' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center bg-[#0a120c] p-4 rounded-2xl border border-emerald-900/60">
              <h2 className="font-serif text-lg font-bold text-amber-200">Beef Share Catalog Products</h2>
              <button
                onClick={() => {
                  setEditingProduct(null);
                  setProductFormData({
                    name: '',
                    shareSize: 'Quarter',
                    finish: 'Pasture-Raised Grain-Finished',
                    price: 1150,
                    hangingWeight: '175 - 200 lbs',
                    takeHomeWeight: '100 - 115 lbs',
                    description: '',
                    imageUrl: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&q=80&w=800',
                    inventory: 10,
                    isOutOfStock: false,
                    isFeatured: true,
                    cutsIncluded: ['Ribeye Steaks', 'NY Strip Steaks', 'Filet Mignon'],
                  });
                  setIsProductModalOpen(true);
                }}
                className="px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-400 text-black font-serif font-bold text-xs uppercase rounded-xl flex items-center gap-2"
              >
                <Plus className="w-4 h-4" /> Add New Product
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((prod) => (
                <div key={prod.id} className="bg-[#0b140f] border border-amber-500/30 rounded-3xl p-5 shadow-xl flex flex-col justify-between">
                  <div>
                    <img src={prod.imageUrl} alt={prod.name} className="w-full h-40 object-cover rounded-2xl mb-4" />
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-serif font-bold text-amber-100 text-lg">{prod.name}</h3>
                      <span className="font-mono text-amber-400 font-bold text-sm">${prod.price}</span>
                    </div>
                    <p className="text-xs text-stone-300 font-light line-clamp-2 mb-3">{prod.description}</p>
                    <div className="text-[10px] font-mono text-stone-400 space-y-1 mb-4">
                      <p>Hanging Weight: <strong className="text-white">{prod.hangingWeight}</strong></p>
                      <p>Take-Home Cut: <strong className="text-white">{prod.takeHomeWeight}</strong></p>
                      <p>Inventory: <strong className="text-amber-300">{prod.inventory} units</strong></p>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-emerald-900/60 flex items-center justify-between">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold ${prod.isOutOfStock ? 'bg-red-950 text-red-300 border border-red-800' : 'bg-emerald-950 text-emerald-300 border border-emerald-800'}`}>
                      {prod.isOutOfStock ? 'Out of Stock' : 'In Stock'}
                    </span>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setEditingProduct(prod);
                          setProductFormData(prod);
                          setIsProductModalOpen(true);
                        }}
                        className="p-2 bg-[#14281c] text-amber-300 rounded-xl hover:bg-[#1e3c2a]"
                        title="Edit Product"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteProduct(prod.id)}
                        className="p-2 bg-red-950 text-red-300 rounded-xl hover:bg-red-900"
                        title="Delete Product"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: TESTIMONIALS APPROVAL */}
        {activeTab === 'testimonials' && (
          <div className="space-y-6">
            <h2 className="font-serif text-lg font-bold text-amber-200">Customer Testimonial Verification</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {testimonials.map((t) => (
                <div key={t.id} className="bg-[#0b140f] border border-emerald-900 p-5 rounded-2xl flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="font-bold text-white text-sm">{t.name} <span className="text-xs font-normal text-stone-400">({t.location})</span></h4>
                      <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-mono font-bold ${t.status === 'approved' ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' : t.status === 'rejected' ? 'bg-red-950 text-red-300 border border-red-800' : 'bg-amber-950 text-amber-300 border border-amber-800'}`}>
                        {t.status}
                      </span>
                    </div>
                    <p className="text-xs text-stone-300 italic mb-3">"{t.comment}"</p>
                    <p className="text-[10px] font-mono text-amber-400">Purchased: {t.sharePurchased} • Rating: {'★'.repeat(t.rating)}</p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-emerald-900/60 flex justify-end gap-2 font-mono text-xs">
                    <button
                      onClick={() => handleUpdateTestimonialStatus(t.id, 'approved')}
                      className="px-3 py-1 bg-emerald-600 text-black font-bold rounded-lg hover:bg-emerald-500 flex items-center gap-1"
                    >
                      <Check className="w-3.5 h-3.5" /> Approve
                    </button>
                    <button
                      onClick={() => handleUpdateTestimonialStatus(t.id, 'rejected')}
                      className="px-3 py-1 bg-red-950 text-red-300 border border-red-800 rounded-lg hover:bg-red-900"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: NEWSLETTER SUBSCRIBERS */}
        {activeTab === 'subscribers' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center bg-[#0a120c] p-4 rounded-2xl border border-emerald-900">
              <h2 className="font-serif text-lg font-bold text-amber-200">Private Reserve Email Subscribers</h2>
              <button
                onClick={handleExportSubscribersCSV}
                className="px-4 py-2 bg-amber-500 text-black font-serif font-bold text-xs uppercase rounded-xl flex items-center gap-2"
              >
                <Download className="w-4 h-4" /> Export CSV List
              </button>
            </div>

            <div className="bg-[#0b140f] border border-amber-500/20 rounded-2xl overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#060c08] text-amber-400 font-mono uppercase text-[10px]">
                  <tr>
                    <th className="py-3 px-4">Email Address</th>
                    <th className="py-3 px-4">Subscribed Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-emerald-900/40">
                  {subscribers.map((s) => (
                    <tr key={s.id}>
                      <td className="py-3 px-4 font-mono font-bold text-amber-300">{s.email}</td>
                      <td className="py-3 px-4 font-mono text-stone-400">{new Date(s.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 5: CONTACT INQUIRIES */}
        {activeTab === 'contact' && (
          <div className="space-y-6">
            <h2 className="font-serif text-lg font-bold text-amber-200">Incoming Customer Messages</h2>
            <div className="space-y-4">
              {contactMessages.map((m) => (
                <div key={m.id} className="bg-[#0b140f] border border-emerald-900 p-5 rounded-2xl">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h4 className="font-bold text-white text-sm">{m.name} <span className="text-xs font-mono text-amber-300">({m.email} • {m.phone || 'No phone'})</span></h4>
                      <p className="text-xs font-serif text-amber-200 mt-0.5">Subject: {m.subject}</p>
                    </div>
                    <span className="text-[10px] font-mono text-stone-500">{new Date(m.createdAt).toLocaleString()}</span>
                  </div>
                  <p className="text-xs text-stone-300 bg-[#060c08] p-3 rounded-xl border border-emerald-950 mt-2">{m.message}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Add Order Modal */}
      {isAddShipmentOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0b140f] border-2 border-amber-500/40 rounded-3xl p-6 max-w-xl w-full">
            <div className="flex justify-between items-center pb-4 border-b border-emerald-900 mb-4">
              <h3 className="font-serif text-xl font-bold text-amber-200">Create Order</h3>
              <button onClick={() => setIsAddShipmentOpen(false)}><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSaveShipment} className="space-y-3 text-xs">
              <input type="text" required placeholder="Customer Name" value={shipmentFormData.name} onChange={(e) => setShipmentFormData({ ...shipmentFormData, name: e.target.value })} className="w-full p-2.5 bg-black border border-emerald-800 rounded-xl" />
              <input type="email" required placeholder="Email" value={shipmentFormData.email} onChange={(e) => setShipmentFormData({ ...shipmentFormData, email: e.target.value })} className="w-full p-2.5 bg-black border border-emerald-800 rounded-xl" />
              <input type="text" required placeholder="Phone" value={shipmentFormData.phone} onChange={(e) => setShipmentFormData({ ...shipmentFormData, phone: e.target.value })} className="w-full p-2.5 bg-black border border-emerald-800 rounded-xl" />
              <select value={shipmentFormData.shareSize} onChange={(e) => setShipmentFormData({ ...shipmentFormData, shareSize: e.target.value })} className="w-full p-2.5 bg-black border border-emerald-800 rounded-xl">
                <option value="Quarter">Quarter Share</option>
                <option value="Half">Half Share</option>
                <option value="Full">Full Share</option>
              </select>
              <button type="submit" className="w-full py-3 bg-amber-500 text-black font-serif font-bold rounded-xl">Save Order</button>
            </form>
          </div>
        </div>
      )}

      {/* Product Modal */}
      {isProductModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0b140f] border-2 border-amber-500/40 rounded-3xl p-6 max-w-xl w-full">
            <div className="flex justify-between items-center pb-4 border-b border-emerald-900 mb-4">
              <h3 className="font-serif text-xl font-bold text-amber-200">{editingProduct ? 'Edit Product Share' : 'New Product Share'}</h3>
              <button onClick={() => setIsProductModalOpen(false)}><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSaveProduct} className="space-y-3 text-xs">
              <input type="text" required placeholder="Product Title" value={productFormData.name} onChange={(e) => setProductFormData({ ...productFormData, name: e.target.value })} className="w-full p-2.5 bg-black border border-emerald-800 rounded-xl" />
              <div className="grid grid-cols-2 gap-3">
                <input type="number" required placeholder="Price ($)" value={productFormData.price} onChange={(e) => setProductFormData({ ...productFormData, price: Number(e.target.value) })} className="w-full p-2.5 bg-black border border-emerald-800 rounded-xl" />
                <input type="number" required placeholder="Inventory" value={productFormData.inventory} onChange={(e) => setProductFormData({ ...productFormData, inventory: Number(e.target.value) })} className="w-full p-2.5 bg-black border border-emerald-800 rounded-xl" />
              </div>
              <textarea placeholder="Description" value={productFormData.description} onChange={(e) => setProductFormData({ ...productFormData, description: e.target.value })} className="w-full p-2.5 bg-black border border-emerald-800 rounded-xl h-20" />
              <label className="flex items-center gap-2 font-mono text-amber-300">
                <input type="checkbox" checked={productFormData.isOutOfStock} onChange={(e) => setProductFormData({ ...productFormData, isOutOfStock: e.target.checked })} />
                Mark Out of Stock
              </label>
              <button type="submit" className="w-full py-3 bg-amber-500 text-black font-serif font-bold rounded-xl">Save Product</button>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteShipmentConfirm && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-[#180d0d] border-2 border-red-500 rounded-3xl p-6 max-w-md w-full">
            <h3 className="font-serif text-xl font-bold text-white mb-2">Delete Order #{deleteShipmentConfirm.id}?</h3>
            <p className="text-xs text-stone-300 mb-4">Are you sure you want to permanently delete this order?</p>
            <div className="flex justify-end gap-3 font-serif">
              <button onClick={() => setDeleteShipmentConfirm(null)} className="px-4 py-2 bg-stone-800 text-xs text-white rounded-xl">Cancel</button>
              <button onClick={() => handleDeleteShipment(deleteShipmentConfirm.id)} className="px-4 py-2 bg-red-600 text-xs text-white rounded-xl">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
