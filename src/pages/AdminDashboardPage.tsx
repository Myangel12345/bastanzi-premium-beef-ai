import React, { useState, useEffect, useRef } from 'react';
import { ShieldCheck, Lock, LogOut, Key, UserCheck, AlertTriangle, Search, Plus, Trash2, Edit3, CheckCircle2, Truck, Printer, Clock, User, ArrowRight, RefreshCw, X, ShieldAlert } from 'lucide-react';

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
  status: 'Pending' | 'Processing' | 'In Transit' | 'Delivered' | 'Cancelled';
  origin: string;
  destination: string;
  carrier: string;
  estimatedDelivery: string;
  createdAt: string;
  updated_at?: string;
  updated_by?: string;
  notes?: string;
}

export default function AdminDashboardPage() {
  // Session authentication state
  const [token, setToken] = useState<string | null>(() => sessionStorage.getItem('admin_token'));
  const [adminUser, setAdminUser] = useState<{ email: string; role: string } | null>(() => {
    const stored = sessionStorage.getItem('admin_user');
    return stored ? JSON.parse(stored) : null;
  });

  // Login form state (No hardcoded credentials!)
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);

  // Inactivity auto-logout tracking (15 minutes = 900,000 ms)
  const [lastActivity, setLastActivity] = useState<number>(Date.now());
  const INACTIVITY_LIMIT_MS = 15 * 60 * 1000; // 15 minutes

  // Shipments state
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [loadingShipments, setLoadingShipments] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [selectedShipment, setSelectedShipment] = useState<Shipment | null>(null);

  // Modal Dialogs
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [waybillModalShipment, setWaybillModalShipment] = useState<Shipment | null>(null);

  // Confirmation Modals (Requirement 6)
  const [deleteConfirmShipment, setDeleteConfirmShipment] = useState<Shipment | null>(null);
  const [deliverConfirmShipment, setDeliverConfirmShipment] = useState<Shipment | null>(null);

  // New Shipment Form State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zip: '',
    shareSize: 'Quarter',
    finish: 'Pasture-Raised Grain-Finished',
    status: 'Pending' as const,
    notes: '',
  });

  // Verify existing session on mount
  useEffect(() => {
    if (token) {
      verifySession(token);
    }
  }, []);

  // Monitor user inactivity and perform automatic logout after 15 minutes
  useEffect(() => {
    if (!token) return;

    const resetInactivity = () => setLastActivity(Date.now());
    const events = ['mousemove', 'keydown', 'click', 'scroll', 'touchstart'];

    events.forEach((evt) => window.addEventListener(evt, resetInactivity));

    const checkInterval = setInterval(() => {
      if (Date.now() - lastActivity > INACTIVITY_LIMIT_MS) {
        handleLogout('Logged out automatically due to 15 minutes of inactivity for security.');
      }
    }, 10000); // Check every 10 seconds

    return () => {
      events.forEach((evt) => window.removeEventListener(evt, resetInactivity));
      clearInterval(checkInterval);
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
        fetchShipments(currentToken);
      } else {
        handleLogout('Session expired or invalid. Please log in again.');
      }
    } catch {
      handleLogout('Server connectivity error verifying session.');
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
        fetchShipments(data.token);
      } else {
        setLoginError(data.error || 'Authentication failed. Please check credentials.');
      }
    } catch (err: any) {
      setLoginError('Unable to connect to login authentication service.');
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
        // Ignore logout network error
      }
    }
    setToken(null);
    setAdminUser(null);
    sessionStorage.removeItem('admin_token');
    sessionStorage.removeItem('admin_user');
    if (reason) {
      setLoginError(reason);
    }
  };

  const fetchShipments = async (authToken = token) => {
    if (!authToken) return;
    setLoadingShipments(true);

    try {
      const res = await fetch('/api/admin/shipments', {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      const data = await res.json();

      if (res.ok && data.shipments) {
        setShipments(data.shipments);
      } else if (res.status === 401) {
        handleLogout('Session expired (401 Unauthorized). Please log in again.');
      }
    } catch {
      // Failed to load shipments
    } finally {
      setLoadingShipments(false);
    }
  };

  const handleCreateShipment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    try {
      const res = await fetch('/api/admin/shipments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setIsAddModalOpen(false);
        setFormData({
          name: '',
          email: '',
          phone: '',
          address: '',
          city: '',
          state: '',
          zip: '',
          shareSize: 'Quarter',
          finish: 'Pasture-Raised Grain-Finished',
          status: 'Pending',
          notes: '',
        });
        fetchShipments();
      } else if (res.status === 401) {
        handleLogout('Unauthorized: Please log in again.');
      }
    } catch {
      alert('Error creating shipment record.');
    }
  };

  const handleUpdateShipmentStatus = async (shipmentId: string, newStatus: any) => {
    if (!token) return;

    try {
      const res = await fetch('/api/admin/shipments', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ id: shipmentId, status: newStatus }),
      });

      if (res.ok) {
        fetchShipments();
      } else if (res.status === 401) {
        handleLogout('Unauthorized: Please log in again.');
      }
    } catch {
      alert('Failed to update status.');
    }
  };

  const handleDeleteShipment = async (shipmentId: string) => {
    if (!token) return;

    try {
      const res = await fetch(`/api/admin/shipments?id=${shipmentId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        setDeleteConfirmShipment(null);
        fetchShipments();
      } else if (res.status === 401) {
        handleLogout('Unauthorized: Please log in again.');
      }
    } catch {
      alert('Failed to delete shipment.');
    }
  };

  // Filtered shipment list
  const filteredShipments = shipments.filter((item) => {
    const matchesSearch =
      item.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.trackingNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.email.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'All' || item.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // If Unauthenticated -> Show Secure Login Screen
  if (!token) {
    return (
      <div className="min-h-screen bg-black text-white pt-28 pb-20 px-4 flex items-center justify-center">
        <div className="w-full max-w-md bg-[#0b140f] border-2 border-amber-500/30 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
          <div className="text-center mb-8">
            <div className="inline-flex p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 mb-4 shadow-lg">
              <ShieldCheck className="w-10 h-10" />
            </div>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-amber-100">
              OGFCARGO Admin Access
            </h1>
            <p className="text-stone-400 text-xs font-mono mt-1">
              Secure Logistics & Reservation Management Portal
            </p>
          </div>

          {loginError && (
            <div className="p-4 bg-red-950/80 border border-red-500/50 rounded-2xl text-red-200 text-xs font-mono mb-6 flex items-start gap-3">
              <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
              <span>{loginError}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-mono uppercase text-amber-400 mb-1.5">
                Administrator Email
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-stone-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  placeholder="admin@ogfcargo.com"
                  className="w-full pl-10 pr-4 py-3 bg-[#060c08] border border-emerald-800/80 focus:border-amber-400 rounded-xl text-xs text-white placeholder-stone-600 focus:outline-none transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono uppercase text-amber-400 mb-1.5">
                Master Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-stone-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-10 pr-4 py-3 bg-[#060c08] border border-emerald-800/80 focus:border-amber-400 rounded-xl text-xs text-white placeholder-stone-600 focus:outline-none transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loginLoading}
              className="w-full py-3.5 bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 text-black font-serif font-bold text-xs uppercase tracking-widest rounded-xl hover:brightness-110 transition-all shadow-xl shadow-amber-500/20 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loginLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Authenticating...</span>
                </>
              ) : (
                <>
                  <span>Authenticate Admin</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 pt-4 border-t border-emerald-900/60 text-center">
            <p className="text-[10px] text-stone-500 font-mono">
              Server-side authentication enforced. Tokens automatically expire after 15 minutes of inactivity.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Authenticated Admin Dashboard Interface
  return (
    <div className="min-h-screen bg-black text-white pt-24 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Top Navbar Header */}
        <div className="bg-[#0c1610] border border-amber-500/30 rounded-3xl p-6 shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-amber-500/20 border border-amber-500/40 rounded-2xl text-amber-400">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-serif text-2xl font-bold text-amber-100">
                  OGFCARGO Admin Dashboard
                </h1>
                <span className="px-2.5 py-0.5 bg-emerald-900/80 text-emerald-300 border border-emerald-700/60 text-[10px] font-mono rounded-full uppercase">
                  Authenticated Session
                </span>
              </div>
              <p className="text-xs text-stone-400 font-mono mt-0.5">
                Logged in as: <strong className="text-amber-300">{adminUser?.email}</strong> • Auto-logout active (15m inactivity)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => fetchShipments()}
              disabled={loadingShipments}
              className="p-3 bg-[#14281c] hover:bg-[#1b3626] text-amber-300 border border-emerald-800/60 rounded-xl transition-colors text-xs font-mono flex items-center gap-2"
              title="Refresh database records"
            >
              <RefreshCw className={`w-4 h-4 ${loadingShipments ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Refresh Data</span>
            </button>

            <button
              onClick={() => setIsAddModalOpen(true)}
              className="px-4 py-3 bg-gradient-to-r from-amber-500 to-amber-400 text-black font-serif font-bold text-xs uppercase tracking-wider rounded-xl hover:brightness-110 transition-all shadow-md flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>New Shipment</span>
            </button>

            {/* Logout Button (Requirement 4) */}
            <button
              onClick={() => handleLogout()}
              className="px-4 py-3 bg-red-950/80 hover:bg-red-900 text-red-300 border border-red-800/60 rounded-xl transition-colors text-xs font-mono font-bold flex items-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>
          </div>
        </div>

        {/* Search & Filter Controls */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-[#0a120c] p-4 rounded-2xl border border-emerald-900/60">
          <div className="relative w-full sm:w-96">
            <Search className="w-4 h-4 text-stone-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by ID, name, tracking, or email..."
              className="w-full pl-10 pr-4 py-2.5 bg-[#050a06] border border-emerald-800/60 rounded-xl text-xs text-white placeholder-stone-500 focus:outline-none focus:border-amber-400 font-mono"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto text-xs font-mono">
            <span className="text-stone-500 uppercase text-[10px]">Filter Status:</span>
            {['All', 'Pending', 'Processing', 'In Transit', 'Delivered'].map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-3 py-1.5 rounded-lg border transition-all whitespace-nowrap ${
                  statusFilter === status
                    ? 'bg-amber-500 text-black font-bold border-amber-400'
                    : 'bg-[#122218] text-stone-300 border-emerald-900/80 hover:border-amber-500/40'
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        {/* Shipments Table List */}
        <div className="bg-[#0b140f] border border-amber-500/20 rounded-3xl overflow-hidden shadow-2xl">
          <div className="p-4 bg-[#0f1d14] border-b border-emerald-900/60 flex items-center justify-between">
            <span className="font-serif text-sm font-bold text-amber-200">
              Active Shipment & Reservation Records ({filteredShipments.length})
            </span>
            <span className="text-[10px] font-mono text-stone-400">
              Audit logging enabled • Server-verified endpoints
            </span>
          </div>

          {loadingShipments ? (
            <div className="p-12 text-center text-amber-300 font-mono text-xs flex items-center justify-center gap-2">
              <RefreshCw className="w-5 h-5 animate-spin" />
              <span>Loading secure shipment ledger...</span>
            </div>
          ) : filteredShipments.length === 0 ? (
            <div className="p-12 text-center text-stone-400 font-mono text-xs">
              No matching shipments found.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-sans">
                <thead className="bg-[#060c08] text-amber-400 font-mono uppercase text-[10px] tracking-wider border-b border-emerald-900/60">
                  <tr>
                    <th className="py-3.5 px-4">Shipment ID / Waybill</th>
                    <th className="py-3.5 px-4">Customer</th>
                    <th className="py-3.5 px-4">Beef Share & Finishing</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4">Audit Info (Updated At / By)</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-emerald-900/40">
                  {filteredShipments.map((shipment) => (
                    <tr key={shipment.id} className="hover:bg-[#102016] transition-colors">
                      <td className="py-4 px-4 font-mono">
                        <div className="font-bold text-amber-300">{shipment.id}</div>
                        <div className="text-[10px] text-stone-400">{shipment.trackingNumber}</div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="font-bold text-white">{shipment.name}</div>
                        <div className="text-[10px] text-stone-400 font-mono">{shipment.email}</div>
                      </td>
                      <td className="py-4 px-4 font-mono text-stone-300">
                        <div>{shipment.shareSize} Share</div>
                        <div className="text-[10px] text-stone-400">{shipment.finish}</div>
                      </td>
                      <td className="py-4 px-4">
                        <span
                          className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider font-mono border ${
                            shipment.status === 'Delivered'
                              ? 'bg-emerald-950 text-emerald-300 border-emerald-700'
                              : shipment.status === 'In Transit'
                              ? 'bg-amber-950 text-amber-300 border-amber-600'
                              : 'bg-stone-900 text-stone-300 border-stone-700'
                          }`}
                        >
                          {shipment.status}
                        </span>
                      </td>

                      {/* Requirement 5: Audit Trail display */}
                      <td className="py-4 px-4 font-mono text-[10px] text-stone-400">
                        <div className="flex items-center gap-1 text-amber-300/90">
                          <Clock className="w-3 h-3" />
                          <span>{new Date(shipment.updated_at || shipment.createdAt).toLocaleString()}</span>
                        </div>
                        <div className="text-stone-400 flex items-center gap-1 mt-0.5">
                          <User className="w-3 h-3 text-stone-500" />
                          <span>{shipment.updated_by || 'system'}</span>
                        </div>
                      </td>

                      <td className="py-4 px-4 text-right space-x-2">
                        {/* Waybill Printable Modal Trigger */}
                        <button
                          onClick={() => setWaybillModalShipment(shipment)}
                          className="p-1.5 bg-[#14281c] hover:bg-[#1f3e2c] text-amber-300 rounded-lg border border-emerald-800/60 transition-colors"
                          title="Print Waybill & Shipping Label"
                        >
                          <Printer className="w-4 h-4" />
                        </button>

                        {/* Mark Delivered Trigger with Confirmation */}
                        {shipment.status !== 'Delivered' && (
                          <button
                            onClick={() => setDeliverConfirmShipment(shipment)}
                            className="p-1.5 bg-emerald-950 hover:bg-emerald-900 text-emerald-300 rounded-lg border border-emerald-700 transition-colors"
                            title="Mark as Delivered"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                          </button>
                        )}

                        {/* Delete Trigger with Confirmation */}
                        <button
                          onClick={() => setDeleteConfirmShipment(shipment)}
                          className="p-1.5 bg-red-950/80 hover:bg-red-900 text-red-300 rounded-lg border border-red-800 transition-colors"
                          title="Delete Shipment"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* REQUIREMENT 6: Confirmation Dialog for Marking Delivered */}
      {deliverConfirmShipment && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0d1811] border-2 border-emerald-500/60 rounded-3xl p-6 max-w-md w-full shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center gap-3 text-emerald-400 mb-4">
              <CheckCircle2 className="w-8 h-8" />
              <h3 className="font-serif text-xl font-bold text-white">Confirm Mark Delivered</h3>
            </div>
            <p className="text-xs text-stone-300 leading-relaxed font-sans mb-4">
              Are you sure you want to mark shipment <strong className="text-amber-300 font-mono">{deliverConfirmShipment.id}</strong> ({deliverConfirmShipment.name}) as <strong className="text-emerald-400">DELIVERED</strong>?
            </p>
            <p className="text-[10px] text-stone-400 font-mono bg-[#060c08] p-3 rounded-xl mb-6">
              Audit log will record update time <span className="text-amber-300">{new Date().toLocaleTimeString()}</span> and administrator identity <span className="text-amber-300">{adminUser?.email}</span>.
            </p>
            <div className="flex justify-end gap-3 font-serif">
              <button
                onClick={() => setDeliverConfirmShipment(null)}
                className="px-4 py-2.5 bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs font-bold rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  handleUpdateShipmentStatus(deliverConfirmShipment.id, 'Delivered');
                  setDeliverConfirmShipment(null);
                }}
                className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-bold rounded-xl shadow-lg"
              >
                Confirm Delivered
              </button>
            </div>
          </div>
        </div>
      )}

      {/* REQUIREMENT 6: Confirmation Dialog for Deleting Shipment */}
      {deleteConfirmShipment && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#180d0d] border-2 border-red-500/60 rounded-3xl p-6 max-w-md w-full shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center gap-3 text-red-400 mb-4">
              <ShieldAlert className="w-8 h-8" />
              <h3 className="font-serif text-xl font-bold text-white">Confirm Deletion</h3>
            </div>
            <p className="text-xs text-stone-300 leading-relaxed font-sans mb-4">
              Are you sure you want to delete shipment <strong className="text-amber-300 font-mono">{deleteConfirmShipment.id}</strong> belonging to <strong className="text-white">{deleteConfirmShipment.name}</strong>?
            </p>
            <p className="text-[10px] text-red-300/80 font-mono bg-[#0c0505] p-3 rounded-xl mb-6">
              ⚠️ Warning: This operation will permanently remove the record from OGFCARGO and Supabase databases.
            </p>
            <div className="flex justify-end gap-3 font-serif">
              <button
                onClick={() => setDeleteConfirmShipment(null)}
                className="px-4 py-2.5 bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs font-bold rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteShipment(deleteConfirmShipment.id)}
                className="px-5 py-2.5 bg-red-600 hover:bg-red-500 text-white text-xs font-bold rounded-xl shadow-lg"
              >
                Delete Shipment
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create New Shipment Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#0b140f] border-2 border-amber-500/40 rounded-3xl p-6 max-w-xl w-full shadow-2xl my-8">
            <div className="flex items-center justify-between pb-4 border-b border-emerald-900/60 mb-6">
              <h3 className="font-serif text-xl font-bold text-amber-200">Create OGFCARGO Shipment</h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 text-stone-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateShipment} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-amber-400 font-mono uppercase mb-1">Customer Name</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full p-2.5 bg-[#050a06] border border-emerald-800/80 rounded-xl text-white"
                  />
                </div>
                <div>
                  <label className="block text-amber-400 font-mono uppercase mb-1">Email</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full p-2.5 bg-[#050a06] border border-emerald-800/80 rounded-xl text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-amber-400 font-mono uppercase mb-1">Phone</label>
                  <input
                    type="text"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full p-2.5 bg-[#050a06] border border-emerald-800/80 rounded-xl text-white"
                  />
                </div>
                <div>
                  <label className="block text-amber-400 font-mono uppercase mb-1">Share Size</label>
                  <select
                    value={formData.shareSize}
                    onChange={(e) => setFormData({ ...formData, shareSize: e.target.value })}
                    className="w-full p-2.5 bg-[#050a06] border border-emerald-800/80 rounded-xl text-white"
                  >
                    <option value="Quarter">Quarter Share (100 lbs)</option>
                    <option value="Half">Half Share (200 lbs)</option>
                    <option value="Full">Full Share (400 lbs)</option>
                    <option value="Eighth">Eighth Share (50 lbs)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-amber-400 font-mono uppercase mb-1">City</label>
                  <input
                    type="text"
                    required
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full p-2.5 bg-[#050a06] border border-emerald-800/80 rounded-xl text-white"
                  />
                </div>
                <div>
                  <label className="block text-amber-400 font-mono uppercase mb-1">State</label>
                  <input
                    type="text"
                    required
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                    className="w-full p-2.5 bg-[#050a06] border border-emerald-800/80 rounded-xl text-white"
                  />
                </div>
                <div>
                  <label className="block text-amber-400 font-mono uppercase mb-1">Zip</label>
                  <input
                    type="text"
                    required
                    value={formData.zip}
                    onChange={(e) => setFormData({ ...formData, zip: e.target.value })}
                    className="w-full p-2.5 bg-[#050a06] border border-emerald-800/80 rounded-xl text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-amber-400 font-mono uppercase mb-1">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                  className="w-full p-2.5 bg-[#050a06] border border-emerald-800/80 rounded-xl text-white"
                >
                  <option value="Pending">Pending</option>
                  <option value="Processing">Processing</option>
                  <option value="In Transit">In Transit</option>
                  <option value="Delivered">Delivered</option>
                </select>
              </div>

              <div className="pt-4 flex justify-end gap-3 font-serif">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2.5 bg-stone-800 text-stone-300 rounded-xl font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-amber-500 text-black rounded-xl font-bold hover:bg-amber-400"
                >
                  Create & Log
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Printable Waybill Modal */}
      {waybillModalShipment && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white text-black rounded-3xl p-8 max-w-2xl w-full shadow-2xl my-8">
            <div className="flex justify-between items-center border-b-2 border-black pb-4 mb-6">
              <div>
                <h2 className="text-2xl font-black font-serif">OGFCARGO LOGISTICS VENTURES</h2>
                <p className="text-xs uppercase font-bold text-gray-600">Official Cold-Chain Shipping Waybill</p>
              </div>
              <div className="text-right font-mono">
                <p className="text-lg font-bold text-black">{waybillModalShipment.trackingNumber}</p>
                <p className="text-xs text-gray-600">Ref: {waybillModalShipment.id}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6 text-xs mb-6">
              <div className="bg-gray-100 p-4 rounded-xl border border-gray-300">
                <p className="font-bold text-gray-500 uppercase">ORIGIN / SHIPPER</p>
                <p className="font-bold text-sm text-black mt-1">Bastanzi Premium Beef Co.</p>
                <p>Sheridan Ranch Station, MT</p>
                <p className="text-gray-600">Carrier: {waybillModalShipment.carrier || 'OGFCARGO Cold Chain'}</p>
              </div>

              <div className="bg-gray-100 p-4 rounded-xl border border-gray-300">
                <p className="font-bold text-gray-500 uppercase">DESTINATION / CONSIGNEE</p>
                <p className="font-bold text-sm text-black mt-1">{waybillModalShipment.name}</p>
                <p>{waybillModalShipment.address || 'Standard Address'}</p>
                <p>{waybillModalShipment.city}, {waybillModalShipment.state} {waybillModalShipment.zip}</p>
                <p className="text-gray-600">{waybillModalShipment.phone}</p>
              </div>
            </div>

            <div className="border border-black rounded-xl p-4 mb-6 text-xs space-y-2 bg-gray-50 font-mono">
              <div className="flex justify-between">
                <span>Share Specification:</span>
                <strong className="text-black">{waybillModalShipment.shareSize} Beef Share</strong>
              </div>
              <div className="flex justify-between">
                <span>Finishing Preference:</span>
                <strong className="text-black">{waybillModalShipment.finish}</strong>
              </div>
              <div className="flex justify-between">
                <span>Temperature Controls:</span>
                <strong className="text-black">Blast Frozen (-20°F) • Dry Ice Insulated</strong>
              </div>
              <div className="flex justify-between">
                <span>Audit Verified By:</span>
                <strong className="text-black">{waybillModalShipment.updated_by || adminUser?.email}</strong>
              </div>
            </div>

            <div className="flex justify-between items-center pt-4 border-t border-gray-300 font-serif">
              <button
                onClick={() => setWaybillModalShipment(null)}
                className="px-4 py-2 bg-gray-300 hover:bg-gray-400 text-black text-xs font-bold rounded-xl"
              >
                Close
              </button>
              <button
                onClick={() => window.print()}
                className="px-6 py-2 bg-black hover:bg-gray-800 text-white text-xs font-bold rounded-xl flex items-center gap-2 shadow-lg"
              >
                <Printer className="w-4 h-4" />
                <span>Print Official Label</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
