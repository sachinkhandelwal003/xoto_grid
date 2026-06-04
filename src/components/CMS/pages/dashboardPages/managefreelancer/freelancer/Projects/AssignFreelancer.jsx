// src/pages/freelancer/components/AssignFreelancer.jsx
import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import {
  Card,
  List,
  Button,
  Tag,
  Space,
  message,
  Input,
} from "antd";
import { apiService } from "../../../../../../../manageApi/utils/custom.apiservice";
import { showSuccessAlert, showErrorAlert } from "../../../../../../../manageApi/utils/sweetAlert";

const { Search } = Input;

const AssignFreelancer = ({ project, onSuccess, onCancel }) => {
  const { token } = useSelector((s) => s.auth);
  const [freelancers, setFreelancers] = useState([]);
  const [filteredFreelancers, setFilteredFreelancers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [assigning, setAssigning] = useState(false);

  useEffect(() => {
    fetchFreelancers();
  }, []);

  const fetchFreelancers = async () => {
    setLoading(true);
    try {
      const res = await apiService.get("/freelancer", { limit: 100 });
      setFreelancers(res.freelancers || []);
      setFilteredFreelancers(res.freelancers || []);
    } catch (err) {
      message.error("Failed to load freelancers");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (value) => {
    if (!value) {
      setFilteredFreelancers(freelancers);
      return;
    }
    
    const filtered = freelancers.filter(f => 
      f.name?.first_name?.toLowerCase().includes(value.toLowerCase()) ||
      f.name?.last_name?.toLowerCase().includes(value.toLowerCase()) ||
      f.email?.toLowerCase().includes(value.toLowerCase()) ||
      f.skills?.some(skill => skill.toLowerCase().includes(value.toLowerCase()))
    );
    setFilteredFreelancers(filtered);
  };

  const assignFreelancer = async (freelancerId) => {
    setAssigning(true);
    try {
      await apiService.post(
        `/freelancer/projects/${project._id}/assign`,
        { freelancerId }
      );
      showSuccessAlert("Assigned", "Freelancer assigned successfully");
      onSuccess();
    } catch (err) {
      showErrorAlert(
        "Error",
        err?.response?.data?.message || "Assignment failed"
      );
    } finally {
      setAssigning(false);
    }
  };

  return (
    <Card
      title={`Assign Freelancer to ${project?.title}`}
      extra={<Button onClick={onCancel}>Back</Button>}
    >
      <Search
        placeholder="Search freelancers by name, email, or skills..."
        onSearch={handleSearch}
        style={{ marginBottom: 16 }}
        enterButton
      />

      <List
        loading={loading}
        dataSource={filteredFreelancers}
        renderItem={(f) => (
          <List.Item
            actions={[
              <Button
                type="primary"
                size="small"
                onClick={() => assignFreelancer(f._id)}
                loading={assigning}
              >
                Assign
              </Button>,
            ]}
          >
            <List.Item.Meta
              title={`${f.name?.first_name} ${f.name?.last_name}`}
              description={
                <Space direction="vertical" size={0}>
                  <div>{f.email}</div>
                  {f.skills && f.skills.length > 0 && (
                    <div>
                      <Tag color="blue">
                        {f.skills?.join(", ") || "No skills listed"}
                      </Tag>
                    </div>
                  )}
                </Space>
              }
            />
          </List.Item>
        )}
        locale={{ emptyText: "No freelancers found" }}
      />
    </Card>
  );
};

export default AssignFreelancer;