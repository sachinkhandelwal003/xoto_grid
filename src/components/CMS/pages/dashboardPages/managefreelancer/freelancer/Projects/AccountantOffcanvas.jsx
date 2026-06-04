// src/pages/freelancer/AccountantOffcanvas.jsx
import React, { useState } from "react";
import { Drawer, Descriptions, Tag, Button, Progress, List, Card, Space, message } from "antd";
import { CheckCircleOutlined, CloseCircleOutlined } from "@ant-design/icons";
import { apiService } from "../../../../../../../manageApi/utils/custom.apiservice";
import { showSuccessAlert } from "../../../../../../../manageApi/utils/sweetAlert";
import moment from "moment";

const AccountantOffcanvas = ({ project, onUpdate }) => {
  const [open, setOpen] = useState(false);

  const approveDailyUpdate = async (milestoneId, dailyId) => {
    try {
      await apiService.patch(
        `/freelancer/projects/${project._id}/milestones/${milestoneId}/daily/${dailyId}/approve`
      );
      showSuccessAlert("Approved", "Daily update approved");
      onUpdate();
    } catch (err) {
      message.error("Approval failed");
    }
  };

  const approveMilestone = async (milestoneId) => {
    try {
      await apiService.patch(`/freelancer/projects/${project._id}/milestones/${milestoneId}/approve`);
      showSuccessAlert("Invoice Generated", "Milestone approved");
      onUpdate();
    } catch (err) {
      message.error("Failed to approve milestone");
    }
  };

  return (
    <>
      <Button size="small" onClick={() => setOpen(true)}>Accountant</Button>
      <Drawer title="Accountant View" open={open} onClose={() => setOpen(false)} width={700}>
        <Descriptions title="Project Summary" bordered>
          <Descriptions.Item label="Title">{project.title}</Descriptions.Item>
          <Descriptions.Item label="Budget">${project.budget?.toLocaleString()}</Descriptions.Item>
          <Descriptions.Item label="Status">
            <Tag color={project.status === "completed" ? "green" : "orange"}>
              {project.status?.toUpperCase()}
            </Tag>
          </Descriptions.Item>
        </Descriptions>

        <h3 className="mt-4">Milestones</h3>
        <List
          dataSource={project.milestones || []}
          renderItem={m => (
            <Card size="small" className="mb-2">
              <Space direction="vertical" style={{ width: "100%" }}>
                <div><strong>{m.title}</strong> - ${m.amount?.toLocaleString()}</div>
                <Progress percent={m.progress} size="small" />
                <div>
                  Due: {moment(m.due_date).format("YYYY-MM-DD")} | Status: <Tag>{m.status}</Tag>
                </div>
                {m.status === "release_requested" && (
                  <Button
                    type="primary"
                    icon={<CheckCircleOutlined />}
                    size="small"
                    onClick={() => approveMilestone(m._id)}
                  >
                    Approve & Generate Invoice
                  </Button>
                )}
                {m.daily_updates?.map(du => du.approval_status === "pending" && (
                  <div key={du._id} className="mt-2 p-2 bg-gray-50 rounded">
                    <small>{moment(du.date).format("YYYY-MM-DD")}: {du.work_done}</small>
                    <Button
                      size="small"
                      type="link"
                      icon={<CheckCircleOutlined />}
                      onClick={() => approveDailyUpdate(m._id, du._id)}
                    >
                      Approve
                    </Button>
                  </div>
                ))}
              </Space>
            </Card>
          )}
        />
      </Drawer>
    </>
  );
};

export default AccountantOffcanvas;