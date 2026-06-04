// src/pages/freelancer/components/ProjectForm.jsx
import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import {
  Form,
  Input,
  InputNumber,
  DatePicker,
  Select,
  Switch,
  Button,
  Row,
  Col,
  Card,
  Collapse,
  Divider,
  Space,
  message,
} from "antd";
import {
  PlusOutlined,
  MinusOutlined,
} from "@ant-design/icons";
import { apiService } from "../../../../../../../manageApi/utils/custom.apiservice";
import { showSuccessAlert, showErrorAlert } from "../../../../../../../manageApi/utils/sweetAlert";
import moment from "moment";
import axios from "axios";

const { Option } = Select;
const { TextArea } = Input;
const { Panel } = Collapse;

const ProjectForm = ({ project, onSuccess, onCancel }) => {
  const { token } = useSelector((s) => s.auth);
  const [form] = Form.useForm();
  const [saving, setSaving] = useState(false);
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  
  // Enhanced project scope state
  const [projectScope, setProjectScope] = useState({
    softscaping: false,
    hardscaping: false,
    irrigation: false,
    lighting: false,
    water_features: false,
    furniture: false,
    maintenance: false,
  });
  
  // Materials state
  const [materials, setMaterials] = useState([
    { name: "", quantity: 0, unit: "", supplier: "" },
  ]);
  const [equipment, setEquipment] = useState([""]);
  const [team, setTeam] = useState([""]);
  
  // Cost breakdown state
  const [costBreakdown, setCostBreakdown] = useState({
    materials: 0,
    labor: 0,
    equipment: 0,
    overheads: 0,
    contingency: 0,
  });

  // With milestones toggle
  const [withMilestones, setWithMilestones] = useState(false);
  const [milestones, setMilestones] = useState([
    { title: "", description: "", start_date: null, end_date: null, due_date: null, amount: 0 },
  ]);

  // Fetch Categories & Subcategories
  const fetchCategories = async () => {
    try {
      const { data } = await axios.get(
        "https://kotiboxglobaltech.online/api/freelancer/category?active=true",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setCategories(data.categories || []);
    } catch (err) {
      message.error("Failed to load categories");
    }
  };

  const fetchSubcategories = async (catId) => {
    if (!catId) return setSubcategories([]);
    try {
      const { data } = await axios.get(
        `https://kotiboxglobaltech.online/api/freelancer/subcategory?category=${catId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setSubcategories(data.subcategories || []);
    } catch (err) {
      message.error("Failed to load subcategories");
    }
  };

  useEffect(() => {
    fetchCategories();
    
    if (project) {
      // Populate form with project data
      const scope = project.scope || {};
      const projectMaterials = project.materials || [
        { name: "", quantity: 0, unit: "", supplier: "" },
      ];
      const projectEquipment = project.equipment || [""];
      const projectTeam = project.team || [""];
      const projectCostBreakdown = project.cost_breakdown || {
        materials: 0,
        labor: 0,
        equipment: 0,
        overheads: 0,
        contingency: 0,
      };
      
      setProjectScope(scope);
      setMaterials(projectMaterials);
      setEquipment(projectEquipment);
      setTeam(projectTeam);
      setCostBreakdown(projectCostBreakdown);
      
      if (project.milestones && project.milestones.length > 0) {
        setWithMilestones(true);
        setMilestones(project.milestones.map(m => ({
          title: m.title,
          description: m.description,
          start_date: m.start_date ? moment(m.start_date) : null,
          end_date: m.end_date ? moment(m.end_date) : null,
          due_date: m.due_date ? moment(m.due_date) : null,
          amount: m.amount,
        })));
      }

      form.setFieldsValue({
        ...project,
        start_date: project.start_date ? moment(project.start_date) : null,
        end_date: project.end_date ? moment(project.end_date) : null,
        category: project.category?._id,
        subcategory: project.subcategory?._id,
        site_area: project.site_area || 0,
        design_theme: project.design_theme || "",
        architect: project.architect || "",
        manpower: project.manpower || 0,
        drawings: project.drawings || [],
        planting_plan: project.planting_plan || "",
        material_specs: project.material_specs || "",
        irrigation_plan: project.irrigation_plan || "",
        lighting_plan: project.lighting_plan || "",
        visualization_3d: project.visualization_3d || "",
      });
      
      fetchSubcategories(project.category?._id);
    }
  }, [project, form, token]);

  // Handle materials changes
  const handleMaterialChange = (index, field, value) => {
    const newMaterials = [...materials];
    newMaterials[index][field] = value;
    setMaterials(newMaterials);
  };

  const addMaterial = () => {
    setMaterials([
      ...materials,
      { name: "", quantity: 0, unit: "", supplier: "" },
    ]);
  };

  const removeMaterial = (index) => {
    if (materials.length > 1) {
      const newMaterials = materials.filter((_, i) => i !== index);
      setMaterials(newMaterials);
    }
  };

  // Handle equipment changes
  const handleEquipmentChange = (index, value) => {
    const newEquipment = [...equipment];
    newEquipment[index] = value;
    setEquipment(newEquipment);
  };

  const addEquipment = () => {
    setEquipment([...equipment, ""]);
  };

  const removeEquipment = (index) => {
    if (equipment.length > 1) {
      const newEquipment = equipment.filter((_, i) => i !== index);
      setEquipment(newEquipment);
    }
  };

  // Handle team changes
  const handleTeamChange = (index, value) => {
    const newTeam = [...team];
    newTeam[index] = value;
    setTeam(newTeam);
  };

  const addTeam = () => {
    setTeam([...team, ""]);
  };

  const removeTeam = (index) => {
    if (team.length > 1) {
      const newTeam = team.filter((_, i) => i !== index);
      setTeam(newTeam);
    }
  };

  // Handle cost breakdown changes
  const handleCostBreakdownChange = (field, value) => {
    setCostBreakdown((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Handle milestone changes
  const handleMilestoneChange = (index, field, value) => {
    const newMilestones = [...milestones];
    newMilestones[index][field] = value;
    setMilestones(newMilestones);
  };

  const addMilestone = () => {
    setMilestones([
      ...milestones,
      { title: "", description: "", start_date: null, end_date: null, due_date: null, amount: 0 },
    ]);
  };

  const removeMilestone = (index) => {
    if (milestones.length > 1) {
      const newMilestones = milestones.filter((_, i) => i !== index);
      setMilestones(newMilestones);
    }
  };

  const handleScopeChange = (field, value) => {
    setProjectScope((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const saveProject = async (values) => {
    setSaving(true);
    try {
      // Calculate duration in weeks if not provided
      const durationWeeks =
        values.duration_weeks ||
        (values.start_date && values.end_date
          ? Math.ceil(
              moment(values.end_date).diff(
                moment(values.start_date),
                "weeks",
                true
              )
            )
          : 0);

      const payload = {
        title: values.title,
        client_name: values.client_name,
        client_company: values.client_company,
        project_type: values.project_type,
        address: values.address,
        city: values.city,
        gps: values.gps,
        start_date: values.start_date?.toISOString(),
        end_date: values.end_date?.toISOString(),
        duration_weeks: durationWeeks,
        overview: values.overview,
        site_area: values.site_area,
        design_theme: values.design_theme,
        scope: projectScope,
        architect: values.architect,
        drawings: values.drawings || [],
        planting_plan: values.planting_plan,
        material_specs: values.material_specs,
        irrigation_plan: values.irrigation_plan,
        lighting_plan: values.lighting_plan,
        visualization_3d: values.visualization_3d,
        team: team.filter((t) => t.trim() !== ""),
        equipment: equipment.filter((e) => e.trim() !== ""),
        materials: materials.filter((m) => m.name.trim() !== ""),
        manpower: values.manpower,
        budget: values.budget,
        cost_breakdown: costBreakdown,
        category: values.category,
        subcategory: values.subcategory,
      };

      // Add milestones if withMilestones is true
      if (withMilestones) {
        payload.milestones = milestones.map(milestone => ({
          ...milestone,
          start_date: milestone.start_date?.toISOString(),
          end_date: milestone.end_date?.toISOString(),
          due_date: milestone.due_date?.toISOString(),
        }));
      }

      // Remove undefined and null values
      Object.keys(payload).forEach((key) => {
        if (payload[key] === undefined || payload[key] === null) {
          delete payload[key];
        }
        if (Array.isArray(payload[key]) && payload[key].length === 0) {
          delete payload[key];
        }
        if (typeof payload[key] === "string" && payload[key].trim() === "") {
          delete payload[key];
        }
      });

      if (project) {
        await apiService.put(`/freelancer/projects/${project._id}`, payload);
        showSuccessAlert("Success", "Project updated successfully");
      } else {
        await apiService.post("/freelancer/projects", payload);
        showSuccessAlert("Success", "Project created successfully");
      }
      
      onSuccess();
    } catch (err) {
      console.error("Save project error:", err);
      showErrorAlert("Error", err?.response?.data?.message || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card>
      <Form form={form} layout="vertical" onFinish={saveProject}>
        <Collapse defaultActiveKey={["1"]} ghost>
          {/* Basic Information */}
          <Panel header="Basic Information" key="1">
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="title"
                  label="Project Title"
                  rules={[{ required: true, message: "Please enter project title" }]}
                >
                  <Input placeholder="Enter project title" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="project_type"
                  label="Project Type"
                  rules={[{ required: true, message: "Please select project type" }]}
                >
                  <Select placeholder="Select project type">
                    <Option value="Residential">Residential</Option>
                    <Option value="Commercial">Commercial</Option>
                    <Option value="Resort">Resort</Option>
                  </Select>
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="client_name"
                  label="Client Name"
                  rules={[{ required: true, message: "Please enter client name" }]}
                >
                  <Input placeholder="Enter client name" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="client_company" label="Client Company">
                  <Input placeholder="Enter company name" />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="category"
                  label="Category"
                  rules={[{ required: true, message: "Please select category" }]}
                >
                  <Select
                    placeholder="Select category"
                    onChange={(v) => {
                      form.setFieldsValue({ subcategory: undefined });
                      fetchSubcategories(v);
                    }}
                  >
                    {categories.map((c) => (
                      <Option key={c._id} value={c._id}>
                        {c.name}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="subcategory"
                  label="Subcategory"
                  rules={[{ required: true, message: "Please select subcategory" }]}
                >
                  <Select
                    placeholder="Select subcategory"
                    disabled={!form.getFieldValue("category")}
                  >
                    {subcategories.map((s) => (
                      <Option key={s._id} value={s._id}>
                        {s.name}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
            </Row>
          </Panel>

          {/* Location & Timeline */}
          <Panel header="Location & Timeline" key="2">
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item name="address" label="Address">
                  <Input placeholder="Enter project address" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="city" label="City">
                  <Input placeholder="Enter city" />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item name="gps" label="GPS Coordinates">
                  <Input placeholder="e.g., 7.9519,98.3381" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="site_area" label="Site Area (sq.m)">
                  <InputNumber
                    min={0}
                    style={{ width: "100%" }}
                    placeholder="Enter site area"
                  />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="start_date"
                  label="Start Date"
                  rules={[{ required: true, message: "Please select start date" }]}
                >
                  <DatePicker style={{ width: "100%" }} />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="end_date"
                  label="End Date"
                  rules={[{ required: true, message: "Please select end date" }]}
                >
                  <DatePicker style={{ width: "100%" }} />
                </Form.Item>
              </Col>
            </Row>
          </Panel>

          {/* Project Details */}
          <Panel header="Project Details" key="3">
            <Form.Item name="overview" label="Project Overview">
              <TextArea rows={3} placeholder="Enter project description" />
            </Form.Item>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item name="design_theme" label="Design Theme">
                  <Input placeholder="e.g., Tropical Modern" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="architect" label="Architect">
                  <Input placeholder="Enter architect name" />
                </Form.Item>
              </Col>
            </Row>
            <Form.Item label="Project Scope">
              <Row gutter={[16, 16]}>
                <Col span={8}>
                  <Switch
                    checked={projectScope.softscaping}
                    onChange={(v) => handleScopeChange("softscaping", v)}
                  />{" "}
                  Softscaping
                </Col>
                <Col span={8}>
                  <Switch
                    checked={projectScope.hardscaping}
                    onChange={(v) => handleScopeChange("hardscaping", v)}
                  />{" "}
                  Hardscaping
                </Col>
                <Col span={8}>
                  <Switch
                    checked={projectScope.irrigation}
                    onChange={(v) => handleScopeChange("irrigation", v)}
                  />{" "}
                  Irrigation
                </Col>
                <Col span={8}>
                  <Switch
                    checked={projectScope.lighting}
                    onChange={(v) => handleScopeChange("lighting", v)}
                  />{" "}
                  Lighting
                </Col>
                <Col span={8}>
                  <Switch
                    checked={projectScope.water_features}
                    onChange={(v) => handleScopeChange("water_features", v)}
                  />{" "}
                  Water Features
                </Col>
                <Col span={8}>
                  <Switch
                    checked={projectScope.furniture}
                    onChange={(v) => handleScopeChange("furniture", v)}
                  />{" "}
                  Furniture
                </Col>
                <Col span={8}>
                  <Switch
                    checked={projectScope.maintenance}
                    onChange={(v) => handleScopeChange("maintenance", v)}
                  />{" "}
                  Maintenance
                </Col>
              </Row>
            </Form.Item>
          </Panel>

          {/* Budget & Resources */}
          <Panel header="Budget & Resources" key="4">
            <Form.Item
              name="budget"
              label="Total Budget"
              rules={[{ required: true, message: "Please enter budget" }]}
            >
              <InputNumber
                min={0}
                style={{ width: "100%" }}
                formatter={(v) => `$ ${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                parser={(v) => v.replace(/\$\s?|(,*)/g, "")}
                placeholder="Enter total budget"
              />
            </Form.Item>
            <div style={{ marginBottom: 16 }}>
              <strong>Cost Breakdown</strong>
            </div>
            <Row gutter={16} style={{ marginBottom: 16 }}>
              <Col span={12}>
                <Form.Item label="Materials">
                  <InputNumber
                    value={costBreakdown.materials}
                    onChange={(v) => handleCostBreakdownChange("materials", v)}
                    style={{ width: "100%" }}
                    formatter={(v) => `$ ${v}`}
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="Labor">
                  <InputNumber
                    value={costBreakdown.labor}
                    onChange={(v) => handleCostBreakdownChange("labor", v)}
                    style={{ width: "100%" }}
                    formatter={(v) => `$ ${v}`}
                  />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={8}>
                <Form.Item label="Equipment">
                  <InputNumber
                    value={costBreakdown.equipment}
                    onChange={(v) => handleCostBreakdownChange("equipment", v)}
                    style={{ width: "100%" }}
                    formatter={(v) => `$ ${v}`}
                  />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item label="Overheads">
                  <InputNumber
                    value={costBreakdown.overheads}
                    onChange={(v) => handleCostBreakdownChange("overheads", v)}
                    style={{ width: "100%" }}
                    formatter={(v) => `$ ${v}`}
                  />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item label="Contingency">
                  <InputNumber
                    value={costBreakdown.contingency}
                    onChange={(v) => handleCostBreakdownChange("contingency", v)}
                    style={{ width: "100%" }}
                    formatter={(v) => `$ ${v}`}
                  />
                </Form.Item>
              </Col>
            </Row>
            <Form.Item name="manpower" label="Manpower Required">
              <InputNumber
                min={0}
                style={{ width: "100%" }}
                placeholder="Number of people"
              />
            </Form.Item>
          </Panel>

          {/* Materials & Equipment */}
          <Panel header="Materials & Equipment" key="5">
            <div style={{ marginBottom: 16 }}>
              <strong>Materials</strong>
            </div>
            {materials.map((material, index) => (
              <Row gutter={16} key={index} style={{ marginBottom: 8 }}>
                <Col span={6}>
                  <Input
                    placeholder="Material name"
                    value={material.name}
                    onChange={(e) =>
                      handleMaterialChange(index, "name", e.target.value)
                    }
                  />
                </Col>
                <Col span={4}>
                  <InputNumber
                    placeholder="Qty"
                    value={material.quantity}
                    onChange={(v) =>
                      handleMaterialChange(index, "quantity", v)
                    }
                    style={{ width: "100%" }}
                  />
                </Col>
                <Col span={4}>
                  <Input
                    placeholder="Unit"
                    value={material.unit}
                    onChange={(e) =>
                      handleMaterialChange(index, "unit", e.target.value)
                    }
                  />
                </Col>
                <Col span={8}>
                  <Input
                    placeholder="Supplier"
                    value={material.supplier}
                    onChange={(e) =>
                      handleMaterialChange(index, "supplier", e.target.value)
                    }
                  />
                </Col>
                <Col span={2}>
                  <Button
                    danger
                    icon={<MinusOutlined />}
                    onClick={() => removeMaterial(index)}
                    disabled={materials.length === 1}
                  />
                </Col>
              </Row>
            ))}
            <Button
              type="dashed"
              icon={<PlusOutlined />}
              onClick={addMaterial}
              style={{ width: "100%", marginBottom: 16 }}
            >
              Add Material
            </Button>

            <div style={{ marginBottom: 16 }}>
              <strong>Equipment</strong>
            </div>
            {equipment.map((item, index) => (
              <Row gutter={16} key={index} style={{ marginBottom: 8 }}>
                <Col span={22}>
                  <Input
                    placeholder="Equipment name"
                    value={item}
                    onChange={(e) =>
                      handleEquipmentChange(index, e.target.value)
                    }
                  />
                </Col>
                <Col span={2}>
                  <Button
                    danger
                    icon={<MinusOutlined />}
                    onClick={() => removeEquipment(index)}
                    disabled={equipment.length === 1}
                  />
                </Col>
              </Row>
            ))}
            <Button
              type="dashed"
              icon={<PlusOutlined />}
              onClick={addEquipment}
              style={{ width: "100%", marginBottom: 16 }}
            >
              Add Equipment
            </Button>

            <div style={{ marginBottom: 16 }}>
              <strong>Team</strong>
            </div>
            {team.map((member, index) => (
              <Row gutter={16} key={index} style={{ marginBottom: 8 }}>
                <Col span={22}>
                  <Input
                    placeholder="Team member role/name"
                    value={member}
                    onChange={(e) => handleTeamChange(index, e.target.value)}
                  />
                </Col>
                <Col span={2}>
                  <Button
                    danger
                    icon={<MinusOutlined />}
                    onClick={() => removeTeam(index)}
                    disabled={team.length === 1}
                  />
                </Col>
              </Row>
            ))}
            <Button 
              type="dashed" 
              icon={<PlusOutlined />}
              onClick={addTeam} 
              style={{ width: "100%" }}
            >
              Add Team Member
            </Button>
          </Panel>

          {/* Milestones */}
          <Panel header="Milestones" key="6">
            <Form.Item>
              <Switch
                checked={withMilestones}
                onChange={setWithMilestones}
                checkedChildren="With Milestones"
                unCheckedChildren="Without Milestones"
              />
            </Form.Item>

            {withMilestones && (
              <div>
                {milestones.map((milestone, index) => (
                  <Card key={index} style={{ marginBottom: 16, border: "1px solid #d9d9d9" }}>
                    <Row gutter={16}>
                      <Col span={11}>
                        <Input
                          placeholder="Milestone Title"
                          value={milestone.title}
                          onChange={(e) => handleMilestoneChange(index, "title", e.target.value)}
                        />
                      </Col>
                      <Col span={11}>
                        <InputNumber
                          placeholder="Amount"
                          value={milestone.amount}
                          onChange={(v) => handleMilestoneChange(index, "amount", v)}
                          style={{ width: "100%" }}
                          formatter={(v) => `$ ${v}`}
                        />
                      </Col>
                      <Col span={2}>
                        <Button
                          danger
                          icon={<MinusOutlined />}
                          onClick={() => removeMilestone(index)}
                          disabled={milestones.length === 1}
                        />
                      </Col>
                    </Row>
                    <Row gutter={16} style={{ marginTop: 8 }}>
                      <Col span={24}>
                        <Input
                          placeholder="Description"
                          value={milestone.description}
                          onChange={(e) => handleMilestoneChange(index, "description", e.target.value)}
                        />
                      </Col>
                    </Row>
                    <Row gutter={16} style={{ marginTop: 8 }}>
                      <Col span={8}>
                        <DatePicker
                          placeholder="Start Date"
                          value={milestone.start_date}
                          onChange={(date) => handleMilestoneChange(index, "start_date", date)}
                          style={{ width: "100%" }}
                        />
                      </Col>
                      <Col span={8}>
                        <DatePicker
                          placeholder="End Date"
                          value={milestone.end_date}
                          onChange={(date) => handleMilestoneChange(index, "end_date", date)}
                          style={{ width: "100%" }}
                        />
                      </Col>
                      <Col span={8}>
                        <DatePicker
                          placeholder="Due Date"
                          value={milestone.due_date}
                          onChange={(date) => handleMilestoneChange(index, "due_date", date)}
                          style={{ width: "100%" }}
                        />
                      </Col>
                    </Row>
                  </Card>
                ))}
                <Button
                  type="dashed"
                  icon={<PlusOutlined />}
                  onClick={addMilestone}
                  style={{ width: "100%" }}
                >
                  Add Milestone
                </Button>
              </div>
            )}
          </Panel>

          {/* Documentation */}
          <Panel header="Documentation" key="7">
            <Form.Item name="drawings" label="Drawings (URLs)">
              <Select mode="tags" placeholder="Add drawing URLs">
                {project?.drawings?.map((url, index) => (
                  <Option key={index} value={url}>
                    {url}
                  </Option>
                ))}
              </Select>
            </Form.Item>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item name="planting_plan" label="Planting Plan URL">
                  <Input placeholder="Planting plan URL" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="material_specs" label="Material Specifications">
                  <Input placeholder="Material specifications" />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item name="irrigation_plan" label="Irrigation Plan URL">
                  <Input placeholder="Irrigation plan URL" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="lighting_plan" label="Lighting Plan URL">
                  <Input placeholder="Lighting plan URL" />
                </Form.Item>
              </Col>
            </Row>
            <Form.Item name="visualization_3d" label="3D Visualization URL">
              <Input placeholder="3D visualization URL" />
            </Form.Item>
          </Panel>
        </Collapse>

        <Divider />
        
        <Form.Item>
          <Space>
            <Button
              type="primary"
              htmlType="submit"
              loading={saving}
              size="large"
            >
              {project ? "Update Project" : "Create Project"}
            </Button>
            <Button onClick={onCancel} size="large">
              Cancel
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </Card>
  );
};

export default ProjectForm;