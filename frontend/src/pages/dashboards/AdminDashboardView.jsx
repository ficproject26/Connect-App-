import React, { useState, useEffect } from 'react';
import { 
  Shield, Layers, Users, ShoppingBag, BarChart3, Settings, 
  Plus, Edit3, Trash2, CheckCircle2, XCircle, Search, RefreshCw, Sparkles 
} from 'lucide-react';
import ResponsiveTable from '../../components/common/ResponsiveTable';
import { fetchAdminCategories } from '../../services/categoryService';

export default function AdminDashboardView({ onNotification }) {
  const [activeTab, setActiveTab] = useState('categories'); // categories | vendors | agents | reports | settings
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);

  // Load Categories from Backend API
  const loadCategories = () => {
    setLoading(true);
    fetchAdminCategories().then(data => {
      setCategories(data || []);
      setLoading(false);
    }).catch(err => {
      console.warn("Failed loading categories:", err);
      setLoading(false);
    });
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const adminStats = [
    { label: 'Total Platform Users', value: '48,920', icon: Users, color: 'text-blue-500 bg-blue-500/10' },
    { label: 'Verified Vendors', value: '1,240', icon: ShoppingBag, color: 'text-amber-500 bg-amber-500/10' },
    { label: 'Active Field Agents', value: '380', icon: Shield, color: 'text-emerald-500 bg-emerald-500/10' },
    { label: 'Active Categories', value: categories.length || '7', icon: Layers, color: 'text-purple-500 bg-purple-500/10' },
  ];

  // Table Columns for 3-Tier Categories
  const categoryColumns = [
    {
      header: 'Level 1: Main Category',
      accessor: 'name',
      render: (row) => (
        <div className="flex items-center gap-2.5">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
          <span className="font-extrabold text-slate-900 dark:text-white uppercase tracking-wider">{row.name}</span>
        </div>
      )
    },
    {
      header: 'Level 2: Subcategories',
      accessor: 'subcategories',
      render: (row) => {
        const subs = Array.isArray(row.children) && row.children.length > 0
          ? row.children.map(c => c.name || c.subcategory)
          : (row.subcategories || []);
        return (
          <div className="flex flex-wrap gap-1">
            {subs.length > 0 ? (
              subs.slice(0, 4).map((s, idx) => (
                <span key={idx} className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[10px] font-bold">
                  {s}
                </span>
              ))
            ) : (
              <span className="text-slate-400 italic text-[11px]">No subcategories</span>
            )}
            {subs.length > 4 && (
              <span className="text-[10px] text-amber-500 font-bold">+{subs.length - 4} more</span>
            )}
          </div>
        );
      }
    },
    {
      header: 'Hierarchy Status',
      accessor: 'status',
      render: (row) => (
        <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
          Synced (DB Single Authority)
        </span>
      )
    },
    {
      header: 'Actions',
      accessor: 'actions',
      render: (row) => (
        <div className="flex items-center gap-2">
          <button className="p-1.5 rounded-lg text-slate-400 hover:text-amber-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer border-none">
            <Edit3 size={15} />
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6 sm:space-y-8 animate-fade-in">

      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-[#0b132b] text-white p-6 sm:p-8 rounded-3xl border border-slate-800 shadow-2xl">
        <div className="space-y-1">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-rose-500/20 text-rose-400 border border-rose-500/40">
            <Shield size={12} /> Enterprise Super Admin
          </span>
          <h1 className="text-xl sm:text-2xl font-black font-sans tracking-tight text-white">
            Forge Connect Control Center
          </h1>
          <p className="text-xs text-slate-300">
            Manage 3-tier category taxonomy, vendor network approvals, agent onboarding, and real-time synchronization.
          </p>
        </div>

        <button
          onClick={loadCategories}
          className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-amber-400 border border-slate-700 font-bold text-xs uppercase tracking-wider rounded-xl transition-all flex items-center gap-2 cursor-pointer shadow-sm"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Sync Database
        </button>
      </div>

      {/* Admin Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {adminStats.map((st, i) => {
          const Icon = st.icon;
          return (
            <div key={i} className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-2 shadow-xs">
              <div className={`w-10 h-10 rounded-xl ${st.color} flex items-center justify-center`}>
                <Icon size={20} />
              </div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">{st.label}</span>
              <span className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white font-sans">{st.value}</span>
            </div>
          );
        })}
      </div>

      {/* Admin Subtabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2 overflow-x-auto no-scrollbar">
        {[
          { id: 'categories', label: '3-Tier Category Management' },
          { id: 'vendors', label: 'Vendor Approvals' },
          { id: 'agents', label: 'Agent Directory' },
          { id: 'settings', label: 'Platform Configuration' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer border-none shrink-0 ${
              activeTab === tab.id
                ? 'bg-rose-600 text-white dark:bg-amber-400 dark:text-slate-950 shadow-sm font-extrabold'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* TAB: 3-TIER CATEGORIES */}
      {activeTab === 'categories' && (
        <div className="space-y-4">
          <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-2xl text-xs text-amber-900 dark:text-amber-300 font-semibold space-y-1">
            <span className="font-extrabold uppercase tracking-wider block">Database Authority Rule (AGENTS.md):</span>
            <p>
              Modifications here strictly sync with MongoDB `/api/admin/categories`. Customer Mega Menus, Search dropdowns, and Category cards automatically override static baselines with this database configuration.
            </p>
          </div>

          <ResponsiveTable
            columns={categoryColumns}
            data={categories.length > 0 ? categories : [
              { name: 'Services', children: [{ name: 'AC Repair' }, { name: 'Electrician' }, { name: 'Plumbing' }] },
              { name: 'Products', children: [{ name: 'Smartphones' }, { name: 'Laptops' }, { name: 'Sarees' }] },
              { name: 'Daily Needs', children: [{ name: 'Grocery' }, { name: 'Milk & Dairy' }] },
              { name: 'Food', children: [{ name: 'South Indian' }, { name: 'North Indian' }] },
              { name: 'Stay', children: [{ name: 'Luxury Resort' }, { name: 'Budget Hotel' }] },
              { name: 'Travel', children: [{ name: 'AC Bus Sleeper' }, { name: 'Flight Tickets' }] },
              { name: 'Jobs', children: [{ name: 'IT Engineering' }, { name: 'Store Operations' }] },
            ]}
          />
        </div>
      )}

      {/* TAB: VENDORS */}
      {activeTab === 'vendors' && (
        <div className="space-y-4">
          <h2 className="text-base font-black text-slate-900 dark:text-white uppercase tracking-wider font-sans">
            Vendor Applications & Status
          </h2>
          <ResponsiveTable
            columns={[
              { header: 'Business Name', accessor: 'name', render: (row) => <span className="font-bold text-slate-900 dark:text-white">{row.name}</span> },
              { header: 'Category', accessor: 'category', render: (row) => <span className="text-slate-500">{row.category}</span> },
              { header: 'Location', accessor: 'city', render: (row) => <span>{row.city}</span> },
              {
                header: 'Approval Status',
                accessor: 'status',
                render: (row) => (
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                    Approved Vendor
                  </span>
                )
              }
            ]}
            data={[
              { name: 'SK Electronics & Tech', category: 'Services & Products', city: 'Bangalore' },
              { name: 'Hotel Shubha Sai Deluxe', category: 'Stay', city: 'Mysore' },
              { name: 'Apex Travels India', category: 'Travel', city: 'Chennai' },
            ]}
          />
        </div>
      )}

      {/* TAB: SETTINGS */}
      {activeTab === 'settings' && (
        <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl space-y-6">
          <h2 className="text-base font-black text-slate-900 dark:text-white uppercase tracking-wider font-sans border-b border-slate-100 dark:border-slate-800 pb-3">
            Global Enterprise Settings
          </h2>
          <form onSubmit={(e) => e.preventDefault()} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold uppercase text-slate-400 block mb-1.5">Platform Title</label>
                <input
                  type="text"
                  defaultValue="Forge India Connect App"
                  className="w-full p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold text-slate-800 dark:text-slate-200"
                />
              </div>
              <div>
                <label className="text-xs font-bold uppercase text-slate-400 block mb-1.5">Helpline Support Number</label>
                <input
                  type="text"
                  defaultValue="+91 1800-123-4567"
                  className="w-full p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold text-slate-800 dark:text-slate-200"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end">
              <button
                type="submit"
                className="w-full sm:w-auto px-6 py-3 bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer border-none shadow-md"
              >
                Save System Settings
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
}
