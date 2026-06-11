import {
  Card,
  Typography,
  Form,
  Input,
  Button,
  Row,
  Col,
  Select,
  InputNumber,
  Upload,
  message,
  Spin,
  Switch,
  DatePicker,
  Divider,
  Alert,
} from "antd";

import {
  ArrowLeftOutlined,
  SaveOutlined,
  PlusOutlined,
} from "@ant-design/icons";

import { apiService } from "../../../manageApi/utils/custom.apiservice";
import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import dayjs from "dayjs";

const { Title, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;

const UPLOAD_API = `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'}/upload`;

// ── Upload a single file to S3, return URL ──────────────────
const uploadToS3 = async (file) => {
  const fd = new FormData();
  fd.append("file", file);
  const res  = await fetch(UPLOAD_API, { method: "POST", body: fd });
  const data = await res.json();
  if (!res.ok || data.success === false) throw new Error(data.message || "Upload failed");
  // Same URL extraction logic as DeveloperProjects.jsx
  return (
    data.url || data.imageUrl || data.secure_url ||
    data.data?.url || data.data?.imageUrl ||
    data.file?.url || data.file?.imageUrl ||
    data.file?.secure_url || data.file?.location ||
    null
  );
};

// ── Extract URL from fileList item (existing or new upload) ─
const getUrlFromFile = async (f) => {
  // Already uploaded (existing URL from API)
  if (f.url && !f.originFileObj) return f.url;
  // New file — upload it now
  if (f.originFileObj) return await uploadToS3(f.originFileObj);
  return null;
};

export default function DeveloperPropertyEdit() {
  const navigate  = useNavigate();
  const { id }    = useParams();
  const [form]    = Form.useForm();

  const [loading, setLoading]   = useState(false);
  const [saving, setSaving]     = useState(false);
  const [saveError, setSaveError] = useState("");
  const [approvalStatus, setApprovalStatus] = useState('');
const [adminComments, setAdminComments]   = useState('');

  // Photo file lists — each item is { uid, name, status, url } or antd upload file
  const [mainLogoFile,      setMainLogoFile]      = useState([]);
  const [architectureFiles, setArchitectureFiles] = useState([]);
  const [interiorFiles,     setInteriorFiles]     = useState([]);
  const [lobbyFiles,        setLobbyFiles]        = useState([]);
  const [otherFiles,        setOtherFiles]        = useState([]);

  // ── Fetch property ────────────────────────────────────────
  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        setLoading(true);
        const res  = await apiService.get(`/properties/${id}`);
        const data = res?.data?.data || res?.data;
        if (!data) return;

        form.setFieldsValue({
          propertyName:             data.propertyName,
          developerName:            data.developerName,
          unitNumber:               data.unitNumber,
          floorNumber:              data.floorNumber,
          unitType:                 data.unitType,
          bedroomType:              data.bedroomType,
          bedrooms:                 data.bedrooms,
          bathrooms:                data.bathrooms,
          builtUpArea_min:          data.builtUpArea_min,
          builtUpArea_max:          data.builtUpArea_max,
          builtUpAreaUnit:          data.builtUpAreaUnit,
          price_min:                data.price_min,
          price_max:                data.price_max,
          currency:                 data.currency,
          area:                     data.area,
          city:                     data.city,
          country:                  data.country,
          description:              data.description,
          parkingSpaces:            data.parkingSpaces,
          furnishing:               data.furnishing,
          ownershipType:            data.ownershipType,
          totalUnits:               data.totalUnits,
          projectStatus:            data.projectStatus,
          floors:                   data.floors,
          serviceChargeInfo:        data.serviceChargeInfo,
          readinessProgress:        data.readinessProgress,
          eoiAmount:                data.eoiAmount,
          resaleConditions:         data.resaleConditions,
          commission:               data.commission,
          shareCommission:          data.shareCommission,
          shareCommissionPercentage: data.shareCommissionPercentage,
          videoUrl:                 data.videoUrl,
          transactionType:          data.transactionType,
          projectOption:            data.projectOption,
          hasView:                  data.hasView,
          viewType:                 data.viewType,
          // Flat proximity fields
          airport: data.proximity?.airport,
          metro:   data.proximity?.metro,
          mall:    data.proximity?.mall,
          school:  data.proximity?.school,
          // Flat coordinates
          lat: data.coordinates?.lat,
          lng: data.coordinates?.lng,
          // Flat facilities
          swimmingPool:     data.facilities?.swimmingPool,
          gym:              data.facilities?.gym,
          parking:          data.facilities?.parking,
          childrenPlayArea: data.facilities?.childrenPlayArea,
          gardens:          data.facilities?.gardens,
          security:         data.facilities?.security,
          concierge:        data.facilities?.concierge,
          // Completion date
          quarter:  data.completionDate?.quarter,
          year:     data.completionDate?.year,
          fullDate: data.completionDate?.fullDate ? dayjs(data.completionDate.fullDate) : null,
        });
 setApprovalStatus(data.approvalStatus || '');
        setAdminComments(data.adminComments   || '');
        // ── Populate photo file lists ────────────────────
        const toFileList = (urls = [], prefix) =>
          urls.map((url, i) => ({
            uid:    `${prefix}-${i}`,
            name:   `${prefix}-${i}.jpg`,
            status: "done",
            url,
          }));

        if (data.mainLogo) {
          setMainLogoFile([{ uid: "-1", name: "main-logo.jpg", status: "done", url: data.mainLogo }]);
        }
        setArchitectureFiles(toFileList(data.photos?.architecture, "arch"));
        setInteriorFiles(toFileList(data.photos?.interior,         "int"));
        setLobbyFiles(toFileList(data.photos?.lobby,               "lobby"));
        setOtherFiles(toFileList(data.photos?.other,               "other"));

      } catch (err) {
        console.error(err);
        message.error("Failed to load property data");
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  // ── Submit — pure JSON, not FormData ─────────────────────
  const handleSubmit = async (values) => {
    try {
      setSaving(true);
      setSaveError("");

      // Upload any NEW photos first, keep existing URLs as-is
      const uploadAll = async (fileList) => {
        const results = await Promise.all(fileList.map(getUrlFromFile));
        return results.filter(Boolean);
      };

      const [mainLogoUrl, archUrls, intUrls, lobbyUrls, otherUrls] = await Promise.all([
        uploadAll(mainLogoFile),
        uploadAll(architectureFiles),
        uploadAll(interiorFiles),
        uploadAll(lobbyFiles),
        uploadAll(otherFiles),
      ]);

      // ── Build proper JSON payload ────────────────────────
      const payload = {
        // Basic
        propertyName:    values.propertyName,
        developerName:   values.developerName,
        unitNumber:      values.unitNumber     || "",
        floorNumber:     values.floorNumber    || 0,
        unitType:        values.unitType,
        bedroomType:     values.bedroomType,
        bedrooms:        values.bedrooms       || 0,
        bathrooms:       values.bathrooms      || 0,
        builtUpArea_min: values.builtUpArea_min || 0,
        builtUpArea_max: values.builtUpArea_max || 0,
        builtUpAreaUnit: values.builtUpAreaUnit || "sqft",
        price_min:       values.price_min      || 0,
        price_max:       values.price_max      || 0,
        currency:        values.currency       || "AED",
        description:     values.description    || "",
        videoUrl:        values.videoUrl       || "",
        transactionType: values.transactionType || "sell",
        projectOption:   values.projectOption  || "new",

        // Location
        area:    values.area    || "",
        city:    values.city    || "",
        country: values.country || "",

        // ✅ Nested objects — proper JSON structure
        coordinates: {
          lat: values.lat || null,
          lng: values.lng || null,
        },
        proximity: {
          airport: values.airport || "",
          metro:   values.metro   || "",
          mall:    values.mall    || "",
          school:  values.school  || "",
        },
        facilities: {
          swimmingPool:    values.swimmingPool    || false,
          gym:             values.gym             || false,
          parking:         values.parking         || false,
          childrenPlayArea: values.childrenPlayArea || false,
          gardens:         values.gardens         || false,
          security:        values.security        || false,
          concierge:       values.concierge       || false,
        },

        // Project details
        totalUnits:               values.totalUnits               || 0,
        floors:                   values.floors                   || 0,
        projectStatus:            values.projectStatus            || "presale",
        readinessProgress:        values.readinessProgress        || "0%",
        parkingSpaces:            values.parkingSpaces            || 0,
        furnishing:               values.furnishing               || "unfurnished",
        ownershipType:            values.ownershipType            || "freehold",
        serviceChargeInfo:        values.serviceChargeInfo        || "No info",
        resaleConditions:         values.resaleConditions         || "Not specified",

        // Pricing extras
        eoiAmount:                values.eoiAmount                || 0,
        commission:               values.commission               || 0,
        shareCommission:          values.shareCommission          || false,
        shareCommissionPercentage: values.shareCommissionPercentage || 0,

        // View
        hasView:  values.hasView  || false,
        viewType: values.viewType || [],

        // Completion date
        completionDate: {
          quarter:  values.quarter  || null,
          year:     values.year     || null,
          fullDate: values.fullDate ? values.fullDate.toISOString() : null,
        },

        // ✅ Photos — existing URLs + new uploads combined
        mainLogo: mainLogoUrl[0] || "",
        photos: {
          architecture: archUrls,
          interior:     intUrls,
          lobby:        lobbyUrls,
          other:        otherUrls,
        },
      };

      

      await apiService.put(`/properties/${id}`, payload);

      message.success("Property updated successfully!");
      navigate("/dashboard/developer/developer-projects");

    } catch (err) {
      console.error(err);
      const msg = err?.response?.data?.message || "Failed to update property";
      setSaveError(msg);
      message.error(msg);
    } finally {
      setSaving(false);
    }
  };

  // ── Upload props factory ──────────────────────────────────
  // beforeUpload returns false → file stays local, uploaded on submit
  const makeUploadProps = (fileList, setFileList, maxCount = 10) => ({
    listType:     "picture-card",
    fileList,
    maxCount,
    beforeUpload: (file) => {
      const ok = file.type.startsWith("image/");
      if (!ok) message.error("Images only!");
      return false; // prevent auto-upload
    },
    onChange: ({ fileList: next }) => setFileList(next),
  });

  if (loading) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen flex items-center justify-center">
        <Spin size="large" tip="Loading property..." />
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">

      {/* Header */}
      <div className="mb-6">
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate("/dashboard/developer/developer-projects")}
          className="mb-4"
        >
          Back to Properties
        </Button>
        <Title level={3} style={{ margin: 0 }}>Edit Property</Title>
        <Text type="secondary">Changes will be resubmitted for admin review</Text>
      </div>

      {saveError && (
        <Alert type="error" message={saveError} showIcon closable className="mb-4"
          onClose={() => setSaveError("")} />
      )}

      <Form form={form} layout="vertical" onFinish={handleSubmit}
        onFinishFailed={({ errorFields }) =>
          message.error(errorFields?.[0]?.errors?.[0] || "Please fill required fields")
        }
      >

        {/* ── Basic Info ──────────────────────────────── */}
        <Card title="Basic Information" className="mb-4" style={{ borderRadius: 12 }}>
          <Row gutter={[16, 0]}>
            <Col xs={24} md={12}>
              <Form.Item label="Property Name" name="propertyName"
                rules={[{ required: true, message: "Required" }]}>
                <Input size="large" />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item label="Developer Name" name="developerName">
                <Input size="large" />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item label="Transaction Type" name="transactionType">
                <Select size="large">
                  <Option value="sell">Sell</Option>
                  <Option value="rent">Rent</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item label="Unit Type" name="unitType">
                <Select size="large">
                  <Option value="apartment">Apartment</Option>
                  <Option value="duplex">Duplex</Option>
                  <Option value="penthouse">Penthouse</Option>
                  <Option value="villa">Villa</Option>
                  <Option value="townhouse">Townhouse</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item label="Project Option" name="projectOption">
                <Select size="large">
                  <Option value="new">New</Option>
                  <Option value="existing">Existing</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item label="Unit Number" name="unitNumber">
                <Input size="large" />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item label="Floor Number" name="floorNumber">
                <InputNumber style={{ width: "100%" }} size="large" min={0} />
              </Form.Item>
            </Col>
          </Row>
        </Card>

        {/* ── Rooms & Area ─────────────────────────────── */}
        <Card title="Rooms & Area" className="mb-4" style={{ borderRadius: 12 }}>
          <Row gutter={[16, 0]}>
            <Col xs={24} md={8}>
              <Form.Item label="Bedroom Type" name="bedroomType">
                <Select size="large">
                  <Option value="studio">Studio</Option>
                  <Option value="1bed">1 Bed</Option>
                  <Option value="2bed">2 Bed</Option>
                  <Option value="3bed">3 Bed</Option>
                  <Option value="4bed">4 Bed</Option>
                  <Option value="5bed">5+ Bed</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item label="Bedrooms" name="bedrooms">
                <InputNumber style={{ width: "100%" }} size="large" min={0} />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item label="Bathrooms" name="bathrooms">
                <InputNumber style={{ width: "100%" }} size="large" min={0} />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item label="Built-Up Area Min (sqft)" name="builtUpArea_min">
                <InputNumber style={{ width: "100%" }} size="large" min={0} />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item label="Built-Up Area Max (sqft)" name="builtUpArea_max">
                <InputNumber style={{ width: "100%" }} size="large" min={0} />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item label="Area Unit" name="builtUpAreaUnit">
                <Select size="large">
                  <Option value="sqft">Sqft</Option>
                  <Option value="sqm">Sqm</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
        </Card>

        {/* ── Pricing ──────────────────────────────────── */}
        <Card title="Pricing" className="mb-4" style={{ borderRadius: 12 }}>
          <Row gutter={[16, 0]}>
            <Col xs={24} md={8}>
              <Form.Item label="Price Min (AED)" name="price_min">
                <InputNumber style={{ width: "100%" }} size="large" min={0}
                  formatter={v => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                  parser={v => v.replace(/,/g, "")} />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item label="Price Max (AED)" name="price_max">
                <InputNumber style={{ width: "100%" }} size="large" min={0}
                  formatter={v => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                  parser={v => v.replace(/,/g, "")} />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item label="Currency" name="currency">
                <Select size="large">
                  <Option value="AED">AED</Option>
                  <Option value="USD">USD</Option>
                  <Option value="EUR">EUR</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item label="EOI Amount" name="eoiAmount">
                <InputNumber style={{ width: "100%" }} size="large" min={0}
                  formatter={v => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                  parser={v => v.replace(/,/g, "")} />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item label="Commission (%)" name="commission">
                <InputNumber style={{ width: "100%" }} size="large" min={0} max={100} />
              </Form.Item>
            </Col>
            <Col xs={12} md={4}>
              <Form.Item label="Share Commission" name="shareCommission" valuePropName="checked">
                <Switch />
              </Form.Item>
            </Col>
            <Col xs={12} md={4}>
              <Form.Item label="Share %" name="shareCommissionPercentage">
                <InputNumber style={{ width: "100%" }} size="large" min={0} max={100} />
              </Form.Item>
            </Col>
          </Row>
        </Card>

        {/* ── Location ──────────────────────────────────── */}
        <Card title="Location" className="mb-4" style={{ borderRadius: 12 }}>
          <Row gutter={[16, 0]}>
            <Col xs={24} md={8}>
              <Form.Item label="Area" name="area">
                <Input size="large" />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item label="City" name="city">
                <Input size="large" />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item label="Country" name="country">
                <Input size="large" />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item label="Latitude" name="lat">
                <InputNumber style={{ width: "100%" }} size="large" />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item label="Longitude" name="lng">
                <InputNumber style={{ width: "100%" }} size="large" />
              </Form.Item>
            </Col>
          </Row>
          <Divider orientation="left" style={{ fontSize: 13, color: "#9ca3af" }}>
            Proximity (minutes)
          </Divider>
          <Row gutter={[16, 0]}>
            {["airport", "metro", "mall", "school"].map(k => (
              <Col xs={12} md={6} key={k}>
                <Form.Item label={k.charAt(0).toUpperCase() + k.slice(1)} name={k}>
                  <Input size="large" placeholder="mins" suffix="min" />
                </Form.Item>
              </Col>
            ))}
          </Row>
        </Card>

        {/* ── Project Details ───────────────────────────── */}
        <Card title="Project Details" className="mb-4" style={{ borderRadius: 12 }}>
          <Row gutter={[16, 0]}>
            <Col xs={24} md={8}>
              <Form.Item label="Total Units" name="totalUnits">
                <InputNumber style={{ width: "100%" }} size="large" min={0} />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item label="Floors" name="floors">
                <InputNumber style={{ width: "100%" }} size="large" min={0} />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item label="Parking Spaces" name="parkingSpaces">
                <InputNumber style={{ width: "100%" }} size="large" min={0} />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item label="Project Status" name="projectStatus">
                <Select size="large">
                  <Option value="presale">Pre-sale</Option>
                  <Option value="under_construction">Under Construction</Option>
                  <Option value="completed">Completed</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item label="Furnishing" name="furnishing">
                <Select size="large">
                  <Option value="unfurnished">Unfurnished</Option>
                  <Option value="furnished">Furnished</Option>
                  <Option value="semi-furnished">Semi-Furnished</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item label="Ownership Type" name="ownershipType">
                <Select size="large">
                  <Option value="freehold">Freehold</Option>
                  <Option value="leasehold">Leasehold</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item label="Readiness Progress" name="readinessProgress">
                <Input size="large" placeholder="e.g. 50%" />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item label="Service Charge Info" name="serviceChargeInfo">
                <Input size="large" />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item label="Resale Conditions" name="resaleConditions">
                <Input size="large" />
              </Form.Item>
            </Col>
          </Row>
        </Card>

        {/* ── Completion Date ───────────────────────────── */}
        <Card title="Completion Date" className="mb-4" style={{ borderRadius: 12 }}>
          <Row gutter={[16, 0]}>
            <Col xs={24} md={8}>
              <Form.Item label="Quarter" name="quarter">
                <Select size="large">
                  <Option value="Q1">Q1</Option>
                  <Option value="Q2">Q2</Option>
                  <Option value="Q3">Q3</Option>
                  <Option value="Q4">Q4</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item label="Year" name="year">
                <InputNumber style={{ width: "100%" }} size="large" min={2024} max={2050} />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item label="Full Date" name="fullDate">
                <DatePicker size="large" style={{ width: "100%" }} format="YYYY-MM-DD" />
              </Form.Item>
            </Col>
          </Row>
        </Card>

        {/* ── Facilities ────────────────────────────────── */}
        <Card title="Facilities" className="mb-4" style={{ borderRadius: 12 }}>
          <Row gutter={[16, 0]}>
            {[
              ["swimmingPool", "Swimming Pool"],
              ["gym", "Gym"],
              ["parking", "Parking"],
              ["childrenPlayArea", "Children's Play Area"],
              ["gardens", "Gardens"],
              ["security", "Security"],
              ["concierge", "Concierge"],
            ].map(([name, label]) => (
              <Col xs={12} md={6} key={name}>
                <Form.Item label={label} name={name} valuePropName="checked">
                  <Switch />
                </Form.Item>
              </Col>
            ))}
          </Row>
        </Card>

        {/* ── View ─────────────────────────────────────── */}
        <Card title="View Details" className="mb-4" style={{ borderRadius: 12 }}>
          <Row gutter={[16, 0]}>
            <Col xs={24} md={6}>
              <Form.Item label="Has View" name="hasView" valuePropName="checked">
                <Switch />
              </Form.Item>
            </Col>
            <Col xs={24} md={18}>
              <Form.Item label="View Type" name="viewType">
                <Select mode="multiple" size="large" placeholder="Select view types">
                  {["sea", "city", "garden", "pool", "golf"].map(v => (
                    <Option key={v} value={v}>{v.charAt(0).toUpperCase() + v.slice(1)}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>
        </Card>

        {/* ── Description & Media ──────────────────────── */}
        <Card title="Description & Media" className="mb-4" style={{ borderRadius: 12 }}>
          <Form.Item label="Description" name="description">
            <TextArea rows={4} />
          </Form.Item>
          <Form.Item label="Video URL" name="videoUrl">
            <Input size="large" placeholder="https://youtube.com/..." />
          </Form.Item>
        </Card>

        {/* ── Photos ───────────────────────────────────── */}
        <Card title="Photos" className="mb-4" style={{ borderRadius: 12 }}>
          <Alert
            type="info" showIcon className="mb-4"
            message="Existing photos are shown below. Add new ones or remove existing ones. All changes save on submit."
          />
          {[
            ["Main Logo",   mainLogoFile,      setMainLogoFile,      1],
            ["Architecture", architectureFiles, setArchitectureFiles, 10],
            ["Interior",    interiorFiles,      setInteriorFiles,     10],
            ["Lobby",       lobbyFiles,        setLobbyFiles,        10],
            ["Other",       otherFiles,        setOtherFiles,        10],
          ].map(([label, fileList, setter, max]) => (
            <div key={label} style={{ marginBottom: 20 }}>
              <Text strong style={{ display: "block", marginBottom: 8 }}>{label}</Text>
              <Upload {...makeUploadProps(fileList, setter, max)}>
                {fileList.length < max && (
                  <div><PlusOutlined /><div style={{ marginTop: 8 }}>Upload</div></div>
                )}
              </Upload>
            </div>
          ))}
        </Card>
{approvalStatus === 'changes_requested' && adminComments && (
          <Alert
            type="warning"
            showIcon
            className="mb-4"
            message="Admin Requested Changes"
            description={adminComments}
          />
        )}
        {approvalStatus === 'approved' && (
          <Alert
            type="info"
            showIcon
            className="mb-4"
            message="Editing this listing will send it back for admin approval"
          />
        )}
        {/* ── Submit ───────────────────────────────────── */}
        <Card style={{ borderRadius: 12 }}>
          <div style={{ display: "flex", gap: 12 }}>
            <Button
              type="primary"
              htmlType="submit"
              icon={<SaveOutlined />}
              size="large"
              loading={saving}
              style={{ background: "#6d28d9", borderColor: "#6d28d9" }}
            >
              {saving ? "Saving..." : "Save Changes"}
            </Button>
            <Button size="large"
              onClick={() => navigate("/dashboard/developer/developer-projects")}>
              Cancel
            </Button>
          </div>
        </Card>

      </Form>
    </div>
  );
}