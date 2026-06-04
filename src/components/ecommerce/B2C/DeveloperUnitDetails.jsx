import React, { useState, useEffect } from "react";
import { Card, Typography, Row, Col, Tag, Button, Popconfirm, message, Spin, Divider } from "antd";
import { useParams, useNavigate } from "react-router-dom";
import { apiService } from "../../../manageApi/utils/custom.apiservice";
import { EditOutlined, DeleteOutlined, ArrowLeftOutlined } from "@ant-design/icons";

const { Title, Text } = Typography;

const toLabel = (s) => s ? s.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase()) : "—";
const fmt = (n, cur = "AED") => n ? `${cur} ${Number(n).toLocaleString()}` : "—";

const STATUS_CONFIG = {
  available: { color: "green", label: "Available" },
  hold: { color: "warning", label: "On Hold" },
  reserved: { color: "purple", label: "Reserved" },
  booked: { color: "orange", label: "Booked" },
  spa_signed: { color: "default", label: "SPA Signed" },
  sold: { color: "blue", label: "Sold" },
  handover: { color: "cyan", label: "Handover" },
  cancelled: { color: "red", label: "Cancelled" },
};

export default function DeveloperUnitDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [unit, setUnit] = useState(null);

  useEffect(() => {
    if (!id) return;
    apiService.get(`/properties/inventory/${id}`)
      .then((res) => {
        if (res?.data) {
          setUnit(res.data);
        }
      })
      .catch((err) => {
        console.error("Failed to load unit details:", err);
        message.error("Failed to load unit details");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [id]);

  const handleDelete = async () => {
    try {
      const res = await apiService.delete(`/properties/inventory/${id}`);
      if (res) {
        message.success("Unit deleted successfully");
        navigate("/dashboard/developer/developer-inventory");
      }
    } catch (err) {
      console.error("Delete unit error:", err);
      message.error(err?.response?.data?.message || "Failed to delete unit");
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "80px 0" }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!unit) {
    return (
      <div style={{ padding: 24, textAlign: "center" }}>
        <Title level={4}>Unit not found</Title>
        <Button onClick={() => navigate("/dashboard/developer/developer-inventory")}>Back to Inventory</Button>
      </div>
    );
  }

  const raw = unit.rawValues || {};
  const isCurrencyInherited = raw.currency === null || raw.currency === undefined;
  const isFurnishingInherited = raw.furnishing === null || raw.furnishing === undefined;
  const isParkingInherited = raw.parkingSpaces === null || raw.parkingSpaces === undefined;
  const isHasViewInherited = raw.hasView === null || raw.hasView === undefined;
  const isViewTypeInherited = raw.viewType === null || raw.viewType === undefined;
  const isPaymentPlanInherited = raw.paymentPlan === null || raw.paymentPlan === undefined || raw.paymentPlan === "";

  const renderBadge = (isInherited) => (
    <Tag color={isInherited ? "purple" : "geekblue"} style={{ fontSize: "10px", borderRadius: "10px", marginLeft: "8px", border: "none" }}>
      {isInherited ? "Project level" : "Override"}
    </Tag>
  );

  const sc = STATUS_CONFIG[unit.status] || { color: "default", label: toLabel(unit.status) };

  return (
    <div style={{ padding: "24px", maxWidth: "900px", margin: "0 auto", fontFamily: "'Inter', sans-serif" }}>
      
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <div>
          <Title level={3} style={{ margin: 0 }}>Unit Specifications</Title>
          <Text type="secondary">Detailed listing parameters and references</Text>
        </div>
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate("/dashboard/developer/developer-inventory")}>
          Back to Inventory
        </Button>
      </div>

      <Card className="shadow-sm rounded-xl">
        <Row gutter={[24, 24]}>
          
          <Col span={24}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "#f8fafc", padding: "16px 20px", borderRadius: "12px", border: "1px solid #ede9fe" }}>
              <div>
                <span style={{ fontSize: "12px", color: "#64748b", textTransform: "uppercase", fontWeight: 600 }}>Unit Identifier</span>
                <div style={{ fontSize: "20px", fontWeight: 800, color: "#0f172a", marginTop: 4 }}>{unit.unitNumber}</div>
              </div>
              <div>
                <span style={{ fontSize: "12px", color: "#64748b", textTransform: "uppercase", fontWeight: 600, display: "block", textAlign: "right" }}>Project Link</span>
                <div style={{ fontSize: "16px", fontWeight: 700, color: "#5c039b", marginTop: 4, textAlign: "right" }}>
                  {unit.propertyId?.projectName || unit.propertyId?.propertyName || "Untitled Project"}
                </div>
              </div>
            </div>
          </Col>

          <Col xs={24} md={12}>
            <div style={S.infoBlock}>
              <Text type="secondary">Unit Type</Text>
              <div style={S.infoVal}>{toLabel(unit.unitType)}</div>
            </div>
          </Col>

          <Col xs={24} md={12}>
            <div style={S.infoBlock}>
              <Text type="secondary">Listing Status</Text>
              <div style={{ marginTop: 4 }}>
                <Tag color={sc.color} style={{ fontSize: 13, padding: "3px 12px", fontWeight: 600 }}>
                  {sc.label}
                </Tag>
              </div>
            </div>
          </Col>

          <Col xs={24} md={8}>
            <div style={S.infoBlock}>
              <Text type="secondary">Building / Tower</Text>
              <div style={S.infoVal}>{unit.buildingName || "—"}</div>
            </div>
          </Col>

          <Col xs={24} md={8}>
            <div style={S.infoBlock}>
              <Text type="secondary">Floor Number</Text>
              <div style={S.infoVal}>{unit.floorNumber ?? "—"}</div>
            </div>
          </Col>

          <Col xs={24} md={8}>
            <div style={S.infoBlock}>
              <Text type="secondary">Dimensions Area</Text>
              <div style={S.infoVal}>{unit.area ? `${Number(unit.area).toLocaleString()} ${unit.areaUnit || "sqft"}` : "—"}</div>
            </div>
          </Col>

          {["apartment", "villa", "townhouse", "duplex", "penthouse", "hotel_apartment"].includes(unit.unitType?.toLowerCase()) && (
            <>
              <Col xs={24} md={8}>
                <div style={S.infoBlock}>
                  <Text type="secondary">Bedroom Configuration</Text>
                  <div style={S.infoVal}>{toLabel(unit.bedroomType)}</div>
                </div>
              </Col>

              <Col xs={24} md={8}>
                <div style={S.infoBlock}>
                  <Text type="secondary">Bedrooms Count</Text>
                  <div style={S.infoVal}>{unit.bedrooms || "—"}</div>
                </div>
              </Col>

              <Col xs={24} md={8}>
                <div style={S.infoBlock}>
                  <Text type="secondary">Bathrooms Count</Text>
                  <div style={S.infoVal}>{unit.bathrooms || "—"}</div>
                </div>
              </Col>
            </>
          )}

          <Col span={24}>
            <Divider style={{ margin: "12px 0" }} />
          </Col>

          <Col xs={24} md={12}>
            <div style={S.infoBlock}>
              <Text type="secondary">Base Price</Text>
              <div style={{ ...S.infoVal, color: "#5c039b", fontSize: "20px", fontWeight: 800 }}>
                {fmt(unit.price, unit.currency)}
                {renderBadge(isCurrencyInherited)}
              </div>
            </div>
          </Col>

          <Col xs={24} md={12}>
            <div style={S.infoBlock}>
              <Text type="secondary">Furnishing Status</Text>
              <div style={S.infoVal}>
                {toLabel(unit.furnishing)}
                {renderBadge(isFurnishingInherited)}
              </div>
            </div>
          </Col>

          <Col xs={24} md={12}>
            <div style={S.infoBlock}>
              <Text type="secondary">Allocated Parking Spaces</Text>
              <div style={S.infoVal}>
                {unit.parkingSpaces ?? "0"} spaces
                {renderBadge(isParkingInherited)}
              </div>
            </div>
          </Col>

          <Col xs={24} md={12}>
            <div style={S.infoBlock}>
              <Text type="secondary">Scenic View Access</Text>
              <div style={S.infoVal}>
                {unit.hasView ? `Yes — ${unit.viewType?.map(toLabel).join(", ") || "General view"}` : "No specific view"}
                {renderBadge(isHasViewInherited || isViewTypeInherited)}
              </div>
            </div>
          </Col>

          <Col span={24}>
            <div style={S.infoBlock}>
              <Text type="secondary">Associated Payment Plan</Text>
              <div style={S.infoVal}>
                {unit.paymentPlan || "—"}
                {renderBadge(isPaymentPlanInherited)}
              </div>
            </div>
          </Col>

          <Col span={24} style={{ marginTop: "16px" }}>
            <Space>
              <Button
                type="primary"
                icon={<EditOutlined />}
                style={{ background: "#5c039b", borderColor: "#5c039b" }}
                onClick={() => navigate(`/dashboard/developer/inventory/${id}/edit`)}
              >
                Edit Specifications
              </Button>
              <Popconfirm
                title="Delete this unit?"
                description="This listing parameters will be permanently removed from inventory catalog."
                onConfirm={handleDelete}
                okText="Delete"
                cancelText="Cancel"
                okButtonProps={{ danger: true }}
              >
                <Button danger icon={<DeleteOutlined />}>
                  Delete Unit
                </Button>
              </Popconfirm>
            </Space>
          </Col>

        </Row>
      </Card>
    </div>
  );
}

const S = {
  infoBlock: { background: "#f8fafc", padding: "14px 18px", borderRadius: "8px", border: "1px solid #f1f5f9", height: "100%" },
  infoVal: { fontSize: "15px", fontWeight: 700, color: "#0f172a", marginTop: 4, display: "flex", alignItems: "center" }
};