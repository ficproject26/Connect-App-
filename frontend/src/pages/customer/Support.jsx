import React, { useState } from 'react';
import { LifeBuoy, Send, MessageSquare } from 'lucide-react';

export default function Support() {
  const [ticketMessage, setTicketMessage] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (ticketMessage.trim()) {
      alert("Privilege support ticket submitted! Our VIP concierge will contact you within 15 minutes.");
      setTicketMessage('');
    }
  };

  return (
    <div className="p-6 bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-3xl text-left text-white max-w-4xl mx-auto space-y-6">
      <div className="flex items-center space-x-3.5">
        <LifeBuoy className="w-8 h-8 text-[#F4C400]" />
        <div>
          <h2 className="text-xl font-bold">24/7 VIP Concierge & Support</h2>
          <p className="text-xs text-slate-400">Direct channel for member assistance and bookings</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 p-6 bg-slate-950/60 border border-slate-800 rounded-2xl space-y-4">
          <h3 className="font-bold text-sm text-white">Create a Concierge Request</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <textarea 
              rows="5"
              placeholder="Describe your request (e.g. 'I need to book a priority bypass consultation at Apollo clinic next Monday, or book a table for 4 at Celeste Hall tomorrow evening')."
              value={ticketMessage}
              onChange={(e) => setTicketMessage(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-xs text-white focus:outline-none focus:border-[#F4C400] resize-none leading-relaxed"
              required
            />
            <div className="flex justify-end">
              <button type="submit" className="px-5 py-2.5 bg-[#F4C400] hover:bg-yellow-500 text-slate-950 font-bold rounded-xl flex items-center space-x-2 cursor-pointer shadow">
                <Send className="w-4 h-4" />
                <span>Submit Request</span>
              </button>
            </div>
          </form>
        </div>

        <div className="p-6 bg-[#1C2541]/40 border border-slate-800 rounded-2xl flex flex-col justify-between space-y-4 text-xs">
          <div className="space-y-3">
            <h3 className="font-bold text-white">Direct Privilege Helpline</h3>
            <p className="text-slate-450 text-[10px] leading-relaxed">Active members have access to our priority call center with zero hold times.</p>
            <div className="pt-2.5 space-y-2 font-mono">
              <p className="text-slate-350">📞 Toll Free: <span className="text-white font-bold">1800-419-8800</span></p>
              <p className="text-slate-350">✉️ Concierge: <span className="text-[#F4C400] font-bold">vip@connect.com</span></p>
            </div>
          </div>
          <div className="flex items-center space-x-2 bg-emerald-500/10 border border-emerald-500/20 px-3.5 py-2 rounded-xl text-emerald-400 text-[9px] font-bold">
            <MessageSquare className="w-4 h-4 shrink-0" />
            <span>Live Chat Agent Online</span>
          </div>
        </div>
      </div>
    </div>
  );
}
