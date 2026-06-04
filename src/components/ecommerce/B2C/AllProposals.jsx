import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiService } from '../../../manageApi/utils/custom.apiservice';
import { FileText, Loader2, AlertCircle, Eye, Search } from 'lucide-react';
import CustomTable from '../../CMS/pages/custom/CustomTable';

const PURPLE = '#5C039B';

const STATUS_STYLES = {
  draft: { bg: '#F3F4F6', color: '#6B7280', label: 'Draft' },
  sent: { bg: '#EFF6FF', color: '#2563EB', label: 'Sent' },
  accepted: { bg: '#ECFDF5', color: '#059669', label: 'Accepted' },
  rejected: { bg: '#FEF2F2', color: '#DC2626', label: 'Rejected' },
};

const StatusBadge = ({ status }) => {
  const s = STATUS_STYLES[status] || { bg: '#F3F4F6', color: '#6B7280', label: status };
  return (
    <span style={{ padding: '3px 10px', borderRadius: 99, fontSize: 12, fontWeight: 600, background: s.bg, color: s.color }}>
      {s.label}
    </span>
  );
};

const AllProposals = () => {
  const [proposals, setProposals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  const fetchProposals = async (page = 1, limit = 10) => {
    try {
      setLoading(true);
      const res = await apiService.get(`/vault/proposals?page=${page}&limit=${limit}&search=${search}`);
      const data = res?.data || {};
      setProposals(data.proposals || data.data || []);
      setTotalItems(data.total || 0);
    } catch (err) {
      setError('Failed to load proposals');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProposals(currentPage, itemsPerPage);
  }, [currentPage, itemsPerPage, search]);

  const columns = [
    {
      key: 'lead',
      title: 'Lead',
      render: (_, row) => (
        <div>
          <p style={{ fontWeight: 600, color: '#111827', margin: 0 }}>{row.lead?.customerInfo?.fullName || 'N/A'}</p>
          <p style={{ fontSize: 12, color: '#6B7280', margin: 0 }}>{row.lead?.customerInfo?.email}</p>
        </div>
      ),
    },
    {
      key: 'loanAmount',
      title: 'Loan Amount',
      render: (_, row) => <span>AED {row.loanAmount?.toLocaleString()}</span>,
    },
    {
      key: 'interestRate',
      title: 'Rate',
      render: (_, row) => <span>{row.interestRate}%</span>,
    },
    {
      key: 'tenure',
      title: 'Tenure',
      render: (_, row) => <span>{row.tenureYears} yrs</span>,
    },
    {
      key: 'status',
      title: 'Status',
      render: (_, row) => <StatusBadge status={row.status} />,
    },
    {
      key: 'createdAt',
      title: 'Created',
      render: (_, row) => <span>{new Date(row.createdAt).toLocaleDateString()}</span>,
    },
    {
      key: 'actions',
      title: '',
      render: (_, row) => (
        <button
          onClick={() => navigate(`/dashboard/xotovaultpartner/proposals/${row._id}`)}
          style={{ padding: '5px 10px', background: 'transparent', border: '1px solid #E5E7EB', borderRadius: 6, cursor: 'pointer' }}
        >
          <Eye size={14} color={PURPLE} />
        </button>
      ),
    },
  ];

  const filteredProposals = proposals;

  return (
    <div style={{ padding: '28px 24px', background: '#F9FAFB', minHeight: '100vh' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: '#111827', margin: 0 }}>All Proposals</h1>
      </div>

      <div style={{ marginBottom: 20, maxWidth: 400, position: 'relative' }}>
        <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF' }} />
        <input
          type="text"
          placeholder="Search proposals..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ width: '100%', padding: '10px 12px 10px 36px', border: '1px solid #E5E7EB', borderRadius: 10, fontSize: 13, outline: 'none' }}
        />
      </div>

      {loading ? (
        <div className="flex justify-center py-10">
          <Loader2 className="w-8 h-8 animate-spin" style={{ color: PURPLE }} />
        </div>
      ) : error ? (
        <div className="text-center py-10 text-red-500">
          <AlertCircle className="w-8 h-8 mx-auto mb-2" />
          {error}
        </div>
      ) : (
        <CustomTable
          columns={columns}
          data={filteredProposals}
          loading={loading}
          currentPage={currentPage}
          itemsPerPage={itemsPerPage}
          totalItems={totalItems}
          onPageChange={(page, size) => {
            setCurrentPage(page);
            if (size !== itemsPerPage) setItemsPerPage(size);
          }}
        />
      )}
    </div>
  );
};

export default AllProposals;