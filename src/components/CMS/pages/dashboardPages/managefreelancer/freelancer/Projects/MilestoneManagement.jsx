// src/pages/freelancer/components/MilestoneManagement.jsx
import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import {
  Card,
  List,
  Button,
  Tag,
  Progress,
  Space,
  Form,
  Input,
  InputNumber,
  DatePicker,
  Modal,
  message,
  Row,
  Col,
  Badge,
} from "antd";
import {
  CheckCircleOutlined,
  FileTextOutlined,
  PlusOutlined,
  ExclamationCircleOutlined,
} from "@ant-design/icons";
import { apiService } from "../../../../../../../manageApi/utils/custom.apiservice";
import { showSuccessAlert, showErrorAlert } from "../../../../../../../manageApi/utils/sweetAlert";
import moment from "moment";

const { TextArea } = Input;
const { confirm } = Modal;

const MilestoneManagement = ({ project, onBack }) => {
  const { user } = useSelector((s) => s.auth);
  const [milestones, setMilestones] = useState([]);
  const [loading, setLoading] = useState(false);
  const [addingMilestone, setAddingMilestone] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [form] = Form.useForm();

  useEffect(() => {
    if (project) {
      fetchMilestones();
    }
  }, [project]);

  const fetchMilestones = async () => {
    setLoading(true);
    try {
      const res = await apiService.get(
        `/freelancer/projects/${project._id}/milestones`
      );
      setMilestones(res.milestones || []);
    } catch (err) {
      message.error("Failed to load milestones");
    } finally {
      setLoading(false);
    }
  };

  const addMilestone = async (values) => {
    setAddingMilestone(true);
    try {
      const payload = {
        title: values.title,
        description: values.description || "",
        due_date: values.due_date.toISOString(),
        amount: Number(values.amount),
        progress: 0,
        photos: [],
        notes: values.notes || "",
      };

      await apiService.post(
        `/freelancer/projects/${project._id}/milestones`,
        payload
      );
      
      showSuccessAlert("Success", "Milestone added successfully");
      form.resetFields();
      setShowAddForm(false);
      await fetchMilestones();
    } catch (err) {
      console.error("Add milestone error:", err);
      showErrorAlert(
        "Error",
        err?.response?.data?.message || "Failed to add milestone"
      );
    } finally {
      setAddingMilestone(false);
    }
  };

  const updateMilestoneProgress = async (milestoneId, progress) => {
    try {
      await apiService.put(
        `/freelancer/projects/${project._id}/milestones/${milestoneId}/freelancer`,
        { progress }
      );
      showSuccessAlert("Updated", "Milestone progress updated");
      await fetchMilestones();
    } catch (err) {
      showErrorAlert("Error", err?.response?.data?.message || "Update failed");
    }
  };

  const approveMilestone = async (milestoneId) => {
    confirm({
      title: 'Approve Milestone',
      icon: <ExclamationCircleOutlined />,
      content: 'Are you sure you want to approve this milestone and generate invoice?',
      onOk: async () => {
        try {
          await apiService.patch(
            `/freelancer/projects/${project._id}/milestones/${milestoneId}/approve`
          );
          showSuccessAlert("Approved", "Milestone approved and invoice generated");
          await fetchMilestones();
        } catch (err) {
          showErrorAlert(
            "Error",
            err?.response?.data?.message || "Approval failed"
          );
        }
      },
    });
  };

  return (
    <Card
      title={`Milestones - ${project?.title}`}
      extra={<Button onClick={onBack}>Back to Projects</Button>}
    >
      {/* Add Milestone Form - Only for Admin/SuperAdmin */}
      {['SuperAdmin', 'Admin'].includes(user.role) && (
        <Card
          title="Add New Milestone"
          style={{ marginBottom: 16 }}
          extra={
            <Button
              type={showAddForm ? "default" : "primary"}
              icon={<PlusOutlined />}
              onClick={() => setShowAddForm(!showAddForm)}
            >
              {showAddForm ? "Cancel" : "Add Milestone"}
            </Button>
          }
        >
          {showAddForm && (
            <Form form={form} onFinish={addMilestone} layout="vertical">
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    name="title"
                    label="Title"
                    rules={[{ required: true, message: "Please enter milestone title" }]}
                  >
                    <Input placeholder="Milestone title" />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="amount"
                    label="Amount"
                    rules={[{ required: true, message: "Please enter milestone amount" }]}
                  >
                    <InputNumber
                      min={0}
                      style={{ width: "100%" }}
                      formatter={(v) => `$ ${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                      placeholder="Amount"
                    />
                  </Form.Item>
                </Col>
              </Row>
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    name="due_date"
                    label="Due Date"
                    rules={[{ required: true, message: "Please select due date" }]}
                  >
                    <DatePicker style={{ width: "100%" }} />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item name="description" label="Description">
                    <Input placeholder="Milestone description" />
                  </Form.Item>
                </Col>
              </Row>
              <Form.Item name="notes" label="Notes">
                <TextArea rows={2} placeholder="Additional notes..." />
              </Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                loading={addingMilestone}
                block
              >
                {addingMilestone ? "Adding Milestone..." : "Add Milestone"}
              </Button>
            </Form>
          )}
        </Card>
      )}

      {/* Milestones List */}
      <List
        loading={loading}
        dataSource={milestones}
        renderItem={(m) => (
          <Card className="mb-3" key={m._id}>
            <div className="flex justify-between items-start">
              <div style={{ flex: 1 }}>
                <div className="flex justify-between items-center mb-2">
                  <div className="flex items-center">
                    <strong>{m.title}</strong>
                    {m.daily_updates && m.daily_updates.length > 0 && (
                      <Badge
                        count={m.daily_updates.filter(du => du.approval_status === 'pending').length}
                        style={{ backgroundColor: '#faad14', marginLeft: 8 }}
                      >
                        <Button
                          size="small"
                          type="link"
                          icon={<FileTextOutlined />}
                        >
                          Daily Updates
                        </Button>
                      </Badge>
                    )}
                  </div>
                  <Tag
                    color={
                      m.status === "approved"
                        ? "green"
                        : m.status === "submitted"
                          ? "orange"
                          : m.status === "in_progress"
                            ? "blue"
                            : "default"
                    }
                  >
                    {m.status?.toUpperCase()}
                  </Tag>
                </div>
                {m.description && (
                  <div className="mb-2 text-gray-600">{m.description}</div>
                )}
                <div className="mb-2">
                  <span className="font-medium">Due:</span>{" "}
                  {moment(m.due_date).format("YYYY-MM-DD")} |
                  <span className="font-medium ml-2">Amount:</span> $
                  {Number(m.amount).toLocaleString()}
                </div>
                {m.notes && (
                  <div className="mb-2">
                    <span className="font-medium">Notes:</span> {m.notes}
                  </div>
                )}
                
                {/* Progress Section */}
                <div className="mt-3">
                  <div className="flex justify-between items-center mb-2">
                    <span>Progress:</span>
                    {user.role === 'Freelancer' && (
                      <Space>
                        <Button
                          size="small"
                          onClick={() =>
                            updateMilestoneProgress(
                              m._id,
                              Math.min(100, m.progress + 25)
                            )
                          }
                        >
                          +25%
                        </Button>
                        <Button
                          size="small"
                          onClick={() => updateMilestoneProgress(m._id, 100)}
                        >
                          Complete
                        </Button>
                      </Space>
                    )}
                  </div>
                  <Progress percent={m.progress} />
                </div>
              </div>
              
              {/* Action Buttons */}
              <div className="ml-4 flex flex-col gap-2">
                {['SuperAdmin', 'Admin'].includes(user.role) && (
                  <Button
                    type="primary"
                    icon={<CheckCircleOutlined />}
                    onClick={() => approveMilestone(m._id)}
                    disabled={m.status !== 'release_requested'}
                  >
                    Approve & Generate Invoice
                  </Button>
                )}
                {m.status === 'approved' && (
                  <Tag color="green">Invoice Generated</Tag>
                )}
              </div>
            </div>
          </Card>
        )}
        locale={{ emptyText: "No milestones found" }}
      />
    </Card>
  );
};

export default MilestoneManagement;