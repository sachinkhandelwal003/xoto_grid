import React, { useState, useEffect } from "react";
import { Form, Input, Button, Card, Select, InputNumber, Switch, Space, message } from "antd";
import { useNavigate } from "react-router-dom";
import { apiService } from "../../../manageApi/utils/custom.apiservice";

const { Option } = Select;

const UNIT_TYPES = ["apartment", "villa", "townhouse", "duplex", "penthouse", "plot", "office", "retail", "warehouse", "hotel_apartment"];
const BEDROOM_TYPES = ["studio", "1bed", "2bed", "3bed", "4bed", "5bed", "6bed", "7bed", "8plus"];
const VIEW_TYPES = ["sea", "city", "garden", "landmark", "pool", "park"];
const FURNISHING = ["furnished", "semi_furnished", "unfurnished"];
const AREA_UNITS = ["sqft", "sqm"];
const CURRENCIES = ["AED", "USD", "EUR"];

const toLabel = (s) => s ? s.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase()) : "—";

export default function DeveloperAddUnit() {
  const [loading, setLoading] = useState(false);
  const [project, setProject] = useState(null);
  const [form] = Form.useForm();
  const navigate = useNavigate();

  const projectId = localStorage.getItem("selectedProject");

  useEffect(() => {
    if (!projectId) {
      message.error("Please select a project first from the inventory page");
      navigate("/dashboard/developer/developer-inventory");
      return;
    }

    apiService.get(`/properties/${projectId}`)
      .then((res) => {
        if (res?.data) {
          setProject(res.data);
        }
      })
      .catch((err) => {
        console.error("Failed to load project:", err);
        message.error("Failed to load project details");
      });
  }, [projectId, navigate]);

  const onFinish = async (values) => {
    setLoading(true);
    try {
      const payload = {
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
        }]
      };

      const res = await apiService.post("/properties/inventory", payload);

      if (res?.success) {
        message.success("Unit Added Successfully");
        setTimeout(() => {
          navigate("/dashboard/developer/developer-inventory");
        }, 700);
      } else {
        message.error(res?.message || "Failed to add unit");
      }
    } catch (error) {
      console.error("Add unit error:", error);
      message.error(error?.response?.data?.message || "Failed to add unit");
    } finally {
      setLoading(false);
    }
  };

  const isResidentialUnitType = (unitType) => 
    ["apartment", "villa", "townhouse", "duplex", "penthouse", "hotel_apartment"].includes(unitType);
  const isPlotUnitType = (unitType) => unitType === "plot";

  const propCurrency = project?.currency || "AED";
  const propFurnishing = project?.furnishing || "unfurnished";
  const propParking = project?.parkingSpaces ?? 0;
  const propHasView = project?.hasView ? "Yes" : "No";
  const propViewType = project?.viewType?.length ? project.viewType.map(toLabel).join(", ") : "None";
  const propPaymentPlan = project?.paymentPlan?.length ? project.paymentPlan[0]?.title : "";

  return (
    <div style={{ padding: "24px", maxWidth: "900px", margin: "0 auto", fontFamily: "'Inter', sans-serif" }}>
      <Card
        title={<span style={{ fontSize: 18, fontWeight: 700, color: "#5c039b" }}>Add New Unit</span>}
        extra={
          <Button onClick={() => navigate("/dashboard/developer/developer-inventory")}>
            Back to Inventory
          </Button>
        }
        className="shadow-sm rounded-xl"
      >
        <Form form={form} layout="vertical" onFinish={onFinish}>
          
          <div style={S.formSection}>Unit Identity</div>
          <div style={S.formGrid3}>
            <Form.Item name="unitNumber" label="Unit Number" rules={[{ required: true, message: "Unit number is required" }]}><Input placeholder="e.g. T1-1001" /></Form.Item>
            <Form.Item name="buildingName" label="Building Name"><Input placeholder="e.g. Tower A" /></Form.Item>
            <Form.Item name="floorNumber" label="Floor Number"><InputNumber min={0} style={{ width: "100%" }} /></Form.Item>
          </div>

          <div style={S.formSection}>Unit Type & Size</div>
          <div style={S.formGrid4}>
            <Form.Item name="unitType" label="Unit Type" rules={[{ required: true, message: "Unit type is required" }]}>
              <Select placeholder="Select">{UNIT_TYPES.map(t => <Option key={t} value={t}>{toLabel(t)}</Option>)}</Select>
            </Form.Item>
            
            <Form.Item shouldUpdate={(prev, curr) => prev.unitType !== curr.unitType}>
              {({ getFieldValue }) => {
                const unitType = getFieldValue("unitType");
                return isResidentialUnitType(unitType) ? (
                  <>
                    <Form.Item name="bedroomType" label="Bedroom Type" rules={[{ required: true, message: "Required" }]}>
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
            <Form.Item name="area" label="Area" rules={[{ required: true, message: "Area is required" }]}><InputNumber min={0} style={{ width: "100%" }} /></Form.Item>
            <Form.Item name="areaUnit" label="Unit" initialValue="sqft"><Select>{AREA_UNITS.map(u => <Option key={u} value={u}>{u}</Option>)}</Select></Form.Item>
            <Form.Item name="price" label="Price" rules={[{ required: true, message: "Price is required" }]}>
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
                          const shouldShow = hasView === true || (hasView === "inherit" && project?.hasView);
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

          <Space style={{ marginTop: "24px" }}>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              style={{ background: "#5c039b", borderColor: "#5c039b" }}
            >
              Add Unit
            </Button>
            <Button onClick={() => navigate("/dashboard/developer/developer-inventory")}>
              Cancel
            </Button>
          </Space>
        </Form>
      </Card>
    </div>
  );
}

const S = {
  formSection: { fontSize: 12, fontWeight: 700, color: "#5c039b", textTransform: "uppercase", letterSpacing: "0.07em", padding: "12px 0 8px", borderBottom: "1px solid #f1f5f9", marginBottom: 12 },
  formGrid3: { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 },
  formGrid4: { display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }
};