import React from 'react';
import { 
  LayoutDashboard, ShoppingBag, Briefcase, User, Shield, 
  Settings, FileText, ChevronLeft, ChevronRight, X, Sparkles, 
  Layers, Package, Utensils, BedDouble, Plane, Users, Bell, 
  CreditCard, Calendar, BarChart3, HelpCircle, LogOut
} from 'lucide-react';

export default function ResponsiveSidebar({
  activeView,
  onSelectView,
  isMobileOpen,
  onCloseMobile,
  role = 'customer',
  onRoleChange,
  isCollapsed,
  onToggleCollapse
}) {
  const getNavItems = () => {
    const common = [
      { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { id: 'orders', label: 'Orders & Bookings', icon: Calendar },
      { id: 'profile', label: 'My Profile', icon: User },
    ];

    if (role === 'admin') {
      return [
        { id: 'admin-dashboard', label: 'Admin Portal', icon: Shield, badge: 'Live' },
        { id: 'categories', label: 'Categories (3-Tier)', icon: Layers },
        { id: 'vendors', label: 'Vendor Management', icon: ShoppingBag },
        { id: 'agents', label: 'Agent Network', icon: Users },
        { id: 'reports', label: 'Analytics & Reports', icon: BarChart3 },
        { id: 'settings', label: 'Platform Settings', icon: Settings },
      ];
    }

    if (role === 'vendor') {
      return [
        { id: 'vendor-dashboard', label: 'Vendor Portal', icon: ShoppingBag, badge: 'Pro' },
        { id: 'products', label: 'Catalog / Products', icon: Package },
        { id: 'services', label: 'Service Offerings', icon: Briefcase },
        { id: 'orders', label: 'Store Orders', icon: Calendar },
        { id: 'earnings', label: 'Payouts & Revenue', icon: CreditCard },
        { id: 'profile', label: 'Store Profile', icon: User },
      ];
    }

    // Customer
    return [
      ...common,
      { id: 'products', label: 'Products Mall', icon: Package },
      { id: 'services', label: 'Doorstep Services', icon: Briefcase },
      { id: 'food', label: 'Food Delivery', icon: Utensils },
      { id: 'stay', label: 'Hotels & Stay', icon: BedDouble },
      { id: 'travel', label: 'Travel & Bus', icon: Plane },
      { id: 'membership', label: 'Membership Plan', icon: Sparkles, badge: 'VIP' },
    ];
  };

  const navItems = getNavItems();

  const sidebarContent = (
    <div className="h-full flex flex-col justify-between bg-[#0b132b] text-white select-none">
      {/* Top Header */}
      <div>
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-300 flex items-center justify-center font-black text-slate-950 shrink-0 shadow-lg">
              FI
            </div>
            {!isCollapsed && (
              <div className="flex flex-col truncate">
                <span className="font-extrabold text-sm tracking-wider uppercase text-white truncate">
                  Forge Connect
                </span>
                <span className="text-[10px] text-amber-400 font-bold uppercase tracking-widest">
                  Enterprise Suite
                </span>
              </div>
            )}
          </div>

          {/* Desktop Collapse Button */}
          <button
            onClick={onToggleCollapse}
            className="hidden md:flex p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
            title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          >
            {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          </button>

          {/* Mobile Close Button */}
          <button
            onClick={onCloseMobile}
            className="md:hidden p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Role View Switcher */}
        {!isCollapsed && (
          <div className="p-3 bg-slate-900/60 border-b border-slate-800">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-2">
              Switch Access Role
            </label>
            <div className="grid grid-cols-3 gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-[11px] font-bold">
              {['customer', 'vendor', 'admin'].map((r) => (
                <button
                  key={r}
                  onClick={() => onRoleChange && onRoleChange(r)}
                  className={`py-1.5 rounded-lg capitalize transition-all cursor-pointer border-none ${
                    role === r 
                      ? 'bg-amber-400 text-slate-950 shadow-sm font-extrabold' 
                      : 'text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Navigation Links */}
        <nav className="p-3 space-y-1.5 max-h-[calc(100vh-220px)] overflow-y-auto custom-scrollbar">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  onSelectView(item.id);
                  if (onCloseMobile) onCloseMobile();
                }}
                title={isCollapsed ? item.label : undefined}
                className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl transition-all cursor-pointer text-left text-xs font-bold ${
                  isActive
                    ? 'bg-amber-400 text-slate-950 shadow-md font-extrabold translate-x-1'
                    : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                }`}
              >
                <Icon size={18} className={`shrink-0 ${isActive ? 'text-slate-950' : 'text-amber-400'}`} />
                {!isCollapsed && <span className="truncate flex-grow">{item.label}</span>}
                {!isCollapsed && item.badge && (
                  <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${
                    isActive ? 'bg-slate-950 text-amber-400' : 'bg-amber-400/20 text-amber-300'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer Info */}
      <div className="p-4 border-t border-slate-800">
        {!isCollapsed ? (
          <div className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-900/80 border border-slate-800">
            <div className="w-8 h-8 rounded-full bg-amber-400/20 border border-amber-400/40 text-amber-400 font-bold flex items-center justify-center text-xs shrink-0">
              {role.charAt(0).toUpperCase()}
            </div>
            <div className="flex flex-col truncate">
              <span className="text-xs font-extrabold text-white truncate capitalize">
                {role} Portal
              </span>
              <span className="text-[10px] text-slate-400 truncate">
                Responsive v2.4
              </span>
            </div>
          </div>
        ) : (
          <div className="flex justify-center">
            <div className="w-8 h-8 rounded-full bg-amber-400/20 text-amber-400 font-bold flex items-center justify-center text-xs">
              {role.charAt(0).toUpperCase()}
            </div>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* ── DESKTOP & TABLET SIDEBAR ── */}
      <aside
        className={`hidden md:block sticky top-[72px] h-[calc(100vh-72px)] transition-all duration-300 z-30 shrink-0 border-r border-slate-800 shadow-xl ${
          isCollapsed ? 'w-16' : 'w-64'
        }`}
      >
        {sidebarContent}
      </aside>

      {/* ── MOBILE DRAWER SLIDE-OVER ── */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm transition-opacity"
            onClick={onCloseMobile}
          />
          {/* Slide Drawer */}
          <div className="fixed inset-y-0 left-0 w-72 max-w-[85vw] shadow-2xl animate-slide-right">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
}
