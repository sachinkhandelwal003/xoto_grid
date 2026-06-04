/* src/pages/freelancer/projects/AddProjects.jsx */
import React, { useState, useEffect, useCallback } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  Form,
  Input,
  InputNumber,
  DatePicker,
  Select,
  Checkbox,
  Upload,
  Button,
  Card,
  Row,
  Col,
  Typography,
  Space,
  Divider,
  message,
  Tabs,
  Modal,
} from "antd";
import {
  UploadOutlined,
  EnvironmentOutlined,
  DollarCircleOutlined,
  TeamOutlined,
  FileTextOutlined,
  SafetyOutlined,
  ProjectOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { apiService } from "../../../../../../../manageApi/utils/custom.apiservice";
import { showSuccessAlert, showErrorAlert } from "../../../../../../../manageApi/utils/sweetAlert";
import moment from "moment";

const { Title } = Typography;
const { TextArea } = Input;
const { Option } = Select;
const { TabPane } = Tabs;

const DUMMY_JSON = `{
  "title": "Green Oasis Villa",
  "client_name": "Mr. Rajesh Kumar",
  "client_company": "Kumar Builders Pvt Ltd",
  "project_type": "Residential",
  "address": "Plot 45, Sector 12, Noida",
  "city": "Noida",
  "gps_coordinates": { "latitude": 28.5355, "longitude": 77.3910 },
  "start_date": "2025-12-01",
  "end_date": "2026-06-30",
  "project_duration": "7 months",
  "budget": 2500000,
  "overview": "Luxury villa landscaping with water features and smart irrigation",
  "site_area": { "value": 1200, "unit": "sq_m" },
  "design_concept": "Tropical Modern",
  "work_scope": {
    "softscaping": true,
    "hardscaping": true,
    "irrigation_systems": true,
    "lighting_design": true,
    "water_features": true
  },
  "scope_details": "Complete garden redesign with automated drip system and LED pathway lighting.",
  "landscape_architect": "Ar. Priya Sharma",
  "planting_plan": "Detailed planting schedule attached",
  "material_specifications": "Granite pavers, LED lights, PVC pipes",
  "team_members": [
    { "name": "Vikram Singh", "role": "Site Supervisor", "contact": "+91 9876543210" }
  ],
  "machinery_equipment": ["Excavator JCB"],
  "materials_list": [
    { "item": "Granite Pavers", "quantity": 500, "unit": "sq ft", "supplier": "StoneWorld Ltd" }
  ],
  "cost_breakdown": {
    "materials": 800000,
    "labor": 600000,
    "equipment": 300000,
    "overheads": 200000,
    "contingency": 100000
  },
  "payment_terms": "30% advance, 40% on milestone 1, 30% on completion",
  "project_schedule": "Gantt chart attached",
  "safety_guidelines": "Helmet, gloves, safety boots mandatory",
  "milestones": [
    {
      "title": "Site Clearance",
      "start_date": "2025-12-01",
      "end_date": "2025-12-15",
      "amount": 500000,
      "description": "Clear debris and level ground"
    },
    {
      "title": "Hardscaping",
      "start_date": "2025-12-16",
      "end_date": "2026-02-28",
      "amount": 1000000,
      "description": "Lay pathways and install water feature"
    }
  ],
  "permits_approvals": [
    { "name": "Tree Cutting NOC", "status": "pending" }
  ]
}`;

/* --------------------------------------------------------------- */
const AddProjects = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const { token } = useSelector((s) => s.auth);

  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [selectedCat, setSelectedCat] = useState(null);
  const [jsonModal, setJsonModal] = useState(false);
  const [jsonText, setJsonText] = useState(DUMMY_JSON);

  /* ------------------- FETCH DATA ------------------- */
  const fetchCategories = useCallback(async () => {
    try {
      const res = await apiService.get("/freelancer/category?active=true");
      setCategories(res.categories || []);
    } catch {
      message.error("Failed to load categories");
    }
  }, [token]);

  const fetchSubcategories = useCallback(async (catId) => {
    if (!catId) {
      setSubcategories([]);
      return;
    }
    try {
      const res = await apiService.get(`/freelancer/subcategory?category=${catId}`);
      setSubcategories(res.subcategories || []);
    } catch {
      message.error("Failed to load subcategories");
    }
  }, [token]);

 

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  /* ------------------- HANDLERS ------------------- */
  const onCategoryChange = (val) => {
    setSelectedCat(val);
    form.setFieldsValue({ subcategory: undefined });
    fetchSubcategories(val);
  };

  const fillWithDummy = () => {
    try {
      const data = JSON.parse(DUMMY_JSON);
      fillForm(data);
      message.success("Dummy data loaded");
    } catch {
      message.error("Invalid dummy JSON");
    }
  };

  const fillFromText = () => {
    try {
      const data = JSON.parse(jsonText);
      fillForm(data);
      setJsonModal(false);
      message.success("JSON loaded");
    } catch {
      message.error("Invalid JSON");
    }
  };

  const fillForm = (data) => {
    form.setFieldsValue({
      ...data,
      start_date: data.start_date ? moment(data.start_date) : undefined,
      end_date: data.end_date ? moment(data.end_date) : undefined,
      budget: data.budget ? Number(data.budget) : undefined,
      milestones: (data.milestones || []).map((m) => ({
        ...m,
        start_date: moment(m.start_date),
        end_date: moment(m.end_date),
        amount: Number(m.amount),
      })),
    });
  };

  /* ------------------- SUBMIT ------------------- */
  const onFinish = async (values) => {
    setLoading(true);
    const fd = new FormData();

    // Basic
    fd.append("title", values.title);
    fd.append("client_name", values.client_name);
    fd.append("client_company", values.client_company || "");
    fd.append("project_type", values.project_type);
    fd.append("address", values.address);
    fd.append("city", values.city);
    fd.append("start_date", moment(values.start_date).format("YYYY-MM-DD"));
    fd.append("end_date", moment(values.end_date).format("YYYY-MM-DD"));
    fd.append("project_duration", values.project_duration || "");
    fd.append("budget", values.budget);

    // GPS
    if (values.gps_coordinates?.latitude) fd.append("gps_coordinates[latitude]", values.gps_coordinates.latitude);
    if (values.gps_coordinates?.longitude) fd.append("gps_coordinates[longitude]", values.gps_coordinates.longitude);

    // Scope
    fd.append("overview", values.overview || "");
    if (values.site_area?.value) fd.append("site_area[value]", values.site_area.value);
    fd.append("site_area[unit]", values.site_area?.unit || "sq_m");
    fd.append("design_concept", values.design_concept || "");
    fd.append("scope_details", values.scope_details || "");

    // Work Scope
    const ws = values.work_scope || {};
    ["softscaping","hardscaping","irrigation_systems","lighting_design","water_features","furniture_accessories","maintenance_plan"]
      .forEach(k => fd.append(`work_scope[${k}]`, !!ws[k]));

    // Design
    fd.append("landscape_architect", values.landscape_architect || "");
    fd.append("planting_plan", values.planting_plan || "");
    fd.append("material_specifications", values.material_specifications || "");
    fd.append("irrigation_plan", values.irrigation_plan || "");
    fd.append("lighting_plan", values.lighting_plan || "");

    // Files
    const addFiles = (field, list) => (list || []).forEach(f => f.originFileObj && fd.append(field, f.originFileObj));
    addFiles("drawings_blueprints", values.drawings_blueprints?.fileList);
    addFiles("visualization_3d", values.visualization_3d?.fileList);

    // Resources
    (values.team_members || []).forEach((m, i) => {
      fd.append(`team_members[${i}][name]`, m.name || "");
      fd.append(`team_members[${i}][role]`, m.role || "");
      fd.append(`team_members[${i}][contact]`, m.contact || "");
    });
    (values.machinery_equipment || []).forEach((v, i) => fd.append(`machinery_equipment[${i}]`, v));
    (values.materials_list || []).forEach((m, i) => {
      fd.append(`materials_list[${i}][item]`, m.item || "");
      fd.append(`materials_list[${i}][quantity]`, m.quantity || 0);
      fd.append(`materials_list[${i}][unit]`, m.unit || "");
      fd.append(`materials_list[${i}][supplier]`, m.supplier || "");
    });
    (values.suppliers || []).forEach((s, i) => fd.append(`suppliers[${i}]`, s));

    // Budget
    if (values.cost_breakdown) {
      Object.keys(values.cost_breakdown).forEach(k => fd.append(`cost_breakdown[${k}]`, values.cost_breakdown[k] || 0));
    }
    fd.append("payment_terms", values.payment_terms || "");

    // Compliance
    fd.append("project_schedule", values.project_schedule || "");
    fd.append("safety_guidelines", values.safety_guidelines || "");
    fd.append("environmental_compliance", values.environmental_compliance || "");
    fd.append("waste_disposal_plan", values.waste_disposal_plan || "");

    // Permits
    (values.permits_approvals || []).forEach((p, i) => {
      fd.append(`permits_approvals[${i}][name]`, p.name || "");
      fd.append(`permits_approvals[${i}][status]`, p.status || "pending");
      if (p.document?.[0]?.originFileObj) fd.append("permits_documents", p.document[0].originFileObj);
    });

    // Milestones – ONLY 5 FIELDS
    fd.append("milestones", JSON.stringify(
      (values.milestones || []).map(m => ({
        title: m.title,
        description: m.description || "",
        start_date: moment(m.start_date).format("YYYY-MM-DD"),
        end_date: moment(m.end_date).format("YYYY-MM-DD"),
        amount: Number(m.amount)
      }))
    ));

    // IDs
    fd.append("category", values.category);
    fd.append("subcategory", values.subcategory);
    if (values.customer) fd.append("customer", values.customer); // Optional

    try {
      await apiService.upload("/freelancer/projects", fd, token);
      showSuccessAlert("Success", "Project created!");
      navigate(-1);
    } catch (err) {
      const errs = err?.response?.data?.errors;
      if (Array.isArray(errs)) {
        errs.forEach(e => message.error(`${e.field}: ${e.message}`));
      } else {
        showErrorAlert("Error", err?.response?.data?.message || "Failed");
      }
    } finally {
      setLoading(false);
    }
  };

  const normFile = e => (Array.isArray(e) ? e : e && e.fileList);

  /* ------------------- MILESTONE VALIDATOR ------------------- */
  const milestoneValidator = async (_, value) => {
    if (!Array.isArray(value) || value.length === 0) return;
    const projectStart = form.getFieldValue("start_date");
    const projectEnd = form.getFieldValue("end_date");
    if (!projectStart || !projectEnd) return;

    for (const m of value) {
      if (!m.title || !m.start_date || !m.end_date || m.amount === undefined) {
        throw new Error("Each milestone needs title, dates & amount");
      }
      const ms = moment(m.start_date);
      const me = moment(m.end_date);
      if (ms >= me) throw new Error(`"${m.title}": Start must be before end`);
      if (ms < projectStart || me > projectEnd) {
        throw new Error(`"${m.title}": Must be within project dates`);
      }
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <Card>
        <Title level={3} className="mb-6">
          <ProjectOutlined /> Add New Landscaping Project
        </Title>

        <Tabs defaultActiveKey="form">
          <TabPane tab="Form" key="form">
            <Form form={form} layout="vertical" onFinish={onFinish}>

              {/* ========== REFERENCE IDs (TOP) ========== */}
              <Card title={<Space><UserOutlined /> Project References</Space>} className="mb-6">
                <Row gutter={16}>
                  <Col xs={24} md={8}>
                    <Form.Item name="category" label="Category" rules={[{ required: true }]}>
                      <Select placeholder="Select category" onChange={onCategoryChange}>
                        {categories.map(c => (
                          <Option key={c._id} value={c._id}>{c.name}</Option>
                        ))}
                      </Select>
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={8}>
                    <Form.Item name="subcategory" label="Subcategory" rules={[{ required: true }]}>
                      <Select placeholder="Select subcategory" disabled={!selectedCat}>
                        {subcategories.map(s => (
                          <Option key={s._id} value={s._id}>{s.name}</Option>
                        ))}
                      </Select>
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={8}>
                    <Form.Item name="customer" label="Customer">
                      <Select placeholder="Select customer (optional)" allowClear>
                        {customers.map(u => (
                          <Option key={u._id} value={u._id}>{u.name || u.email}</Option>
                        ))}
                      </Select>
                    </Form.Item>
                  </Col>
                </Row>
              </Card>

              {/* ========== BASIC DETAILS ========== */}
              <Card title={<Space><FileTextOutlined /> Basic Details</Space>} className="mb-6">
                <Row gutter={16}>
                  <Col xs={24} md={12}>
                    <Form.Item name="title" label="Project Title" rules={[{ required: true }]}>
                      <Input />
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={12}>
                    <Form.Item name="client_name" label="Client Name" rules={[{ required: true }]}>
                      <Input />
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={12}>
                    <Form.Item name="client_company" label="Company">
                      <Input />
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={12}>
                    <Form.Item name="project_type" label="Project Type" rules={[{ required: true }]}>
                      <Select placeholder="Select type">
                        {["Residential","Commercial","Public","Resort","Urban","Other"].map(t => (
                          <Option key={t} value={t}>{t}</Option>
                        ))}
                      </Select>
                    </Form.Item>
                  </Col>

                  <Col xs={24} md={8}>
                    <Form.Item name="start_date" label="Start Date" rules={[{ required: true }]}>
                      <DatePicker style={{ width: "100%" }} />
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={8}>
                    <Form.Item name="end_date" label="End Date" rules={[{ required: true }]}>
                      <DatePicker style={{ width: "100%" }} />
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={8}>
                    <Form.Item name="budget" label="Budget (₹)" rules={[{ required: true, type: "number", min: 0 }]}>
                      <InputNumber style={{ width: "100%" }} formatter={v => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} />
                    </Form.Item>
                  </Col>

                  <Col xs={24} md={12}>
                    <Form.Item name="address" label="Address" rules={[{ required: true }]}>
                      <Input />
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={12}>
                    <Form.Item name="city" label="City" rules={[{ required: true }]}>
                      <Input />
                    </Form.Item>
                  </Col>
                </Row>

                <Row gutter={16} className="mt-4">
                  <Col span={24}>
                    <Form.Item label="GPS Coordinates">
                      <Input.Group compact>
                        <Form.Item name={["gps_coordinates","latitude"]} noStyle>
                          <InputNumber style={{ width: "50%" }} placeholder="Latitude" step={0.000001} />
                        </Form.Item>
                        <Form.Item name={["gps_coordinates","longitude"]} noStyle>
                          <InputNumber style={{ width: "50%" }} placeholder="Longitude" step={0.000001} />
                        </Form.Item>
                      </Input.Group>
                    </Form.Item>
                  </Col>
                </Row>
              </Card>

              {/* ========== SCOPE & DESIGN ========== */}
              <Card title="Scope & Design" className="mb-6">
                <Row gutter={16}>
                  <Col span={24}>
                    <Form.Item name="overview" label="Project Overview">
                      <TextArea rows={2} />
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={8}>
                    <Form.Item label="Site Area">
                      <Input.Group compact>
                        <Form.Item name={["site_area","value"]} noStyle>
                          <InputNumber style={{ width: "60%" }} placeholder="Value" />
                        </Form.Item>
                        <Form.Item name={["site_area","unit"]} noStyle initialValue="sq_m">
                          <Select style={{ width: "40%" }}>
                            <Option value="sq_m">sq m</Option>
                            <Option value="sq_ft">sq ft</Option>
                          </Select>
                        </Form.Item>
                      </Input.Group>
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={16}>
                    <Form.Item name="design_concept" label="Design Concept">
                      <Input />
                    </Form.Item>
                  </Col>
                  <Col span={24}>
                    <Form.Item name="scope_details" label="Detailed Scope">
                      <TextArea rows={3} />
                    </Form.Item>
                  </Col>

                  <Col span={24}>
                    <Form.Item label="Work Scope">
                      {["softscaping","hardscaping","irrigation_systems","lighting_design","water_features","furniture_accessories","maintenance_plan"]
                        .map(k => (
                          <Form.Item key={k} name={["work_scope",k]} valuePropName="checked" noStyle>
                            <Checkbox>{k.replace(/_/g," ")}</Checkbox>
                          </Form.Item>
                        ))}
                    </Form.Item>
                  </Col>
                </Row>
              </Card>

              {/* ========== DESIGN & PLANNING ========== */}
              <Card title="Design & Planning" className="mb-6">
                <Row gutter={16}>
                  <Col xs={24} md={12}>
                    <Form.Item name="landscape_architect" label="Landscape Architect">
                      <Input />
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={12}>
                    <Form.Item name="drawings_blueprints" label="Drawings / Blueprints"
                      valuePropName="fileList" getValueFromEvent={normFile}>
                      <Upload beforeUpload={() => false} multiple>
                        <Button icon={<UploadOutlined />}>Upload</Button>
                      </Upload>
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={12}>
                    <Form.Item name="visualization_3d" label="3D Visualizations"
                      valuePropName="fileList" getValueFromEvent={normFile}>
                      <Upload beforeUpload={() => false} multiple>
                        <Button icon={<UploadOutlined />}>Upload</Button>
                      </Upload>
                    </Form.Item>
                  </Col>
                </Row>
              </Card>

              {/* ========== MILESTONES (SIMPLE) ========== */}
              <Card title="Milestones" className="mb-6">
                <Form.List name="milestones" rules={[{ validator: milestoneValidator }]}>
                  {(fields, { add, remove }) => (
                    <>
                      {fields.map(({ key, name }) => (
                        <Card key={key} size="small" className="mb-3">
                          <Row gutter={16}>
                            <Col xs={24} md={7}>
                              <Form.Item name={[name, "title"]} rules={[{ required: true }]}>
                                <Input placeholder="Milestone Title" />
                              </Form.Item>
                            </Col>
                            <Col xs={24} md={5}>
                              <Form.Item name={[name, "start_date"]} rules={[{ required: true }]}>
                                <DatePicker style={{ width: "100%" }} placeholder="Start" />
                              </Form.Item>
                            </Col>
                            <Col xs={24} md={5}>
                              <Form.Item name={[name, "end_date"]} rules={[{ required: true }]}>
                                <DatePicker style={{ width: "100%" }} placeholder="End" />
                              </Form.Item>
                            </Col>
                            <Col xs={24} md={4}>
                              <Form.Item name={[name, "amount"]} rules={[{ required: true, type: "number", min: 0 }]}>
                                <InputNumber style={{ width: "100%" }} placeholder="Amount" />
                              </Form.Item>
                            </Col>
                            <Col xs={24} md={2}>
                              <Button danger onClick={() => remove(name)}>Remove</Button>
                            </Col>
                            <Col span={24}>
                              <Form.Item name={[name, "description"]}>
                                <Input placeholder="Description (optional)" />
                              </Form.Item>
                            </Col>
                          </Row>
                        </Card>
                      ))}
                      <Button type="dashed" onClick={() => add()} block icon={<ProjectOutlined />}>
                        Add Milestone
                      </Button>
                    </>
                  )}
                </Form.List>
              </Card>

              {/* ========== SUBMIT ========== */}
              <Divider />
              <Space>
                <Button type="primary" htmlType="submit" loading={loading} size="large">
                  Create Project
                </Button>
                <Button onClick={() => navigate(-1)}>Cancel</Button>
              </Space>
            </Form>
          </TabPane>

          <TabPane tab="Dummy Data" key="dummy">
            <Card>
              <Space direction="vertical" style={{ width: "100%" }}>
                <Button type="primary" onClick={fillWithDummy}>Load Default Dummy</Button>
                <Button onClick={() => setJsonModal(true)}>Paste Custom JSON</Button>
              </Space>
            </Card>
          </TabPane>
        </Tabs>

        {/* JSON Modal */}
        <Modal
          title="Paste JSON"
          open={jsonModal}
          onCancel={() => setJsonModal(false)}
          footer={[
            <Button key="cancel" onClick={() => setJsonModal(false)}>Cancel</Button>,
            <Button key="load" type="primary" onClick={fillFromText}>Load</Button>,
          ]}
          width={800}
        >
          <TextArea
            rows={20}
            value={jsonText}
            onChange={e => setJsonText(e.target.value)}
            placeholder="Paste your JSON here..."
          />
        </Modal>
      </Card>
    </div>
  );
};

export default AddProjects;