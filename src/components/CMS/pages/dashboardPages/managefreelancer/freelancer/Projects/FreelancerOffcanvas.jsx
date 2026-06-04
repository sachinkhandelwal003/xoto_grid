// src/pages/freelancer/FreelancerOffcanvas.jsx
import React, { useState } from "react";
import { Drawer, List, Button, Tag, Space, message } from "antd";
import { UserAddOutlined } from "@ant-design/icons";
import { apiService } from "../../../../../../../manageApi/utils/custom.apiservice";
import { showSuccessAlert } from "../../../../../../../manageApi/utils/sweetAlert";

const FreelancerOffcanvas = ({ project, freelancers, onAssign }) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const assign = async (freelancerId) => {
    setLoading(true);
    try {
      await apiService.post(`/freelancer/projects/${project._id}/assign`, { freelancerId });
      showSuccessAlert("Assigned", "Freelancer assigned!");
      setOpen(false);
      onAssign();
    } catch (err) {
      message.error(err?.response?.data?.message || "Assignment failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button size="small" icon={<UserAddOutlined />} onClick={() => setOpen(true)} />
      <Drawer title={`Assign to ${project.title}`} open={open} onClose={() => setOpen(false)} width={500}>
        <List
          dataSource={freelancers}
          renderItem={f => (
            <List.Item
              actions={[
                <Button
                  type="primary"
                  size="small"
                  loading={loading}
                  onClick={() => assign(f._id)}
                >
                  Assign
                </Button>
              ]}
            >
              <List.Item.Meta
                title={`${f.name?.first_name} ${f.name?.last_name}`}
                description={
                  <Space direction="vertical" size={0}>
                    <div>{f.email}</div>
                    <Tag color="blue">{f.skills?.join(", ") || "No skills"}</Tag>
                  </Space>
                }
              />
            </List.Item>
          )}
        />
      </Drawer>
    </>
  );
};

export default FreelancerOffcanvas;