import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Tag, Tooltip, Modal, message, Image } from 'antd';
import { useSelector } from 'react-redux';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  HomeOutlined,
} from '@ant-design/icons';
import { apiService } from '../../manageApi/utils/custom.apiservice';
import CustomTable from '../../components/CMS/pages/custom/CustomTable';

const THEME = { primary: '#7c3aed' };

// ── Property model ke enum values se match ──────────────────────────────────
const FURNISHING_COLORS = {
  furnished:      'green',
  semi_furnished: 'blue',
  unfurnished:    'default',
};

const FURNISHING_LABELS = {
  furnished:      'Furnished',
  semi_furnished: 'Semi Furnished',
  unfurnished:    'Unfurnished',
};

const UNIT_TYPE_COLORS = {
  apartment: 'purple',
  villa:     'gold',
  penthouse: 'magenta',
  townhouse: 'cyan',
  duplex:    'orange',
  plot:      'lime',
  office:    'blue',
  retail:    'volcano',
  warehouse: 'geekblue',
};

const BEDROOM_LABELS = {
  studio: 'Studio',
  '1bed': '1 BHK',
  '2bed': '2 BHK',
  '3bed': '3 BHK',
  '4bed': '4 BHK',
  '5bed': '5 BHK',
  '6bed': '6 BHK',
  '7bed': '7 BHK',
  '8plus': '8+ BHK',
};

// ── Role slug helper (same as existing code) ─────────────────────────────────
const ROLE_SLUG_MAP = {
  0: 'superadmin', 1: 'admin',     2: 'customer',
  15: 'agency',   16: 'agent',    17: 'developer', 18: 'vault-admin',
};

// ─────────────────────────────────────────────────────────────────────────────

const RentalPropertyList = () => {
  const { user }   = useSelector((s) => s.auth);
  const roleSlug   = ROLE_SLUG_MAP[user?.role?.code] ?? 'superadmin';
  const navigate   = useNavigate();

  const [data,         setData]         = useState([]);
  const [loading,      setLoading]      = useState(false);
  const [totalItems,   setTotalItems]   = useState(0);
  const [currentPage,  setCurrentPage]  = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [activeFilters, setActiveFilters] = useState({});

  const [deleteModal,   setDeleteModal]   = useState({ open: false, record: null });
  const [deleteLoading, setDeleteLoading] = useState(false);

  // ── FETCH — useCallback se bilkul hatao, simple async function ──────────
  const fetchProperties = async (page, limit, filters) => {
    try {
      setLoading(true);

      const params = new URLSearchParams({
        propertySubType: 'rental',
        page,
        limit,
      });

      if (filters.search)          params.set('search',          filters.search);
      if (filters.unitType)        params.set('unitType',        filters.unitType);
      if (filters.bedroomType)     params.set('bedroomType',     filters.bedroomType);
      if (filters.furnishing)      params.set('furnishing',      filters.furnishing);
      if (filters.city)            params.set('city',            filters.city);
      if (filters.area)            params.set('area',            filters.area);
      if (filters.rentalFrequency) params.set('rentalFrequency', filters.rentalFrequency);
      if (filters.approvalStatus)  params.set('approvalStatus',  filters.approvalStatus);
      if (filters.listingStatus)   params.set('listingStatus',   filters.listingStatus);
      if (filters.minPrice)        params.set('minPrice',        filters.minPrice);
      if (filters.maxPrice)        params.set('maxPrice',        filters.maxPrice);
      if (filters.isImmediate !== undefined && filters.isImmediate !== '')
                                   params.set('isImmediate',     filters.isImmediate);
      if (filters.isShortTerm !== undefined && filters.isShortTerm !== '')
                                   params.set('isShortTerm',     filters.isShortTerm);
      if (filters.hasView !== undefined && filters.hasView !== '')
                                   params.set('hasView',         filters.hasView);
      if (filters.sortBy)          params.set('sortBy',          filters.sortBy);
      if (filters.sortOrder)       params.set('sortOrder',       filters.sortOrder);

      const res = await apiService.get(`/properties?${params.toString()}`);

     

      const raw   = res?.data ?? res;
      const list  = Array.isArray(raw?.data)  ? raw.data  :
                    Array.isArray(raw)         ? raw       : [];
      const total = raw?.pagination?.totalItems ?? raw?.count ?? list.length;

      setData(list);
      setTotalItems(total);
    } catch (err) {
      message.error('Failed to load rental properties.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // ── Single useEffect — sirf ek baar mount pe ────────────────────────────
  useEffect(() => {
    fetchProperties(1, 10, {});
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── HANDLERS ─────────────────────────────────────────────────────────────
  const handlePageChange = (page, size) => {
    setCurrentPage(page);
    setItemsPerPage(size);
    fetchProperties(page, size, activeFilters);
  };

  const handleFilter = (filters) => {
    const cleaned = Object.fromEntries(
      Object.entries(filters).filter(([, v]) => v !== '' && v !== undefined && v !== null)
    );
    setActiveFilters(cleaned);
    setCurrentPage(1);
    fetchProperties(1, itemsPerPage, cleaned);  // itemsPerPage state se direct
  };

  const handleDelete = async () => {
    if (!deleteModal.record) return;
    try {
      setDeleteLoading(true);
      await apiService.delete(`/properties/${deleteModal.record._id}`);
      message.success(`"${deleteModal.record.propertyName}" deleted successfully.`);
      setDeleteModal({ open: false, record: null });
      fetchProperties(currentPage, itemsPerPage, activeFilters);
    } catch (err) {
      message.error(err?.response?.data?.message || 'Failed to delete property.');
    } finally {
      setDeleteLoading(false);
    }
  };

  // ── Helper: first available image from photos object ─────────────────────
  const getFirstImage = (record) => {
    const p = record.photos;
    if (!p) return record.mainLogo || null;
    return (
      p.architecture?.[0] ||
      p.interior?.[0]     ||
      p.lobby?.[0]        ||
      p.other?.[0]        ||
      record.mainLogo     ||
      null
    );
  };

  // ── COLUMNS ──────────────────────────────────────────────────────────────
  const columns = [
    // ── Image ──────────────────────────────────────────────────────────────
    {
      key:      'photos',
      title:    'Image',
      sortable: false,
      render: (_, record) => {
        const src = getFirstImage(record);
        return src ? (
          <Image
            src={src}
            alt={record.propertyName}
            width={60}
            height={46}
            style={{ objectFit: 'cover', borderRadius: 6, border: '1px solid #e5e7eb' }}
            preview={{ mask: <EyeOutlined style={{ fontSize: 12 }} /> }}
          />
        ) : (
          <div style={{
            width: 60, height: 46, borderRadius: 6,
            background: '#ede9fe', display: 'flex',
            alignItems: 'center', justifyContent: 'center',
            border: '1px solid #ddd6fe',
          }}>
            <HomeOutlined style={{ color: THEME.primary, fontSize: 18 }} />
          </div>
        );
      },
    },

    // ── Property Name + Area ───────────────────────────────────────────────
    {
      key:      'propertyName',   // ← model field
      title:    'Property',
      sortable: true,
      render: (val, record) => (
        <div>
          <div style={{ fontWeight: 600, fontSize: 13, color: '#111827', maxWidth: 220 }}
            className="truncate">
            {val}
          </div>
          <div style={{ fontSize: 11, color: '#6b7280', marginTop: 2 }}>
            {record.area ? `${record.area}, ` : ''}{record.city}
          </div>
          {record.unitNumber && (
            <div style={{ fontSize: 10, color: '#9ca3af' }}>
              Unit {record.unitNumber}
              {record.floorNumber ? ` · Floor ${record.floorNumber}` : ''}
            </div>
          )}
        </div>
      ),
    },

    // ── Unit Type ─────────────────────────────────────────────────────────
    {
      key:         'unitType',   // ← model field
      title:       'Type',
      sortable:    true,
      filterable:  true,
      filterKey:   'unitType',
      filterOptions: [
        { label: 'Apartment',  value: 'apartment'  },
        { label: 'Villa',      value: 'villa'      },
        { label: 'Townhouse',  value: 'townhouse'  },
        { label: 'Duplex',     value: 'duplex'     },
        { label: 'Penthouse',  value: 'penthouse'  },
        { label: 'Office',     value: 'office'     },
        { label: 'Retail',     value: 'retail'     },
        { label: 'Warehouse',  value: 'warehouse'  },
      ],
      render: (val) =>
        val ? (
          <Tag color={UNIT_TYPE_COLORS[val] || 'default'} style={{ textTransform: 'capitalize', fontWeight: 500 }}>
            {val}
          </Tag>
        ) : '—',
    },

    // ── Bedroom Type ──────────────────────────────────────────────────────
    {
      key:         'bedroomType',   // ← model field
      title:       'BHK',
      sortable:    false,
      filterable:  true,
      filterKey:   'bedroomType',
      filterOptions: [
        { label: 'Studio', value: 'studio' },
        { label: '1 BHK',  value: '1bed'   },
        { label: '2 BHK',  value: '2bed'   },
        { label: '3 BHK',  value: '3bed'   },
        { label: '4 BHK',  value: '4bed'   },
        { label: '5+ BHK', value: '5bed'   },
      ],
      render: (val) => val ? (BEDROOM_LABELS[val] || val) : '—',
    },

    // ── Annual Rent ───────────────────────────────────────────────────────
    {
      key:      'price',   // ← model field
      title:    'Annual Rent',
      sortable: true,
      render: (val, record) => {
        const displayPrice = val || record.price_min;
        return displayPrice ? (
          <div>
            <span style={{ fontWeight: 600, color: '#059669' }}>
              AED {Number(displayPrice).toLocaleString()}
            </span>
            {record.rentalFrequency && (
              <div style={{ fontSize: 10, color: '#6b7280', textTransform: 'capitalize' }}>
                / {record.rentalFrequency}
              </div>
            )}
          </div>
        ) : '—';
      },
    },

    // ── Furnishing ────────────────────────────────────────────────────────
    {
      key:         'furnishing',   // ← model field
      title:       'Furnishing',
      sortable:    true,
      filterable:  true,
      filterKey:   'furnishing',
      filterOptions: [
        { label: 'Furnished',      value: 'furnished'      },
        { label: 'Semi Furnished', value: 'semi_furnished' },
        { label: 'Unfurnished',    value: 'unfurnished'    },
      ],
      render: (val) =>
        val ? (
          <Tag color={FURNISHING_COLORS[val] || 'default'}>
            {FURNISHING_LABELS[val] || val}
          </Tag>
        ) : '—',
    },

    // ── City ──────────────────────────────────────────────────────────────
    {
      key:         'city',   // ← model field
      title:       'City',
      sortable:    true,
      filterable:  true,
      filterKey:   'city',
      filterOptions: [
        { label: 'Dubai',         value: 'Dubai'         },
        { label: 'Abu Dhabi',     value: 'Abu Dhabi'     },
        { label: 'Sharjah',       value: 'Sharjah'       },
        { label: 'Ajman',         value: 'Ajman'         },
        { label: 'Ras Al Khaimah',value: 'Ras Al Khaimah'},
        { label: 'Fujairah',      value: 'Fujairah'      },
      ],
      render: (val) => val || '—',
    },

    // ── RERA Verified ─────────────────────────────────────────────────────
    {
      key:      'reraPermitNumber',   // ← model field
      title:    'RERA',
      sortable: false,
      render: (val) =>
        val ? (
          <Tooltip title={`Permit: ${val}`}>
            <Tag color="green">Verified</Tag>
          </Tooltip>
        ) : (
          <Tag color="default">Pending</Tag>
        ),
    },

    // ── Listing Status ────────────────────────────────────────────────────
    {
      key:      'listingStatus',   // ← model field
      title:    'Status',
      sortable: false,
      render: (val) => {
        const colorMap = {
          active:   'green',
          pending:  'orange',
          rejected: 'red',
          inactive: 'default',
        };
        return val ? (
          <Tag color={colorMap[val] || 'default'} style={{ textTransform: 'capitalize' }}>
            {val}
          </Tag>
        ) : '—';
      },
    },

    // ── Rental Frequency ─────────────────────────────────────────────────
    {
      key:         'rentalFrequency',   // ← model field
      title:       'Frequency',
      sortable:    false,
      filterable:  true,
      filterKey:   'rentalFrequency',
      filterOptions: [
        { label: 'Monthly',   value: 'monthly'   },
        { label: 'Quarterly', value: 'quarterly' },
        { label: 'Yearly',    value: 'yearly'    },
      ],
      render: (val) =>
        val ? (
          <Tag color="blue" style={{ textTransform: 'capitalize' }}>{val}</Tag>
        ) : '—',
    },

    // ── Short Term badge ──────────────────────────────────────────────────
    {
      key:      'isShortTerm',   // ← model field
      title:    'Duration',
      sortable: false,
      render: (val) =>
        val ? (
          <Tag color="cyan">Short Term</Tag>
        ) : (
          <Tag color="default">Long Term</Tag>
        ),
    },

    // ── Actions ───────────────────────────────────────────────────────────
    {
      key:      'actions',
      title:    'Actions',
      sortable: false,
      render: (_, record) => (
        <div className="flex items-center gap-2">
          <Tooltip title="Edit">
            <Button
              type="text"
              icon={<EditOutlined />}
              size="small"
              style={{ color: THEME.primary }}
            
                onClick={() => navigate(`/dashboard/${roleSlug}/rental/properties/edit/${record._id}`)}

              
            />
          </Tooltip>
          <Tooltip title="Delete">
            <Button
              type="text"
              icon={<DeleteOutlined />}
              size="small"
              danger
              onClick={() => setDeleteModal({ open: true, record })}
            />
          </Tooltip>
        </div>
      ),
    },
  ];

  // ── RENDER ────────────────────────────────────────────────────────────────
  return (
    <div className="p-4 md:p-8 bg-gray-50 min-h-screen">

      {/* PAGE HEADER */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 m-0">Rental Properties</h2>
          <p className="text-gray-500 text-sm mt-1">
            Manage all rental listings
          </p>
        </div>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          size="large"
          style={{ backgroundColor: THEME.primary, borderColor: THEME.primary }}
          onClick={() => navigate(`/dashboard/${roleSlug}/rental/properties/create`)}
        >
          Add Rental Property
        </Button>
      </div>

      {/* TABLE */}
      <CustomTable
        columns={columns}
        data={data}
        loading={loading}
        totalItems={totalItems}
        currentPage={currentPage}
        itemsPerPage={itemsPerPage}
        onPageChange={handlePageChange}
        onFilter={handleFilter}
        showSearch={true}
      />

      {/* DELETE CONFIRM MODAL */}
      <Modal
        open={deleteModal.open}
        title="Delete Rental Property"
        onCancel={() => !deleteLoading && setDeleteModal({ open: false, record: null })}
        footer={[
          <Button
            key="cancel"
            onClick={() => setDeleteModal({ open: false, record: null })}
            disabled={deleteLoading}
          >
            Cancel
          </Button>,
          <Button
            key="delete"
            danger
            type="primary"
            loading={deleteLoading}
            onClick={handleDelete}
          >
            Delete
          </Button>,
        ]}
        centered
      >
        <p>
          Are you sure you want to delete{' '}
          <strong>"{deleteModal.record?.propertyName}"</strong>?{' '}
          This action cannot be undone.
        </p>
      </Modal>
    </div>
  );
};

export default RentalPropertyList;