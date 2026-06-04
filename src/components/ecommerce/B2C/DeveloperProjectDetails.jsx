import {
  Card,
  Typography,
  Row,
  Col,
  Tag,
  Button,
  Spin,
  Descriptions,
  Image,
  Progress,
  Alert,
  Table,
  Badge,
  Modal,
  Form,
  Input,
  InputNumber,
  Select,
  message,
  Space,
  Tooltip,
  Statistic,
} from "antd";
import {
  ArrowLeftOutlined,
  EnvironmentOutlined,
  HomeOutlined,
  CalendarOutlined,
  DollarOutlined,
  TeamOutlined,
  CheckCircleFilled,
  CloseCircleFilled,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  ShoppingOutlined,
  BookOutlined,
  UnlockOutlined,
  ReloadOutlined,
  ApartmentOutlined,
  CarOutlined,
  PercentageOutlined,
  UnorderedListOutlined,
} from "@ant-design/icons";
import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import dayjs from "dayjs";
import { apiService } from "../../../manageApi/utils/custom.apiservice";

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;

const THEME = { primary: "#6d28d9" }; // Purple theme

// Status helpers
const APPROVAL_COLOR = {
  pending: "orange",
  approved: "green",
  rejected: "red",
};
const PROJECT_STATUS_LABEL = {
  presale: "Presale",
  under_construction: "Under Construction",
  ready: "Ready",
  completed: "Completed",
};
const PROJECT_STATUS_COLOR = {
  presale: "blue",
  under_construction: "orange",
  ready: "green",
  completed: "green",
};

// Unit status config
const UNIT_STATUS_CONFIG = {
  available: { color: "success", label: "Available", status: "success" },
  hold: { color: "default", label: "Hold", status: "default" },
  reserved: { color: "warning", label: "Reserved", status: "warning" },
  booked: { color: "processing", label: "Booked", status: "processing" },
  spa_signed: { color: "purple", label: "SPA Signed", status: "processing" },
  sold: { color: "error", label: "Sold", status: "error" },
  handover: { color: "cyan", label: "Handover", status: "success" },
  cancelled: { color: "error", label: "Cancelled", status: "error" },
};

// Facility label map
const FACILITY_LABELS = {
  swimmingPool: "Swimming Pool",
  gym: "Gym & Fitness",
  parking: "Parking",
  childrenPlayArea: "Children's Play Area",
  gardens: "Landscaped Gardens",
  security: "24/7 Security",
  concierge: "Concierge Services",
  lounge: "Lounge",
  smartHome: "Smart Home",
};

const AMENITY_LABELS = {
  "Swimming Pool": "Swimming Pool",
  Gym: "Gym & Fitness",
  Parking: "Parking",
  "Children Play Area": "Children's Play Area",
  Gardens: "Landscaped Gardens",
  Security: "24/7 Security",
  Concierge: "Concierge Services",
  Lounge: "Lounge",
  "Smart Home": "Smart Home",
};

export default function DeveloperProjectDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Inventory states (now from combined API)
  const [inventory, setInventory] = useState([]);
  const [inventoryStats, setInventoryStats] = useState({
    total: 0,
    available: 0,
    hold: 0,
    reserved: 0,
    booked: 0,
    spa_signed: 0,
    sold: 0,
    handover: 0,
    cancelled: 0
  });
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });
  const [inventoryLoading, setInventoryLoading] = useState(false);
  
  // Modal states
  const [modalVisible, setModalVisible] = useState(false);
  const [modalMode, setModalMode] = useState("create");
  const [selectedUnit, setSelectedUnit] = useState(null);
  const [form] = Form.useForm();

  // Fetch project details (now includes combined inventory data!)
  useEffect(() => {
    if (!id) return;
    fetchProjectDetails();
  }, [id]);

  const fetchProjectDetails = async () => {
    try {
      setLoading(true);
      const res = await apiService.get(`/properties/${id}`);
      const data = res?.data?.data || res?.data;
      setProject(data);
      
      // Extract combined inventory data
      if (data.inventory) {
        setInventory(data.inventory);
        setPagination(prev => ({
          ...prev,
          total: data.inventory.length
        }));
      }
      if (data.inventoryStats) {
        setInventoryStats(data.inventoryStats);
      }
    } catch (err) {
      console.error(err);
      message.error("Failed to load project details");
    } finally {
      setLoading(false);
    }
  };

  const fetchInventory = async () => {
    await fetchProjectDetails();
  };

  const handleCreateUnit = () => {
    setModalMode("create");
    setSelectedUnit(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEditUnit = (unit) => {
    setModalMode("edit");
    setSelectedUnit(unit);
    form.setFieldsValue({
      unitNumber: unit.unitNumber,
      buildingName: unit.buildingName,
      floorNumber: unit.floorNumber,
      unitType: unit.unitType,
      bedroomType: unit.bedroomType,
      bedrooms: unit.bedrooms,
      bathrooms: unit.bathrooms,
      area: unit.area,
      areaUnit: unit.areaUnit,
      price: unit.price,
      currency: unit.currency,
      parkingSpaces: unit.parkingSpaces,
      furnishing: unit.furnishing,
      status: unit.status
    });
    setModalVisible(true);
  };

  const handleDeleteUnit = async (unit) => {
    Modal.confirm({
      title: "Delete Unit",
      content: `Are you sure you want to delete Unit ${unit.unitNumber}?`,
      okText: "Delete",
      okType: "danger",
      cancelText: "Cancel",
      onOk: async () => {
        try {
          const res = await apiService.delete(`/properties/inventory/${unit._id}`);
          if (res?.data?.success) {
            message.success("Unit deleted successfully");
            fetchInventory();
            fetchProjectDetails();
          }
        } catch (err) {
          message.error("Failed to delete unit");
        }
      }
    });
  };

  const handleFormSubmit = async () => {
    try {
      const values = await form.validateFields();
      
      if (modalMode === "create") {
        const payload = {
          propertyId: project._id,
          units: [values]
        };
        const res = await apiService.post('/properties/inventory', payload);
        if (res?.data?.success) {
          message.success("Unit added successfully");
          setModalVisible(false);
          fetchInventory();
          fetchProjectDetails();
        }
      } else if (modalMode === "edit" && selectedUnit) {
        const res = await apiService.patch(`/properties/inventory/${selectedUnit._id}`, values);
        if (res?.data?.success) {
          message.success("Unit updated successfully");
          setModalVisible(false);
          fetchInventory();
        }
      }
    } catch (error) {
      console.error("Form validation failed:", error);
      message.error("Please check the form for errors");
    }
  };

  // Table columns for inventory
  const inventoryColumns = [
    {
      title: "Unit #",
      dataIndex: "unitNumber",
      key: "unitNumber",
      render: (text, record) => (
        <Button type="link" className="p-0" onClick={() => {
          setSelectedUnit(record);
          setModalMode("view");
          setModalVisible(true);
        }}>
          {text}
        </Button>
      )
    },
    {
      title: "Building",
      dataIndex: "buildingName",
      key: "buildingName",
      render: (text) => text || "—"
    },
    {
      title: "Floor",
      dataIndex: "floorNumber",
      key: "floorNumber",
      render: (text) => text || "G"
    },
    {
      title: "Type",
      dataIndex: "unitType",
      key: "unitType",
      render: (text) => <Tag>{text}</Tag>
    },
    {
      title: "Beds/Baths",
      key: "beds",
      render: (_, record) => `${record.bedrooms || 0} / ${record.bathrooms || 0}`
    },
    {
      title: "Area",
      key: "area",
      render: (_, record) => `${record.area?.toLocaleString() || 0} ${record.areaUnit || 'sqft'}`
    },
    {
      title: "Price",
      dataIndex: "price",
      key: "price",
      render: (text, record) => (
        <Text strong>
          {record.currency || "AED"} {text?.toLocaleString() || 0}
        </Text>
      )
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status) => {
        const config = UNIT_STATUS_CONFIG[status] || UNIT_STATUS_CONFIG.available;
        return <Badge status={config.status} text={config.label} />;
      }
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Space>
          <Tooltip title="Edit">
            <Button icon={<EditOutlined />} size="small" onClick={() => handleEditUnit(record)} />
          </Tooltip>
          <Tooltip title="Delete">
            <Button icon={<DeleteOutlined />} size="small" danger onClick={() => handleDeleteUnit(record)} />
          </Tooltip>
        </Space>
      )
    }
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <Spin size="large" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen">
        <Alert type="error" message="Property not found." showIcon />
        <Button className="mt-4 rounded-lg font-medium" icon={<ArrowLeftOutlined />} onClick={() => navigate(-1)}>
          Go Back
        </Button>
      </div>
    );
  }

  // Derived values
  const allPhotos = [
    ...(project.media?.architectureImages || []),
    ...(project.media?.interiorImages || []),
    ...(project.media?.lobbyImages || []),
    ...(project.media?.otherImages || []),
  ];

  const photoCategoryMap = [
    { label: "Architecture", photos: project.media?.architectureImages || [] },
    { label: "Interior", photos: project.media?.interiorImages || [] },
    { label: "Lobby", photos: project.media?.lobbyImages || [] },
    { label: "Other", photos: project.media?.otherImages || [] },
  ].filter(c => c.photos.length > 0);

  const locationStr = [project.area, project.city, project.country].filter(Boolean).join(", ");

  const completionLabel = project.completionDate?.quarter && project.completionDate?.year
    ? `${project.completionDate.quarter} ${project.completionDate.year}`
    : project.completionDate?.fullDate
      ? dayjs(project.completionDate.fullDate).isValid()
        ? dayjs(project.completionDate.fullDate).format("MMM D, YYYY")
        : String(project.completionDate.fullDate)
      : "Not specified";

  const readinessValue = parseInt(project.readinessProgress) || 0;

  const firstFloorPlan = project.floorPlans?.[0] || {};
  const builtUpMin = project.builtUpArea_min ?? firstFloorPlan.areaFrom ?? 0;
  const builtUpMax = project.builtUpArea_max ?? firstFloorPlan.areaTo ?? 0;
  const builtUpUnit = project.builtUpAreaUnit || "sqft";

  const developerDisplayName =
    project.developerName ||
    project.developerDetails?.companyName ||
    project.developerDetails?.contactName ||
    project.developerDetails?.primaryContactName ||
    "—";

  const selectedAmenities = Array.isArray(project.amenities) ? project.amenities : [];
  const amenityRendered = selectedAmenities.map((a) => AMENITY_LABELS[a] || a).filter(Boolean);

  const selectedFacilityKeys = project.facilities
    ? Object.entries(project.facilities).filter(([, v]) => !!v).map(([k]) => k)
    : [];
  const facilityRendered = selectedFacilityKeys.map((k) => FACILITY_LABELS[k] || k).filter(Boolean);

  const amenitiesAndFacilitiesToShow = Array.from(new Set([...amenityRendered, ...facilityRendered]));

  const bedroomLabel = project.bedroomType
    ? project.bedroomType.replace("bed", " Bedroom").replace("studio", "Studio")
    : project.bedrooms
    ? `${project.bedrooms} Bedroom`
    : "—";

  // Use inventory stats from combined API
  const displayTotalUnits = inventoryStats.total || project.totalUnits || 0;
  const displaySoldUnits = inventoryStats.sold || project.soldUnits || 0;
  const displayReservedUnits = inventoryStats.reserved || project.reservedUnits || 0;
  const displayBookedUnits = inventoryStats.booked || project.bookedUnits || 0;
  const displayAvailableUnits = inventoryStats.available || 0;
  const displayHoldUnits = inventoryStats.hold || 0;
  const displaySpaSignedUnits = inventoryStats.spa_signed || 0;
  const displayHandoverUnits = inventoryStats.handover || 0;
  const displayCancelledUnits = inventoryStats.cancelled || 0;
  
  // Calculate occupancy rate
  const occupiedUnits = displaySoldUnits + displayReservedUnits + displayBookedUnits + displaySpaSignedUnits + displayHandoverUnits;
  const occupancyRate = displayTotalUnits > 0 ? Math.round((occupiedUnits / displayTotalUnits) * 100) : 0;

  return (
    <div className="p-4 md:p-6 bg-gray-50 min-h-screen max-w-[1600px] mx-auto">

      {/* Back Button */}
      <div className="flex justify-between items-center mb-5">
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate(-1)}
          className="rounded-lg font-medium"
        >
          Back to My Properties
        </Button>
        
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={handleCreateUnit}
          style={{ backgroundColor: THEME.primary }}
          className="rounded-lg font-medium"
        >
          Add Unit
        </Button>
      </div>

      {/* Hero Card */}
      <Card className="mb-6 rounded-2xl overflow-hidden shadow-sm border-0" bodyStyle={{ padding: 0 }}>
        {allPhotos.length > 0 ? (
          <div className="h-56 md:h-72 w-full relative bg-gray-100">
            <img src={allPhotos[0]} alt="cover" className="w-full h-full object-contain" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            
            <div className="absolute top-4 right-4 flex gap-2">
              <Tag color={APPROVAL_COLOR[project.approvalStatus]} className="font-bold text-xs px-3 py-1 rounded-full border-0 shadow-sm m-0">
                {project.approvalStatus?.toUpperCase()}
              </Tag>
              <Tag color={PROJECT_STATUS_COLOR[project.projectStatus] || "default"} className="font-bold text-xs px-3 py-1 rounded-full border-0 shadow-sm m-0">
                {PROJECT_STATUS_LABEL[project.projectStatus] || project.projectStatus}
              </Tag>
            </div>
          </div>
        ) : (
          <div className="h-32 w-full bg-gradient-to-r from-purple-100 to-indigo-50" />
        )}

        <div className="px-6 pb-6 pt-4 relative flex flex-col md:flex-row md:items-start gap-4">
          {project.mainLogo && (
            <img
              src={project.mainLogo}
              alt="logo"
              className="w-20 h-20 rounded-xl object-contain border-4 border-white shadow-md bg-white -mt-12 flex-shrink-0 z-10 relative"
            />
          )}
          <div className="flex-1 mt-2 md:mt-0">
            <Title level={3} className="!mb-1">{project.propertyName || "Untitled Property"}</Title>
            <Text className="text-gray-500 text-sm flex items-center gap-1 mb-3">
              <EnvironmentOutlined />
              {locationStr || "Location not specified"}
            </Text>
            
            <div className="flex flex-wrap gap-2">
              <Tag color="purple" className="rounded-md px-2 py-0.5 m-0">{project.unitType?.replace("_", " ")}</Tag>
              <Tag color="blue" className="rounded-md px-2 py-0.5 m-0">{bedroomLabel}</Tag>
              {project.furnishing && (
                <Tag className="rounded-md px-2 py-0.5 m-0">{project.furnishing.charAt(0).toUpperCase() + project.furnishing.slice(1)}</Tag>
              )}
              {project.ownershipType && (
                <Tag color="geekblue" className="rounded-md px-2 py-0.5 m-0">{project.ownershipType}</Tag>
              )}
              {project.hasView && project.viewType?.length > 0 && (
                project.viewType.map(v => (
                  <Tag key={v} color="cyan" className="rounded-md px-2 py-0.5 m-0">{v.charAt(0).toUpperCase() + v.slice(1)} View</Tag>
                ))
              )}
            </div>
          </div>

          <div className="md:text-right mt-4 md:mt-0 bg-gray-50 p-4 rounded-xl border border-gray-100 shrink-0 min-w-[200px]">
            <Text className="text-gray-500 text-xs uppercase font-semibold tracking-wider">Price Range</Text>
            <div className="my-1">
              <span className="text-xl font-bold" style={{ color: THEME.primary }}>
                {project.currency} {Number(project.price_min || 0).toLocaleString()}
              </span>
              <span className="text-gray-400 mx-2">–</span>
              <span className="text-xl font-bold" style={{ color: THEME.primary }}>
                {Number(project.price_max || 0).toLocaleString()}
              </span>
            </div>
            <Text className="text-gray-500 text-sm">
              {Number(project.builtUpArea_min || 0).toLocaleString()} –{" "}
              {Number(project.builtUpArea_max || 0).toLocaleString()} {project.builtUpAreaUnit}
            </Text>
          </div>
        </div>

        {project.approvalStatus === "rejected" && project.rejectionReason && (
          <div className="px-6 pb-6">
            <Alert type="error" showIcon message={<span className="font-semibold">Rejection Reason</span>} description={project.rejectionReason} className="rounded-lg" />
          </div>
        )}
      </Card>

      {/* Inventory Dashboard */}
      <Card className="mb-6 rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4">
          <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <UnorderedListOutlined className="text-xl" style={{ color: THEME.primary }} />
                <Title level={5} className="!mb-0">Inventory Overview</Title>
              </div>
              <Tooltip title="Refresh">
                <Button icon={<ReloadOutlined />} onClick={fetchProjectDetails} size="small" />
              </Tooltip>
            </div>

          <Row gutter={[16, 16]}>
            <Col xs={12} sm={6} md={4}>
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <Statistic value={displayAvailableUnits} valueStyle={{ color: '#10b981', fontSize: '24px' }} />
                <Text className="text-xs text-gray-500">Available</Text>
              </div>
            </Col>
            <Col xs={12} sm={6} md={4}>
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <Statistic value={displayHoldUnits} valueStyle={{ color: '#6b7280', fontSize: '24px' }} />
                <Text className="text-xs text-gray-500">Hold</Text>
              </div>
            </Col>
            <Col xs={12} sm={6} md={4}>
              <div className="text-center p-3 bg-orange-50 rounded-lg">
                <Statistic value={displayReservedUnits} valueStyle={{ color: '#f59e0b', fontSize: '24px' }} />
                <Text className="text-xs text-gray-500">Reserved</Text>
              </div>
            </Col>
            <Col xs={12} sm={6} md={4}>
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <Statistic value={displayBookedUnits} valueStyle={{ color: '#3b82f6', fontSize: '24px' }} />
                <Text className="text-xs text-gray-500">Booked</Text>
              </div>
            </Col>
            <Col xs={12} sm={6} md={4}>
              <div className="text-center p-3 bg-purple-50 rounded-lg">
                <Statistic value={displaySpaSignedUnits} valueStyle={{ color: '#8b5cf6', fontSize: '24px' }} />
                <Text className="text-xs text-gray-500">SPA Signed</Text>
              </div>
            </Col>
            <Col xs={12} sm={6} md={4}>
              <div className="text-center p-3 bg-red-50 rounded-lg">
                <Statistic value={displaySoldUnits} valueStyle={{ color: '#ef4444', fontSize: '24px' }} />
                <Text className="text-xs text-gray-500">Sold</Text>
              </div>
            </Col>
            {displayHandoverUnits > 0 && (
              <Col xs={12} sm={6} md={4}>
                <div className="text-center p-3 bg-cyan-50 rounded-lg">
                  <Statistic value={displayHandoverUnits} valueStyle={{ color: '#06b6d4', fontSize: '24px' }} />
                  <Text className="text-xs text-gray-500">Handover</Text>
                </div>
              </Col>
            )}
            {displayCancelledUnits > 0 && (
              <Col xs={12} sm={6} md={4}>
                <div className="text-center p-3 bg-rose-50 rounded-lg">
                  <Statistic value={displayCancelledUnits} valueStyle={{ color: '#f43f5e', fontSize: '24px' }} />
                  <Text className="text-xs text-gray-500">Cancelled</Text>
                </div>
              </Col>
            )}
          </Row>

          {displayTotalUnits > 0 && (
            <div className="mt-4">
              <div className="flex justify-between text-xs text-gray-500 mb-1">
                <span>Occupancy Rate</span>
                <span>{occupancyRate}%</span>
              </div>
              <Progress 
                percent={occupancyRate}
                strokeColor={THEME.primary}
                showInfo={false}
              />
            </div>
          )}
        </div>
      </Card>

      {/* Inventory Table */}
      <Card 
        title={<span className="text-lg font-bold">Unit Inventory</span>}
        className="mb-6 shadow-sm rounded-2xl border border-gray-100"
        extra={<Text className="text-xs text-gray-400">Total: {displayTotalUnits} units</Text>}
      >
        <Table
          columns={inventoryColumns}
          dataSource={inventory}
          rowKey="key"
          loading={inventoryLoading}
          pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            total: pagination.total,
            showSizeChanger: true,
            showTotal: (total) => `Total ${total} units`,
            onChange: (page, pageSize) => setPagination(prev => ({ ...prev, current: page, pageSize }))
          }}
          scroll={{ x: 1000 }}
          locale={{ emptyText: inventoryLoading ? "Loading..." : "No inventory units added yet. Click 'Add Unit' to get started." }}
        />
      </Card>

      {/* Quick Stats Row */}
      <Row gutter={[16, 16]} className="mb-6">
        {[
          { icon: <HomeOutlined className="text-[#6d28d9] text-xl" />, label: "Total Units", value: displayTotalUnits || "—" },
          { icon: <TeamOutlined className="text-[#0ea5e9] text-xl" />, label: "Bedrooms", value: project.bedrooms || "—" },
          { icon: <CalendarOutlined className="text-[#f59e0b] text-xl" />, label: "Completion", value: completionLabel },
          { icon: <DollarOutlined className="text-[#10b981] text-xl" />, label: "Floors", value: project.floors || "—" },
          { icon: <CarOutlined className="text-[#8b5cf6] text-xl" />, label: "Parking Spaces", value: project.parkingSpaces ?? "—" },
        ].map(({ icon, label, value }) => (
          <Col xs={12} sm={8} md={4} key={label} className="flex-1">
            <Card className="shadow-sm border border-gray-100 rounded-2xl text-center transition-all hover:-translate-y-1 hover:shadow-md cursor-default h-full" bodyStyle={{ padding: "16px 12px" }}>
              <div className="mb-2 bg-gray-50 inline-flex p-3 rounded-full">{icon}</div>
              <div className="text-lg font-bold text-gray-800 leading-tight">{value}</div>
              <div className="text-xs text-gray-400 font-medium mt-1">{label}</div>
            </Card>
          </Col>
        ))}
      </Row>

      {/* Rest of your existing content (Photos, Property Details, Description, Proximity, Payment Plan, Bottom Cards) */}
      <div className="space-y-6 mb-6">
        {/* Photos by category */}
        {photoCategoryMap.length > 0 && (
          <Card title={<span className="text-lg font-bold">Property Photos</span>} className="shadow-sm rounded-2xl border border-gray-100">
            {photoCategoryMap.map(cat => (
              <div key={cat.label} className="mb-6 last:mb-0">
                <Text className="block mb-3 text-xs text-gray-400 uppercase tracking-widest font-bold">{cat.label}</Text>
                <Image.PreviewGroup>
                  <div className="flex gap-3 flex-wrap">
                    {cat.photos.map((url, i) => (
                      <div key={i} className="rounded-xl overflow-hidden border border-gray-100 shadow-sm">
                        <Image width={160} height={110} className="object-contain hover:scale-105 transition-transform duration-300 bg-gray-50" src={url} />
                      </div>
                    ))}
                  </div>
                </Image.PreviewGroup>
              </div>
            ))}
          </Card>
        )}

        {/* Property Details */}
        <Card title={<span className="text-lg font-bold">Property Details</span>} className="shadow-sm rounded-2xl border border-gray-100 overflow-hidden" bodyStyle={{ padding: 0 }}>
          <div className="overflow-x-auto p-1">
            <Descriptions bordered column={{ xs: 1, sm: 2, md: 3, lg: 4 }} size="middle" className="min-w-[700px] w-full" 
              labelStyle={{ backgroundColor: '#f8fafc', color: '#64748b', fontWeight: 500, whiteSpace: 'nowrap', width: 'auto', minWidth: '130px' }}
              contentStyle={{ color: '#1e293b', fontWeight: 500, minWidth: '130px' }}
            >
              <Descriptions.Item label="Property Name">{project.propertyName || "—"}</Descriptions.Item>
              <Descriptions.Item label="Developer Name">{developerDisplayName}</Descriptions.Item>
              <Descriptions.Item label="Unit Type">
                <Tag color="purple" className="m-0 bg-purple-50 text-purple-700 border-purple-200">
                  {project.unitType?.charAt(0).toUpperCase() + project.unitType?.slice(1)}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Bedroom Type">{bedroomLabel}</Descriptions.Item>
              <Descriptions.Item label="Bathrooms">{project.bathrooms ?? "—"}</Descriptions.Item>
              <Descriptions.Item label="Total Units">{displayTotalUnits || "—"}</Descriptions.Item>
              <Descriptions.Item label="Floors">{project.floors || "—"}</Descriptions.Item>
              <Descriptions.Item label="Parking Spaces">{project.parkingSpaces ?? "—"}</Descriptions.Item>
              <Descriptions.Item label="Built-Up Area">{Number(builtUpMin).toLocaleString()} – {Number(builtUpMax).toLocaleString()} {builtUpUnit}</Descriptions.Item>
              <Descriptions.Item label="Price Range">
                <Text strong style={{ color: THEME.primary }}>{project.currency} {project.price_min?.toLocaleString()} – {project.price_max?.toLocaleString()}</Text>
              </Descriptions.Item>
              <Descriptions.Item label="Ownership Type">{project.ownershipType || "—"}</Descriptions.Item>
              <Descriptions.Item label="Furnishing">{project.furnishing ? project.furnishing.charAt(0).toUpperCase() + project.furnishing.slice(1) : "—"}</Descriptions.Item>
              <Descriptions.Item label="Project Status">
                <Tag color={PROJECT_STATUS_COLOR[project.projectStatus] || "default"} className="m-0">
                  {PROJECT_STATUS_LABEL[project.projectStatus] || project.projectStatus}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Completion Date">{completionLabel}</Descriptions.Item>
              <Descriptions.Item label="Transaction Type">{project.transactionType || "—"}</Descriptions.Item>
              {project.hasView && (
                <Descriptions.Item label="View Type">
                  <div className="flex gap-2 flex-wrap">{project.viewType?.map(v => (<Tag key={v} color="cyan" className="m-0">{v}</Tag>))}</div>
                </Descriptions.Item>
              )}
            </Descriptions>
          </div>
        </Card>

        {/* Description */}
        <Card title={<span className="text-lg font-bold">Description</span>} className="shadow-sm rounded-2xl border border-gray-100">
          <Paragraph className="text-gray-600 leading-relaxed text-sm m-0 whitespace-pre-line">
            {project.description || "No description provided."}
          </Paragraph>
        </Card>

        {/* Proximity */}
        {Object.values(project.proximity || {}).some(Boolean) && (
          <Card title={<span className="text-lg font-bold">Proximity</span>} className="shadow-sm rounded-2xl border border-gray-100">
            <Row gutter={[16, 16]}>
              {Object.entries(project.proximity).map(([key, val]) => val ? (
                <Col xs={12} sm={8} md={4} key={key}>
                  <div className="text-center p-4 bg-indigo-50 rounded-xl border border-indigo-100 h-full flex flex-col justify-center">
                    <div className="text-xl font-extrabold" style={{ color: THEME.primary }}>{val} min</div>
                    <div className="text-xs text-gray-500 mt-1 capitalize font-medium">{key}</div>
                  </div>
                </Col>
              ) : null)}
            </Row>
          </Card>
        )}

        {/* Payment Plan */}
        {project.paymentPlan?.length > 0 && (
          <Card title={<span className="text-lg font-bold">Payment Plan</span>} className="shadow-sm rounded-2xl border border-gray-100">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {project.paymentPlan.map((plan, i) => (
                <div key={plan._id || i} className="p-5 bg-purple-50 rounded-xl border border-purple-100">
                  <Text strong className="text-purple-700 text-[15px] block mb-3 border-b border-purple-200 pb-2">
                    {plan.title || `Plan ${i + 1}`}
                  </Text>
                  {plan.stages?.length > 0 ? (
                    <div className="space-y-3">
                      {plan.stages.map((stage, j) => (
                        <div key={j} className="flex justify-between items-center text-sm">
                          <Text className="text-gray-600">{stage.label || stage.name}</Text>
                          <Text strong className="text-gray-800">{stage.percentage ?? stage.value}%</Text>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <Text type="secondary" className="text-sm">No stages defined yet.</Text>
                  )}
                </div>
              ))}
            </div>
            {project.eoiAmount > 0 && (
              <div className="mt-5 p-4 bg-green-50 rounded-xl border border-green-200 flex flex-col md:flex-row md:items-center justify-between">
                <div>
                  <Text strong className="text-green-700 text-base">EOI Amount</Text>
                  <Text type="secondary" className="text-xs block mt-1">Expression of Interest — refundable token amount</Text>
                </div>
                <Text strong className="text-green-700 text-xl mt-2 md:mt-0">
                  {project.currency} {Number(project.eoiAmount).toLocaleString()}
                </Text>
              </div>
            )}
          </Card>
        )}
      </div>

      {/* Bottom Cards */}
      <Title level={4} className="!mb-4 !mt-8 text-gray-700">Project Status & Details</Title>
      <Row gutter={[24, 24]}>
        <Col xs={24} md={12} lg={8}>
          <Card title={<span className="text-base font-bold">Listing Status</span>} className="shadow-sm rounded-2xl border border-gray-100 h-full">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <Text className="text-gray-500 font-medium text-sm">Approval</Text>
                <Tag color={APPROVAL_COLOR[project.approvalStatus]} className="m-0 font-semibold rounded-md">{project.approvalStatus?.toUpperCase()}</Tag>
              </div>
              <div className="flex justify-between items-center">
                <Text className="text-gray-500 font-medium text-sm">Listing</Text>
                <Tag className="m-0 rounded-md bg-gray-100 border-gray-200 text-gray-700">{project.listingStatus?.toUpperCase()}</Tag>
              </div>
              <div className="flex justify-between items-center">
                <Text className="text-gray-500 font-medium text-sm">Available</Text>
                <Tag color={project.isAvailable ? "green" : "red"} className="m-0 rounded-md font-medium">{project.isAvailable ? "Yes" : "No"}</Tag>
              </div>
              <div className="flex justify-between items-center">
                <Text className="text-gray-500 font-medium text-sm">Featured</Text>
                <Tag color={project.isFeatured ? "gold" : "default"} className="m-0 rounded-md font-medium">{project.isFeatured ? "Featured" : "Standard"}</Tag>
              </div>
            </div>
          </Card>
        </Col>

        <Col xs={24} md={12} lg={8}>
          <Card title={<span className="text-base font-bold">Construction Progress</span>} className="shadow-sm rounded-2xl border border-gray-100 h-full">
            <Progress percent={readinessValue} strokeColor={THEME.primary} trailColor="#f3f4f6" size={["100%", 14]} format={p => <span className="font-bold text-gray-700">{p}%</span>} />
            {project.serviceChargeInfo && (
              <div className="mt-6 pt-4 border-t border-gray-100 flex justify-between items-center">
                <Text className="text-gray-500 text-sm font-medium">Service Charge</Text>
                <Text className="text-gray-800 text-sm font-semibold bg-gray-50 px-3 py-1 rounded-md">{project.serviceChargeInfo}</Text>
              </div>
            )}
          </Card>
        </Col>

        <Col xs={24} md={12} lg={8}>
          <Card title={<span className="text-base font-bold text-white">Inventory Summary</span>} className="shadow-sm rounded-2xl border-0 bg-gray-900 h-full">
            <Row gutter={[12, 12]}>
              {[
                { label: "Total", value: displayTotalUnits, color: "text-white", bg: "bg-white/10" },
                { label: "Available", value: displayAvailableUnits, color: "text-green-400", bg: "bg-green-400/10" },
                { label: "Hold", value: displayHoldUnits, color: "text-gray-300", bg: "bg-gray-500/10" },
                { label: "Reserved", value: displayReservedUnits, color: "text-amber-400", bg: "bg-amber-400/10" },
                { label: "Booked", value: displayBookedUnits, color: "text-blue-400", bg: "bg-blue-400/10" },
                { label: "SPA Signed", value: displaySpaSignedUnits, color: "text-purple-400", bg: "bg-purple-400/10" },
                { label: "Sold", value: displaySoldUnits, color: "text-red-400", bg: "bg-red-400/10" },
                { label: "Handover", value: displayHandoverUnits, color: "text-cyan-400", bg: "bg-cyan-400/10" },
                { label: "Cancelled", value: displayCancelledUnits, color: "text-rose-400", bg: "bg-rose-400/10" },
              ].filter(s => s.value > 0 || s.label === "Total").map(({ label, value, color, bg }) => (
                <Col xs={12} sm={8} md={6} key={label}>
                  <div className={`text-center p-3 rounded-xl border border-white/5 ${bg}`}>
                    <div className={`text-2xl font-black ${color}`}>{value}</div>
                    <div className="text-xs font-semibold text-gray-400 mt-1 uppercase tracking-wider">{label}</div>
                  </div>
                </Col>
              ))}
            </Row>
          </Card>
        </Col>

        <Col xs={24} lg={12}>
          <Card title={<span className="text-base font-bold">Facilities & Amenities</span>} className="shadow-sm rounded-2xl border border-gray-100 h-full">
            {amenitiesAndFacilitiesToShow.length > 0 ? (
              <div className="flex flex-wrap gap-2 p-1">
                {amenitiesAndFacilitiesToShow.map((label, i) => (
                  <Tag key={`${label}-${i}`} color="blue" className="m-0 bg-blue-50 text-blue-700 border-blue-100">{label}</Tag>
                ))}
              </div>
            ) : (
              <Text type="secondary" className="italic">No facilities/amenities listed</Text>
            )}
          </Card>
        </Col>

        <Col xs={24} lg={12}>
          <Card className="shadow-sm rounded-2xl border border-gray-100 h-full flex flex-col" bodyStyle={{ padding: 0, display: 'flex', flex: 1, flexDirection: 'column' }}>
            <div className="p-6 border-b border-gray-100 flex-1">
              <Title level={5} className="!mb-5 !text-base !font-bold">Commission</Title>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <Text className="text-gray-500 text-sm font-medium">Share Commission</Text>
                  <Tag color={project.shareCommission ? "green" : "default"} className="m-0 px-3 py-1 rounded-md text-sm">
                    {project.shareCommission ? "Yes" : "No"}
                  </Tag>
                </div>
                {project.shareCommission && (
                  <div className="flex justify-between items-center p-3 bg-purple-50 rounded-xl">
                    <Text className="text-purple-800 text-sm font-semibold">Commission Percentage</Text>
                    <Text strong className="text-xl text-purple-700">{project.shareCommissionPercentage || project.commission || 0}%</Text>
                  </div>
                )}
              </div>
            </div>
            {project.resaleConditions && project.resaleConditions !== "Not specified" && (
              <div className="p-6 bg-orange-50/50 rounded-b-2xl">
                <Title level={5} className="!mb-2 !text-sm !text-orange-800 !font-bold">Resale Conditions</Title>
                <Text className="text-sm text-gray-600 leading-relaxed">{project.resaleConditions}</Text>
              </div>
            )}
          </Card>
        </Col>
      </Row>

      {/* Add/Edit Unit Modal */}
      <Modal
        title={modalMode === "create" ? "Add New Unit" : modalMode === "edit" ? "Edit Unit" : "Unit Details"}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={modalMode === "view" ? [
          <Button key="close" onClick={() => setModalVisible(false)}>Close</Button>,
          <Button key="edit" type="primary" onClick={() => {
            setModalMode("edit");
            form.setFieldsValue(selectedUnit);
          }}>Edit</Button>
        ] : [
          <Button key="cancel" onClick={() => setModalVisible(false)}>Cancel</Button>,
          <Button key="submit" type="primary" onClick={handleFormSubmit}>Save</Button>
        ]}
        width={700}
      >
        <Form form={form} layout="vertical" disabled={modalMode === "view"}>
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
              <Form.Item name="floorNumber" label="Floor Number">
                <InputNumber placeholder="0 for Ground" className="w-full" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="unitType" label="Unit Type" rules={[{ required: true }]}>
                <Select>
                  <Option value="apartment">Apartment</Option>
                  <Option value="villa">Villa</Option>
                  <Option value="townhouse">Townhouse</Option>
                  <Option value="duplex">Duplex</Option>
                  <Option value="penthouse">Penthouse</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="bedroomType" label="Bedroom Type" rules={[{ required: true }]}>
                <Select>
                  <Option value="studio">Studio</Option>
                  <Option value="1bed">1 Bedroom</Option>
                  <Option value="2bed">2 Bedroom</Option>
                  <Option value="3bed">3 Bedroom</Option>
                  <Option value="4bed">4 Bedroom+</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item name="bedrooms" label="Bedrooms">
                <InputNumber min={0} className="w-full" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="bathrooms" label="Bathrooms">
                <InputNumber min={0} className="w-full" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="parkingSpaces" label="Parking Spaces">
                <InputNumber min={0} className="w-full" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="area" label="Area" rules={[{ required: true }]}>
                <InputNumber placeholder="Area" className="w-full" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="areaUnit" label="Area Unit">
                <Select>
                  <Option value="sqft">Square Feet (sqft)</Option>
                  <Option value="sqm">Square Meters (sqm)</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="price" label="Price" rules={[{ required: true }]}>
                <InputNumber placeholder="Price" className="w-full" prefix="AED" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="currency" label="Currency">
                <Select>
                  <Option value="AED">AED</Option>
                  <Option value="USD">USD</Option>
                  <Option value="EUR">EUR</Option>
                  <Option value="GBP">GBP</Option>
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

          <Form.Item name="status" label="Status">
            <Select>
              <Option value="available">Available</Option>
              <Option value="reserved">Reserved</Option>
              <Option value="booked">Booked</Option>
              <Option value="sold">Sold</Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}