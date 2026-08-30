import React, { useState, useEffect } from 'react';
import { 
  Calendar, ShoppingBag, CheckCircle2, Clock, XCircle, 
  CreditCard, FileText, Download, LifeBuoy, ArrowRight 
} from 'lucide-react';
import ResponsiveTable from '../../components/common/ResponsiveTable';
import { apiFetch } from '../../services/api';

export default function OrdersBookingsView({ orders = [], onOpenSupportModal }) {
  const [activeTab, setActiveTab] = useState('orders'); // orders | bookings | payments
  const [liveOrders, setLiveOrders] = useState(orders);

  useEffect(() => {
    if (orders && orders.length > 0) {
      setLiveOrders(orders);
    } else {
      apiFetch('/orders').then(res => {
        const list = Array.isArray(res) ? res : (Array.isArray(res?.data) ? res.data : (res?.data?.orders || res?.orders || []));
        setLiveOrders(list);
      }).catch(() => {});
    }
  }, [orders]);

  const displayOrders = liveOrders;

  const columns = [
    {
      header: 'Booking / Order #',
      accessor: 'order_number',
      render: (row) => (
        <div className="flex flex-col">
          <span className="font-mono font-bold text-amber-500">#{row.order_number || 'ORD-9021'}</span>
          <span className="text-[10px] text-slate-400 font-semibold">{row.date || 'Today'}</span>
        </div>
      )
    },
    {
      header: 'Item / Package',
      accessor: 'items',
      render: (row) => <span className="font-bold text-slate-900 dark:text-white">{row.items || row.product_details || 'Connect Offering'}</span>
    },
    {
      header: 'Category',
      accessor: 'type',
      render: (row) => (
        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
          {row.type || 'Service'}
        </span>
      )
    },
    {
      header: 'Total Paid',
      accessor: 'amount',
      render: (row) => <span className="font-extrabold text-slate-900 dark:text-white">₹{(row.amount || 0).toLocaleString()}</span>
    },
    {
      header: 'Status',
      accessor: 'status',
      render: (row) => {
        const st = (row.status || 'Completed').toLowerCase();
        return (
          <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
            st.includes('completed') || st.includes('delivered')
              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
              : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
          }`}>
            {row.status || 'Completed'}
          </span>
        );
      }
    },
    {
      header: 'Actions',
      accessor: 'actions',
      render: (row) => (
        <button
          onClick={() => onOpenSupportModal && onOpenSupportModal(row)}
          className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-amber-400 hover:text-slate-950 text-slate-700 dark:text-slate-300 text-[10.5px] font-extrabold transition-all cursor-pointer border-none"
        >
          Support / Refund
        </button>
      )
    }
  ];

  return (
    <div className="space-y-6 sm:space-y-8 animate-fade-in">
      
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-2">
        <span className="text-[10px] font-black uppercase tracking-widest text-amber-500">
          User Account Center
        </span>
        <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white font-sans">
          My Orders & Active Bookings
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Track real-time delivery status, view digital receipts, or raise instant support tickets.
        </p>
      </div>

      <ResponsiveTable
        columns={columns}
        data={displayOrders}
      />

    </div>
  );
}
