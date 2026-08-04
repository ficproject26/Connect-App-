import React, { useState } from 'react';
import { 
  ShoppingBag, Package, DollarSign, TrendingUp, Users, Plus, 
  Search, Edit3, Trash2, CheckCircle2, AlertCircle, Clock, Eye 
} from 'lucide-react';
import ResponsiveTable from '../../components/common/ResponsiveTable';
import SkeletonLoader from '../../components/common/SkeletonLoader';

export default function VendorDashboardView({
  products = [],
  orders = [],
  onAddProduct,
  onUpdateOrder
}) {
  const [activeSubTab, setActiveSubTab] = useState('overview'); // overview | catalog | orders | settings
  const [searchQuery, setSearchQuery] = useState('');

  // Sample Vendor Stats
  const stats = [
    { title: 'Total Revenue', value: '₹2,48,500', change: '+18.4%', isUp: true, icon: DollarSign, color: 'text-emerald-500 bg-emerald-500/10' },
    { title: 'Store Orders', value: '142', change: '+12%', isUp: true, icon: ShoppingBag, color: 'text-blue-500 bg-blue-500/10' },
    { title: 'Catalog Items', value: products.length || '28', change: 'Active', isUp: true, icon: Package, color: 'text-amber-500 bg-amber-500/10' },
    { title: 'Store Rating', value: '4.9 ★', change: 'Top Vendor', isUp: true, icon: TrendingUp, color: 'text-purple-500 bg-purple-500/10' },
  ];

  // Table columns for Vendor Products
  const productColumns = [
    {
      header: 'Item',
      accessor: 'name',
      render: (row) => (
        <div className="flex items-center gap-3">
          <img
            src={row.image || 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=100&q=80'}
            alt={row.name}
            className="w-10 h-10 rounded-xl object-cover border border-slate-200 dark:border-slate-800 shrink-0"
          />
          <div className="flex flex-col truncate">
            <span className="font-bold text-slate-900 dark:text-white truncate">{row.name}</span>
            <span className="text-[10px] text-slate-400 font-semibold">{row.category || 'General'}</span>
          </div>
        </div>
      )
    },
    {
      header: 'Price',
      accessor: 'price',
      render: (row) => <span className="font-extrabold text-slate-900 dark:text-white">₹{(row.price || 0).toLocaleString()}</span>
    },
    {
      header: 'Stock Status',
      accessor: 'stock',
      render: (row) => (
        <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
          In Stock
        </span>
      )
    },
    {
      header: 'Actions',
      accessor: 'actions',
      render: (row) => (
        <div className="flex items-center gap-2">
          <button className="p-1.5 rounded-lg text-slate-400 hover:text-blue-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer border-none">
            <Edit3 size={15} />
          </button>
          <button className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer border-none">
            <Trash2 size={15} />
          </button>
        </div>
      )
    }
  ];

  // Table columns for Vendor Orders
  const orderColumns = [
    {
      header: 'Order ID',
      accessor: 'order_number',
      render: (row) => <span className="font-mono font-bold text-amber-500">#{row.order_number || row.id || 'ORD-9821'}</span>
    },
    {
      header: 'Customer',
      accessor: 'customer_name',
      render: (row) => <span className="font-bold text-slate-900 dark:text-white">{row.customer_name || 'Rahul Sharma'}</span>
    },
    {
      header: 'Amount',
      accessor: 'amount',
      render: (row) => <span className="font-extrabold text-slate-900 dark:text-white">₹{(row.amount || 1499).toLocaleString()}</span>
    },
    {
      header: 'Status',
      accessor: 'status',
      render: (row) => {
        const st = (row.status || 'Pending').toLowerCase();
        return (
          <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
            st.includes('completed') || st.includes('delivered')
              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
              : st.includes('cancel')
              ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20'
              : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
          }`}>
            {row.status || 'Pending'}
          </span>
        );
      }
    }
  ];

  return (
    <div className="space-y-6 sm:space-y-8 animate-fade-in">

      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div>
          <span className="text-[10px] font-black uppercase tracking-widest text-amber-500 block mb-1">
            Vendor Business Portal
          </span>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white font-sans">
            SK Electronics & Services
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Manage product inventory, incoming orders, and payouts.
          </p>
        </div>

        <button
          onClick={onAddProduct}
          className="w-full sm:w-auto px-5 py-3 bg-amber-400 hover:bg-amber-500 text-slate-950 font-extrabold text-xs uppercase tracking-wider rounded-2xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer border-none"
        >
          <Plus size={16} /> Add New Listing
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((st, i) => {
          const Icon = st.icon;
          return (
            <div key={i} className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-3 shadow-xs">
              <div className="flex justify-between items-center">
                <div className={`p-2.5 rounded-xl ${st.color}`}>
                  <Icon size={20} />
                </div>
                <span className="text-[11px] font-bold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                  {st.change}
                </span>
              </div>
              <div>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">{st.title}</span>
                <span className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white font-sans">{st.value}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Tabs Switcher */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
        {[
          { id: 'overview', label: 'Catalog Inventory' },
          { id: 'orders', label: 'Incoming Orders' },
          { id: 'settings', label: 'Store Profile' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveSubTab(tab.id)}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer border-none ${
              activeSubTab === tab.id
                ? 'bg-[#0b132b] text-white dark:bg-amber-400 dark:text-slate-950 shadow-sm font-extrabold'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* TAB CONTENT: CATALOG */}
      {activeSubTab === 'overview' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3">
            <h2 className="text-base font-black text-slate-900 dark:text-white uppercase tracking-wider font-sans">
              Product & Service Listings ({products.length})
            </h2>
            <div className="relative">
              <Search className="absolute left-3 top-2.5 text-slate-400" size={16} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Filter listings..."
                className="w-full sm:w-64 pl-9 pr-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-amber-400"
              />
            </div>
          </div>

          <ResponsiveTable
            columns={productColumns}
            data={products}
            emptyMessage="No catalog items listed yet. Click 'Add New Listing' to add your products."
          />
        </div>
      )}

      {/* TAB CONTENT: ORDERS */}
      {activeSubTab === 'orders' && (
        <div className="space-y-4">
          <h2 className="text-base font-black text-slate-900 dark:text-white uppercase tracking-wider font-sans">
            Store Orders History
          </h2>
          <ResponsiveTable
            columns={orderColumns}
            data={orders.length > 0 ? orders : [
              { order_number: 'ORD-8812', customer_name: 'Anish Kumar', amount: 3499, status: 'Completed' },
              { order_number: 'ORD-8813', customer_name: 'Priya Sundaram', amount: 1299, status: 'Processing' },
              { order_number: 'ORD-8814', customer_name: 'Vikram Singh', amount: 5999, status: 'Completed' },
            ]}
          />
        </div>
      )}

      {/* TAB CONTENT: STORE PROFILE FORM (Responsive 2-Col Desktop, Single-Col Mobile) */}
      {activeSubTab === 'settings' && (
        <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl space-y-6">
          <h2 className="text-base font-black text-slate-900 dark:text-white uppercase tracking-wider font-sans border-b border-slate-100 dark:border-slate-800 pb-3">
            Vendor Business Profile
          </h2>

          <form onSubmit={(e) => e.preventDefault()} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold uppercase text-slate-400 block mb-1.5">Business Name</label>
                <input
                  type="text"
                  defaultValue="SK Electronics & Appliance Services"
                  className="w-full p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold text-slate-800 dark:text-slate-200"
                />
              </div>
              <div>
                <label className="text-xs font-bold uppercase text-slate-400 block mb-1.5">Contact Phone</label>
                <input
                  type="text"
                  defaultValue="+91 98765 43210"
                  className="w-full p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold text-slate-800 dark:text-slate-200"
                />
              </div>
              <div>
                <label className="text-xs font-bold uppercase text-slate-400 block mb-1.5">GSTIN Number</label>
                <input
                  type="text"
                  defaultValue="29ABCDE1234F1ZH"
                  className="w-full p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold text-slate-800 dark:text-slate-200"
                />
              </div>
              <div>
                <label className="text-xs font-bold uppercase text-slate-400 block mb-1.5">Operating City</label>
                <input
                  type="text"
                  defaultValue="Bangalore, Karnataka"
                  className="w-full p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold text-slate-800 dark:text-slate-200"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end">
              <button
                type="submit"
                className="w-full sm:w-auto px-6 py-3 bg-amber-400 hover:bg-amber-500 text-slate-950 font-extrabold text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer border-none shadow-md"
              >
                Save Store Profile
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
}
