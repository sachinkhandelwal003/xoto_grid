// src/components/ecommerce/B2C/products/VendorInventory.jsx
import React, { useState, useEffect, useCallback, useRef } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  Button, Card, Tag, Space, Typography,
  Tooltip, Popconfirm, Input, Drawer,
  Divider, InputNumber, Modal, Avatar,
} from "antd";
import {
  CheckCircleOutlined, StopOutlined,
  WarningOutlined, ShoppingOutlined,
} from "@ant-design/icons";
import {
  FiSearch, FiRefreshCw, FiPackage,
  FiTag, FiBox, FiAlertTriangle, FiEdit2,
  FiEye, FiDollarSign, FiLayers, FiPlusCircle,
  FiLock, FiCheck, FiUnlock,
} from "react-icons/fi";
import CustomTable from '../../../CMS/pages/custom/CustomTable';
import { apiService } from '../../../../manageApi/utils/custom.apiservice';
import { showToast } from '../../../../manageApi/utils/toast';

const { Title, Text } = Typography;

const THEME = {
  primary: "#722ed1",
  success: "#52c41a",
  warning: "#faad14",
  error: "#ff4d4f",
};

// ── Inventory action modal config ────────────────────────────────────
const ACTION_CONFIG = {
  add: {
    title: "Add Stock",
    description: "Add new stock units to this product's inventory.",
    icon: <FiPlusCircle style={{ color: THEME.success, fontSize: 22 }} />,
    color: THEME.success,
    label: "Qty to Add",
    buttonText: "Add Stock",
    endpoint: "inventory/add",
    field: "qty",
  },
  reserve: {
    title: "Reserve Stock",
    description: "Reserve units to prevent overselling (e.g. for pending orders).",
    icon: <FiLock style={{ color: THEME.warning, fontSize: 22 }} />,
    color: THEME.warning,
    label: "Qty to Reserve",
    buttonText: "Reserve",
    endpoint: "inventory/reserve",
    field: "qty",
  },
  confirm: {
    title: "Confirm Stock",
    description: "Confirm reserved stock has been used/shipped.",
    icon: <FiCheck style={{ color: THEME.primary, fontSize: 22 }} />,
    color: THEME.primary,
    label: "Qty to Confirm",
    buttonText: "Confirm",
    endpoint: "inventory/confirm",
    field: "qty",
  },
  release: {
    title: "Release Stock",
    description: "Release previously reserved stock back to available.",
    icon: <FiUnlock style={{ color: "#13c2c2", fontSize: 22 }} />,
    color: "#13c2c2",
    label: "Qty to Release",
    buttonText: "Release",
    endpoint: "inventory/release",
    field: "qty",
  },
};

const VendorInventory = () => {
  const navigate = useNavigate();
  const { user } = useSelector((s) => s.auth);

  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [totalCount, setTotalCount] = useState(0);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalResults: 0,
    itemsPerPage: 10,
  });

  // Drawer
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selected, setSelected] = useState(null);

  // Inventory action modal
  const [modalOpen, setModalOpen] = useState(false);
  const [activeAction, setActiveAction] = useState(null); // "add"|"reserve"|"confirm"|"release"
  const [actionQty, setActionQty] = useState(1);
  const [actionSku, setActionSku] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  const searchTimeout = useRef(null);

  // ── Fetch products (API integrated from previous snippet) ──────────
  const fetchProducts = useCallback(async (page = 1, limit = 10, searchVal = "") => {
    setLoading(true);
    try {
      const params = { page, limit, vendor_id: user?._id || user?.id };
      if (searchVal?.trim()) params.search = searchVal.trim();

      // ✅ Endpoint changed to inventory/get-vendor-inventory
      const res = await apiService.get("inventory/get-vendor-inventory", params);
      
      const list = res.data || [];

      // ✅ Mapping updated to extract item.product and availableQty/reservedQty
      const data = list.map((item, i) => {
        const p = item.product || item; // Fallback in case format is slightly different
        return {
          ...p,
          key: p._id,
          sno: (page - 1) * limit + i + 1,
          quantity: item.availableQty || 0,
          reserved: item.reservedQty || 0,
          display_price: p.discountedPrice || p.price || 0,
          category_name: typeof p.category === "object" ? p.category?.name : p.category || "—",
          brand_name: typeof p.brandName === "object" ? p.brandName?.name : p.brandName || "—",
        };
      });

      setProducts(data);
      const total = res.pagination?.totalProducts || res.pagination?.total || res.totalProducts || data.length;
      setTotalCount(total);
      setPagination({
        currentPage: res.pagination?.current_page || page,
        totalPages: res.pagination?.total_pages || 1,
        totalResults: total,
        itemsPerPage: limit,
      });
    } catch (err) {
      showToast("Failed to load inventory", "error");
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => { fetchProducts(1, 10, ""); }, [fetchProducts]);

  // ── Search debounce ────────────────────────────────────────────
  const handleSearch = (e) => {
    const val = e.target.value;
    setSearch(val);
    clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => {
      fetchProducts(1, pagination.itemsPerPage, val);
    }, 500);
  };

  // ── Open inventory action modal ────────────────────────────────
  const openAction = (product, action) => {
    setSelected(product);
    setActiveAction(action);
    setActionQty(1);
    setActionSku(product.sku || "");
    setModalOpen(true);
  };

  // ── Execute inventory action ───────────────────────────────────
  const executeAction = async () => {
    if (!actionQty || actionQty < 1) {
      showToast("Please enter a valid quantity", "error");
      return;
    }
    const cfg = ACTION_CONFIG[activeAction];
    setActionLoading(true);
    try {
      const payload = { productId: selected._id, qty: actionQty };
      if (activeAction === "add" && actionSku) payload.sku = actionSku;

      await apiService.post(cfg.endpoint, payload);
      showToast(`${cfg.title} successful!`, "success");
      setModalOpen(false);

      // 🔥 IMPORTANT FIX → REFRESH FROM BACKEND
      await fetchProducts(pagination.currentPage, pagination.itemsPerPage, search);

    } catch (err) {
      showToast(err?.response?.data?.error || err?.response?.data?.message || "Action failed", "error");
    } finally {
      setActionLoading(false);
    }
  };

  // ── Stock tag ──────────────────────────────────────────────────
  const getStockTag = (qty) => {
    if (!qty || qty === 0)
      return <Tag color="red" icon={<StopOutlined />}>Out of Stock</Tag>;
    if (qty <= 10)
      return <Tag color="orange" icon={<WarningOutlined />}>Low ({qty})</Tag>;
    return <Tag color="green" icon={<CheckCircleOutlined />}>{qty} in Stock</Tag>;
  };

  // ── Columns ────────────────────────────────────────────────────
  const columns = [
    
    {
      title: "Product",
      key: "name",
      width: 280,
      render: (_, r) => (
        <div className="flex items-center gap-3">
          <div style={{
            width: 48, height: 48, borderRadius: 8,
            overflow: "hidden", flexShrink: 0,
            background: "#f5f5f5", border: "1px solid #eee",
          }}>
            {r.photos?.[0] ? (
              <img src={r.photos[0]} alt={r.name}
                style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            ) : (
              <div style={{
                width: "100%", height: "100%", display: "flex",
                alignItems: "center", justifyContent: "center", color: "#ccc", fontSize: 20,
              }}>
                <FiPackage />
              </div>
            )}
          </div>
          <div>
            <div className="font-semibold text-gray-800 text-sm leading-tight">
              {r.name?.length > 40 ? r.name.slice(0, 40) + "..." : r.name}
            </div>
            <div className="text-xs text-gray-400 mt-0.5">{r.category_name}</div>
          </div>
        </div>
      ),
    },
    {
      title: "Price",
      key: "price",
      width: 110,
      render: (_, r) => (
        <div>
          <div className="font-bold text-gray-800">AED {r.display_price?.toFixed(2)}</div>
          {r.price && r.discountedPrice && r.price !== r.discountedPrice && (
            <div className="text-xs text-gray-400 line-through">AED {r.price?.toFixed(2)}</div>
          )}
        </div>
      ),
    },
    {
      title: "Stock",
      key: "quantity",
      width: 140,
      render: (_, r) => getStockTag(r.quantity),
    },
    // ✅ Added Reserved Column
    {
      title: "Reserved",
      key: "reserved",
      width: 100,
      render: (_, r) => r.reserved || 0,
    },
    {
      title: "Status",
      key: "isActive",
      width: 100,
      render: (_, r) =>
        r.isActive
          ? <Tag color="green" icon={<CheckCircleOutlined />}>Active</Tag>
          : <Tag color="red" icon={<StopOutlined />}>Inactive</Tag>,
    },
    {
      title: "Inventory",
      key: "inventory",
      width: 200,
      render: (_, r) => (
        <Space size={4}>
          <Tooltip title="Add Stock">
            <Button size="small" onClick={() => openAction(r, "add")}
              style={{ borderColor: THEME.success, color: THEME.success, borderRadius: 6 }}
              icon={<FiPlusCircle />}
            >Add</Button>
          </Tooltip>
          <Tooltip title="Reserve Stock">
            <Button size="small" onClick={() => openAction(r, "reserve")}
              style={{ borderColor: THEME.warning, color: THEME.warning, borderRadius: 6 }}
              icon={<FiLock />}
            >Reserve</Button>
          </Tooltip>
          <Tooltip title="Confirm">
            <Button size="small" onClick={() => openAction(r, "confirm")}
              style={{ borderColor: THEME.primary, color: THEME.primary, borderRadius: 6 }}
              icon={<FiCheck />}
            >Confirm</Button>
          </Tooltip>
          <Tooltip title="Release">
            <Button size="small" onClick={() => openAction(r, "release")}
              style={{ borderColor: "#13c2c2", color: "#13c2c2", borderRadius: 6 }}
              icon={<FiUnlock />}
            >Release</Button>
          </Tooltip>
        </Space>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      fixed: "right",
      width: 90,
      render: (_, r) => (
        <Space size="small">
          <Tooltip title="View Details">
            <Button type="text"
              icon={<FiEye style={{ color: THEME.primary, fontSize: 17 }} />}
              onClick={() => { setSelected(r); setDrawerOpen(true); }}
            />
          </Tooltip>
          <Tooltip title="Edit Product">
            <Button type="text"
              icon={<FiEdit2 style={{ color: THEME.warning, fontSize: 17 }} />}
              onClick={() => navigate(`/dashboard/vendor-b2c/products/edit/${r._id}`)}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  // ── Stats ──────────────────────────────────────────────────────
  const outOfStock = products.filter((p) => !p.quantity || p.quantity === 0).length;
  const lowStock = products.filter((p) => p.quantity > 0 && p.quantity <= 10).length;
  const activeCount = products.filter((p) => p.isActive).length;

  const cfg = activeAction ? ACTION_CONFIG[activeAction] : null;

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <Title level={3} style={{ margin: 0 }}>Inventory Management</Title>
          <Text type="secondary">Track stock levels and manage your product inventory.</Text>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {[
          { label: "Total Products", value: totalCount, color: THEME.primary, icon: <FiPackage /> },
          { label: "Active", value: activeCount, color: THEME.success, icon: <CheckCircleOutlined /> },
          { label: "Low Stock", value: lowStock, color: THEME.warning, icon: <FiAlertTriangle /> },
          { label: "Out of Stock", value: outOfStock, color: THEME.error, icon: <FiBox /> },
        ].map((s) => (
          <Card key={s.label} bordered={false} className="shadow-sm rounded-xl"
            bodyStyle={{ padding: "16px 20px" }}>
            <div className="flex items-center justify-between">
              <div>
                <Text type="secondary" className="text-xs uppercase tracking-wide">{s.label}</Text>
                <div className="text-2xl font-bold mt-1" style={{ color: s.color }}>{s.value}</div>
              </div>
              <div style={{
                width: 44, height: 44, borderRadius: "50%",
                background: `${s.color}15`, color: s.color,
                display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20,
              }}>
                {s.icon}
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Table */}
      <Card bordered={false} className="shadow-sm rounded-xl overflow-hidden" bodyStyle={{ padding: 0 }}>
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
          <Input
            placeholder="Search by product name, category..."
            prefix={<FiSearch className="text-gray-400" />}
            value={search}
            onChange={handleSearch}
            allowClear
            onClear={() => { setSearch(""); fetchProducts(1, pagination.itemsPerPage, ""); }}
            style={{ maxWidth: 360, borderRadius: 8 }}
          />
          <Button icon={<FiRefreshCw />}
            onClick={() => fetchProducts(pagination.currentPage, pagination.itemsPerPage, search)}>
            Refresh
          </Button>
        </div>
        <div className="bg-white">
          <CustomTable
            columns={columns}
            data={products}
            loading={loading}
            totalItems={pagination.totalResults}
            currentPage={pagination.currentPage}
            onPageChange={(page, limit) => fetchProducts(page, limit, search)}
            showSearch={false}
          />
        </div>
      </Card>

      {/* ── Inventory Action Modal ── */}
      <Modal
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        footer={null}
        title={null}
        centered
        width={420}
      >
        {cfg && selected && (
          <div>
            {/* Modal Header */}
            <div className="flex items-center gap-3 mb-4">
              <div style={{
                width: 48, height: 48, borderRadius: 10,
                background: `${cfg.color}15`,
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                {cfg.icon}
              </div>
              <div>
                <div className="font-bold text-gray-800 text-base">{cfg.title}</div>
                <div className="text-xs text-gray-400">{selected.name?.slice(0, 40)}</div>
              </div>
            </div>

            <Text type="secondary" style={{ fontSize: 13 }}>{cfg.description}</Text>

            <Divider />

            {/* Current stock */}
            <div className="flex justify-between items-center mb-4">
              <Text type="secondary">Current Stock</Text>
              <div className="font-bold text-gray-800">{selected.quantity || 0} units</div>
            </div>

            {/* Quantity input */}
            <div className="mb-4">
              <div className="text-sm font-medium text-gray-700 mb-2">{cfg.label}</div>
              <InputNumber
                min={1}
                value={actionQty}
                onChange={(v) => setActionQty(v)}
                style={{ width: "100%", borderRadius: 8 }}
                size="large"
              />
            </div>

            {/* SKU input — only for add */}
            {activeAction === "add" && (
              <div className="mb-4">
                <div className="text-sm font-medium text-gray-700 mb-2">SKU (optional)</div>
                <Input
                  value={actionSku}
                  onChange={(e) => setActionSku(e.target.value)}
                  placeholder="Enter SKU"
                  style={{ borderRadius: 8 }}
                  size="large"
                />
              </div>
            )}

            <div className="flex gap-3 mt-4">
              <Button block size="large" onClick={() => setModalOpen(false)}
                style={{ borderRadius: 10 }}>
                Cancel
              </Button>
              <Button block size="large" type="primary" loading={actionLoading}
                onClick={executeAction}
                style={{ background: cfg.color, borderColor: cfg.color, borderRadius: 10, fontWeight: 600 }}>
                {cfg.buttonText}
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* ── Product Detail Drawer ── */}
      <Drawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        width={420}
        title={null}
        bodyStyle={{ padding: 0 }}
      >
        {selected && (
          <div>
            {/* Banner */}
            <div style={{
              background: `linear-gradient(135deg, ${THEME.primary}, #9b59b6)`,
              padding: "24px 24px 55px",
              display: "flex", flexDirection: "column", alignItems: "center",
            }}>
              <div style={{
                width: 90, height: 90, borderRadius: 12,
                overflow: "hidden", border: "3px solid white",
                boxShadow: "0 4px 12px rgba(0,0,0,0.2)", background: "#fff",
              }}>
                {selected.photos?.[0] ? (
                  <img src={selected.photos[0]} alt={selected.name}
                    style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                ) : (
                  <div style={{
                    width: "100%", height: "100%", display: "flex",
                    alignItems: "center", justifyContent: "center", color: "#ccc", fontSize: 32,
                  }}>
                    <FiPackage />
                  </div>
                )}
              </div>
            </div>

            {/* Floating name card */}
            <div style={{ padding: "0 24px", marginTop: -28 }}>
              <Card bordered={false}
                bodyStyle={{ padding: "16px 20px", textAlign: "center" }}
                style={{ borderRadius: 12, boxShadow: "0 4px 16px rgba(0,0,0,0.08)" }}>
                <Title level={5} style={{ margin: 0, lineHeight: 1.4 }}>{selected.name}</Title>
                <Text type="secondary" style={{ fontSize: 12 }}>{selected.category_name}</Text>
                <div className="mt-2 flex justify-center gap-2 flex-wrap">
                  {selected.isActive
                    ? <Tag color="green" icon={<CheckCircleOutlined />}>Active</Tag>
                    : <Tag color="red" icon={<StopOutlined />}>Inactive</Tag>
                  }
                  {getStockTag(selected.quantity)}
                </div>
              </Card>
            </div>

            {/* Details */}
            <div style={{ padding: "20px 24px" }}>
              <Text className="text-xs uppercase tracking-widest text-gray-400 font-semibold">
                Product Details
              </Text>
              <div className="mt-3 space-y-4">
                {[
                  { icon: <FiDollarSign />, label: "Price", value: `AED ${selected.display_price?.toFixed(2)}` },
                  { icon: <FiTag />, label: "Category", value: selected.category_name },
                  { icon: <FiLayers />, label: "Brand", value: selected.brand_name || "—" },
                  { icon: <FiBox />, label: "Return Policy", value: selected.returnPolicyDays ? `${selected.returnPolicyDays} days` : "—" },
                ].map((item) => (
                  <div key={item.label} className="flex items-center gap-3">
                    <div style={{
                      width: 34, height: 34, borderRadius: 8,
                      background: `${THEME.primary}12`, color: THEME.primary,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      flexShrink: 0, fontSize: 15,
                    }}>
                      {item.icon}
                    </div>
                    <div>
                      <div className="text-xs text-gray-400">{item.label}</div>
                      <div className="text-sm font-medium text-gray-800">{item.value}</div>
                    </div>
                  </div>
                ))}
              </div>

              <Divider />

              {/* Inventory action buttons in drawer */}
              <Text className="text-xs uppercase tracking-widest text-gray-400 font-semibold">
                Inventory Actions
              </Text>
              <div className="grid grid-cols-2 gap-3 mt-3">
                {Object.entries(ACTION_CONFIG).map(([key, c]) => (
                  <Button key={key} block
                    icon={c.icon}
                    onClick={() => { setDrawerOpen(false); openAction(selected, key); }}
                    style={{ borderColor: c.color, color: c.color, borderRadius: 10, height: 42, fontWeight: 600 }}
                  >
                    {c.title}
                  </Button>
                ))}
              </div>

              <Divider />

              <Button block size="large" icon={<FiEdit2 />}
                style={{ borderRadius: 10, fontWeight: 600, borderColor: THEME.primary, color: THEME.primary }}
                onClick={() => { setDrawerOpen(false); navigate(`/dashboard/vendor-b2c/products/edit/${selected._id}`); }}
              >
                Edit Product
              </Button>
            </div>
          </div>
        )}
      </Drawer>
    </div>
  );
};

export default VendorInventory;