// src/components/Vault/VaultClients.jsx
import React, { useState } from "react";
import {
  Users, User, Phone, Briefcase, Banknote, Calendar,
  Search, SlidersHorizontal, ArrowRight, X,
  CheckCircle2, TrendingUp
} from "lucide-react";
import CustomTable from "../../CMS/pages/custom/CustomTable";

const mockClients = [
  { _id:"1", name:"Ahmed Al Mansoori",   phone:"+971 50 123 4567", agentId:{ first_name:"John",   last_name:"Doe"   }, referralType:"Referral Only",   status:"qualified",     createdAt:"2025-03-15T10:00:00Z", loanAmount:2500000 },
  { _id:"2", name:"Fatima Hassan",       phone:"+971 55 987 6543", agentId:{ first_name:"Jane",   last_name:"Smith" }, referralType:"Referral + Docs", status:"new",           createdAt:"2025-03-20T14:30:00Z", loanAmount:1200000 },
  { _id:"3", name:"Mohammed Al Rashidi", phone:"+971 56 222 3333", agentId:null,                                       referralType:"Referral Only",   status:"disbursed",     createdAt:"2025-02-10T09:15:00Z", loanAmount:7500000 },
  { _id:"4", name:"Layla Mahmoud",       phone:"+971 50 444 5555", agentId:{ first_name:"Ahmed",  last_name:"Ali"   }, referralType:"Referral + Docs", status:"lost",          createdAt:"2025-03-01T11:20:00Z", loanAmount:3200000 },
  { _id:"5", name:"Tariq Al Balushi",    phone:"+971 52 666 7777", agentId:{ first_name:"Sara",   last_name:"Khan"  }, referralType:"Referral Only",   status:"pre_approved",  createdAt:"2025-01-22T13:00:00Z", loanAmount:4800000 },
  { _id:"6", name:"Noura Al Zaabi",      phone:"+971 58 888 9999", agentId:{ first_name:"Khalid", last_name:"Naser" }, referralType:"Referral + Docs", status:"documentation", createdAt:"2025-02-28T16:45:00Z", loanAmount:900000  },
];

const CLIENT_STATUSES = ["new","contacted","qualified","documentation","bank","pre_approved","valuation","fol_issued","disbursed","lost"];

const statusConfig = {
  new:           { label:"New",           pill:"bg-cyan-50 text-cyan-600 border-cyan-200"          },
  contacted:     { label:"Contacted",     pill:"bg-sky-50 text-sky-600 border-sky-200"              },
  qualified:     { label:"Qualified",     pill:"bg-green-50 text-green-600 border-green-200"        },
  documentation: { label:"Documentation", pill:"bg-amber-50 text-amber-600 border-amber-200"        },
  bank:          { label:"Bank",          pill:"bg-violet-50 text-violet-600 border-violet-200"     },
  pre_approved:  { label:"Pre Approved",  pill:"bg-emerald-50 text-emerald-600 border-emerald-200"  },
  valuation:     { label:"Valuation",     pill:"bg-purple-50 text-purple-600 border-purple-200"     },
  fol_issued:    { label:"FOL Issued",    pill:"bg-teal-50 text-teal-600 border-teal-200"           },
  disbursed:     { label:"Disbursed",     pill:"bg-green-100 text-green-700 border-green-300"       },
  lost:          { label:"Lost",          pill:"bg-red-50 text-red-500 border-red-200"              },
};

const dotColor = {
  new:"bg-cyan-500", contacted:"bg-sky-500", qualified:"bg-green-500",
  documentation:"bg-amber-500", bank:"bg-violet-500", pre_approved:"bg-emerald-500",
  valuation:"bg-purple-500", fol_issued:"bg-teal-500", disbursed:"bg-green-600", lost:"bg-red-500",
};

const cfg     = s  => statusConfig[s] || { label: s, pill: "bg-gray-100 text-gray-500 border-gray-200" };
const dot     = s  => dotColor[s] || "bg-gray-400";
const fmtAED  = n  => n ? `AED ${(n / 1000000).toFixed(1)}M` : "—";
const fmtDate = dt => dt ? new Date(dt).toLocaleDateString("en-GB", { day:"2-digit", month:"short", year:"numeric" }) : "—";
const agentName = a => a ? `${a.first_name || ""} ${a.last_name || ""}`.trim() : "Direct";

const PipelineBar = ({ status }) => {
  const idx = CLIENT_STATUSES.indexOf(status);
  const pct = status === "lost" ? 100 : Math.round(((idx + 1) / (CLIENT_STATUSES.length - 1)) * 100);
  const bar = status === "lost" ? "bg-red-400" : status === "disbursed" ? "bg-green-500" : "bg-purple-600";
  return (
    <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
      <div className={`h-full rounded-full ${bar} transition-all`} style={{ width: `${pct}%` }} />
    </div>
  );
};

const StatusBadge = ({ status }) => {
  const c = cfg(status);
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${c.pill}`}>
      {c.label}
    </span>
  );
};

const StatCard = ({ label, value, icon: Icon, colorCls, bgCls }) => (
  <div className="bg-white rounded-xl border border-gray-100 p-4 flex items-center gap-4 shadow-sm">
    <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${bgCls}`}>
      <Icon size={18} className={colorCls} />
    </div>
    <div>
      <div className={`text-2xl font-bold leading-none ${colorCls}`}>{value}</div>
      <div className="text-xs text-gray-400 font-medium mt-1">{label}</div>
    </div>
  </div>
);

export default function VaultClients() {
  const [search,       setSearch]       = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [statusModal,  setStatusModal]  = useState(null);

  const clients = mockClients;

  const filtered = clients.filter(c =>
    (statusFilter === "All" || c.status === statusFilter) &&
    ((c.name  || "").toLowerCase().includes(search.toLowerCase()) ||
     (c.phone || "").includes(search))
  );

  const stats = {
    total:     clients.length,
    new:       clients.filter(c => c.status === "new").length,
    qualified: clients.filter(c => c.status === "qualified").length,
    disbursed: clients.filter(c => c.status === "disbursed").length,
    lost:      clients.filter(c => c.status === "lost").length,
  };

  const columns = [
    {
      key: "name",
      title: "Client",
      sortable: true,
      render: (_, row) => (
        <div className="flex items-center gap-3 py-1">
          <div className="w-9 h-9 rounded-lg bg-purple-50 border border-purple-100 flex items-center justify-center flex-shrink-0">
            <span className="text-sm font-bold text-purple-700">{(row.name || "?")[0].toUpperCase()}</span>
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-800">{row.name || "—"}</p>
            <p className="text-xs text-gray-400 flex items-center gap-1">
              <Phone size={10} />{row.phone || "—"}
            </p>
          </div>
        </div>
      ),
    },
    {
      key: "agent",
      title: "Agent",
      render: (_, row) => (
        <div className="flex items-center gap-2">
          <Briefcase size={13} className="text-gray-400 flex-shrink-0" />
          <div>
            <p className="text-sm font-medium text-gray-700">{agentName(row.agentId)}</p>
            {row.agentId && <p className="text-xs text-gray-400">Agent</p>}
          </div>
        </div>
      ),
    },
    {
      key: "loanAmount",
      title: "Loan Value",
      sortable: true,
      render: (_, row) => (
        <div className="flex items-center gap-1.5">
          <Banknote size={13} className="text-purple-500 flex-shrink-0" />
          <span className="text-sm font-bold text-purple-700">{fmtAED(row.loanAmount)}</span>
        </div>
      ),
    },
    {
      key: "pipeline",
      title: "Pipeline",
      render: (_, row) => (
        <div className="min-w-[100px]">
          <PipelineBar status={row.status} />
        </div>
      ),
    },
    {
      key: "status",
      title: "Status",
      render: (_, row) => <StatusBadge status={row.status} />,
    },
    {
      key: "createdAt",
      title: "Created",
      sortable: true,
      render: (_, row) => (
        <div className="flex items-center gap-1.5 text-xs text-gray-500">
          <Calendar size={12} className="flex-shrink-0" />
          {fmtDate(row.createdAt)}
        </div>
      ),
    },
    {
      key: "actions",
      title: "Action",
      render: (_, row) => (
        <button
          onClick={() => setStatusModal(row)}
          className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold border border-purple-200 text-purple-700 bg-purple-50 rounded-lg hover:bg-purple-700 hover:text-white hover:border-purple-700 transition"
        >
          Update <ArrowRight size={11} />
        </button>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-8">

      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-9 h-9 rounded-lg bg-purple-700 flex items-center justify-center">
          <Users size={17} className="text-white" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-gray-900">Clients</h1>
          <p className="text-sm text-gray-500">Track mortgage clients through the entire pipeline</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-5 gap-4 mb-6">
        <StatCard label="Total"     value={stats.total}     icon={Users}        colorCls="text-purple-700"  bgCls="bg-purple-50"  />
        <StatCard label="New"       value={stats.new}       icon={User}         colorCls="text-sky-600"     bgCls="bg-sky-50"     />
        <StatCard label="Qualified" value={stats.qualified} icon={CheckCircle2} colorCls="text-green-600"   bgCls="bg-green-50"   />
        <StatCard label="Disbursed" value={stats.disbursed} icon={TrendingUp}   colorCls="text-emerald-600" bgCls="bg-emerald-50" />
        <StatCard label="Lost"      value={stats.lost}      icon={X}            colorCls="text-red-500"     bgCls="bg-red-50"     />
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-100 px-4 py-3 mb-4 flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            placeholder="Search by name or phone..."
            value={search} onChange={e => setSearch(e.target.value)}
            className="w-full pl-8 pr-4 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100 transition"
          />
        </div>
        <div className="flex items-center gap-2">
          <SlidersHorizontal size={14} className="text-gray-400 flex-shrink-0" />
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
            className="text-sm border border-gray-200 rounded-lg px-3 py-2 outline-none focus:border-purple-500 bg-white text-gray-700 cursor-pointer">
            <option value="All">All Statuses</option>
            {CLIENT_STATUSES.map(s => <option key={s} value={s}>{cfg(s).label}</option>)}
          </select>
        </div>
        <span className="ml-auto text-xs text-gray-400 font-medium">
          {filtered.length} of {clients.length} clients
        </span>
      </div>

      {/* Table */}
      <CustomTable
        columns={columns}
        data={filtered}
        showSearch={false}
      />

      {/* Status Modal */}
      {statusModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl">
            <div className="flex items-start justify-between p-5 border-b border-gray-100">
              <div>
                <h3 className="text-base font-bold text-gray-800">Update Status</h3>
                <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-1">
                  <User size={11} />{statusModal.name} · {statusModal.phone}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <StatusBadge status={statusModal.status} />
                <button onClick={() => setStatusModal(null)} className="p-1 rounded-lg hover:bg-gray-100 transition">
                  <X size={16} className="text-gray-400" />
                </button>
              </div>
            </div>

            <div className="p-4 flex flex-col gap-1.5 max-h-72 overflow-y-auto">
              {CLIENT_STATUSES.map(s => {
                const isCurrent = s === statusModal.status;
                return (
                  <button key={s} onClick={() => setStatusModal(null)}
                    className={`flex items-center justify-between w-full px-3 py-2.5 rounded-lg border text-left transition hover:translate-x-1
                      ${isCurrent ? "border-purple-200 bg-purple-50" : "border-gray-100 bg-white hover:border-gray-200 hover:bg-gray-50"}`}>
                    <div className="flex items-center gap-2.5">
                      <span className={`w-2 h-2 rounded-full flex-shrink-0 ${dot(s)}`} />
                      <span className={`text-sm ${isCurrent ? "font-700 font-bold text-purple-700" : "font-medium text-gray-700"}`}>
                        {cfg(s).label}
                      </span>
                    </div>
                    {isCurrent && (
                      <span className="text-xs font-bold text-purple-600 bg-purple-100 px-2 py-0.5 rounded-full">Current</span>
                    )}
                  </button>
                );
              })}
            </div>

            <div className="p-4 pt-0">
              <button onClick={() => setStatusModal(null)}
                className="w-full py-2.5 text-sm font-semibold border border-gray-200 text-gray-500 rounded-lg hover:bg-gray-50 transition">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}