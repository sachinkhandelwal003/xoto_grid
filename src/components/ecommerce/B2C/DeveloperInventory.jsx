import React, { useEffect, useState, useCallback } from "react";
import {
  Select, Input, Upload, message, Popconfirm,
  Modal, Form, InputNumber, Divider, Switch, Spin, Pagination, Button
} from "antd";
import {
  SearchOutlined, UploadOutlined, PlusOutlined,
  EditOutlined, ReloadOutlined, AppstoreOutlined, EyeOutlined,
  CheckCircleFilled, ClockCircleFilled, CloseCircleFilled,
  DollarOutlined, HomeOutlined, FilterOutlined, ThunderboltOutlined,
}  from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { apiService } from "../../../manageApi/utils/custom.apiservice";

const { Option } = Select;

const UNIT_TYPES = ["apartment", "villa", "townhouse", "duplex", "penthouse", "plot", "office", "retail", "warehouse", "hotel_apartment"];
const BEDROOM_TYPES = ["studio", "1bed", "2bed", "3bed", "4bed", "5bed", "6bed", "7bed", "8plus"];
const VIEW_TYPES = ["sea", "city", "garden", "landmark", "pool", "park"];
const FURNISHING = ["furnished", "semi_furnished", "unfurnished"];
const AREA_UNITS = ["sqft", "sqm"];
const CURRENCIES = ["AED", "USD", "EUR"];

const STATUS_CONFIG = {
  available: { color: "#15803d", bg: "#f0fdf4", border: "#bbf7d0", dot: "#22c55e", label: "Available" },
  hold: { color: "#ca8a04", bg: "#fefce8", border: "#fde047", dot: "#eab308", label: "On Hold" },
  reserved: { color: "#6d28d9", bg: "#f5f3ff", border: "#ddd6fe", dot: "#8b5cf6", label: "Reserved" },
  booked: { color: "#92400e", bg: "#fffbeb", border: "#fde68a", dot: "#f59e0b", label: "Booked" },
  spa_signed: { color: "#0f172a", bg: "#f1f5f9", border: "#cbd5e1", dot: "#475569", label: "SPA Signed" },
  sold: { color: "#1e40af", bg: "#eff6ff", border: "#bfdbfe", dot: "#3b82f6", label: "Sold" },
  handover: { color: "#065f46", bg: "#ecfdf5", border: "#a7f3d0", dot: "#10b981", label: "Handover" },
  cancelled: { color: "#b91c1c", bg: "#fef2f2", border: "#fecaca", dot: "#ef4444", label: "Cancelled" },
};

const STAT_CARDS = [
  { key: "total", label: "Total Units", color: "#6d28d9", bg: "#f5f3ff", icon: <AppstoreOutlined /> },
  { key: "available", label: "Available", color: "#15803d", bg: "#f0fdf4", icon: <CheckCircleFilled /> },
  { key: "reserved", label: "Reserved", color: "#6d28d9", bg: "#f5f3ff", icon: <ClockCircleFilled /> },
  { key: "booked", label: "Booked", color: "#92400e", bg: "#fffbeb", icon: <ClockCircleFilled /> },
  { key: "sold", label: "Sold", color: "#1e40af", bg: "#eff6ff", icon: <DollarOutlined /> },
];

const toLabel = (s) => s ? s.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase()) : "—";
const fmt = (n, cur = "AED") => n ? `${cur} ${Number(n).toLocaleString()}` : "—";

// Field row component
const Field = ({ label, value, highlight }) => (
  <div style={S.fieldRow}>
    <span style={S.fieldLabel}>{label}</span>
    <span style={{ ...S.fieldValue, ...(highlight ? { color: "#6d28d9", fontWeight: 600 } : {}) }}>
      {value || "—"}
    </span>
  </div>
);

// Inventory Card Component
const InventoryCard = ({ unit, onEdit, onAction, onView }) => {
  const sc = STATUS_CONFIG[unit.status] || STATUS_CONFIG.available;
  const status = unit.status?.toLowerCase();
  const [hov, setHov] = useState(null);
  const unitType = unit.unitType?.toLowerCase();

  const isResidential = ["apartment", "villa", "townhouse", "duplex", "penthouse"].includes(unitType);
  const isCommercial = ["office", "retail", "warehouse"].includes(unitType);
  const isPlot = unitType === "plot";

  return (
    <div style={S.card}>
      {/* Header */}
      <div style={S.cardHeader}>
        <div>
          <div style={S.unitNum}>{unit.unitNumber}</div>
          <div style={S.unitSub}>
            {[unit.buildingName, unit.floorNumber != null && `Floor ${unit.floorNumber}`]
              .filter(Boolean).join(" · ") || "—"}
          </div>
        </div>
        <span style={{ ...S.statusPill, color: sc.color, background: sc.bg, border: `1px solid ${sc.border}` }}>
          <span style={{ ...S.statusDot, background: sc.dot }} />
          {sc.label}
        </span>
      </div>

      {/* Body */}
      <div style={S.cardBody}>
        <Field label="Type" value={toLabel(unit.unitType)} />
        
        {isResidential && (
          <>
            <Field label="Bedroom" value={toLabel(unit.bedroomType)} />
            <Field label="Bathrooms" value={unit.bathrooms} />
          </>
        )}
        
        <Field label="Area" value={unit.area ? `${Number(unit.area).toLocaleString()} ${unit.areaUnit || "sqft"}` : "—"} />
        <Field label="Price" value={fmt(unit.price, unit.currency)} highlight />
        
        {!isPlot && (
          <>
            <Field label="Furnishing" value={toLabel(unit.furnishing)} />
            <Field label="Parking" value={unit.parkingSpaces ?? "—"} />
          </>
        )}
        
        {isResidential && (
          <Field label="View" value={unit.viewType?.length ? unit.viewType.map(toLabel).join(", ") : "—"} />
        )}
        
        {unit.reservedAt && <Field label="Reserved" value={new Date(unit.reservedAt).toLocaleDateString("en-AE", { day: "2-digit", month: "short", year: "numeric" })} />}
        {unit.bookedAt && <Field label="Booked" value={new Date(unit.bookedAt).toLocaleDateString("en-AE", { day: "2-digit", month: "short", year: "numeric" })} />}
        {unit.soldAt && <Field label="Sold" value={new Date(unit.soldAt).toLocaleDateString("en-AE", { day: "2-digit", month: "short", year: "numeric" })} />}
      </div>

      {/* Actions */}
      <div style={S.cardActions}>
        <button
          style={{ ...S.actBtn, ...S.actBtnOutline, ...(hov === "edit" ? S.actBtnOutlineHov : {}) }}
          onMouseEnter={() => setHov("edit")}
          onMouseLeave={() => setHov(null)}
          onClick={() => onEdit(unit)}
        >
          <EditOutlined style={{ fontSize: 11 }} /> Edit
        </button>

        {status === "available" && (<>
          <button
            style={{ ...S.actBtn, ...S.actBtnPurple, ...(hov === "res" ? S.actBtnPurpleHov : {}) }}
            onMouseEnter={() => setHov("res")} onMouseLeave={() => setHov(null)}
            onClick={() => onAction(unit.key, "reserve", "Unit reserved")}
          >Reserve</button>
          <Popconfirm title="Delete this unit?" onConfirm={() => onAction(unit.key, "delete")}>
            <button style={{ ...S.actBtn, ...S.actBtnDanger }}>Delete</button>
          </Popconfirm>
        </>)}

        {status === "reserved" && (<>
          <button
            style={{ ...S.actBtn, ...S.actBtnPurple }}
            onClick={() => onAction(unit.key, "book", "Unit booked")}
          >Book</button>
          <button
            style={{ ...S.actBtn, ...S.actBtnDanger }}
            onClick={() => onAction(unit.key, "release", "Unit released")}
          >Release</button>
        </>)}

        {(status === "booked" || status === "sold") && (
          <button
            style={{ ...S.actBtn, ...S.actBtnPurple, flex: 2 }}
            onClick={() => onView(unit)}
          >View Details</button>
        )}
      </div>
    </div>
  );
};

// Form Fields Component
const InventoryFormFields = ({ isEdit = false, selectedUnit = null, activeProperty = null }) => {
  const isResidentialUnitType = (unitType) => 
    ["apartment", "villa", "townhouse", "duplex", "penthouse", "hotel_apartment"].includes(unitType);
  
  const isPlotUnitType = (unitType) => unitType === "plot";

  const propCurrency = activeProperty?.currency || "AED";
  const propFurnishing = activeProperty?.furnishing || "unfurnished";
  const propParking = activeProperty?.parkingSpaces ?? 0;
  const propHasView = activeProperty?.hasView ? "Yes" : "No";
  const propViewType = activeProperty?.viewType?.length ? activeProperty.viewType.map(toLabel).join(", ") : "None";
  const propPaymentPlan = activeProperty?.paymentPlan?.length ? activeProperty.paymentPlan[0]?.title : "";

  return (
    <>
      <div style={S.formSection}>Unit Identity</div>
      <div style={S.formGrid3}>
        <Form.Item name="unitNumber" label="Unit Number" rules={[{ required: true }]}><Input placeholder="e.g. T1-1001" /></Form.Item>
        <Form.Item name="buildingName" label="Building Name"><Input placeholder="e.g. Tower A" /></Form.Item>
        <Form.Item name="floorNumber" label="Floor Number"><InputNumber min={0} style={{ width: "100%" }} /></Form.Item>
      </div>

      <div style={S.formSection}>Unit Type & Size</div>
      <div style={S.formGrid4}>
        <Form.Item name="unitType" label="Unit Type" rules={[{ required: true }]}>
          <Select placeholder="Select">{UNIT_TYPES.map(t => <Option key={t} value={t}>{toLabel(t)}</Option>)}</Select>
        </Form.Item>
        
        <Form.Item shouldUpdate={(prev, curr) => prev.unitType !== curr.unitType}>
          {({ getFieldValue }) => {
            const unitType = getFieldValue("unitType");
            return isResidentialUnitType(unitType) ? (
              <>
                <Form.Item name="bedroomType" label="Bedroom Type" rules={[{ required: true }]}>
                  <Select placeholder="Select">{BEDROOM_TYPES.map(t => <Option key={t} value={t}>{toLabel(t)}</Option>)}</Select>
                </Form.Item>
                <Form.Item name="bedrooms" label="Bedrooms"><InputNumber min={0} style={{ width: "100%" }} /></Form.Item>
                <Form.Item name="bathrooms" label="Bathrooms"><InputNumber min={0} style={{ width: "100%" }} /></Form.Item>
              </>
            ) : null;
          }}
        </Form.Item>
      </div>

      <div style={S.formSection}>Area & Price</div>
      <div style={S.formGrid4}>
        <Form.Item name="area" label="Area" rules={[{ required: true }]}><InputNumber min={0} style={{ width: "100%" }} /></Form.Item>
        <Form.Item name="areaUnit" label="Unit" initialValue="sqft"><Select>{AREA_UNITS.map(u => <Option key={u} value={u}>{u}</Option>)}</Select></Form.Item>
        <Form.Item name="price" label="Price" rules={[{ required: true }]}>
          <InputNumber min={0} style={{ width: "100%" }}
            formatter={v => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
            parser={v => v.replace(/,/g, "")} />
        </Form.Item>
        <Form.Item name="currency" label="Currency" initialValue="inherit">
          <Select>
            <Option value="inherit">Inherit: Project ({propCurrency})</Option>
            {CURRENCIES.map(c => <Option key={c} value={c}>{c}</Option>)}
          </Select>
        </Form.Item>
      </div>

      <Form.Item shouldUpdate={(prev, curr) => prev.unitType !== curr.unitType}>
        {({ getFieldValue }) => {
          const unitType = getFieldValue("unitType");
          if (!isPlotUnitType(unitType)) {
            return (
              <>
                <div style={S.formSection}>View & Features</div>
                <div style={S.formGrid4}>
                  <Form.Item name="hasView" label="Has View" initialValue="inherit">
                    <Select>
                      <Option value="inherit">Inherit: Project ({propHasView})</Option>
                      <Option value={true}>Yes</Option>
                      <Option value={false}>No</Option>
                    </Select>
                  </Form.Item>

                  <Form.Item shouldUpdate={(prev, curr) => prev.hasView !== curr.hasView}>
                    {({ getFieldValue }) => {
                      const hasView = getFieldValue("hasView");
                      const shouldShow = hasView === true || (hasView === "inherit" && activeProperty?.hasView);
                      return shouldShow ? (
                        <Form.Item
                          name="viewType"
                          label="View Types"
                          style={{ gridColumn: "span 2" }}
                        >
                          <Select mode="multiple" placeholder={`Inherit: ${propViewType}`} allowClear>
                            {VIEW_TYPES.map(v => (
                              <Option key={v} value={v}>{toLabel(v)}</Option>
                            ))}
                          </Select>
                        </Form.Item>
                      ) : null;
                    }}
                  </Form.Item>

                  <Form.Item name="parkingSpaces" label="Parking">
                    <InputNumber min={0} style={{ width: "100%" }} placeholder={`Inherit: ${propParking}`} />
                  </Form.Item>
                </div>
                <div style={S.formGrid3}>
                  <Form.Item name="furnishing" label="Furnishing" initialValue="inherit">
                    <Select>
                      <Option value="inherit">Inherit: Project ({toLabel(propFurnishing)})</Option>
                      {FURNISHING.map(f => <Option key={f} value={f}>{toLabel(f)}</Option>)}
                    </Select>
                  </Form.Item>
                  <Form.Item name="paymentPlan" label="Payment Plan" style={{ gridColumn: "span 2" }}>
                    <Input placeholder={propPaymentPlan ? `Inherit: ${propPaymentPlan}` : "e.g. 50/50 Handover Plan"} />
                  </Form.Item>
                </div>
              </>
            );
          }
          return null;
        }}
      </Form.Item>

      {isEdit && (<>
        <div style={S.formSection}>Status</div>
        <div style={{ maxWidth: 240 }}>
          <Form.Item name="status" label="Unit Status">
            <Select>
              {["available", "reserved", "booked"].map(s => <Option key={s} value={s}>{toLabel(s)}</Option>)}
              <Option value="sold" disabled={selectedUnit?.status !== "booked"}>Sold</Option>
            </Select>
          </Form.Item>
        </div>
      </>)}
    </>
  );
};

// Main Component
export default function DeveloperInventory() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [propertiesList, setPropertiesList] = useState([]);
  const [projectId, setProjectId] = useState(null);
  const [units, setUnits] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState(null);
  const [unitTypeFilter, setUtFilter] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [createModal, setCreateModal] = useState(false);
  const [editModal, setEditModal] = useState(false);
  const [viewModal, setViewModal] = useState(false);
  const [selectedUnit, setSelectedUnit] = useState(null);
  const [createForm] = Form.useForm();
  const [editForm] = Form.useForm();
  const [saving, setSaving] = useState(false);
  const [categoryConfig, setCategoryConfig] = useState(null);
  const [propertyConfig, setPropertyConfig] = useState(null);
  const [configModalVisible, setConfigModalVisible] = useState(false);
  const [configForm] = Form.useForm();
  const [generating, setGenerating] = useState(false);
  const PAGE_SIZE = 12;

  const fetchCategoryConfig = useCallback(async () => {
    try {
      const res = await apiService.get("/properties/inventory-categories");
      if (res) {
        setCategoryConfig(res);
      }
    } catch (err) {
      console.error("Failed to fetch category config:", err);
    }
  }, []);

  const fetchPropertyConfig = useCallback(async (pid) => {
    try {
      const res = await apiService.get(`/properties/${pid}/required-config`);
      if (res?.data) {
        setPropertyConfig(res.data);
        return res.data;
      }
    } catch (err) {
      console.error("Failed to fetch property config:", err);
      message.error(err?.response?.data?.message || "Failed to load config");
    }
  }, []);

  const handleAutoGenerate = async () => {
    if (!projectId) {
      message.error("Select a project first");
      return;
    }
    // Fetch property config and open modal
    const config = await fetchPropertyConfig(projectId);
    if (config) {
      setConfigModalVisible(true);
    }
  };

  const handleSubmitConfigAndGenerate = async () => {
    try {
      await configForm.validateFields();
      const configData = configForm.getFieldsValue();
      setGenerating(true);
      setConfigModalVisible(false);
      
      const res = await apiService.post("/properties/inventory/auto-generate", {
        propertyId: projectId,
        config: configData
      });
      
      message.success(res?.message || "Units generated successfully!");
      fetchInventory(projectId, currentPage);
      configForm.resetFields();
    } catch (err) {
      console.error("Auto-generate error:", err);
      message.error(err?.response?.data?.message || "Auto-generate failed");
    } finally {
      setGenerating(false);
    }
  };

  const fetchProjects = useCallback(async () => {
    try {
      const res = await apiService.get("/properties/");
      const list =
        (Array.isArray(res?.data) && res.data) ||
        (Array.isArray(res) && res) ||
        [];
      setPropertiesList(list);
const userData = JSON.parse(localStorage.getItem("user") || "{}");

const opts = (Array.isArray(list) ? list : [])
  .filter((p) => {

    // include all property types
    const allowedTypes = [
      "off_plan",
      "rental",
      "secondary"
    ];

    const validType = allowedTypes.includes(
      p.propertySubType
    );

    // only projects created by current admin
    const isOwnProject =
      p.createdBy === userData?._id ||
      p.createdBy?._id === userData?._id;

    // Admin → own properties only
    if (userData?.role?.name === "admin") {
      return validType && isOwnProject;
    }

    // keep previous behavior for others
    return validType;
  })
  .map((p) => ({
    label:
      p.projectName ||
      p.propertyName ||
      "Untitled",

    value: p._id
  }));

      setProjects(opts);

      const savedProjectId = localStorage.getItem("selectedProject");
      const isValidSaved = opts.some(opt => opt.value === savedProjectId);

      if (opts.length > 0) {
        if (isValidSaved) {
          setProjectId(savedProjectId);
        } else {
          setProjectId(opts[0].value);
          localStorage.setItem("selectedProject", opts[0].value);
        }
      }
    } catch (err) {
      message.error("Failed to load projects");
    }
  }, []);

  const fetchInventory = useCallback(async (pid, page = 1) => {
    if (!pid) return;
    setLoading(true);
    try {
      let url = `/properties/inventory?propertyId=${pid}&page=${page}&limit=${PAGE_SIZE}`;
      if (statusFilter) url += `&status=${statusFilter}`;
      if (unitTypeFilter) url += `&unitType=${unitTypeFilter}`;

      const res = await apiService.get(url);
      
      // Handle different response formats
      const resData = res?.data || res;
      const inventoryList = Array.isArray(resData) ? resData : (resData?.data || []);
      
      const list = inventoryList.map(item => ({
        key: item._id || item.key,
        _id: item._id,
        unitNumber: item.unitNumber,
        buildingName: item.buildingName,
        floorNumber: item.floorNumber,
        unitType: item.unitType,
        bedroomType: item.bedroomType,
        bedrooms: item.bedrooms,
        bathrooms: item.bathrooms,
        area: item.area,
        areaUnit: item.areaUnit || "sqft",
        price: item.price,
        currency: item.currency,
        hasView: item.hasView,
        viewType: item.viewType,
        parkingSpaces: item.parkingSpaces,
        furnishing: item.furnishing,
        paymentPlan: item.paymentPlan,
        rawValues: item.rawValues,
        status: item.status,
        bookedAt: item.bookedAt,
        reservedAt: item.reservedAt,
        soldAt: item.soldAt,
      }));

      setUnits(list);
      
      // Get counts and pagination
      const counts = resData?.counts || res?.counts;
      if (counts) {
        setStats(counts);
      }
      
      const totalItems = resData?.pagination?.totalItems || res?.pagination?.totalItems || list.length;
      const currentPage = resData?.pagination?.currentPage || res?.pagination?.currentPage || page;
      
      setTotalItems(totalItems);
      setCurrentPage(currentPage);
      
    } catch (err) {
      console.error("Failed to load inventory:", err);
      message.error(err?.response?.data?.message || "Failed to load inventory");
    } finally {
      setLoading(false);
    }
  }, [statusFilter, unitTypeFilter]);

const handleCreate = async (values) => {
  if (!projectId) { message.error("Select a project first"); return; }
  setSaving(true);
  try {
    await apiService.post("/properties/inventory", {
      propertyId: projectId,
      units: [{
        unitNumber: values.unitNumber,
        buildingName: values.buildingName || "",
        floorNumber: values.floorNumber || 0,
        unitType: values.unitType,
        bedroomType: values.bedroomType,
        bedrooms: values.bedrooms || 0,
        bathrooms: values.bathrooms || 0,
        area: values.area,
        areaUnit: values.areaUnit || "sqft",
        price: values.price,
        currency: values.currency === "inherit" ? null : values.currency,
        hasView: values.hasView === "inherit" ? null : values.hasView,
        viewType: (values.hasView === "inherit" || !values.viewType) ? null : values.viewType,
        parkingSpaces: values.parkingSpaces === undefined || values.parkingSpaces === null ? null : values.parkingSpaces,
        furnishing: values.furnishing === "inherit" ? null : values.furnishing,
        paymentPlan: !values.paymentPlan ? null : values.paymentPlan,
        status: "available"
      }],
    });
    message.success("Unit created");
    setCreateModal(false);
    createForm.resetFields();
    fetchInventory(projectId, currentPage);
  } catch (err) {
    console.error("Create error:", err.response?.data);
    message.error(err?.response?.data?.message || "Create failed");
  } finally {
    setSaving(false);
  }
};
 const handleUpdate = async (values) => {
  setSaving(true);
  try {
    await apiService.patch(`/properties/inventory/${selectedUnit._id}`, {
      ...values,
      currency: values.currency === "inherit" ? null : values.currency,
      hasView: values.hasView === "inherit" ? null : values.hasView,
      viewType: (values.hasView === "inherit" || !values.viewType) ? null : values.viewType,
      parkingSpaces: values.parkingSpaces === undefined || values.parkingSpaces === null ? null : values.parkingSpaces,
      furnishing: values.furnishing === "inherit" ? null : values.furnishing,
      paymentPlan: !values.paymentPlan ? null : values.paymentPlan,
    });
    message.success("Unit updated");
    setEditModal(false); 
    editForm.resetFields(); 
    setSelectedUnit(null);
    fetchInventory(projectId, currentPage);
  } catch (err) { 
    message.error(err?.response?.data?.message || "Update failed"); 
  } finally { 
    setSaving(false); 
  }
};

  const handleAction = async (id, action, successMsg) => {
  try {
    if (action === "delete") {
      await apiService.delete(`/properties/inventory/${id}`);
      message.success("Unit deleted");
    } else {
      // reserve, book, release
      await apiService.post(`/properties/inventory/${id}/${action}`);
      message.success(successMsg);
    }
    fetchInventory(projectId, currentPage);
  } catch (err) { 
    message.error(err?.response?.data?.message || "Action failed"); 
  }
};

  const openEdit = (unit) => {
    setSelectedUnit(unit);
    editForm.setFieldsValue({
      ...unit,
      areaUnit: unit.areaUnit || "sqft",
      currency: unit.rawValues?.currency === null || unit.rawValues?.currency === undefined ? "inherit" : unit.rawValues.currency,
      hasView: unit.rawValues?.hasView === null || unit.rawValues?.hasView === undefined ? "inherit" : unit.rawValues.hasView,
      viewType: unit.rawValues?.viewType || undefined,
      parkingSpaces: unit.rawValues?.parkingSpaces === null || unit.rawValues?.parkingSpaces === undefined ? undefined : unit.rawValues.parkingSpaces,
      furnishing: unit.rawValues?.furnishing === null || unit.rawValues?.furnishing === undefined ? "inherit" : unit.rawValues.furnishing,
      paymentPlan: unit.rawValues?.paymentPlan || undefined
    });
    setEditModal(true);
  };

  const openView = (unit) => {
    setSelectedUnit(unit);
    setViewModal(true);
  };

  const handleCSV = async (file) => {
  if (!projectId) { message.error("Select project first"); return false; }
  const text = await file.text();
  const parsed = text.split(/\r?\n/).slice(1)
    .map(row => {
      const c = row.split(",");
      return {
        unitNumber: c[0]?.trim(), 
        area: Number(c[1]), 
        price: Number(c[2]),
        viewType: c[3]?.trim() ? [c[3].trim()] : [], 
        status: c[4]?.trim()?.toLowerCase() || "available",
        unitType: c[5]?.trim()?.toLowerCase() || "apartment", 
        bedroomType: c[6]?.trim()?.toLowerCase() || "1bed"
      };
    }).filter(u => u.unitNumber && u.area && u.price);
    
  if (!parsed.length) { message.error("No valid rows"); return false; }
  try {
    await apiService.post("/properties/inventory/bulk", { 
      propertyId: projectId, 
      units: parsed 
    });
    message.success(`${parsed.length} units imported`);
    fetchInventory(projectId, currentPage);
  } catch { 
    message.error("Import failed"); 
  }
  return false;
};
;

  useEffect(() => { fetchProjects(); fetchCategoryConfig(); }, [fetchProjects, fetchCategoryConfig]);
  useEffect(() => { if (projectId) fetchInventory(projectId, 1); }, [projectId, statusFilter, unitTypeFilter]);

  const displayed = search
    ? units.filter(u => u.unitNumber?.toLowerCase().includes(search.toLowerCase()))
    : units;

  const byStatus = stats?.byStatus || {};
  const byUnitType = stats?.byUnitType || {};

  const getStatVal = (key) => {
    if (key === "total") return stats?.totalUnits || 0;
    return byStatus[key] || 0;
  };

  return (
    <div style={S.page}>
      {/* Header */}
      <div style={S.topBar}>
        <div>
          <h1 style={S.pageTitle}>Inventory Management</h1>
          <p style={S.pageSubtitle}>Manage all units across your projects</p>
        </div>
        <div style={S.headerActions}>
          <Upload beforeUpload={handleCSV} accept=".csv" showUploadList={false}>
            <button style={S.outlineBtn}><UploadOutlined style={{ fontSize: 13 }} /> Import CSV</button>
          </Upload>
          <button
            style={{ ...S.primaryBtn, background: "#15803d", opacity: !projectId ? 0.5 : 1 }}
            disabled={!projectId || generating}
            onClick={handleAutoGenerate}
          >
            <ThunderboltOutlined style={{ fontSize: 13 }} /> {generating ? "Generating..." : "Auto-Generate"}
          </button>
          <button
            style={{ ...S.primaryBtn, opacity: !projectId ? 0.5 : 1 }}
            disabled={!projectId}
            onClick={() => setCreateModal(true)}
          >
            <PlusOutlined style={{ fontSize: 13 }} /> Add Unit
          </button>
        </div>
      </div>

      {/* Stat Cards */}
      {stats && (
        <div style={S.statsRow}>
          {STAT_CARDS.map(s => (
            <div key={s.key} style={S.statCard}>
              <div style={{ ...S.statIcon, color: s.color, background: s.bg }}>{s.icon}</div>
              <div>
                <div style={{ ...S.statCount, color: s.color }}>{getStatVal(s.key)}</div>
                <div style={S.statLabel}>{s.label}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Filter Bar */}
      <div style={S.filterBar}>
        <div style={S.filterGroup}>
          <label style={S.filterLabel}><HomeOutlined style={{ fontSize: 11 }} /> Project</label>
          <Select
            style={{ width: 220 }}
            placeholder="Select project"
            options={projects}
            value={projectId}
            showSearch
            filterOption={(i, o) => o.label?.toLowerCase().includes(i.toLowerCase())}
            onChange={val => {
              setProjectId(val);
              localStorage.setItem("selectedProject", val);
              setCurrentPage(1); setStatusFilter(null); setUtFilter(null); setSearch("");
            }}
          />
        </div>

        <div style={S.filterGroup}>
          <label style={S.filterLabel}><FilterOutlined style={{ fontSize: 11 }} /> Status</label>
          <Select style={{ width: 140 }} placeholder="All" allowClear value={statusFilter}
            onChange={val => { setStatusFilter(val); setCurrentPage(1); }}>
            {Object.keys(STATUS_CONFIG).map(s => (
              <Option key={s} value={s}>
                <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <span style={{ width: 7, height: 7, borderRadius: "50%", background: STATUS_CONFIG[s]?.dot, display: "inline-block" }} />
                  {toLabel(s)}
                </span>
              </Option>
            ))}
          </Select>
        </div>

        <div style={S.filterGroup}>
          <label style={S.filterLabel}>Unit Type</label>
          <Select style={{ width: 140 }} placeholder="All" allowClear value={unitTypeFilter}
            onChange={val => { setUtFilter(val); setCurrentPage(1); }}>
            {UNIT_TYPES.map(t => <Option key={t} value={t}>{toLabel(t)}</Option>)}
          </Select>
        </div>

        <div style={{ ...S.filterGroup, flex: 1 }}>
          <label style={S.filterLabel}>Search</label>
          <div style={{ position: "relative" }}>
            <SearchOutlined style={{ position: "absolute", left: 11, top: "50%", transform: "translateY(-50%)", color: "#94a3b8", fontSize: 13, zIndex: 1 }} />
            <input
              style={S.searchInput}
              placeholder="Unit number..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            {search && <button style={S.clearBtn} onClick={() => setSearch("")}>✕</button>}
          </div>
        </div>

        <div style={{ ...S.filterGroup, justifyContent: "flex-end" }}>
          <label style={S.filterLabel}>&nbsp;</label>
          <button style={S.iconBtn} onClick={() => fetchInventory(projectId, currentPage)} disabled={!projectId}>
            <ReloadOutlined style={{ fontSize: 14 }} />
          </button>
        </div>

        {(statusFilter || unitTypeFilter || search) && (
          <div style={{ ...S.filterGroup, justifyContent: "flex-end" }}>
            <label style={S.filterLabel}>&nbsp;</label>
            <button style={S.clearFiltersBtn} onClick={() => { setStatusFilter(null); setUtFilter(null); setSearch(""); }}>
              Clear Filters
            </button>
          </div>
        )}
      </div>

      {/* Unit Type Breakdown */}
      {Object.keys(byUnitType).length > 0 && (
        <div style={S.breakdownWrap}>
          <div style={S.breakdownTitle}>Inventory Breakdown by Unit Type</div>
          <div style={S.breakdownGrid}>
            {Object.entries(byUnitType).map(([type, data]) => (
              <div key={type} style={S.breakdownCard}>
                <div style={S.breakdownType}>{toLabel(type)}</div>
                <div style={S.breakdownTags}>
                  <span style={{ ...S.miniTag, color: "#15803d", background: "#f0fdf4", border: "1px solid #bbf7d0" }}>Avail {data.available || 0}</span>
                  <span style={{ ...S.miniTag, color: "#6d28d9", background: "#f5f3ff", border: "1px solid #ddd6fe" }}>Res {data.reserved || 0}</span>
                  <span style={{ ...S.miniTag, color: "#92400e", background: "#fffbeb", border: "1px solid #fde68a" }}>Book {data.booked || 0}</span>
                  <span style={{ ...S.miniTag, color: "#1e40af", background: "#eff6ff", border: "1px solid #bfdbfe" }}>Sold {data.sold || 0}</span>
                </div>
                {data.pricing?.min && (
                  <div style={S.breakdownPrice}>
                    {Number(data.pricing.min).toLocaleString()} – {Number(data.pricing.max).toLocaleString()} AED
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Result Count */}
      <div style={S.resultRow}>
        <span style={S.resultTxt}>
          {search ? `${displayed.length} result${displayed.length !== 1 ? "s" : ""}` : `${totalItems} unit${totalItems !== 1 ? "s" : ""} total`}
        </span>
      </div>

      {/* Grid / Empty States */}
      {!projectId ? (
        <div style={S.emptyState}>
          <div style={S.emptyIcon}><HomeOutlined style={{ fontSize: 28, color: "#94a3b8" }} /></div>
          <p style={S.emptyTitle}>No project selected</p>
          <p style={S.emptySub}>Select a project from the filter above to view its inventory</p>
        </div>
      ) : loading ? (
        <div style={{ textAlign: "center", padding: "80px 0" }}>
          <Spin size="large" />
        </div>
      ) : displayed.length === 0 ? (
        <div style={S.emptyState}>
          <div style={S.emptyIcon}><AppstoreOutlined style={{ fontSize: 28, color: "#94a3b8" }} /></div>
          <p style={S.emptyTitle}>No units found</p>
          <p style={S.emptySub}>Try changing your filters or add a new unit</p>
          <button style={S.primaryBtn} onClick={() => setCreateModal(true)}>
            <PlusOutlined /> Add Unit
          </button>
        </div>
      ) : (
        <>
          <div style={S.grid}>
            {displayed.map(unit => (
              <InventoryCard
                key={unit.key}
                unit={unit}
                onEdit={openEdit}
                onAction={handleAction}
                onView={openView}
              />
            ))}
          </div>

          {!search && totalItems > PAGE_SIZE && (
            <div style={{ textAlign: "center", marginTop: 24 }}>
              <Pagination
                current={currentPage}
                total={totalItems}
                pageSize={PAGE_SIZE}
                onChange={p => { setCurrentPage(p); fetchInventory(projectId, p); }}
                showTotal={t => `${t} units`}
                showSizeChanger={false}
              />
            </div>
          )}
        </>
      )}

      {/* Create Modal */}
      <Modal
        title={<span style={S.modalTitle}><PlusOutlined style={{ color: "#6d28d9" }} /> Add New Unit</span>}
        open={createModal}
        onCancel={() => { setCreateModal(false); createForm.resetFields(); }}
        footer={null} width={780} destroyOnClose
      >
        <Form form={createForm} layout="vertical" onFinish={handleCreate}>
          <InventoryFormFields activeProperty={propertiesList.find(p => p._id === projectId)} />
          <div style={S.modalFooter}>
            <button style={S.outlineBtn} type="button" onClick={() => { setCreateModal(false); createForm.resetFields(); }}>Cancel</button>
            <button style={{ ...S.primaryBtn, opacity: saving ? 0.7 : 1 }} type="submit" disabled={saving}>
              {saving ? "Saving..." : "Create Unit"}
            </button>
          </div>
        </Form>
      </Modal>

      {/* View Modal */}
      <Modal
        title={<span style={S.modalTitle}><EyeOutlined style={{ color: "#6d28d9" }} /> Unit Details — {selectedUnit?.unitNumber}</span>}
        open={viewModal}
        onCancel={() => { setViewModal(false); setSelectedUnit(null); }}
        footer={[
          <Button key="close" onClick={() => { setViewModal(false); setSelectedUnit(null); }}>Close</Button>,
          <Button key="edit" type="primary" style={{ backgroundColor: "#6d28d9" }} onClick={() => {
            setViewModal(false);
            openEdit(selectedUnit);
          }}>Edit</Button>
        ]}
        width={600}
        destroyOnClose
      >
        {selectedUnit && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div style={{ padding: 12, background: '#f8fafc', borderRadius: 8, border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: 12, color: '#64748b', marginBottom: 4 }}>Unit Type</div>
                <div style={{ fontSize: 14, fontWeight: 600, color: '#0f172a' }}>{toLabel(selectedUnit.unitType)}</div>
              </div>
              <div style={{ padding: 12, background: '#f8fafc', borderRadius: 8, border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: 12, color: '#64748b', marginBottom: 4 }}>Status</div>
                <div style={{ fontSize: 14, fontWeight: 600, color: '#0f172a' }}>{toLabel(selectedUnit.status)}</div>
              </div>
              {selectedUnit.bedroomType && (
                <div style={{ padding: 12, background: '#f8fafc', borderRadius: 8, border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: 12, color: '#64748b', marginBottom: 4 }}>Bedroom Type</div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: '#0f172a' }}>{toLabel(selectedUnit.bedroomType)}</div>
                </div>
              )}
              {selectedUnit.bedrooms != null && (
                <div style={{ padding: 12, background: '#f8fafc', borderRadius: 8, border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: 12, color: '#64748b', marginBottom: 4 }}>Bedrooms</div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: '#0f172a' }}>{selectedUnit.bedrooms}</div>
                </div>
              )}
              {selectedUnit.bathrooms != null && (
                <div style={{ padding: 12, background: '#f8fafc', borderRadius: 8, border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: 12, color: '#64748b', marginBottom: 4 }}>Bathrooms</div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: '#0f172a' }}>{selectedUnit.bathrooms}</div>
                </div>
              )}
              {selectedUnit.area != null && (
                <div style={{ padding: 12, background: '#f8fafc', borderRadius: 8, border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: 12, color: '#64748b', marginBottom: 4 }}>Area</div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: '#0f172a' }}>{Number(selectedUnit.area).toLocaleString()} {selectedUnit.areaUnit || 'sqft'}</div>
                </div>
              )}
              {selectedUnit.price != null && (
                <div style={{ padding: 12, background: '#f8fafc', borderRadius: 8, border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: 12, color: '#64748b', marginBottom: 4 }}>Price</div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: '#6d28d9' }}>{fmt(selectedUnit.price, selectedUnit.currency)}</div>
                </div>
              )}
              {selectedUnit.buildingName && (
                <div style={{ padding: 12, background: '#f8fafc', borderRadius: 8, border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: 12, color: '#64748b', marginBottom: 4 }}>Building Name</div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: '#0f172a' }}>{selectedUnit.buildingName}</div>
                </div>
              )}
              {selectedUnit.floorNumber != null && (
                <div style={{ padding: 12, background: '#f8fafc', borderRadius: 8, border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: 12, color: '#64748b', marginBottom: 4 }}>Floor Number</div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: '#0f172a' }}>{selectedUnit.floorNumber}</div>
                </div>
              )}
              {selectedUnit.furnishing && (
                <div style={{ padding: 12, background: '#f8fafc', borderRadius: 8, border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: 12, color: '#64748b', marginBottom: 4 }}>Furnishing</div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: '#0f172a' }}>{toLabel(selectedUnit.furnishing)}</div>
                </div>
              )}
              {selectedUnit.parkingSpaces != null && (
                <div style={{ padding: 12, background: '#f8fafc', borderRadius: 8, border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: 12, color: '#64748b', marginBottom: 4 }}>Parking Spaces</div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: '#0f172a' }}>{selectedUnit.parkingSpaces}</div>
                </div>
              )}
              {selectedUnit.hasView && selectedUnit.viewType?.length > 0 && (
                <div style={{ padding: 12, background: '#f8fafc', borderRadius: 8, border: '1px solid #e2e8f0', gridColumn: 'span 2' }}>
                  <div style={{ fontSize: 12, color: '#64748b', marginBottom: 4 }}>View Types</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {selectedUnit.viewType.map((v, idx) => (
                      <span key={idx} style={{
                        fontSize: 12,
                        padding: '4px 10px',
                        borderRadius: 20,
                        background: '#e0e7ff',
                        color: '#4f46e5',
                        fontWeight: 600
                      }}>
                        {toLabel(v)}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </Modal>

      {/* Edit Modal */}
      <Modal
        title={<span style={S.modalTitle}><EditOutlined style={{ color: "#6d28d9" }} /> Edit Unit — {selectedUnit?.unitNumber}</span>}
        open={editModal}
        onCancel={() => { setEditModal(false); editForm.resetFields(); setSelectedUnit(null); }}
        footer={null} width={780} destroyOnClose
      >
        <Form form={editForm} layout="vertical" onFinish={handleUpdate}>
          <InventoryFormFields isEdit selectedUnit={selectedUnit} activeProperty={propertiesList.find(p => p._id === projectId)} />
          <div style={S.modalFooter}>
            <button style={S.outlineBtn} type="button" onClick={() => { setEditModal(false); editForm.resetFields(); setSelectedUnit(null); }}>Cancel</button>
            <button style={{ ...S.primaryBtn, opacity: saving ? 0.7 : 1 }} type="submit" disabled={saving}>
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </Form>
      </Modal>

      {/* Config Modal for Auto-Generate */}
      <Modal
        title={<span style={S.modalTitle}><ThunderboltOutlined style={{ color: "#6d28d9" }} /> Configure & Generate Inventory</span>}
        open={configModalVisible}
        onCancel={() => { setConfigModalVisible(false); configForm.resetFields(); }}
        footer={null} width={800} destroyOnClose
      >
        {propertyConfig?.message && (
          <div style={{
            marginBottom: "16px",
            padding: "12px 16px",
            borderRadius: "8px",
            background: propertyConfig.mismatchedTypes ? "#fef2f2" : "#f0fdf4",
            border: `1px solid ${propertyConfig.mismatchedTypes ? "#fecaca" : "#bbf7d0"}`,
            color: propertyConfig.mismatchedTypes ? "#b91c1c" : "#15803d",
            fontSize: "13px"
          }}>
            {propertyConfig.message}
          </div>
        )}

        <Form form={configForm} layout="vertical">
          {propertyConfig?.categoryConfig?.configFields?.map((field, idx) => (
            <div key={idx}>
              <Divider style={{ margin: "16px 0 8px" }}>{field.label}</Divider>
              {field.type === "array" && field.fields && (
                <Form.List name={field.key}>
                  {(fields, { add, remove }) => (
                    <>
                      {fields.map((listField, i) => (
                        <div key={listField.key} style={{
                          marginBottom: "12px",
                          padding: "12px",
                          border: "1px solid #e2e8f0",
                          borderRadius: "8px",
                          background: "#f8fafc"
                        }}>
                          <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "8px" }}>
                            <button
                              type="button"
                              onClick={() => remove(i)}
                              style={{
                                background: "#fff",
                                border: "1px solid #fecaca",
                                color: "#dc2626",
                                borderRadius: "4px",
                                padding: "4px 8px",
                                cursor: "pointer",
                                fontSize: "12px"
                              }}
                            >
                              Remove
                            </button>
                          </div>
                          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "12px" }}>
                            {field.fields.map((subField) => (
                              <Form.Item
                                key={subField.key}
                                name={[listField.name, subField.key]}
                                label={subField.label}
                                rules={subField.required ? [{ required: true, message: `${subField.label} is required` }] : []}
                                initialValue={subField.default}
                              >
                                {subField.type === "select" && subField.options ? (
                                  <Select placeholder={`Select ${subField.label}`}>
                                    {subField.options.map(opt => (
                                      <Option key={opt} value={opt}>{toLabel(opt)}</Option>
                                    ))}
                                  </Select>
                                ) : subField.type === "multiSelect" && subField.options ? (
                                  <Select mode="multiple" placeholder={`Select ${subField.label}`} allowClear>
                                    {subField.options.map(opt => (
                                      <Option key={opt} value={opt}>{toLabel(opt)}</Option>
                                    ))}
                                  </Select>
                                ) : subField.type === "boolean" ? (
                                  <Switch />
                                ) : subField.type === "number" ? (
                                  <InputNumber style={{ width: "100%" }} />
                                ) : (
                                  <Input placeholder={`Enter ${subField.label}`} />
                                )}
                              </Form.Item>
                            ))}
                          </div>
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={() => add()}
                        style={{
                          width: "100%",
                          border: "1.5px dashed #d1d5db",
                          borderRadius: "8px",
                          padding: "12px",
                          background: "#fafafa",
                          color: "#6d28d9",
                          cursor: "pointer",
                          fontSize: "13px",
                          fontWeight: 600
                        }}
                      >
                        <PlusOutlined /> Add {field.label.slice(0, -1)}
                      </button>
                    </>
                  )}
                </Form.List>
              )}

              {field.type !== "array" && (
                <Form.Item
                  name={field.key}
                  label={field.label}
                  rules={field.required ? [{ required: true, message: `${field.label} is required` }] : []}
                  initialValue={field.default}
                >
                  {field.type === "select" && field.options ? (
                    <Select placeholder={`Select ${field.label}`}>
                      {field.options.map(opt => (
                        <Option key={opt} value={opt}>{toLabel(opt)}</Option>
                      ))}
                    </Select>
                  ) : field.type === "number" ? (
                    <InputNumber style={{ width: "100%" }} />
                  ) : (
                    <Input placeholder={`Enter ${field.label}`} />
                  )}
                </Form.Item>
              )}
            </div>
          ))}

          <div style={S.modalFooter}>
            <button
              style={S.outlineBtn}
              type="button"
              onClick={() => { setConfigModalVisible(false); configForm.resetFields(); }}
              disabled={generating}
            >
              Cancel
            </button>
            <button
              style={{ ...S.primaryBtn, opacity: generating ? 0.7 : 1 }}
              type="button"
              onClick={handleSubmitConfigAndGenerate}
              disabled={generating}
            >
              {generating ? "Generating..." : "Generate Inventory"}
            </button>
          </div>
        </Form>
      </Modal>
    </div>
  );
}

// Styles
const S = {
  page: { minHeight: "100vh", background: "#f8fafc", padding: "28px 24px", fontFamily: "'Inter','Segoe UI',sans-serif" },

  topBar: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24, flexWrap: "wrap", gap: 12 },
  pageTitle: { margin: 0, fontSize: 22, fontWeight: 700, color: "#0f172a", letterSpacing: "-0.3px" },
  pageSubtitle: { margin: "3px 0 0", fontSize: 13, color: "#64748b" },
  headerActions: { display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" },

  primaryBtn: { display: "inline-flex", alignItems: "center", gap: 7, background: "#6d28d9", color: "#fff", border: "none", borderRadius: 8, padding: "9px 18px", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" },
  outlineBtn: { display: "inline-flex", alignItems: "center", gap: 7, background: "#fff", color: "#374151", border: "1.5px solid #d1d5db", borderRadius: 8, padding: "9px 16px", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" },
  iconBtn: { display: "inline-flex", alignItems: "center", justifyContent: "center", background: "#fff", color: "#374151", border: "1.5px solid #d1d5db", borderRadius: 8, padding: "9px 11px", cursor: "pointer", fontFamily: "inherit" },

  statsRow: { display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(150px,1fr))", gap: 12, marginBottom: 20 },
  statCard: { display: "flex", alignItems: "center", gap: 12, background: "#fff", border: "1.5px solid #e2e8f0", borderRadius: 10, padding: "14px 16px" },
  statIcon: { width: 36, height: 36, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15, flexShrink: 0 },
  statCount: { fontSize: 20, fontWeight: 700, lineHeight: 1.1 },
  statLabel: { fontSize: 11, color: "#64748b", fontWeight: 500, marginTop: 1 },

  filterBar: { display: "flex", gap: 16, flexWrap: "wrap", alignItems: "flex-end", background: "#fff", border: "1.5px solid #e2e8f0", borderRadius: 10, padding: "16px 20px", marginBottom: 20 },
  filterGroup: { display: "flex", flexDirection: "column", gap: 4 },
  filterLabel: { fontSize: 11, fontWeight: 600, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em" },
  searchInput: { padding: "8px 32px 8px 34px", border: "1.5px solid #e2e8f0", borderRadius: 8, fontSize: 13, background: "#fff", color: "#0f172a", outline: "none", fontFamily: "inherit", width: "100%", boxSizing: "border-box", minWidth: 180 },
  clearBtn: { position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: "#94a3b8", cursor: "pointer", fontSize: 11, padding: 2 },
  clearFiltersBtn: { background: "none", border: "1px solid #e2e8f0", borderRadius: 6, padding: "8px 12px", fontSize: 12, color: "#64748b", cursor: "pointer", fontFamily: "inherit" },

  breakdownWrap: { background: "#fff", border: "1.5px solid #e2e8f0", borderRadius: 10, padding: "16px 20px", marginBottom: 20 },
  breakdownTitle: { fontSize: 13, fontWeight: 700, color: "#0f172a", marginBottom: 14 },
  breakdownGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(200px,1fr))", gap: 12 },
  breakdownCard: { background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 8, padding: "12px 14px" },
  breakdownType: { fontSize: 13, fontWeight: 700, color: "#0f172a", marginBottom: 8 },
  breakdownTags: { display: "flex", flexWrap: "wrap", gap: 5, marginBottom: 8 },
  miniTag: { fontSize: 11, fontWeight: 600, padding: "2px 7px", borderRadius: 4 },
  breakdownPrice: { fontSize: 11, color: "#6d28d9", fontWeight: 600 },

  resultRow: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 },
  resultTxt: { fontSize: 12, color: "#64748b", fontWeight: 500 },

  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(272px,1fr))", gap: 16 },

  card: { background: "#fff", border: "1.5px solid #e2e8f0", borderRadius: 10, overflow: "hidden" },
  cardHeader: { padding: "12px 16px", display: "flex", justifyContent: "space-between", alignItems: "flex-start", borderBottom: "1px solid #f1f5f9" },
  unitNum: { fontSize: 15, fontWeight: 700, color: "#0f172a" },
  unitSub: { fontSize: 11, color: "#64748b", marginTop: 2 },
  statusPill: { display: "inline-flex", alignItems: "center", gap: 5, fontSize: 11, fontWeight: 600, padding: "3px 9px", borderRadius: 20 },
  statusDot: { width: 6, height: 6, borderRadius: "50%", flexShrink: 0 },

  cardBody: { padding: "10px 16px" },
  fieldRow: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "5px 0", borderBottom: "1px solid #f8fafc" },
  fieldLabel: { fontSize: 12, color: "#94a3b8", fontWeight: 500 },
  fieldValue: { fontSize: 12, color: "#0f172a", fontWeight: 500, textAlign: "right", maxWidth: "60%" },

  cardActions: { padding: "10px 16px", display: "flex", gap: 7, borderTop: "1px solid #f1f5f9" },
  actBtn: { flex: 1, display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 5, borderRadius: 6, padding: "7px 0", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" },
  actBtnOutline: { background: "#fff", color: "#374151", border: "1.5px solid #d1d5db" },
  actBtnOutlineHov: { background: "#f8fafc", color: "#374151", border: "1.5px solid #94a3b8" },
  actBtnPurple: { background: "#6d28d9", color: "#fff", border: "none" },
  actBtnPurpleHov: { background: "#5b21b6", color: "#fff", border: "none" },
  actBtnDanger: { background: "#fff", color: "#dc2626", border: "1.5px solid #fecaca" },

  emptyState: { textAlign: "center", padding: "64px 20px", background: "#fff", borderRadius: 10, border: "1.5px dashed #e2e8f0" },
  emptyIcon: { width: 60, height: 60, background: "#f8fafc", borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px", border: "1px solid #e2e8f0" },
  emptyTitle: { margin: "0 0 6px", fontSize: 16, fontWeight: 700, color: "#0f172a" },
  emptySub: { margin: "0 0 20px", fontSize: 13, color: "#64748b" },

  modalTitle: { fontSize: 15, fontWeight: 700, color: "#0f172a", display: "flex", alignItems: "center", gap: 8 },
  modalFooter: { display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 20, paddingTop: 16, borderTop: "1px solid #f1f5f9" },

  formSection: { fontSize: 12, fontWeight: 700, color: "#6d28d9", textTransform: "uppercase", letterSpacing: "0.07em", padding: "12px 0 8px", borderBottom: "1px solid #f1f5f9", marginBottom: 12 },
  formGrid3: { display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12 },
  formGrid4: { display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12 },
};