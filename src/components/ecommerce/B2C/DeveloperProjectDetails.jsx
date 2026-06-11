import {
  Card, Typography, Row, Col, Tag, Button, Spin, Descriptions,
  Image, Progress, Alert, Table, Badge, Modal, Form, Input,
  InputNumber, Select, message, Space, Tooltip, Statistic, Divider,
} from "antd";
import {
  ArrowLeftOutlined, EnvironmentOutlined, CalendarOutlined,
  PlusOutlined, EditOutlined, DeleteOutlined,
  ReloadOutlined, FilePdfOutlined, PaperClipOutlined, FolderOpenOutlined,
} from "@ant-design/icons";
import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import dayjs from "dayjs";
import { apiService } from "../../../manageApi/utils/custom.apiservice";

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;

const THEME = { primary: "#6d28d9", light: "#f3e8ff" };

const APPROVAL_COLOR   = { pending: "orange", approved: "green", rejected: "red", changes_requested: "orange", draft: "default" };
const PROJECT_STATUS_COLOR = { presale: "blue", under_construction: "orange", ready: "green", completed: "green", sold_out: "red", planned: "default" };
const PROJECT_STATUS_LABEL = { presale: "Pre-Sale", under_construction: "Under Construction", ready: "Ready", completed: "Completed", sold_out: "Sold Out", planned: "Planned" };

const UNIT_STATUS_CONFIG = {
  available: { status: "success",    label: "Available" },
  hold:      { status: "default",    label: "Hold"      },
  reserved:  { status: "warning",    label: "Reserved"  },
  booked:    { status: "processing", label: "Booked"    },
  spa_signed:{ status: "processing", label: "SPA Signed"},
  sold:      { status: "error",      label: "Sold"      },
  handover:  { status: "success",    label: "Handover"  },
  cancelled: { status: "error",      label: "Cancelled" },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

const fmt = (n) => n ? `AED ${Number(n).toLocaleString()}` : "—";

const completionLabel = (cd) => {
  if (!cd) return "Not specified";
  if (cd.quarter && cd.year) return `${cd.quarter} ${cd.year}`;
  if (cd.fullDate && dayjs(cd.fullDate).isValid()) return dayjs(cd.fullDate).format("MMM YYYY");
  return "Not specified";
};

const SectionTitle = ({ children }) => (
  <div style={{ fontWeight: 700, fontSize: 15, color: THEME.primary, marginBottom: 16 }}>
    {children}
  </div>
);

// ─── Main Component ───────────────────────────────────────────────────────────

export default function DeveloperProjectDetails() {
  const { id }     = useParams();
  const navigate   = useNavigate();

  const [project,          setProject]          = useState(null);
  const [loading,          setLoading]          = useState(true);
  const [inventory,        setInventory]        = useState([]);
  const [inventoryStats,   setInventoryStats]   = useState({
    total: 0, available: 0, hold: 0, reserved: 0,
    booked: 0, spa_signed: 0, sold: 0, handover: 0, cancelled: 0,
  });
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });

  // Unit modal
  const [modalVisible, setModalVisible] = useState(false);
  const [modalMode,    setModalMode]    = useState("create");
  const [selectedUnit, setSelectedUnit] = useState(null);
  const [unitForm]   = Form.useForm();

  // ── Fetch ─────────────────────────────────────────────────────────────────
  const fetchProject = async () => {
    try {
      setLoading(true);
      const res  = await apiService.get(`/properties/${id}`);
      const data = res?.data?.data || res?.data;
      setProject(data);

      if (Array.isArray(data?.inventory)) {
        setInventory(data.inventory);
        setPagination((p) => ({ ...p, total: data.inventory.length }));
      }
      if (data?.inventoryStats) setInventoryStats(data.inventoryStats);
    } catch (err) {
      message.error("Failed to load project details");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { if (id) fetchProject(); }, [id]);

  // ── Unit CRUD ──────────────────────────────────────────────────────────────
  const openCreateUnit = () => {
    setModalMode("create");
    setSelectedUnit(null);
    unitForm.resetFields();
    setModalVisible(true);
  };

  const openEditUnit = (unit) => {
    setModalMode("edit");
    setSelectedUnit(unit);
    unitForm.setFieldsValue(unit);
    setModalVisible(true);
  };

  const handleDeleteUnit = (unit) => {
    Modal.confirm({
      title: "Delete Unit",
      content: `Delete Unit ${unit.unitNumber}?`,
      okType: "danger",
      onOk: async () => {
        try {
          await apiService.delete(`/properties/inventory/${unit._id}`);
          message.success("Unit deleted");
          fetchProject();
        } catch { message.error("Failed to delete unit"); }
      },
    });
  };

  const handleUnitSubmit = async () => {
    try {
      const values = await unitForm.validateFields();
      if (modalMode === "create") {
        await apiService.post("/properties/inventory", { propertyId: project._id, units: [values] });
        message.success("Unit added");
      } else {
        await apiService.patch(`/properties/inventory/${selectedUnit._id}`, values);
        message.success("Unit updated");
      }
      setModalVisible(false);
      fetchProject();
    } catch (err) {
      if (err?.errorFields) return; // validation error, already shown
      message.error("Failed to save unit");
    }
  };

  // ── Inventory table columns ────────────────────────────────────────────────
  const inventoryColumns = [
    {
      title: "Unit #", dataIndex: "unitNumber", key: "unitNumber",
      render: (text, rec) => (
        <Button type="link" style={{ padding: 0 }} onClick={() => { setSelectedUnit(rec); setModalMode("view"); setModalVisible(true); }}>
          {text}
        </Button>
      ),
    },
    { title: "Building", dataIndex: "buildingName", key: "buildingName", render: (v) => v || "—" },
    { title: "Floor",    dataIndex: "floorNumber",  key: "floorNumber",  render: (v) => v ?? "G" },
    { title: "Type",     dataIndex: "unitType",     key: "unitType",     render: (v) => <Tag>{v}</Tag> },
    { title: "Beds/Bath", key: "bb", render: (_, r) => `${r.bedrooms || 0} / ${r.bathrooms || 0}` },
    { title: "Area",  key: "area", render: (_, r) => `${r.area?.toLocaleString() || 0} ${r.areaUnit || "sqft"}` },
    {
      title: "Price", dataIndex: "price", key: "price",
      render: (v, r) => <Text strong>{r.currency || "AED"} {v?.toLocaleString() || 0}</Text>,
    },
    {
      title: "Status", dataIndex: "status", key: "status",
      render: (s) => {
        const cfg = UNIT_STATUS_CONFIG[s] || UNIT_STATUS_CONFIG.available;
        return <Badge status={cfg.status} text={cfg.label} />;
      },
    },
    {
      title: "Actions", key: "actions",
      render: (_, rec) => (
        <Space size={4}>
          <Tooltip title="Edit">
            <Button icon={<EditOutlined />} size="small" onClick={() => openEditUnit(rec)} />
          </Tooltip>
          <Tooltip title="Delete">
            <Button icon={<DeleteOutlined />} size="small" danger onClick={() => handleDeleteUnit(rec)} />
          </Tooltip>
        </Space>
      ),
    },
  ];

  // ── Loading / empty ────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "60vh" }}>
        <Spin size="large" tip="Loading project..." />
      </div>
    );
  }

  if (!project) {
    return (
      <div style={{ padding: 24 }}>
        <Alert type="error" message="Project not found." showIcon />
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate(-1)} style={{ marginTop: 16 }}>
          Go Back
        </Button>
      </div>
    );
  }

  // ── Derived values ─────────────────────────────────────────────────────────
  const projectName  = project.projectName || project.propertyName || "Untitled Project";
  const mainLogo     = project.media?.mainLogo || project.mainLogo || null;
  const archPhotos   = project.media?.architectureImages || project.photos?.architecture || [];
  const interPhotos  = project.media?.interiorImages     || project.photos?.interior     || [];
  const lobbyPhotos  = project.media?.lobbyImages        || project.photos?.lobby        || [];
  const coverImg     = archPhotos[0] || interPhotos[0] || null;

  const photoCats = [
    { label: "Architecture", photos: archPhotos },
    { label: "Interior",     photos: interPhotos },
    { label: "Lobby",        photos: lobbyPhotos },
  ].filter((c) => c.photos.length > 0);

  const locality   = project.locality || project.area || "";
  const address    = project.location?.address || "";
  const lat        = project.location?.latitude  || project.coordinates?.lat || null;
  const lng        = project.location?.longitude || project.coordinates?.lng || null;
  const locationStr = [address || locality, project.city, project.country].filter(Boolean).join(", ");

  const unitTypes = Array.isArray(project.unitTypes) && project.unitTypes.length > 0
    ? project.unitTypes
    : (project.unitType ? [project.unitType] : []);

  const overview   = project.overview || project.description || "";
  const priceFrom  = project.priceRange?.from || project.price_min || 0;
  const priceTo    = project.priceRange?.to   || project.price_max || 0;
  const priceStr   = priceFrom && priceTo && priceFrom !== priceTo
    ? `${fmt(priceFrom)} – ${fmt(priceTo)}`
    : fmt(priceFrom);

  const constructProgress = project.constructionProgress ?? parseInt(project.readinessProgress) ?? 0;
  const serviceCharge     = project.serviceCharge || project.serviceChargeInfo || "";

  const completion = completionLabel(project.completionDate);

  const developerName = project.developerDetails?.companyName || project.developerName || "—";
  const devContact    = project.developerDetails?.contactName  || project.developerDetails?.primaryContactName || "";
  const devEmail      = project.developerDetails?.email  || "";
  const devPhone      = project.developerDetails?.phone  || "";
  const devLicense    = project.developerDetails?.developerLicenseNumber || "";
  const devLogo       = project.developerDetails?.logo   || "";

  const amenities = Array.isArray(project.amenities) ? project.amenities : [];

  // Inventory stats
  const inv = inventoryStats;
  const totalUnits    = inv.total    || project.totalUnits || 0;
  const availUnits    = inv.available || 0;
  const holdUnits     = inv.hold      || 0;
  const reservedUnits = inv.reserved  || project.reservedUnits || 0;
  const bookedUnits   = inv.booked    || project.bookedUnits   || 0;
  const spaUnits      = inv.spa_signed || 0;
  const soldUnits     = inv.sold      || project.soldUnits     || 0;
  const handoverUnits = inv.handover  || 0;
  const cancelUnits   = inv.cancelled || 0;
  const occupiedUnits = soldUnits + reservedUnits + bookedUnits + spaUnits + handoverUnits;
  const occupancyRate = totalUnits > 0 ? Math.round((occupiedUnits / totalUnits) * 100) : 0;

  // Check if inventory is overview rows (not child unit listings)
  const isInventoryOverview = inventory.length > 0 && !inventory[0]?.unitNumber;

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div style={{ padding: "24px", background: "#f5f3ff", minHeight: "100vh" }}>

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate("/dashboard/developer/developer-properties")}>
          Back to My Properties
        </Button>
        <Space>
          <Tooltip title="Refresh">
            <Button icon={<ReloadOutlined />} onClick={fetchProject} />
          </Tooltip>
          <Button
            type="primary"
            icon={<EditOutlined />}
            onClick={() => navigate(`/dashboard/developer/edit-property/${id}`)}
            style={{ background: THEME.primary, borderColor: THEME.primary }}
          >
            Edit Project
          </Button>
          <Button
            icon={<FolderOpenOutlined />}
            onClick={() => navigate(`/dashboard/developer/developer-properties/${id}/documents`)}
            style={{ borderColor: '#7c3aed', color: '#7c3aed' }}
          >
            Documents
          </Button>
          <Button
            icon={<PlusOutlined />}
            onClick={openCreateUnit}
          >
            Add Unit
          </Button>
        </Space>
      </div>

      {/* Admin feedback banners */}
      {project.approvalStatus === "changes_requested" && project.adminComments && (
        <Alert
          type="warning" showIcon
          message="Admin Requested Changes"
          description={project.adminComments}
          style={{ marginBottom: 16 }}
        />
      )}
      {project.approvalStatus === "rejected" && project.rejectionReason && (
        <Alert
          type="error" showIcon
          message="Listing Rejected"
          description={project.rejectionReason}
          style={{ marginBottom: 16 }}
        />
      )}
      {project.approvalStatus === "draft" && (
        <Alert
          type="info" showIcon
          message="This listing is saved as a draft. Submit it for admin approval when ready."
          style={{ marginBottom: 16 }}
        />
      )}

      {/* ── Hero Card ─────────────────────────────────────────── */}
      <Card style={{ borderRadius: 16, overflow: "hidden", marginBottom: 20, border: "none" }} styles={{ body: { padding: 0 } }}>
        {coverImg ? (
          <div style={{ position: "relative", height: 240, background: "#f0ebff" }}>
            <img src={coverImg} alt="cover" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            <div style={{
              position: "absolute", inset: 0,
              background: "linear-gradient(to top, rgba(0,0,0,0.55) 0%, transparent 55%)",
            }} />
            <div style={{ position: "absolute", top: 12, right: 12, display: "flex", gap: 6 }}>
              <Tag color={APPROVAL_COLOR[project.approvalStatus] || "default"} style={{ margin: 0, fontWeight: 700 }}>
                {project.approvalStatus === "changes_requested" ? "CHANGES REQUESTED" : project.approvalStatus?.toUpperCase()}
              </Tag>
              <Tag color={PROJECT_STATUS_COLOR[project.projectStatus] || "default"} style={{ margin: 0, fontWeight: 700 }}>
                {PROJECT_STATUS_LABEL[project.projectStatus] || project.projectStatus}
              </Tag>
            </div>
          </div>
        ) : (
          <div style={{ height: 80, background: "linear-gradient(135deg, #e9d5ff, #dbeafe)" }} />
        )}

        <div style={{ padding: "16px 24px 24px", display: "flex", gap: 16, flexWrap: "wrap" }}>
          {mainLogo && (
            <img
              src={mainLogo} alt="logo"
              style={{
                width: 80, height: 80, objectFit: "contain",
                borderRadius: 12, border: "3px solid #fff",
                boxShadow: "0 2px 8px rgba(0,0,0,0.12)",
                background: "#fff", flexShrink: 0,
                marginTop: coverImg ? -40 : 0,
              }}
            />
          )}
          <div style={{ flex: 1, minWidth: 200 }}>
            <Title level={3} style={{ margin: "0 0 4px" }}>{projectName}</Title>
            {locationStr && (
              <Text style={{ color: "#6b7280", fontSize: 13 }}>
                <EnvironmentOutlined style={{ marginRight: 4 }} />
                {locationStr}
              </Text>
            )}
            <div style={{ marginTop: 10, display: "flex", flexWrap: "wrap", gap: 6 }}>
              {unitTypes.map((ut) => (
                <Tag key={ut} color="purple" style={{ margin: 0 }}>
                  {ut.charAt(0).toUpperCase() + ut.slice(1).replace("_", " ")}
                </Tag>
              ))}
              {project.furnishingStatus && (
                <Tag style={{ margin: 0 }}>{project.furnishingStatus}</Tag>
              )}
              {project.developmentStatus && (
                <Tag color="geekblue" style={{ margin: 0 }}>{project.developmentStatus}</Tag>
              )}
              {project.saleStatus && project.saleStatus !== "Available" && (
                <Tag color="volcano" style={{ margin: 0 }}>{project.saleStatus}</Tag>
              )}
            </div>
          </div>

          <div style={{
            background: THEME.light,
            border: `1px solid #ddd6fe`,
            borderRadius: 12,
            padding: "16px 20px",
            textAlign: "right",
            minWidth: 200,
            flexShrink: 0,
          }}>
            <Text style={{ fontSize: 11, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.05em", display: "block" }}>
              Price Range
            </Text>
            <div style={{ fontSize: 18, fontWeight: 800, color: THEME.primary, marginTop: 4 }}>
              {priceStr}
            </div>
            {completion !== "Not specified" && (
              <Text style={{ fontSize: 12, color: "#6b7280", marginTop: 4, display: "block" }}>
                <CalendarOutlined style={{ marginRight: 4 }} />
                Completion: {completion}
              </Text>
            )}
          </div>
        </div>
      </Card>

      {/* ── Quick Stats Row ────────────────────────────────────── */}
      <Row gutter={[12, 12]} style={{ marginBottom: 20 }}>
        {[
          { label: "Total Units",    value: totalUnits || "—",         color: "#6d28d9" },
          { label: "Floors",         value: project.numberOfFloors || project.floors || "—", color: "#0ea5e9" },
          { label: "Completion",     value: completion,                color: "#f59e0b" },
          { label: "Progress",       value: `${constructProgress}%`,  color: "#10b981" },
          { label: "Service Charge", value: serviceCharge || "—",     color: "#8b5cf6" },
        ].map(({ label, value, color }) => (
          <Col xs={12} sm={8} md={4} key={label}>
            <Card
              style={{ borderRadius: 12, border: "1px solid #e5e7eb", textAlign: "center" }}
              styles={{ body: { padding: "14px 10px" } }}
            >
              <div style={{ fontSize: 17, fontWeight: 700, color }}>{value}</div>
              <div style={{ fontSize: 11, color: "#9ca3af", marginTop: 4 }}>{label}</div>
            </Card>
          </Col>
        ))}
      </Row>

      {/* ── Construction Progress ──────────────────────────────── */}
      <Card style={{ borderRadius: 16, marginBottom: 20, border: "1px solid #e5e7eb" }}>
        <SectionTitle>Construction Progress</SectionTitle>
        <Progress
          percent={constructProgress}
          strokeColor={THEME.primary}
          trailColor="#f3f4f6"
          format={(p) => <span style={{ fontWeight: 700 }}>{p}%</span>}
        />
        {project.developmentStatus && (
          <Text type="secondary" style={{ fontSize: 12, marginTop: 8, display: "block" }}>
            Status: {project.developmentStatus}
          </Text>
        )}
      </Card>

      {/* ── Inventory Dashboard ───────────────────────────────── */}
      <Card style={{ borderRadius: 16, marginBottom: 20, border: "1px solid #e5e7eb" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <SectionTitle>Inventory Overview</SectionTitle>
          <Tooltip title="Refresh">
            <Button icon={<ReloadOutlined />} onClick={fetchProject} size="small" />
          </Tooltip>
        </div>
        <Row gutter={[12, 12]}>
          {[
            { label: "Available", value: availUnits,    bg: "#f0fdf4", color: "#10b981" },
            { label: "Hold",      value: holdUnits,     bg: "#f9fafb", color: "#6b7280" },
            { label: "Reserved",  value: reservedUnits, bg: "#fffbeb", color: "#f59e0b" },
            { label: "Booked",    value: bookedUnits,   bg: "#eff6ff", color: "#3b82f6" },
            { label: "SPA Signed",value: spaUnits,      bg: "#f5f3ff", color: "#7c3aed" },
            { label: "Sold",      value: soldUnits,     bg: "#fef2f2", color: "#ef4444" },
            ...(handoverUnits > 0 ? [{ label: "Handover", value: handoverUnits, bg: "#ecfeff", color: "#06b6d4" }] : []),
            ...(cancelUnits   > 0 ? [{ label: "Cancelled",value: cancelUnits,  bg: "#fff1f2", color: "#f43f5e" }] : []),
          ].map(({ label, value, bg, color }) => (
            <Col xs={8} sm={6} md={4} key={label}>
              <div style={{ textAlign: "center", background: bg, borderRadius: 10, padding: "10px 8px" }}>
                <Statistic value={value} valueStyle={{ color, fontSize: 22 }} />
                <Text style={{ fontSize: 11, color: "#6b7280" }}>{label}</Text>
              </div>
            </Col>
          ))}
        </Row>
        {totalUnits > 0 && (
          <div style={{ marginTop: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "#6b7280", marginBottom: 4 }}>
              <span>Occupancy Rate</span>
              <span>{occupancyRate}%</span>
            </div>
            <Progress percent={occupancyRate} strokeColor={THEME.primary} showInfo={false} />
          </div>
        )}
      </Card>

      {/* ── Inventory Table (child units) or Inventory Overview (summary rows) */}
      {inventory.length > 0 && (
        <Card
          title={<span style={{ fontWeight: 700 }}>{isInventoryOverview ? "Inventory Summary" : "Unit Inventory"}</span>}
          style={{ borderRadius: 16, marginBottom: 20, border: "1px solid #e5e7eb" }}
          extra={<Text style={{ color: "#9ca3af", fontSize: 12 }}>Total: {totalUnits} units</Text>}
        >
          {isInventoryOverview ? (
            <Table
              size="small"
              dataSource={inventory}
              rowKey={(r, i) => r._id || i}
              pagination={false}
              columns={[
                { title: "Unit Type", dataIndex: "unitType", key: "unitType", render: (v) => <Tag>{v}</Tag> },
                { title: "Units",     dataIndex: "units",    key: "units"    },
                { title: "Sq Ft (from)", dataIndex: "sqft", key: "sqft", render: (v) => v?.toLocaleString() || "—" },
                { title: "Sq M (from)",  dataIndex: "sqm",  key: "sqm",  render: (v) => v?.toLocaleString() || "—" },
              ]}
            />
          ) : (
            <Table
              columns={inventoryColumns}
              dataSource={inventory}
              rowKey={(r, i) => r._id || i}
              pagination={{
                current: pagination.current,
                pageSize: pagination.pageSize,
                total: pagination.total,
                showSizeChanger: true,
                showTotal: (t) => `Total ${t} units`,
                onChange: (page, pageSize) => setPagination((p) => ({ ...p, current: page, pageSize })),
              }}
              scroll={{ x: 900 }}
            />
          )}
        </Card>
      )}

      {/* ── Floor Plans Summary ────────────────────────────────── */}
      {project.floorPlans?.length > 0 && (
        <Card style={{ borderRadius: 16, marginBottom: 20, border: "1px solid #e5e7eb" }}>
          <SectionTitle>Floor Plan & Unit Details</SectionTitle>
          <Table
            size="small"
            dataSource={project.floorPlans}
            rowKey={(_, i) => i}
            pagination={false}
            columns={[
              { title: "Unit Type",     dataIndex: "unitType", key: "unitType" },
              { title: "Area From (sq ft)", dataIndex: "areaFrom", key: "areaFrom", render: (v) => v?.toLocaleString() || "—" },
              { title: "Area To (sq ft)",   dataIndex: "areaTo",   key: "areaTo",   render: (v) => v?.toLocaleString() || "—" },
            ]}
          />
        </Card>
      )}

      {/* ── Overview & Property Details ───────────────────────── */}
      <Card style={{ borderRadius: 16, marginBottom: 20, border: "1px solid #e5e7eb" }}>
        <SectionTitle>Project Overview</SectionTitle>
        {overview ? (
          <Paragraph style={{ color: "#4b5563", lineHeight: 1.8, whiteSpace: "pre-line" }}>
            {overview}
          </Paragraph>
        ) : (
          <Text type="secondary">No overview provided.</Text>
        )}
        <Divider />
        <SectionTitle>Property Details</SectionTitle>
        <Descriptions
          bordered
          column={{ xs: 1, sm: 2, md: 3 }}
          size="small"
          labelStyle={{ background: "#f8fafc", color: "#64748b", fontWeight: 500 }}
          contentStyle={{ color: "#1e293b", fontWeight: 500 }}
        >
          <Descriptions.Item label="Project Name">{projectName}</Descriptions.Item>
          <Descriptions.Item label="Developer">{developerName}</Descriptions.Item>
          <Descriptions.Item label="Locality">{locality || "—"}</Descriptions.Item>
          <Descriptions.Item label="Property Type">{project.propertyType || "—"}</Descriptions.Item>
          <Descriptions.Item label="Unit Types">
            <Space size={4} wrap>
              {unitTypes.map((u) => <Tag key={u} color="purple" style={{ margin: 0 }}>{u}</Tag>)}
            </Space>
          </Descriptions.Item>
          <Descriptions.Item label="Completion">{completion}</Descriptions.Item>
          <Descriptions.Item label="Price Range">
            <Text strong style={{ color: THEME.primary }}>{priceStr}</Text>
          </Descriptions.Item>
          <Descriptions.Item label="Floors">{project.numberOfFloors || project.floors || "—"}</Descriptions.Item>
          <Descriptions.Item label="Furnishing">{project.furnishingStatus || "—"}</Descriptions.Item>
          <Descriptions.Item label="Parking">{project.parkingAllocation || "—"}</Descriptions.Item>
          <Descriptions.Item label="Service Charge">{serviceCharge || "—"}</Descriptions.Item>
          <Descriptions.Item label="Project Status">
            <Tag color={PROJECT_STATUS_COLOR[project.projectStatus] || "default"} style={{ margin: 0 }}>
              {PROJECT_STATUS_LABEL[project.projectStatus] || project.projectStatus || "—"}
            </Tag>
          </Descriptions.Item>
          <Descriptions.Item label="Development Status">{project.developmentStatus || "—"}</Descriptions.Item>
          <Descriptions.Item label="Sale Status">{project.saleStatus || "—"}</Descriptions.Item>
          <Descriptions.Item label="Approval">
            <Tag color={APPROVAL_COLOR[project.approvalStatus] || "default"} style={{ margin: 0 }}>
              {project.approvalStatus === "changes_requested" ? "Changes Requested" : project.approvalStatus?.toUpperCase()}
            </Tag>
          </Descriptions.Item>
          {project.resubmissionCount > 0 && (
            <Descriptions.Item label="Resubmissions">{project.resubmissionCount}</Descriptions.Item>
          )}
        </Descriptions>
      </Card>

      {/* ── Location & Map ────────────────────────────────────── */}
      {(address || locality || lat) && (
        <Card style={{ borderRadius: 16, marginBottom: 20, border: "1px solid #e5e7eb" }}>
          <SectionTitle>Location</SectionTitle>
          {(address || locality) && (
            <Text style={{ display: "block", marginBottom: lat ? 12 : 0, color: "#4b5563" }}>
              <EnvironmentOutlined style={{ marginRight: 6 }} />
              {address || locality}
            </Text>
          )}
          {lat && lng && (
            <div style={{ borderRadius: 10, overflow: "hidden", border: "1px solid #e5e7eb" }}>
              <iframe
                title="map"
                src={`https://maps.google.com/maps?q=${lat},${lng}&z=15&output=embed`}
                width="100%" height="280"
                style={{ border: 0, display: "block" }}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          )}
        </Card>
      )}

      {/* ── Photos ────────────────────────────────────────────── */}
      {photoCats.length > 0 && (
        <Card style={{ borderRadius: 16, marginBottom: 20, border: "1px solid #e5e7eb" }}>
          <SectionTitle>Property Photos</SectionTitle>
          {photoCats.map((cat) => (
            <div key={cat.label} style={{ marginBottom: 20 }}>
              <Text style={{ fontSize: 11, color: "#9ca3af", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", display: "block", marginBottom: 10 }}>
                {cat.label}
              </Text>
              <Image.PreviewGroup>
                <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                  {cat.photos.map((url, i) => (
                    <div key={i} style={{ borderRadius: 10, overflow: "hidden", border: "1px solid #e5e7eb" }}>
                      <Image width={150} height={105} src={url} style={{ objectFit: "cover" }} />
                    </div>
                  ))}
                </div>
              </Image.PreviewGroup>
            </div>
          ))}
        </Card>
      )}

      {/* ── Buildings ─────────────────────────────────────────── */}
      {project.buildings?.length > 0 && (
        <Card style={{ borderRadius: 16, marginBottom: 20, border: "1px solid #e5e7eb" }}>
          <SectionTitle>Buildings in the Project</SectionTitle>
          <Row gutter={[16, 16]}>
            {project.buildings.map((b, i) => (
              <Col xs={24} sm={12} md={8} key={i}>
                <Card size="small" style={{ borderRadius: 10, border: "1px solid #e5e7eb" }}>
                  {b.image && (
                    <img src={b.image} alt={b.title || `building-${i}`}
                      style={{ width: "100%", height: 100, objectFit: "cover", borderRadius: 8, marginBottom: 8 }} />
                  )}
                  <Text strong style={{ display: "block" }}>{b.title || `Building ${i + 1}`}</Text>
                  {b.description && <Text type="secondary" style={{ fontSize: 12 }}>{b.description}</Text>}
                </Card>
              </Col>
            ))}
          </Row>
        </Card>
      )}

      {/* ── Amenities ─────────────────────────────────────────── */}
      {amenities.length > 0 && (
        <Card style={{ borderRadius: 16, marginBottom: 20, border: "1px solid #e5e7eb" }}>
          <SectionTitle>Facilities & Amenities</SectionTitle>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {amenities.map((a) => (
              <Tag key={a} color="blue" style={{ margin: 0, padding: "4px 10px" }}>{a}</Tag>
            ))}
          </div>
        </Card>
      )}

      {/* ── Payment Plan ──────────────────────────────────────── */}
      {project.paymentPlan?.length > 0 && (
        <Card style={{ borderRadius: 16, marginBottom: 20, border: "1px solid #e5e7eb" }}>
          <SectionTitle>Payment Plan</SectionTitle>
          <Row gutter={[16, 16]}>
            {project.paymentPlan.map((plan, i) => (
              <Col xs={24} md={12} lg={8} key={plan._id || i}>
                <div style={{
                  background: "#f5f3ff", borderRadius: 12,
                  border: "1px solid #ddd6fe", padding: 16,
                }}>
                  <Text strong style={{ color: THEME.primary, fontSize: 14, display: "block", marginBottom: 12, paddingBottom: 8, borderBottom: "1px solid #ddd6fe" }}>
                    {plan.title || `Plan ${i + 1}`}
                  </Text>
                  {plan.stages?.length > 0 ? (
                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                      {plan.stages.map((s, j) => (
                        <div key={j} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 13 }}>
                          <Text style={{ color: "#4b5563", flex: 1 }}>
                            {/* support both milestoneTitle (new) and stage/label/name (legacy) */}
                            {s.milestoneTitle || s.label || s.stage?.replace("_", " ") || `Stage ${j + 1}`}
                          </Text>
                          <Text strong style={{ color: "#1e1b4b", marginLeft: 12 }}>
                            {s.percentage ?? s.value}%
                          </Text>
                        </div>
                      ))}
                      {/* Total check */}
                      {(() => {
                        const total = plan.stages.reduce((s, st) => s + (st.percentage ?? st.value ?? 0), 0);
                        return (
                          <div style={{ display: "flex", justifyContent: "space-between", borderTop: "1px solid #c4b5fd", paddingTop: 8, marginTop: 4 }}>
                            <Text style={{ fontSize: 12, color: "#7c3aed", fontWeight: 600 }}>Total</Text>
                            <Text style={{ fontSize: 12, color: total === 100 ? "#10b981" : "#ef4444", fontWeight: 700 }}>
                              {total}%
                            </Text>
                          </div>
                        );
                      })()}
                    </div>
                  ) : (
                    <Text type="secondary" style={{ fontSize: 12 }}>No stages defined.</Text>
                  )}
                </div>
              </Col>
            ))}
          </Row>
        </Card>
      )}

      {/* ── Developer Details ─────────────────────────────────── */}
      <Card style={{ borderRadius: 16, marginBottom: 20, border: "1px solid #e5e7eb" }}>
        <SectionTitle>Developer Details</SectionTitle>
        <div style={{ display: "flex", gap: 20, alignItems: "flex-start", flexWrap: "wrap" }}>
          {devLogo && (
            <img src={devLogo} alt="dev-logo"
              style={{ width: 72, height: 72, objectFit: "contain", borderRadius: 10, border: "1px solid #e5e7eb", background: "#fff" }} />
          )}
          <Descriptions column={{ xs: 1, sm: 2 }} size="small" style={{ flex: 1 }}>
            <Descriptions.Item label="Company">{developerName}</Descriptions.Item>
            {devContact  && <Descriptions.Item label="Contact">{devContact}</Descriptions.Item>}
            {devEmail    && <Descriptions.Item label="Email">{devEmail}</Descriptions.Item>}
            {devPhone    && <Descriptions.Item label="Phone">{devPhone}</Descriptions.Item>}
            {devLicense  && <Descriptions.Item label="Licence No.">{devLicense}</Descriptions.Item>}
          </Descriptions>
        </div>
      </Card>

      {/* ── Documents ─────────────────────────────────────────── */}
      {(project.brochure || project.projectPlan) && (
        <Card style={{ borderRadius: 16, marginBottom: 20, border: "1px solid #e5e7eb" }}>
          <SectionTitle>Documents</SectionTitle>
          <Space size={12} wrap>
            {project.brochure && (
              <Button
                icon={<FilePdfOutlined />}
                href={project.brochure}
                target="_blank"
                rel="noopener noreferrer"
                style={{ borderColor: THEME.primary, color: THEME.primary }}
              >
                Download Brochure
              </Button>
            )}
            {project.projectPlan && (
              <Button
                icon={<PaperClipOutlined />}
                href={project.projectPlan}
                target="_blank"
                rel="noopener noreferrer"
                style={{ borderColor: "#0ea5e9", color: "#0ea5e9" }}
              >
                View Site Plan
              </Button>
            )}
          </Space>
        </Card>
      )}

      {/* ── Add / Edit Unit Modal ─────────────────────────────── */}
      <Modal
        title={modalMode === "create" ? "Add New Unit" : modalMode === "edit" ? "Edit Unit" : "Unit Details"}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={modalMode === "view" ? [
          <Button key="close" onClick={() => setModalVisible(false)}>Close</Button>,
          <Button key="edit" type="primary" onClick={() => { setModalMode("edit"); unitForm.setFieldsValue(selectedUnit); }}>
            Edit
          </Button>,
        ] : [
          <Button key="cancel" onClick={() => setModalVisible(false)}>Cancel</Button>,
          <Button key="submit" type="primary" onClick={handleUnitSubmit}>Save</Button>,
        ]}
        width={680}
      >
        <Form form={unitForm} layout="vertical" disabled={modalMode === "view"}>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="unitNumber" label="Unit Number" rules={[{ required: true, message: "Required" }]}>
                <Input placeholder="e.g., 101, A-101" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="buildingName" label="Building Name">
                <Input placeholder="Building name" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item name="floorNumber" label="Floor">
                <InputNumber className="w-full" style={{ width: "100%" }} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="unitType" label="Unit Type" rules={[{ required: true }]}>
                <Select>
                  {["apartment","villa","townhouse","duplex","penthouse","office","retail","warehouse","plot"].map((v) => (
                    <Option key={v} value={v}>{v.charAt(0).toUpperCase() + v.slice(1)}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="bedroomType" label="Bedroom Type">
                <Select>
                  {["studio","1bed","2bed","3bed","4bed","5bed","6bed","7bed","8plus"].map((v) => (
                    <Option key={v} value={v}>{v === "studio" ? "Studio" : v.replace("bed", " Bed")}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item name="bedrooms" label="Bedrooms">
                <InputNumber min={0} style={{ width: "100%" }} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="bathrooms" label="Bathrooms">
                <InputNumber min={0} style={{ width: "100%" }} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="parkingSpaces" label="Parking">
                <InputNumber min={0} style={{ width: "100%" }} />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="area" label="Area" rules={[{ required: true }]}>
                <InputNumber style={{ width: "100%" }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="areaUnit" label="Unit">
                <Select>
                  <Option value="sqft">Sq Ft</Option>
                  <Option value="sqm">Sq M</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="price" label="Price (AED)" rules={[{ required: true }]}>
                <InputNumber style={{ width: "100%" }} min={0}
                  formatter={(v) => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                  parser={(v) => v.replace(/,/g, "")} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="status" label="Status">
                <Select>
                  {Object.entries(UNIT_STATUS_CONFIG).map(([val, cfg]) => (
                    <Option key={val} value={val}>{cfg.label}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="furnishing" label="Furnishing">
            <Select>
              <Option value="unfurnished">Unfurnished</Option>
              <Option value="semi_furnished">Semi-Furnished</Option>
              <Option value="furnished">Furnished</Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>

    </div>
  );
}
