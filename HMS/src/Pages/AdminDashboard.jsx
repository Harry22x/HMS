import React, { useEffect, useState } from 'react';
import { CheckCircle, XCircle, Eye, ShieldCheck } from 'lucide-react';

export default function AdminDashboard() {
  const [pendingHostels, setPendingHostels] = useState([]);

  useEffect(() => {
    fetch('http://127.0.0.1:5555/hostels')
      .then(r => r.json())
      .then(data => {
       
        setPendingHostels(data.filter(h => h.status === 'pending'));
        console.log(data);
      });
  }, []);

  const handleUpdateStatus = async (id, newStatus) => {
    const response = await fetch(`http://127.0.0.1:5555/hostels/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus })
    });

    if (response.ok) {
      setPendingHostels(prev => prev.filter(h => h.id !== id));
      alert(`Hostel ${newStatus} successfully!`);
    }
  };

  return (
    <div className="p-8 bg-slate-50 min-h-screen">
      <div className="max-w-6xl mx-auto">
        <header className="mb-10 flex items-center gap-4">
          <div className="p-3 bg-indigo-600 text-white rounded-2xl shadow-lg shadow-indigo-200">
            <ShieldCheck size={32} />
          </div>
          <div>
            <h1 className="text-3xl font-black text-slate-900">Admin Control Panel</h1>
            <p className="text-slate-500 font-medium">Reviewing {pendingHostels.length} new hostel submissions</p>
          </div>
        </header>

        <div className="grid grid-cols-1 gap-6">
          {pendingHostels.map(hostel => (
            <div key={hostel.id} className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 flex flex-col lg:flex-row gap-6 items-center">
              <img src={hostel.image} className="w-full lg:w-48 h-32 object-cover rounded-2xl" alt="" />
              
              <div className="flex-1 text-center lg:text-left">
                <h2 className="text-xl font-bold text-slate-800">{hostel.name}</h2>
                <p className="text-slate-500 text-sm mb-2">Manager: {hostel.manager_name} ({hostel.manager_email})</p>
                <div className="flex flex-wrap gap-2 justify-center lg:justify-start">
                  {hostel.amenities.split(', ').map(a => (
                    <span key={a} className="text-[10px] uppercase font-bold tracking-widest bg-slate-100 px-2 py-1 rounded-md text-slate-400">{a}</span>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 w-full lg:w-auto">
                <button 
                  onClick={() => handleUpdateStatus(hostel.id, 'approved')}
                  className="flex-1 lg:flex-none bg-emerald-500 text-white px-6 py-3 rounded-xl font-bold hover:bg-emerald-600 transition flex items-center justify-center gap-2"
                >
                  <CheckCircle size={20} /> Approve
                </button>
                <button 
                  onClick={() => handleUpdateStatus(hostel.id, 'rejected')}
                  className="flex-1 lg:flex-none bg-rose-50 text-rose-500 px-6 py-3 rounded-xl font-bold hover:bg-rose-100 transition flex items-center justify-center gap-2"
                >
                  <XCircle size={20} /> Reject
                </button>
              </div>
            </div>
          ))}

          {pendingHostels.length === 0 && (
            <div className="py-20 text-center bg-white rounded-3xl border-2 border-dashed border-slate-200">
              <p className="text-slate-400 font-bold">All caught up! No pending hostels.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}