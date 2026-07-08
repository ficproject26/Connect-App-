import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User, Truck, Award, DollarSign, MapPin, Phone, ShieldAlert, Check, X,
  Play, CheckCircle, Navigation, Key, Camera, Clock, AlertTriangle, FileText,
  ChevronRight, Eye, Bell, Package, BarChart2, Home, List, Car, Settings,
  Headphones, ChevronDown, Star, Zap, Gift, LogOut, Battery, RefreshCw, Wifi
} from 'lucide-react';
import { apiFetch } from '../../services/api';
import { socketService } from '../../services/socketService';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix leaflet marker default icon issues
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const VENDOR_LAT = 12.9348;
const VENDOR_LNG = 77.6189;

const SIDEBAR_TABS = [
  { id: 'orders',    label: 'My Deliveries',  icon: Package },
  { id: 'delivery_orders', label: 'Delivery Orders', icon: List },
  { id: 'earnings',  label: 'Earnings',        icon: DollarSign },
  { id: 'history',   label: 'History',         icon: Clock },
  { id: 'profile',   label: 'Profile',         icon: User },
  { id: 'vehicle',   label: 'Vehicle',         icon: Car },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'support',   label: 'Support',         icon: Headphones },
];

// Circular progress SVG ring component
function ProgressRing({ percent, size = 100, strokeWidth = 9, color = '#F5A800' }) {
  const radius = (size - strokeWidth) / 2;
  const circ   = 2 * Math.PI * radius;
  const dash   = (percent / 100) * circ;
  return (
    <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
      <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="#1e293b" strokeWidth={strokeWidth} />
      <circle
        cx={size / 2} cy={size / 2} r={radius} fill="none"
        stroke={color} strokeWidth={strokeWidth}
        strokeDasharray={`${dash} ${circ - dash}`}
        strokeLinecap="round"
        style={{ transition: 'stroke-dasharray 0.6s ease' }}
      />
    </svg>
  );
}

export default function DeliveryPartnerDashboard({ currentUser, onLogOut }) {
  const [activeTab, setActiveTab]           = useState('orders');
  const [partnerDetails, setPartnerDetails] = useState(null);
  const [stats, setStats]                   = useState({ todayCompleted: 0, todayEarnings: 0, rating: 4.9 });
  const [status, setStatus]                 = useState('Offline');
  const [activeAssignment, setActiveAssignment] = useState(null);
  const [activeOrder, setActiveOrder]       = useState(null);
  const [incomingAssignment, setIncomingAssignment] = useState(null);
  const [incomingTimer, setIncomingTimer]   = useState(30);
  const [upcomingOrders, setUpcomingOrders] = useState([]);
  const [notifCount, setNotifCount]         = useState(3);

  // Map state
  const mapRef             = useRef(null);
  const riderMarkerRef     = useRef(null);
  const vendorMarkerRef    = useRef(null);
  const customerMarkerRef  = useRef(null);
  const routePolylineRef   = useRef(null);
  const mapContainerId     = 'delivery-leaflet-map-desktop';
  const [eta, setEta]                           = useState(null);
  const [distanceRemaining, setDistanceRemaining] = useState(null);

  // Simulation
  const [simulationRoute, setSimulationRoute] = useState([]);
  const [simulationIndex, setSimulationIndex] = useState(0);
  const [isSimulating, setIsSimulating]       = useState(false);
  const simIntervalRef = useRef(null);

  // Delivery form
  const [otpInput, setOtpInput]         = useState('');
  const [otpError, setOtpError]         = useState('');
  const [photoProof, setPhotoProof]     = useState(null);
  const [showPhotoCamera, setShowPhotoCamera] = useState(false);

  // SOS
  const [showSosModal, setShowSosModal] = useState(false);
  const [sosTriggered, setSosTriggered] = useState(false);

  // Earnings
  const [earningsLogs, setEarningsLogs] = useState([]);

  // Delivery Orders Tab
  const [allOrders, setAllOrders] = useState([]);
  const [ordersSearchQuery, setOrdersSearchQuery] = useState('');

  // --- Data Load ---
  const loadAllOrders = async () => {
    try {
      const res = await apiFetch('/orders');
      if (res.status === 'success') {
        setAllOrders(res.data || []);
      }
    } catch (err) {
      console.error('Failed to load all orders:', err);
    }
  };

  const loadDashboard = async () => {
    try {
      const res = await apiFetch(`/delivery-partners/${currentUser.id || 'dp1'}/dashboard`);
      if (res.status === 'success') {
        const { profile, stats: s, activeAssignment: aa, activeOrder: ao } = res.data;
        setPartnerDetails(profile);
        setStats(s);
        setStatus(profile.status);
        if (aa && aa.status === 'Pending') {
          setIncomingAssignment({
            assignmentId: aa.id || aa.assignmentId,
            order: ao || aa.order,
            ...aa
          });
        } else {
          setIncomingAssignment(null);
          setActiveAssignment(aa);
          setActiveOrder(ao);
        }
      }
      const earnRes = await apiFetch(`/delivery-partners/${currentUser.id || 'dp1'}/earnings`);
      if (earnRes.status === 'success') setEarningsLogs(earnRes.data);
      await loadAllOrders();
    } catch (err) {
      console.error('Failed to load rider details:', err);
    }
  };

  const handleClaimOrder = async (orderId) => {
    try {
      const res = await apiFetch('/delivery-partners/claim-order', {
        method: 'POST',
        body: JSON.stringify({
          partnerId: currentUser.id || 'dp1',
          orderId
        })
      });
      if (res.status === 'success') {
        await loadDashboard();
        setStatus('Busy');
        setActiveTab('orders');
      }
    } catch (err) {
      console.error('Failed to claim order:', err);
    }
  };

  useEffect(() => {
    loadDashboard();
    socketService.connect(currentUser.id || 'dp1', 'delivery');
    socketService.on('order_assigned', (data) => {
      setIncomingAssignment(data);
      setIncomingTimer(30);
    });
    socketService.on('new_order_placed', () => {
      loadAllOrders();
    });
    socketService.on('order_status_updated', () => {
      loadAllOrders();
      loadDashboard();
    });
    return () => {
      socketService.disconnect();
      if (simIntervalRef.current) clearInterval(simIntervalRef.current);
    };
  }, []);

  // Seed some upcoming orders for display
  useEffect(() => {
    setUpcomingOrders([
      { id: 'ORD12346', customer: 'Amit Verma',  distance: 2.8, amount: 650 },
      { id: 'ORD12347', customer: 'Neha Singh',  distance: 3.6, amount: 750 },
    ]);
  }, []);

  // Incoming-order countdown timer
  useEffect(() => {
    if (incomingAssignment && incomingTimer > 0) {
      const t = setTimeout(() => setIncomingTimer(p => p - 1), 1000);
      return () => clearTimeout(t);
    } else if (incomingAssignment && incomingTimer === 0) {
      handleRejectAssignment();
    }
  }, [incomingAssignment, incomingTimer]);

  // Map init when active order changes
  useEffect(() => {
    if (activeOrder && activeTab === 'orders') {
      setTimeout(() => initLeafletMap(), 400);
    } else {
      if (mapRef.current) { mapRef.current.remove(); mapRef.current = null; }
    }
  }, [activeOrder, activeTab]);

  const initLeafletMap = async () => {
    if (mapRef.current) return;
    const el = document.getElementById(mapContainerId);
    if (!el) return;

    const riderLat = partnerDetails?.current_latitude  || VENDOR_LAT;
    const riderLng = partnerDetails?.current_longitude || VENDOR_LNG;
    const vendLat  = VENDOR_LAT;
    const vendLng  = VENDOR_LNG;
    const custLat  = activeOrder?.customer_latitude    || (VENDOR_LAT + 0.015);
    const custLng  = activeOrder?.customer_longitude   || (VENDOR_LNG + 0.01);

    mapRef.current = L.map(mapContainerId, { zoomControl: false, attributionControl: false })
      .setView([riderLat, riderLng], 14);

    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', { maxZoom: 20 })
      .addTo(mapRef.current);

    const makeIcon = (emoji, bg) => L.divIcon({
      className: '',
      html: `<div style="width:32px;height:32px;border-radius:50%;background:${bg};border:2px solid #0f172a;display:flex;align-items:center;justify-content:center;font-size:14px;box-shadow:0 4px 12px rgba(0,0,0,0.5)">${emoji}</div>`,
      iconSize: [32, 32]
    });

    riderMarkerRef.current    = L.marker([riderLat, riderLng], { icon: makeIcon('🚲', '#f59e0b') }).addTo(mapRef.current);
    vendorMarkerRef.current   = L.marker([vendLat,  vendLng],  { icon: makeIcon('🏪', '#7c3aed') }).addTo(mapRef.current).bindPopup('ABC Electronics');
    customerMarkerRef.current = L.marker([custLat,  custLng],  { icon: makeIcon('🏠', '#10b981') }).addTo(mapRef.current).bindPopup(activeOrder?.customer_name || 'Customer');

    mapRef.current.fitBounds(L.latLngBounds([[riderLat, riderLng],[vendLat, vendLng],[custLat, custLng]]), { padding: [40, 40] });

    try {
      const res = await apiFetch('/maps/route', {
        method: 'POST',
        body: JSON.stringify({ startLat: riderLat, startLng: riderLng, endLat: custLat, endLng: custLng })
      });
      if (res.status === 'success') {
        const { route, distance, duration } = res.data;
        setSimulationRoute(route);
        setDistanceRemaining(distance);
        setEta(duration);
        routePolylineRef.current = L.polyline(route, { color: '#3b82f6', weight: 4, opacity: 0.85, dashArray: '6 12' }).addTo(mapRef.current);
      }
    } catch (e) { console.warn('Map routing failed:', e); }
  };

  // Status toggle
  const handleStatusToggle = async () => {
    const next = status === 'Offline' ? 'Available' : 'Offline';
    try {
      const res = await apiFetch(`/delivery-partners/${currentUser.id || 'dp1'}/status`, {
        method: 'PUT', body: JSON.stringify({ status: next, availability: next === 'Available' })
      });
      if (res.status === 'success') setStatus(res.data.status);
    } catch (e) { console.error(e); }
  };

  // Accept / Reject
  const handleAcceptAssignment = async () => {
    if (!incomingAssignment) return;
    const assignmentId = incomingAssignment.assignmentId || incomingAssignment.id;
    try {
      const res = await apiFetch(`/delivery-partners/assignments/${assignmentId}/respond`, {
        method: 'POST', body: JSON.stringify({ action: 'accept' })
      });
      if (res.status === 'success') { setIncomingAssignment(null); await loadDashboard(); setStatus('Busy'); }
    } catch (e) { console.error(e); }
  };

  const handleRejectAssignment = async () => {
    if (!incomingAssignment) return;
    const assignmentId = incomingAssignment.assignmentId || incomingAssignment.id;
    try {
      await apiFetch(`/delivery-partners/assignments/${assignmentId}/respond`, {
        method: 'POST', body: JSON.stringify({ action: 'reject' })
      });
      setIncomingAssignment(null); await loadDashboard();
    } catch (e) { console.error(e); }
  };

  // Milestone steps
  const handleMilestoneStep = async (stepName) => {
    if (!activeOrder) return;
    if (stepName === 'complete') {
      if (!otpInput) { setOtpError('Customer OTP is required.'); return; }
      if (!photoProof) { setOtpError('Photo proof of delivery is required.'); return; }
    }
    try {
      const res = await apiFetch(`/delivery-partners/deliveries/${activeOrder.id}/step`, {
        method: 'POST',
        body: JSON.stringify({ step: stepName, partnerId: currentUser.id || 'dp1', otp: otpInput, photoProof })
      });
      if (res.status === 'success') {
        setOtpError('');
        if (stepName === 'complete') {
          setActiveOrder(null); setActiveAssignment(null); setOtpInput(''); setPhotoProof(null);
          setIsSimulating(false); if (simIntervalRef.current) clearInterval(simIntervalRef.current);
          setStatus('Available'); await loadDashboard();
        } else {
          await loadDashboard();
          if (stepName === 'start') startCoordinatesSimulation();
        }
      } else { setOtpError(res.message || 'Verification failed.'); }
    } catch (e) { setOtpError(e.message || 'Operation failed.'); }
  };

  // GPS simulation
  const startCoordinatesSimulation = () => {
    if (simulationRoute.length === 0 || isSimulating) return;
    setIsSimulating(true); setSimulationIndex(0);
    let idx = 0;
    socketService.joinOrder(activeOrder.id);
    simIntervalRef.current = setInterval(async () => {
      idx += 1;
      if (idx >= simulationRoute.length) {
        clearInterval(simIntervalRef.current); setIsSimulating(false);
        setSimulationIndex(simulationRoute.length - 1);
        handleMilestoneStep('near_customer'); return;
      }
      setSimulationIndex(idx);
      const coords = simulationRoute[idx];
      if (riderMarkerRef.current) riderMarkerRef.current.setLatLng(coords);
      setDistanceRemaining(d => Math.max(0, Number(d) * (1 - idx / simulationRoute.length)));
      setEta(e => Math.max(1, Math.round(Number(e) * (1 - idx / simulationRoute.length))));
      try {
        socketService.sendLocation(currentUser.id || 'dp1', activeOrder.id, coords[0], coords[1], 24, 80, `Point ${idx}`);
      } catch {}
    }, 6000);
  };

  // SOS
  const triggerSosAlert = async () => {
    setSosTriggered(true);
    socketService.triggerLocalEvent('sos_triggered', { partnerId: currentUser.id || 'dp1' });
    try { await apiFetch(`/delivery-partners/${currentUser.id || 'dp1'}/status`, { method: 'PUT', body: JSON.stringify({ status: 'Break', availability: false }) }); setStatus('Break'); } catch {}
    setTimeout(() => { setShowSosModal(false); setSosTriggered(false); }, 3000);
  };

  // Photo
  const handlePhotoCaptureSim = () => {
    setShowPhotoCamera(true);
    setTimeout(() => { setPhotoProof('https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=300&auto=format&fit=crop&q=80'); setShowPhotoCamera(false); }, 1500);
  };

  // Derived stats for display
  const totalOrders     = (stats.todayCompleted || 0) + upcomingOrders.length + (activeOrder ? 1 : 0);
  const completedOrders = stats.todayCompleted || 0;
  const inProgressOrders = activeOrder ? 1 : 0;
  const pendingOrders   = upcomingOrders.length;
  const progressPercent = totalOrders > 0 ? Math.round((completedOrders / totalOrders) * 100) : 66;
  const displayName     = partnerDetails?.name || currentUser?.name || 'Ravi Kumar';
  const partnerId       = currentUser?.id || 'dp1';
  const partnerDisplayId = 'DEL-' + (partnerId === 'dp1' ? '10023' : partnerId.toUpperCase());

  const getHourGreeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good Morning';
    if (h < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  const isOnline = status !== 'Offline';

  return (
    <div className="flex h-screen overflow-hidden bg-slate-950 text-white font-sans">

      {/* ═══════════════════════════════════════ LEFT SIDEBAR ══ */}
      <aside className="w-56 flex-shrink-0 flex flex-col bg-[#0b1120] border-r border-slate-800/60 relative z-20">
        {/* Logo */}
        <div className="px-5 py-5 flex items-center space-x-3 border-b border-slate-800/60">
          <div className="w-9 h-9 rounded-xl bg-amber-500 flex items-center justify-center shrink-0">
            <span className="text-slate-900 font-black text-lg">∞</span>
          </div>
          <div>
            <div className="text-sm font-extrabold text-white leading-tight">Connect App</div>
            <div className="text-[9px] text-amber-500 uppercase tracking-widest font-bold">Delivery Partner</div>
          </div>
        </div>

        {/* Nav Tabs */}
        <nav className="flex-grow px-3 py-4 space-y-2 overflow-y-auto no-scrollbar">
          {SIDEBAR_TABS.map(tab => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center space-x-3 px-3 py-3 rounded-xl text-left transition-all cursor-pointer border-none group ${
                  active
                    ? 'bg-amber-500 text-slate-900 shadow-md shadow-amber-500/20'
                    : 'text-slate-400 hover:bg-slate-800/60 hover:text-white'
                }`}
              >
                <Icon className={`w-4.5 h-4.5 shrink-0 ${active ? 'text-slate-900' : 'text-slate-500 group-hover:text-white'}`} size={18} />
                <span className={`text-[13px] font-semibold ${active ? 'text-slate-900' : ''}`}>{tab.label}</span>
                {tab.id === 'notifications' && notifCount > 0 && (
                  <span className={`ml-auto text-[9px] font-bold px-1.5 py-0.5 rounded-full ${active ? 'bg-slate-900 text-amber-400' : 'bg-red-500 text-white'}`}>{notifCount}</span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Today's Earnings Summary Box */}
        <div className="mx-3 mb-3 bg-slate-900/80 border border-slate-800 rounded-2xl p-3.5">
          <div className="flex items-center space-x-2 mb-2">
            <DollarSign size={14} className="text-emerald-400" />
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Today's Earnings</span>
          </div>
          <div className="text-xl font-black text-white">₹{(stats.todayEarnings || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</div>
          <div className="text-[10px] text-slate-500 mt-0.5">{completedOrders} Deliveries Completed</div>
          <button className="w-full mt-3 py-1.5 text-[10px] font-bold uppercase text-slate-300 hover:text-white border border-slate-700 rounded-lg transition-all cursor-pointer bg-transparent hover:bg-slate-800">
            View Details
          </button>
        </div>

        {/* Partner Status Toggle */}
        <div className="mx-3 mb-4 bg-slate-900/60 border border-slate-800 rounded-xl p-3 flex items-center justify-between">
          <div>
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Partner Status</div>
            <div className={`text-sm font-bold mt-0.5 flex items-center space-x-1.5 ${isOnline ? 'text-emerald-400' : 'text-slate-500'}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${isOnline ? 'bg-emerald-400' : 'bg-slate-600'}`} />
              <span>{isOnline ? 'Online' : 'Offline'}</span>
            </div>
          </div>
          <button
            onClick={handleStatusToggle}
            className={`w-11 h-6 rounded-full transition-all cursor-pointer relative border-none p-0 ${isOnline ? 'bg-emerald-500' : 'bg-slate-700'}`}
          >
            <div className={`w-5 h-5 rounded-full bg-white shadow transition-transform absolute top-0.5 ${isOnline ? 'translate-x-5' : 'translate-x-0.5'}`} />
          </button>
        </div>

        {/* Log Out Button */}
        <div className="mx-3 mb-4 border-t border-slate-800/40 pt-4">
          <button
            onClick={onLogOut}
            className="w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl text-left transition-all cursor-pointer border border-transparent hover:border-red-900/20 bg-transparent text-slate-400 hover:bg-red-500/5 hover:text-red-400 group"
          >
            <LogOut className="w-4.5 h-4.5 shrink-0 text-slate-500 group-hover:text-red-400" size={16} />
            <span className="text-[13px] font-semibold">Sign Out</span>
          </button>
        </div>
      </aside>

      {/* ═══════════════════════════════════════ MAIN AREA ══ */}
      <div className="flex-grow flex flex-col overflow-hidden">

        {/* ── TOP HEADER ── */}
        <header className="flex-shrink-0 h-16 bg-[#0b1120]/95 border-b border-slate-800/60 px-6 flex items-center justify-between backdrop-blur-md z-10">
          {/* Left: Greeting */}
          <div>
            <h1 className="text-base font-bold text-white">
              {getHourGreeting()}, {displayName}! 👋
            </h1>
            <p className="text-[11px] text-slate-400">Stay safe and complete more deliveries today.</p>
          </div>

          {/* Right: Status dropdown + Notif + Avatar */}
          <div className="flex items-center space-x-4">
            {/* Online/Offline Pill */}
            <button
              onClick={handleStatusToggle}
              className={`flex items-center space-x-2 px-3 py-1.5 rounded-full border text-xs font-bold cursor-pointer transition-all ${
                isOnline
                  ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20'
                  : 'border-slate-700 bg-slate-800/50 text-slate-400 hover:bg-slate-700'
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${isOnline ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'}`} />
              <span>{isOnline ? 'Online' : 'Offline'}</span>
              <ChevronDown size={12} />
            </button>

            {/* Notification Bell */}
            <button className="relative w-9 h-9 flex items-center justify-center rounded-xl bg-slate-800/60 border border-slate-700/60 hover:bg-slate-700/60 transition-all cursor-pointer">
              <Bell size={16} className="text-slate-300" />
              {notifCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-[9px] font-bold flex items-center justify-center text-white">{notifCount}</span>
              )}
            </button>

            {/* Avatar */}
            <div className="flex items-center space-x-2.5">
              <div className="w-9 h-9 rounded-full bg-amber-500 border-2 border-amber-400/30 overflow-hidden shrink-0">
                {partnerDetails?.photo
                  ? <img src={partnerDetails.photo} alt="Avatar" className="w-full h-full object-cover" />
                  : <User size={18} className="text-slate-900 m-auto mt-1.5" />
                }
              </div>
              <div>
                <div className="text-xs font-bold text-white leading-tight">{displayName}</div>
                <div className="text-[10px] text-slate-400">{partnerDisplayId}</div>
              </div>
              <ChevronDown size={14} className="text-slate-500" />
            </div>
          </div>
        </header>

        {/* ── SCROLLABLE BODY ── */}
        <main className="flex-grow overflow-y-auto px-6 py-5 space-y-5">

          {/* Old Dashboard Tab has been removed */}

          {/* ── ORDERS / HISTORY TAB ── */}
          {(activeTab === 'orders' || activeTab === 'history') && (
            <div className="space-y-6">
              
              {/* Active Delivery Section (Only in My Deliveries tab and when there is an active order) */}
              {activeTab === 'orders' && activeOrder && (
                <div className="space-y-4 text-left">
                  <h2 className="text-base font-bold text-white">Active Delivery</h2>
                  <div className="bg-[#0f172a] border border-amber-500/40 rounded-2xl p-6 shadow-lg grid grid-cols-1 md:grid-cols-2 gap-6 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full -translate-y-12 translate-x-12 pointer-events-none" />
                    
                    {/* Left: Order Info & Customer Details */}
                    <div className="space-y-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="px-2.5 py-1 bg-amber-500/10 text-amber-500 border border-amber-500/20 rounded-full text-[9px] font-bold uppercase tracking-wider">
                            In Progress
                          </span>
                          <h3 className="text-lg font-black text-white mt-2">Order #{activeOrder.order_number}</h3>
                        </div>
                        <div className="text-right">
                          <span className="text-[10px] text-slate-400 block">Total Payout</span>
                          <span className="text-xl font-black text-amber-500">₹75.00</span>
                        </div>
                      </div>

                      <div className="border-t border-slate-800/60 pt-4 space-y-3">
                        {/* Map Panel inside the Active Delivery Info card */}
                        <div className="relative rounded-xl overflow-hidden border border-slate-800" style={{ height: 180 }}>
                          <div id={mapContainerId} className="absolute inset-0 bg-slate-950 flex items-center justify-center" />
                          {/* Mini Map Info Overlay */}
                          <div className="absolute left-2.5 top-2.5 z-[500] bg-slate-900/90 border border-slate-700/50 rounded-lg px-2 py-1 backdrop-blur-md shadow-lg text-[9px] text-slate-300">
                            <div className="flex items-center space-x-1.5 text-emerald-400 font-bold mb-0.5">
                              <span className="w-1 h-1 rounded-full bg-emerald-400 animate-pulse" />
                              <span>Live GPS Tracking</span>
                            </div>
                            <div>Distance: <strong className="text-white">{distanceRemaining ? distanceRemaining.toFixed(1) : '4.2'} km</strong></div>
                            <div>ETA: <strong className="text-white">{eta || 15} min</strong></div>
                          </div>
                        </div>

                        <div className="flex items-start space-x-3 text-xs pt-2">
                          <MapPin size={16} className="text-violet-400 shrink-0 mt-0.5" />
                          <div>
                            <div className="text-[10px] text-slate-400 font-bold uppercase">Pickup Address</div>
                            <div className="font-semibold text-white">ABC Electronics</div>
                            <div className="text-slate-400 mt-0.5 text-[11px]">MG Road, Bengaluru</div>
                          </div>
                        </div>

                        <div className="flex items-start space-x-3 text-xs">
                          <MapPin size={16} className="text-emerald-400 shrink-0 mt-0.5" />
                          <div>
                            <div className="text-[10px] text-slate-400 font-bold uppercase">Drop Address</div>
                            <div className="font-semibold text-white">{activeOrder.customer_name}</div>
                            <div className="text-slate-400 mt-0.5 text-[11px]">{activeOrder.customer_address}</div>
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-4 border-t border-slate-800/60 pt-4 text-xs">
                        <div className="flex-1 bg-slate-950/40 p-3 rounded-xl border border-slate-800">
                          <span className="text-[9px] text-slate-500 block uppercase font-bold">Product Details</span>
                          <span className="text-white font-semibold block mt-1 truncate" title={activeOrder.product_details}>
                            {activeOrder.product_details}
                          </span>
                        </div>
                        <div className="w-1/3 bg-slate-950/40 p-3 rounded-xl border border-slate-800">
                          <span className="text-[9px] text-slate-500 block uppercase font-bold">Order Value</span>
                          <span className="text-white font-semibold block mt-1">₹{activeOrder.amount}</span>
                        </div>
                      </div>

                      <a href={`tel:${activeOrder.customer_phone}`} className="w-full flex items-center justify-center space-x-2 py-3 bg-slate-950 border border-slate-800 rounded-xl hover:bg-slate-900 text-slate-300 text-xs font-bold cursor-pointer transition-all no-underline">
                        <Phone size={14} />
                        <span>Call Customer ({activeOrder.customer_phone})</span>
                      </a>
                    </div>

                    {/* Right: Actions & Milestones */}
                    <div className="flex flex-col justify-between space-y-4 bg-slate-950/40 border border-slate-800/60 rounded-2xl p-5">
                      <div>
                        <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-3">Delivery Milestones</div>
                        
                        {/* Interactive Milestone Indicator */}
                        <div className="relative pl-6 space-y-4 text-xs before:absolute before:left-[7px] before:top-2 before:bottom-2 before:w-[2px] before:bg-slate-800">
                          {/* Step 1: Accepted */}
                          <div className="relative">
                            <span className={`absolute -left-[23px] top-0.5 w-3.5 h-3.5 rounded-full flex items-center justify-center border-2 ${
                              ['Delivery Partner Accepted', 'Picked Up', 'Out For Delivery', 'Near Customer', 'Delivered'].includes(activeOrder.status)
                                ? 'bg-amber-500 border-amber-500 text-slate-900'
                                : 'bg-slate-900 border-slate-800'
                            }`}>
                              {['Delivery Partner Accepted', 'Picked Up', 'Out For Delivery', 'Near Customer', 'Delivered'].includes(activeOrder.status) && <Check size={8} />}
                            </span>
                            <span className={`font-semibold ${['Delivery Partner Accepted', 'Picked Up', 'Out For Delivery', 'Near Customer', 'Delivered'].includes(activeOrder.status) ? 'text-white' : 'text-slate-500'}`}>Order Accepted</span>
                          </div>

                          {/* Step 2: Picked Up */}
                          <div className="relative">
                            <span className={`absolute -left-[23px] top-0.5 w-3.5 h-3.5 rounded-full flex items-center justify-center border-2 ${
                              ['Picked Up', 'Out For Delivery', 'Near Customer', 'Delivered'].includes(activeOrder.status)
                                ? 'bg-amber-500 border-amber-500 text-slate-900'
                                : 'bg-slate-900 border-slate-800'
                            }`}>
                              {['Picked Up', 'Out For Delivery', 'Near Customer', 'Delivered'].includes(activeOrder.status) && <Check size={8} />}
                            </span>
                            <span className={`font-semibold ${['Picked Up', 'Out For Delivery', 'Near Customer', 'Delivered'].includes(activeOrder.status) ? 'text-white' : 'text-slate-500'}`}>Picked Up from Vendor</span>
                          </div>

                          {/* Step 3: Out for Delivery */}
                          <div className="relative">
                            <span className={`absolute -left-[23px] top-0.5 w-3.5 h-3.5 rounded-full flex items-center justify-center border-2 ${
                              ['Out For Delivery', 'Near Customer', 'Delivered'].includes(activeOrder.status)
                                ? 'bg-amber-500 border-amber-500 text-slate-900'
                                : 'bg-slate-900 border-slate-800'
                            }`}>
                              {['Out For Delivery', 'Near Customer', 'Delivered'].includes(activeOrder.status) && <Check size={8} />}
                            </span>
                            <span className={`font-semibold ${['Out For Delivery', 'Near Customer', 'Delivered'].includes(activeOrder.status) ? 'text-white' : 'text-slate-500'}`}>Out For Delivery</span>
                          </div>

                          {/* Step 4: Near Customer */}
                          <div className="relative">
                            <span className={`absolute -left-[23px] top-0.5 w-3.5 h-3.5 rounded-full flex items-center justify-center border-2 ${
                              ['Near Customer', 'Delivered'].includes(activeOrder.status)
                                ? 'bg-amber-500 border-amber-500 text-slate-900'
                                : 'bg-slate-900 border-slate-800'
                            }`}>
                              {['Near Customer', 'Delivered'].includes(activeOrder.status) && <Check size={8} />}
                            </span>
                            <span className={`font-semibold ${['Near Customer', 'Delivered'].includes(activeOrder.status) ? 'text-white' : 'text-slate-500'}`}>Arrived at Destination</span>
                          </div>
                        </div>
                      </div>

                      {/* Milestone Control Actions */}
                      <div className="space-y-3 border-t border-slate-800/60 pt-4">
                        {activeOrder.status === 'Delivery Partner Accepted' && (
                          <button onClick={() => handleMilestoneStep('pickup')}
                            className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-slate-900 font-extrabold text-xs uppercase rounded-xl cursor-pointer transition-all">
                            Confirm Pickup from Vendor
                          </button>
                        )}
                        {activeOrder.status === 'Picked Up' && (
                          <button onClick={() => handleMilestoneStep('start')}
                            className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-xs uppercase rounded-xl cursor-pointer transition-all">
                            Start Delivery / Enable GPS
                          </button>
                        )}
                        {activeOrder.status === 'Out For Delivery' && (
                          <div className="text-center text-[10px] text-amber-400 font-bold animate-pulse py-2 bg-amber-500/5 border border-amber-500/20 rounded-xl">
                            GPS Tracking Active — En Route...
                          </div>
                        )}

                        {/* Photo proof & OTP completion */}
                        {['Delivery Partner Accepted', 'Picked Up', 'Out For Delivery', 'Near Customer'].includes(activeOrder.status) && (
                          <div className="space-y-3.5">
                            <div className="grid grid-cols-2 gap-3">
                              <div>
                                <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Photo Proof</label>
                                {photoProof ? (
                                  <div className="flex items-center justify-between bg-emerald-950/20 border border-emerald-900/30 px-2 py-1.5 rounded-lg">
                                    <span className="text-[9px] text-emerald-400 font-bold flex items-center">
                                      <CheckCircle size={10} className="mr-1" /> Captured
                                    </span>
                                    <button onClick={() => setPhotoProof(null)} className="text-[9px] text-red-400 cursor-pointer border-none bg-transparent">Retake</button>
                                  </div>
                                ) : (
                                  <button onClick={handlePhotoCaptureSim}
                                    className="w-full py-1.5 border border-dashed border-slate-700 hover:border-slate-500 text-slate-400 text-[10px] font-semibold rounded-lg cursor-pointer bg-transparent flex items-center justify-center space-x-1">
                                    <Camera size={11} />
                                    <span>{showPhotoCamera ? 'Simulating...' : 'Take Photo'}</span>
                                  </button>
                                )}
                              </div>

                              <div>
                                <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                                  OTP (hint: {activeOrder.id.replace(/[^\d]/g, '').slice(-4) || '1234'})
                                </label>
                                <div className="relative">
                                  <Key size={11} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500" />
                                  <input type="text" maxLength={4} value={otpInput}
                                    onChange={e => setOtpInput(e.target.value.replace(/[^\d]/g, ''))}
                                    placeholder="0000"
                                    className="w-full pl-7 pr-1 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-amber-500 placeholder-slate-800"
                                  />
                                </div>
                              </div>
                            </div>
                            
                            <button onClick={() => handleMilestoneStep('complete')}
                              className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs uppercase rounded-xl cursor-pointer transition-all">
                              Deliver Order
                            </button>
                            {otpError && <p className="text-[10px] text-red-400 mt-1 text-center font-semibold">{otpError}</p>}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-4">
                <h2 className="text-base font-bold text-white">Delivery History</h2>
                {earningsLogs.length === 0 ? (
                  <div className="py-16 text-center bg-slate-900/20 border border-slate-800 rounded-2xl text-slate-500 text-sm">
                    No delivery history found.
                  </div>
                ) : (
                  <div className="bg-[#0f172a] border border-slate-800/60 rounded-2xl overflow-hidden">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-slate-800/60 text-[10px] text-slate-400 uppercase tracking-widest">
                          <th className="px-5 py-3 text-left font-bold">Date</th>
                          <th className="px-5 py-3 text-left font-bold">Order ID</th>
                          <th className="px-5 py-3 text-left font-bold">Earning</th>
                          <th className="px-5 py-3 text-left font-bold">Incentive</th>
                          <th className="px-5 py-3 text-left font-bold">Bonus</th>
                          <th className="px-5 py-3 text-left font-bold">Total</th>
                          <th className="px-5 py-3 text-left font-bold">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {earningsLogs.map((log, i) => (
                          <tr key={i} className="border-b border-slate-800/30 hover:bg-slate-900/40 transition-colors">
                            <td className="px-5 py-3 text-slate-300 text-xs">{log.date}</td>
                            <td className="px-5 py-3 text-white font-semibold text-xs">#{log.order_id}</td>
                            <td className="px-5 py-3 text-slate-300 text-xs">₹{log.per_delivery_earning}</td>
                            <td className="px-5 py-3 text-slate-300 text-xs">₹{log.incentive}</td>
                            <td className="px-5 py-3 text-slate-300 text-xs">₹{log.bonus}</td>
                            <td className="px-5 py-3 text-emerald-400 font-bold text-xs">₹{Number(log.per_delivery_earning) + Number(log.incentive) + Number(log.bonus)}</td>
                            <td className="px-5 py-3"><span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full text-[9px] font-bold">Delivered</span></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── DELIVERY ORDERS TAB ── */}
          {activeTab === 'delivery_orders' && (
            <div className="space-y-4 text-left text-white">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h2 className="text-base font-bold text-white">Available Marketplace Orders</h2>
                  <p className="text-[11px] text-slate-400">Claim any placed orders to begin delivery and earn payouts.</p>
                </div>
                <div className="relative w-full sm:w-72">
                  <input
                    type="text"
                    placeholder="Search by customer, address, or items..."
                    value={ordersSearchQuery}
                    onChange={(e) => setOrdersSearchQuery(e.target.value)}
                    className="w-full pl-3 pr-8 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500 placeholder-slate-700"
                  />
                </div>
              </div>

              {allOrders.filter(o => 
                (o.customer_name || '').toLowerCase().includes((ordersSearchQuery || '').toLowerCase()) ||
                (o.customer_address || '').toLowerCase().includes((ordersSearchQuery || '').toLowerCase()) ||
                (o.product_details || '').toLowerCase().includes((ordersSearchQuery || '').toLowerCase()) ||
                (o.id || '').toLowerCase().includes((ordersSearchQuery || '').toLowerCase())
              ).length === 0 ? (
                <div className="py-16 text-center bg-slate-900/20 border border-slate-800 rounded-2xl text-slate-500 text-sm">
                  No orders found.
                </div>
              ) : (
                <div className="bg-[#0f172a] border border-slate-800/60 rounded-2xl overflow-hidden">
                  <table className="w-full text-sm animate-fade-in">
                    <thead>
                      <tr className="border-b border-slate-800/60 text-[10px] text-slate-400 uppercase tracking-widest bg-slate-900/40">
                        <th className="px-5 py-3 text-left font-bold">Order ID</th>
                        <th className="px-5 py-3 text-left font-bold">Customer Info</th>
                        <th className="px-5 py-3 text-left font-bold">Details</th>
                        <th className="px-5 py-3 text-left font-bold">Amount</th>
                        <th className="px-5 py-3 text-left font-bold">Status</th>
                        <th className="px-5 py-3 text-center font-bold">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {allOrders.filter(o => 
                        (o.customer_name || '').toLowerCase().includes((ordersSearchQuery || '').toLowerCase()) ||
                        (o.customer_address || '').toLowerCase().includes((ordersSearchQuery || '').toLowerCase()) ||
                        (o.product_details || '').toLowerCase().includes((ordersSearchQuery || '').toLowerCase()) ||
                        (o.id || '').toLowerCase().includes((ordersSearchQuery || '').toLowerCase())
                      ).map((order) => {
                        const canClaim = ['Order Received', 'Preparing', 'Ready For Pickup'].includes(order.status);
                        
                        return (
                          <tr key={order.id} className="border-b border-slate-800/30 hover:bg-slate-900/40 transition-colors">
                            <td className="px-5 py-4 text-white font-bold text-xs shrink-0">#{order.order_number || order.id}</td>
                            <td className="px-5 py-4 text-left">
                              <div className="text-xs font-semibold text-white">{order.customer_name}</div>
                              <div className="text-[10px] text-slate-400 mt-0.5">{order.customer_address}</div>
                              <div className="text-[10px] text-slate-505 mt-0.5">{order.customer_phone}</div>
                            </td>
                            <td className="px-5 py-4 text-slate-300 text-xs max-w-[180px] truncate" title={order.product_details}>
                              {order.product_details}
                            </td>
                            <td className="px-5 py-4 text-amber-500 font-extrabold text-xs">₹{order.amount}</td>
                            <td className="px-5 py-4">
                              <span className={`px-2.5 py-1 text-[9px] font-bold uppercase rounded-full border ${
                                order.status === 'Delivered' || order.status === 'Completed'
                                  ? 'bg-emerald-500/10 text-emerald-450 border-emerald-500/20'
                                  : order.status === 'Cancelled'
                                  ? 'bg-red-500/10 text-red-400 border-red-500/20'
                                  : ['Order Received', 'Preparing', 'Ready For Pickup'].includes(order.status)
                                  ? 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                                  : 'bg-amber-500/10 text-amber-500 border-amber-500/20'
                              }`}>
                                {order.status.replace('Delivery Partner ', '')}
                              </span>
                            </td>
                            <td className="px-5 py-4 text-center shrink-0">
                              {canClaim ? (
                                <button
                                  onClick={() => handleClaimOrder(order.id)}
                                  className="px-3.5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-900 font-black text-[10px] uppercase rounded-xl transition-all cursor-pointer shadow-sm border border-amber-600/30"
                                >
                                  Accept Order
                                </button>
                              ) : (
                                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Assigned / Locked</span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* ── EARNINGS TAB ── */}
          {activeTab === 'earnings' && (
            <div className="space-y-5">
              <h2 className="text-base font-bold text-white">Earning Analytics</h2>
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-[#0f172a] border border-slate-800/60 rounded-2xl p-5">
                  <div className="text-[10px] text-slate-400 uppercase font-bold tracking-widest mb-2">Total Unpaid Balance</div>
                  <div className="text-3xl font-black text-white">₹{earningsLogs.reduce((a, l) => a + Number(l.per_delivery_earning) + Number(l.incentive), 0)}</div>
                  <p className="text-[10px] text-slate-500 mt-2">Settlement every Monday morning</p>
                </div>
                <div className="bg-[#0f172a] border border-slate-800/60 rounded-2xl p-5">
                  <div className="text-[10px] text-slate-400 uppercase font-bold tracking-widest mb-2">Per Delivery Fees</div>
                  <div className="text-3xl font-black text-white">₹{earningsLogs.reduce((a, l) => a + Number(l.per_delivery_earning), 0)}</div>
                </div>
                <div className="bg-[#0f172a] border border-slate-800/60 rounded-2xl p-5">
                  <div className="text-[10px] text-slate-400 uppercase font-bold tracking-widest mb-2">Incentives &amp; Bonuses</div>
                  <div className="text-3xl font-black text-emerald-400">₹{earningsLogs.reduce((a, l) => a + Number(l.incentive) + Number(l.bonus), 0)}</div>
                </div>
              </div>
            </div>
          )}

          {/* ── PROFILE TAB ── */}
          {activeTab === 'profile' && (
            <div className="space-y-5 max-w-xl">
              <h2 className="text-base font-bold text-white">Rider Profile</h2>
              <div className="bg-[#0f172a] border border-slate-800/60 rounded-2xl p-5 space-y-4">
                <div className="flex items-center space-x-4 pb-4 border-b border-slate-800/60">
                  <div className="w-16 h-16 rounded-2xl bg-slate-800 overflow-hidden border border-slate-700">
                    {partnerDetails?.photo
                      ? <img src={partnerDetails.photo} alt="avatar" className="w-full h-full object-cover" />
                      : <User size={30} className="text-slate-500 m-auto mt-3" />
                    }
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">{partnerDetails?.name || displayName}</h3>
                    <p className="text-sm text-slate-400">{partnerDetails?.mobile}</p>
                    <span className="text-[10px] text-emerald-400 font-bold border border-emerald-900/30 bg-emerald-950/20 px-2 py-0.5 rounded-full">KYC Verified ✓</span>
                  </div>
                </div>
                {[
                  { label: 'Vehicle Number',   value: partnerDetails?.vehicle_number,   icon: Truck },
                  { label: 'Vehicle Type',     value: partnerDetails?.vehicle_type,     icon: Car },
                  { label: 'Driving License',  value: partnerDetails?.driving_license,  icon: FileText },
                  { label: 'Aadhaar Card',     value: partnerDetails?.aadhaar,           icon: User },
                  { label: 'Emergency Contact',value: partnerDetails?.emergency_contact, icon: Phone },
                ].map(({ label, value, icon: Icon }) => (
                  <div key={label} className="flex justify-between items-center text-sm border-b border-slate-800/40 pb-3">
                    <span className="text-slate-400 flex items-center space-x-2">
                      <Icon size={14} className="text-slate-500" />
                      <span>{label}</span>
                    </span>
                    <span className="text-white font-semibold">{value || '—'}</span>
                  </div>
                ))}
                <button onClick={onLogOut}
                  className="w-full py-3 bg-red-950/30 hover:bg-red-900/30 border border-red-900/35 text-red-400 font-bold text-sm rounded-xl cursor-pointer text-center transition-all flex items-center justify-center space-x-2">
                  <LogOut size={16} />
                  <span>Sign Out Account</span>
                </button>
              </div>
            </div>
          )}

          {/* ── OTHER TABS (Vehicle, Notifications, Support) ── */}
          {['vehicle', 'notifications', 'support'].includes(activeTab) && (
            <div className="flex flex-col items-center justify-center py-20 text-slate-500">
              <div className="w-16 h-16 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center mb-4 text-slate-600">
                {activeTab === 'vehicle' && <Car size={28} />}
                {activeTab === 'notifications' && <Bell size={28} />}
                {activeTab === 'support' && <Headphones size={28} />}
              </div>
              <p className="text-sm font-semibold text-slate-400 capitalize">{activeTab} section coming soon</p>
              <p className="text-xs text-slate-600 mt-1">This feature will be available in the next update.</p>
            </div>
          )}

        </main>
      </div>

      {/* ═══════════════════════════════════════ MODALS & OVERLAYS ══ */}

      {/* Incoming Assignment */}
      <AnimatePresence>
        {incomingAssignment && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed inset-0 z-[999] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
          >
            <div className="bg-slate-900 border border-amber-500 rounded-3xl p-6 shadow-2xl max-w-sm w-full">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <span className="text-[9px] bg-amber-500/10 text-amber-500 border border-amber-500/20 px-2 py-0.5 rounded-full font-bold uppercase tracking-widest">New Order Assigned</span>
                  <h3 className="text-lg font-bold text-white mt-2">Order #{incomingAssignment.order?.order_number}</h3>
                </div>
                <div className="w-12 h-12 rounded-full border-2 border-amber-500 flex items-center justify-center font-black text-amber-400">{incomingTimer}s</div>
              </div>
              <div className="bg-slate-950/50 p-3 rounded-xl border border-slate-800 space-y-2 mb-4 text-xs text-slate-300">
                <div className="flex items-center space-x-2"><MapPin size={14} className="text-violet-400 shrink-0" /><span>Pickup: <strong>ABC Electronics</strong></span></div>
                <div className="flex items-center space-x-2"><Navigation size={14} className="text-emerald-400 shrink-0" /><span>Drop: {incomingAssignment.order?.customer_address}</span></div>
                <div className="flex justify-between border-t border-slate-800 pt-2">
                  <span>Value: <strong>₹{incomingAssignment.order?.amount}</strong></span>
                  <span>Payout: <strong>₹75.00</strong></span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <button onClick={handleRejectAssignment} className="py-3 rounded-xl border border-slate-800 bg-slate-950 text-slate-400 font-bold text-sm cursor-pointer hover:bg-slate-900">Reject</button>
                <button onClick={handleAcceptAssignment} className="py-3 rounded-xl bg-amber-500 text-slate-900 font-bold text-sm cursor-pointer hover:bg-amber-400">Accept Order</button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* SOS Modal */}
      <AnimatePresence>
        {showSosModal && (
          <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              className="bg-slate-900 border border-red-500 rounded-3xl p-6 shadow-2xl max-w-sm w-full text-center"
            >
              {sosTriggered ? (
                <div className="py-6 animate-pulse">
                  <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-[0_0_30px_rgba(239,68,68,0.4)]">
                    <ShieldAlert size={32} className="text-white animate-bounce" />
                  </div>
                  <h3 className="text-lg font-extrabold text-red-400 uppercase tracking-wider">SOS ALERT TRIGGERED</h3>
                  <p className="text-xs text-slate-300 mt-2 leading-relaxed">Dispatch team notified. Live coordinates broadcasted to vendor & admins.</p>
                </div>
              ) : (
                <>
                  <div className="w-14 h-14 bg-red-950/30 border border-red-900 rounded-full flex items-center justify-center mx-auto mb-4 text-red-500"><ShieldAlert size={28} /></div>
                  <h3 className="text-base font-extrabold text-white">Confirm SOS Dispatch</h3>
                  <p className="text-xs text-slate-400 mt-2">This will broadcast your position and request immediate backup.</p>
                  <div className="bg-slate-950/50 p-3.5 border border-slate-800 rounded-xl my-4 text-left space-y-1.5 text-xs text-slate-400">
                    <p>📞 Emergency: <strong>100</strong></p>
                    <p>📞 Vendor Helpdesk: <strong>+91 98765 43210</strong></p>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <button onClick={() => setShowSosModal(false)} className="py-2.5 rounded-xl border border-slate-800 text-slate-400 font-bold text-sm cursor-pointer hover:bg-slate-800">Cancel</button>
                    <button onClick={triggerSosAlert} className="py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-sm cursor-pointer">Trigger SOS</button>
                  </div>
                </>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* SOS float button when active order */}
      {activeOrder && activeTab === 'orders' && (
        <button
          onClick={() => setShowSosModal(true)}
          className="fixed bottom-6 right-6 z-50 flex items-center space-x-2 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold text-xs uppercase rounded-xl shadow-lg hover:shadow-red-900/40 cursor-pointer transition-all border-none"
        >
          <AlertTriangle size={14} />
          <span>SOS</span>
        </button>
      )}

    </div>
  );
}
