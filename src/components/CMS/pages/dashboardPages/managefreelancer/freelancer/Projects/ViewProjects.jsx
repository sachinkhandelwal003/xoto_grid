import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import {
    ArrowLeftOutlined,
    BankOutlined,
    CheckCircleOutlined,
    PlusCircleOutlined,
    FileTextOutlined,
    UploadOutlined,
    EditOutlined,
    CalendarOutlined,
    DollarCircleOutlined,
    ClockCircleOutlined,
    ProjectOutlined,
    PercentageOutlined,
    UserOutlined,
    BuildOutlined,
    AreaChartOutlined,
    FileDoneOutlined,
    EnvironmentOutlined,
    MailOutlined,
    IdcardOutlined,DeleteOutlined 
} from "@ant-design/icons";
import {
    Button,
    Card,
    Tag,
    Spin,
    Typography,
    Row,
    Col,
    Statistic,
    List,
    Avatar,
    Badge,
    Modal,
    Form,
    Alert,
    Input,
    InputNumber,
    DatePicker,
    Upload,
    Image,
    Progress,
    message,
    Space,
    Divider,
    Tooltip,
    Descriptions,
    Popconfirm 
} from "antd";
import moment from "moment";
import { apiService } from "../../../../../../../manageApi/utils/custom.apiservice";
import { showSuccessAlert, showErrorAlert } from "../../../../../../../manageApi/utils/sweetAlert";
import { showToast } from "../../../../../../../manageApi/utils/toast";

const { Title, Text } = Typography;
const { TextArea } = Input;
const { RangePicker } = DatePicker;

// Theme Colors
const COLORS = {
    primary: "#722ed1",
    success: "#52c41a",
    warning: "#faad14",
    error: "#ff4d4f",
    bgLight: "#f9f0ff",
    cardBg: "#ffffff"
};

const ViewProjects = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useSelector((s) => s.auth);

    const isAdmin = ["SuperAdmin", "Admin", "Supervisor"].includes(user?.role?.name);
    const isFreelancer = user?.role?.name === "Freelancer";

    // --- STATES ---
    const [project, setProject] = useState(null);
    const [loading, setLoading] = useState(true);

    // Modals
    const [moveModalOpen, setMoveModalOpen] = useState(false);
    const [milestoneModalOpen, setMilestoneModalOpen] = useState(false);
    const [dailyModalOpen, setDailyModalOpen] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [editingMilestoneId, setEditingMilestoneId] = useState(null);

    // Data Lists
    const [accountants, setAccountants] = useState([]);
    const [dailyUpdates, setDailyUpdates] = useState([]);

    // Selection
    const [selectedMilestone, setSelectedMilestone] = useState(null);

    // Loaders
    const [actionLoading, setActionLoading] = useState(false);
    const [loadingUpdates, setLoadingUpdates] = useState(false);

    // Forms
    const [milestoneForm] = Form.useForm();
    const [dailyForm] = Form.useForm();

    // --- FETCH PROJECT DATA ---
    const fetchProjectDetails = async () => {
        setLoading(true);
        try {
            const response = await apiService.get(`/freelancer/projects?id=${id}`);
            if (response.success) {
                setProject(response.project);
            }
        } catch (error) {
            console.error(error);
            showToast("Failed to load project details", "error");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (id) fetchProjectDetails();
    }, [id]);

    // --- HELPERS ---
    const calculateDaysRemaining = (end) => {
        const diff = moment(end).diff(moment(), 'days');
        return diff > 0 ? diff : 0;
    };
const calculateWeightedProgress = () => {
  if (!project?.milestones?.length) return 0;

  const activeMilestones = project.milestones.filter(
    (m) => !m.is_deleted
  );

  const totalWeightage = activeMilestones.reduce(
    (sum, m) => sum + (m.milestone_weightage || 0),
    0
  );

  const approvedWeightage = activeMilestones
    .filter((m) => m.status === "approved")
    .reduce((sum, m) => sum + (m.milestone_weightage || 0), 0);

  return totalWeightage > 0
    ? Math.round((approvedWeightage / totalWeightage) * 100)
    : 0;
};


    const fetchAccountants = async () => {
        const res = await apiService.get("/users?role=accountant");
        setAccountants(res.data || []);
    };

    const openMoveModal = () => {
        fetchAccountants();
        setMoveModalOpen(true);
    };

    // --- API ACTIONS ---
    const handleMoveToAccountant = async (accountantId) => {
        setActionLoading(true);
        try {
            await apiService.post(`/freelancer/projects/${project._id}/move`, { accountantId });
            showSuccessAlert("Moved", "Project moved to accounts");
            setMoveModalOpen(false);
            fetchProjectDetails();
        } catch (err) {
            showErrorAlert("Error", "Failed to move project");
        } finally {
            setActionLoading(false);
        }
    };

    // --- MILESTONE CREATION & EDITING ---
    const openMilestoneModal = (milestone = null) => {
        if (milestone) {
            // Edit mode
            setIsEditMode(true);
            setEditingMilestoneId(milestone._id);
            
            // Pre-fill form with existing data
            milestoneForm.setFieldsValue({
                title: milestone.title,
                description: milestone.description,
                amount: milestone.amount,
                milestone_weightage: milestone.milestone_weightage,
                date_range: [moment(milestone.start_date), moment(milestone.end_date)],
                photos: milestone.photos?.map(url => ({
                    uid: url,
                    name: url.split('/').pop(),
                    status: 'done',
                    url: url
                })) || []
            });
        } else {
            // Create mode
            setIsEditMode(false);
            setEditingMilestoneId(null);
            milestoneForm.resetFields();
        }
        setMilestoneModalOpen(true);
    };

    const handleSaveMilestone = async (values) => {
        const [startMoment, endMoment] = values.date_range;

        setActionLoading(true);

        try {
            let uploadedPhotos = [];

            // ✅ Upload new images
            if (values.photos && values.photos.length > 0) {
                for (const file of values.photos) {
                    if (file.originFileObj) {
                        const formData = new FormData();
                        formData.append("file", file.originFileObj);

                        const uploadRes = await apiService.post("/upload", formData);

                        if (uploadRes?.success && uploadRes?.file?.url) {
                            uploadedPhotos.push(uploadRes.file.url);
                        }
                    } else if (file.url) {
                        // Keep existing photos
                        uploadedPhotos.push(file.url);
                    }
                }
            }

            const payload = {
                title: values.title,
                description: values.description || "",
                start_date: startMoment.format("YYYY-MM-DD"),
                end_date: endMoment.format("YYYY-MM-DD"),
                amount: values.amount,
                milestone_weightage: values.milestone_weightage || 20,
                photos: uploadedPhotos,
            };

            let apiUrl;
            let method;
            
            if (isEditMode && editingMilestoneId) {
                // Update existing milestone
                apiUrl = `/freelancer/projects/update-milestone?milestoneId=${editingMilestoneId}&projectId=${project._id}`;
                method = 'post';
            } else {
                // Create new milestone
                apiUrl = `/freelancer/projects/${project._id}/milestones`;
                method = 'post';
            }

            await apiService[method](apiUrl, payload);

            message.success(isEditMode ? "Milestone updated successfully" : "Milestone created successfully");
            setMilestoneModalOpen(false);
            milestoneForm.resetFields();
            setIsEditMode(false);
            setEditingMilestoneId(null);
            fetchProjectDetails();

        } catch (err) {
            console.error(err);
            message.error(err?.response?.data?.message || (isEditMode ? "Failed to update milestone" : "Failed to add milestone"));
        } finally {
            setActionLoading(false);
        }
    };

    const handleFinalApproveMilestone = async (milestoneId) => {
    try {
        await apiService.post(
            `/freelancer/projects/update-milestone?milestoneId=${milestoneId}&projectId=${project._id}`,
            { status: "approved" }
        );

        message.success("Milestone finally approved");
        fetchProjectDetails();
    } catch (err) {
        message.error("Failed to final approve milestone");
    }
};

    const handleDeleteMilestone = async (milestoneId) => {
        Modal.confirm({
            title: 'Delete Milestone',
            content: 'Are you sure you want to delete this milestone? This action cannot be undone.',
            okText: 'Yes, Delete',
            okType: 'danger',
            cancelText: 'Cancel',
            onOk: async () => {
                try {
                    await apiService.delete(`/freelancer/projects/${project._id}/milestones/${milestoneId}`);
                    message.success('Milestone deleted successfully');
                    fetchProjectDetails();
                } catch (err) {
                    message.error('Failed to delete milestone');
                }
            }
        });
    };

    const updateMilestoneProgress = async (milestoneId, progress) => {
        try {
            await apiService.put(`/freelancer/projects/${project._id}/milestones/${milestoneId}/progress`, { progress });
            message.success("Progress updated");
            fetchProjectDetails();
        } catch (err) {
            message.error("Update failed");
        }
    };

    const requestPaymentRelease = async (milestoneId) => {
        try {
            await apiService.post(`/freelancer/projects/${project._id}/milestones/${milestoneId}/request-release`);
            message.success("Release requested");
            fetchProjectDetails();
        } catch (err) {
            message.error("Request failed");
        }
    };

    const approveMilestone = async (milestoneId) => {
        try {
            await apiService.put(`/freelancer/projects/${project._id}/milestones/${milestoneId}/approve`);
            message.success("Milestone approved");
            fetchProjectDetails();
        } catch (err) {
            message.error("Approval failed");
        }
    };

    // Daily Updates Logic
    const handleOpenDailyUpdates = async (milestone) => {
        setSelectedMilestone(milestone);
        setDailyModalOpen(true);
        setLoadingUpdates(true);
        try {
            const res = await apiService.get(`/freelancer/projects/${project._id}/milestones/${milestone._id}/daily`);
            setDailyUpdates(res.daily_updates || []);
        } catch (error) {
            setDailyUpdates(milestone.daily_updates || []);
        } finally {
            setLoadingUpdates(false);
        }
    };

    const handleAddDailyUpdate = async (values) => {
        setActionLoading(true);
        try {
            const payload = {
                work_done: values.work_done,
                date: values.date ? values.date.format("YYYY-MM-DD") : moment().format("YYYY-MM-DD"),
                notes: values.notes || ""
            };
            await apiService.post(`/freelancer/projects/${project._id}/milestones/${selectedMilestone._id}/daily`, payload);
            message.success("Update submitted");
            dailyForm.resetFields();
            setDailyModalOpen(false);
            fetchProjectDetails();
        } catch (err) {
            message.error("Failed to add update");
        } finally {
            setActionLoading(false);
        }
    };

    const approveDailyUpdate = async (dailyId, approvedProgress) => {
        try {
            await apiService.put(
                `/freelancer/projects/${project._id}/milestones/${selectedMilestone._id}/daily/${dailyId}/approve`,
                { approved_progress: approvedProgress }
            );
            message.success("Update approved");
            handleOpenDailyUpdates(selectedMilestone);
            fetchProjectDetails();
        } catch (err) {
            message.error("Approval failed");
        }
    };

    const rejectDailyUpdate = async (dailyId) => {
        Modal.confirm({
            title: "Reject Daily Update",
            content: (
                <div>
                    <p>Reason for rejection:</p>
                    <Input.TextArea id="rejectionReason" rows={3} placeholder="Enter reason..." />
                </div>
            ),
            onOk: async () => {
                const reason = document.getElementById("rejectionReason")?.value;
                try {
                    await apiService.put(
                        `/freelancer/projects/${project._id}/milestones/${selectedMilestone._id}/daily/${dailyId}/reject`,
                        { reason }
                    );
                    message.success("Update rejected");
                    handleOpenDailyUpdates(selectedMilestone);
                } catch (err) {
                    message.error("Failed to reject");
                }
            },
        });
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center bg-gray-50"><Spin size="large" tip="Loading Project..." /></div>;
    if (!project) return <div className="p-10 text-center text-gray-500">Project Not Found</div>;

    return (
        <div className="min-h-screen bg-gray-50 pb-10">

            {/* --- TOP HEADER & STATS --- */}
            <div className="bg-white shadow-sm border-b border-gray-200 px-6 py-5">
                <div className="max-w-7xl mx-auto">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
                        <div className="flex items-center gap-3 mb-4 md:mb-0">
                            <Button icon={<ArrowLeftOutlined />} onClick={() => navigate(-1)} className="border-gray-300" />
                            <div>
                             
                                <Text type="secondary" className="text-xs">
                                    <ProjectOutlined className="mr-1" /> {project.Code} | {project.client_name}
                                </Text>
                            </div>
                        </div>

                            <Space>
                                <Button icon={<BankOutlined />} onClick={openMoveModal} >
                                    Move to Accountant
                                </Button>
                            </Space>
                 
                    </div>

                    {/* Quick Stats Row */}
                    <Row gutter={24} className="mt-4">
                        <Col xs={12} sm={6}>
                            <Statistic
                                title="Budget"
                                value={project.budget}
                                valueStyle={{ color: COLORS.primary, fontWeight: 600 }}
                                prefix={<DollarCircleOutlined className="mr-1" />}
                            />
                        </Col>
                        <Col xs={12} sm={6}>
  <Statistic
    title="Progress"
    value={calculateWeightedProgress()}
    suffix="%"
    valueStyle={{ color: COLORS.success, fontWeight: 600 }}
    prefix={<CheckCircleOutlined className="mr-1" />}
  />
</Col>

                        <Col xs={12} sm={6}>
                            <Statistic
                                title="Days Remaining"
                                value={calculateDaysRemaining(project.end_date)}
                                valueStyle={{ fontWeight: 600 }}
                                prefix={<ClockCircleOutlined className="mr-1" />}
                            />
                        </Col>
                        <Col xs={12} sm={6}>
                            <Statistic
                                title="Total Milestones"
                                value={project.milestones?.length || 0}
                                valueStyle={{ fontWeight: 600 }}
                                prefix={<FileTextOutlined className="mr-1" />}
                            />
                        </Col>
                    </Row>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
                <Row gutter={24}>

                    {/* --- LEFT SIDEBAR: DETAILS --- */}
                    <Col xs={24} lg={8}>
                        <Card title="Project Details" className="shadow-sm mb-6 rounded-lg" bordered={false}>
                            <Space direction="vertical" className="w-full" size="middle">

                                {/* Customer Details Section */}
                                <div>
                                    <div className="flex items-center gap-2 mb-2">
                                        <UserOutlined style={{ color: COLORS.primary }} />
                                        <Text type="secondary" className="text-xs uppercase">Customer Details</Text>
                                    </div>
                                    <div className="bg-gray-50 p-3 rounded border border-gray-100">
                                        <div className="flex items-center gap-3 mb-2">
                                            <Avatar size="small" icon={<UserOutlined />} style={{ backgroundColor: COLORS.primary }} />
                                            <div>
                                                <div className="font-medium text-gray-800">
                                                    {project.customer?.name?.first_name} {project.customer?.name?.last_name}
                                                </div>
                                                <div className="text-xs text-gray-500 flex items-center gap-1">
                                                    <MailOutlined /> {project.customer?.email}
                                                </div>
                                            </div>
                                        </div>
                                        {project.client_company && (
                                            <div className="text-xs text-gray-500 mt-2">
                                                <IdcardOutlined className="mr-1" /> Company: {project.client_company}
                                            </div>
                                        )}
                                        {project.address && (
                                            <div className="text-xs text-gray-500 mt-1">
                                                <EnvironmentOutlined className="mr-1" /> {project.address}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Estimate Reference Section */}
                                {project.estimate_reference && (
                                    <div>
                                        <div className="flex items-center gap-2 mb-2">
                                            <FileDoneOutlined style={{ color: COLORS.primary }} />
                                            <Text type="secondary" className="text-xs uppercase">Estimate Details</Text>
                                        </div>
                                        <div className="bg-gray-50 p-3 rounded border border-gray-100">
                                            <div className="mb-2">
                                                <div className="text-xs text-gray-500 mb-1">Service Type</div>
                                                <Tag color="blue" icon={<BuildOutlined />}>
                                                    {project.estimate_reference.service_type}
                                                </Tag>
                                            </div>

                                            <div className="mb-2">
                                                <div className="text-xs text-gray-500 mb-1">Work Type</div>
                                                <div className="font-medium text-gray-800">
                                                    {project.estimate_reference.type?.label}
                                                </div>
                                            </div>

                                            <div className="mb-2">
                                                <div className="text-xs text-gray-500 mb-1">Area</div>
                                                <div className="flex items-center gap-2">
                                                    <AreaChartOutlined />
                                                    <span className="font-medium text-gray-800">
                                                        {project.estimate_reference.area_sqft} sq. ft.
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <div>
                                    <Text type="secondary" className="block text-xs uppercase mb-1">Timeline</Text>
                                    <div className="bg-gray-50 p-3 rounded border border-gray-100">
                                        <div className="flex justify-between mb-1">
                                            <span className="text-gray-500">Start:</span>
                                            <span className="font-medium text-gray-800">{moment(project.start_date).format("DD MMM YYYY")}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-500">End:</span>
                                            <span className="font-medium text-gray-800">{moment(project.end_date).format("DD MMM YYYY")}</span>
                                        </div>
                                    </div>
                                </div>

                                <Divider style={{ margin: '8px 0' }} />
{project.assigned_freelancer && (
    <div className="bg-blue-50 p-3 rounded-lg border border-blue-100 flex items-center gap-3">
        <Avatar
            icon={<UserOutlined />}
            style={{ backgroundColor: COLORS.primary }}
        />
        <div>
            <div className="font-medium text-blue-900">
                {project.assigned_freelancer.name?.first_name}{" "}
                {project.assigned_freelancer.name?.last_name}
            </div>
            <div className="text-xs text-blue-600">Email:{project.assigned_freelancer.email}</div>
        </div>
    </div>
)}

                                {/* Accountant Details */}
                                {project.accountant && (
                                    <div className="bg-purple-50 p-3 rounded-lg border border-purple-100 flex items-center gap-3">
                                        <Avatar icon={<BankOutlined />} style={{ backgroundColor: COLORS.primary }} />
                                        <div>
                                            <div className="font-medium text-purple-900">{project.accountant.name?.first_name}</div>
                                            <div className="text-xs text-purple-600">Accountant</div>
                                        </div>
                                    </div>
                                )}
                            </Space>
                        </Card>
                    </Col>

                    {/* --- RIGHT CONTENT: MILESTONES --- */}
                    <Col xs={24} lg={16}>
                        <Card className="shadow-sm rounded-lg" bordered={false}>
                            <div className="p-6">
                                <div className="flex justify-between items-center mb-6">
                                    <Title level={5} style={{ margin: 0 }}>Execution Roadmap</Title>
                                    {isAdmin && (
                                        <Button 
                                            type="primary" 
                                            icon={<PlusCircleOutlined />} 
                                            onClick={() => openMilestoneModal()}
                                        >
                                            New Milestone
                                        </Button>
                                    )}
                                </div>

                                {project.milestones?.length === 0 ? (
                                    <div className="text-center py-10 bg-gray-50 rounded border border-dashed border-gray-300">
                                        <FileTextOutlined style={{ fontSize: 32, color: '#ccc' }} />
                                        <p className="text-gray-500 mt-2">No milestones created yet.</p>
                                    </div>
                                ) : (
                                    <List
                                        dataSource={project.milestones}
                                        renderItem={item => (
                                            <Card
                                                className="mb-4 border-gray-200 hover:shadow-md transition-shadow"
                                                size="small"
                                                bordered
                                                title={
                                                    <div className="flex justify-between items-center">
                                                        <span className="font-semibold text-gray-700">#{item.milestone_number} {item.title}</span>
                                                        <div className="flex items-center gap-2">
                                                            <Tag color={item.status === 'approved' ? 'success' : item.status === 'in_progress' ? 'processing' : 'warning'}>
                                                                {item.status.toUpperCase()}
                                                            </Tag>
                                                            {isAdmin && (
                                                                <Space>
                                                                    <Button
                                                                        type="text"
                                                                        size="small"
                                                                        icon={<EditOutlined />}
                                                                        onClick={() => openMilestoneModal(item)}
                                                                    />
                                                                    <Popconfirm
                                                                        title="Delete milestone"
                                                                        description="Are you sure to delete this milestone?"
                                                                        onConfirm={() => handleDeleteMilestone(item._id)}
                                                                        okText="Yes"
                                                                        cancelText="No"
                                                                        okType="danger"
                                                                    >
                                                                        <Button
                                                                            type="text"
                                                                            size="small"
                                                                            danger
                                                                            icon={<DeleteOutlined />}
                                                                        />
                                                                    </Popconfirm>
                                                                </Space>
                                                            )}
                                                        </div>
                                                    </div>
                                                }
                                            >
                                                <div className="flex flex-col gap-4">
                                                    {/* Progress & Amount */}
                                                    <div className="flex justify-between items-end text-xs text-gray-500">
                                                        <Space>
                                                            <CalendarOutlined /> {moment(item.start_date).format("MMM DD")} - {moment(item.end_date).format("MMM DD")}
                                                        </Space>
                                                        <span className="text-gray-800 font-medium text-sm">AED {Number(item.amount).toLocaleString()}</span>
                                                    </div>

                                                    <div className="flex items-center justify-between">
                                                        <div className="flex-1 mr-4">
                                                            <div className="flex justify-between text-xs mb-1">
                                                                <span>Completion</span>
                                                                <span className="font-bold">{item.progress}%</span>
                                                            </div>
                                                            <Progress percent={item.progress} strokeColor={COLORS.primary} showInfo={false} size="small" />
                                                        </div>
                                                        <div className="text-right">
                                                            <div className="text-xs text-gray-500">Weightage</div>
                                                            <Tag color="orange" icon={<PercentageOutlined />}>
                                                                {item.milestone_weightage || 0}%
                                                            </Tag>
                                                        </div>
                                                    </div>

                                                    {/* Photos if any */}
                                                    {Array.isArray(item.photos) && item.photos.length > 0 && (
                                                        <div className="pt-2">
                                                            <Text type="secondary" className="text-xs block mb-1">
                                                                Attachments:
                                                            </Text>
                                                            <Image.PreviewGroup>
                                                                <div className="flex flex-wrap gap-2">
                                                                    {item.photos.map((photo, index) => (
                                                                        <Image
                                                                            key={index}
                                                                            src={photo}
                                                                            width={40}
                                                                            height={40}
                                                                            preview
                                                                            alt={`Milestone ${item.milestone_number} - ${index + 1}`}
                                                                            className="rounded border border-gray-200 object-cover"
                                                                        />
                                                                    ))}
                                                                </div>
                                                            </Image.PreviewGroup>
                                                        </div>
                                                    )}

                                                    {/* Action Buttons */}
                                                    <div className="flex justify-between items-center pt-2 border-t border-gray-100 mt-2">
                                                        <Button 
                                                            type="text" 
                                                            size="small" 
                                                            icon={<FileTextOutlined />} 
                                                            onClick={() => handleOpenDailyUpdates(item)}
                                                        >
                                                            {item.daily_updates?.length || 0} Daily Updates
                                                        </Button>

                                                     <Space>
    

    {/* CUSTOMER APPROVED */}
    {item.customer_approval_after_completion && (
        <Tag color="cyan">Customer Approved</Tag>
    )}

    {/* FREELANCER APPROVED */}
    {item.freelancer_approv_after_completion && (
        <Tag color="blue">Freelancer Approved</Tag>
    )}

    {/* FINAL APPROVE BUTTON */}
    {isAdmin &&
        item.progress === 100 &&
        item.customer_approval_after_completion &&
        item.freelancer_approv_after_completion &&
        item.status !== "approved" && (
            <Popconfirm
                title="Final approve this milestone?"
                description="This will mark the milestone as fully approved."
                okText="Yes, Approve"
                cancelText="Cancel"
                onConfirm={() => handleFinalApproveMilestone(item._id)}
            >
                <Button
                    type="primary"
                    size="small"
                    icon={<CheckCircleOutlined />}
                >
                    Final Approve
                </Button>
            </Popconfirm>
        )}

    {/* FINAL APPROVED TAG */}
    {item.status === "approved" && (
        <Tag color="green" icon={<CheckCircleOutlined />}>
            Fully Approved
        </Tag>
    )}
</Space>

                                                    </div>
                                                </div>
                                            </Card>
                                        )}
                                    />
                                )}
                            </div>
                        </Card>
                    </Col>
                </Row>
            </div>

            {/* --- MODALS --- */}

            {/* Move Modal */}
            <Modal title="Select Accountant" open={moveModalOpen} footer={null} onCancel={() => setMoveModalOpen(false)}>
                <List
                    dataSource={accountants}
                    renderItem={a => (
                        <List.Item actions={[
                            <Button 
                                size="small" 
                                type="primary" 
                                loading={actionLoading} 
                                onClick={() => handleMoveToAccountant(a._id)}
                            >
                                Select
                            </Button>
                        ]}>
                            <List.Item.Meta
                                avatar={<Avatar icon={<BankOutlined />} />}
                                title={`${a.name?.first_name} ${a.name?.last_name}`}
                                description={a.email}
                            />
                        </List.Item>
                    )}
                />
            </Modal>

            {/* Add/Edit Milestone Modal */}
            <Modal
                title={isEditMode ? "Edit Milestone" : "Create New Milestone"}
                open={milestoneModalOpen}
                onCancel={() => {
                    setMilestoneModalOpen(false);
                    setIsEditMode(false);
                    setEditingMilestoneId(null);
                    milestoneForm.resetFields();
                }}
                footer={null}
                width={700}
            >
                <Form form={milestoneForm} onFinish={handleSaveMilestone} layout="vertical">
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                name="title"
                                label="Title"
                                rules={[{ required: true, message: 'Please enter milestone title' }]}
                            >
                                <Input placeholder="e.g. Foundation Work" />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                name="amount"
                                label="Amount"
                                rules={[{ required: true, message: "Please enter milestone amount" }]}
                            >
                                <InputNumber
                                    style={{ width: "100%" }}
                                    addonBefore="AED"
                                    min={0}
                                    placeholder="Enter amount"
                                />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                name="date_range"
                                label="Milestone Duration"
                                rules={[{ required: true, message: 'Please select date range' }]}
                            >
                                <RangePicker
                                    style={{ width: '100%' }}
                                    disabledDate={(current) => current && (current < moment(project.start_date) || current > moment(project.end_date))}
                                />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                name="milestone_weightage"
                                label="Weightage %"
                                initialValue={20}
                                rules={[{ required: true, message: 'Please enter weightage' }]}
                            >
                                <InputNumber
                                    style={{ width: '100%' }}
                                    min={1}
                                    max={100}
                                    formatter={value => `${value}%`}
                                    parser={value => value.replace('%', '')}
                                    placeholder="Weightage %"
                                />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Form.Item name="description" label="Description">
                        <TextArea
                            rows={3}
                            placeholder="Detailed description of the milestone work"
                            showCount
                            maxLength={500}
                        />
                    </Form.Item>

                    <Form.Item
                        name="photos"
                        label="Attachments"
                        valuePropName="fileList"
                        getValueFromEvent={(e) => (Array.isArray(e) ? e : e?.fileList)}
                    >
                        <Upload
                            listType="picture-card"
                            beforeUpload={() => false}
                            maxCount={5}
                            multiple
                            accept="image/*"
                            fileList={milestoneForm.getFieldValue('photos') || []}
                            onChange={({ fileList }) => milestoneForm.setFieldsValue({ photos: fileList })}
                        >
                            <div>
                                <UploadOutlined />
                                <div style={{ marginTop: 8 }}>Upload</div>
                            </div>
                        </Upload>
                    </Form.Item>

                    <Button 
                        type="primary" 
                        htmlType="submit" 
                        block 
                        loading={actionLoading} 
                        size="large"
                    >
                        {isEditMode ? "Update Milestone" : "Create Milestone"}
                    </Button>
                </Form>
            </Modal>

            {/* Daily Updates Modal */}
            <Modal
                title={
                    <span className="text-gray-700">
                        Daily Updates: <span className="font-bold">{selectedMilestone?.title}</span>
                    </span>
                }
                open={dailyModalOpen}
                onCancel={() => setDailyModalOpen(false)}
                width={800}
                footer={null}
                centered
            >
                {isFreelancer && selectedMilestone?.status !== 'approved' && (
                    <Card type="inner" size="small" className="mb-6 bg-gray-50 border-gray-200">
                        <Form form={dailyForm} onFinish={handleAddDailyUpdate} layout="vertical">
                            <Row gutter={16}>
                                <Col span={8}>
                                    <Form.Item name="date" label="Date" initialValue={moment()}>
                                        <DatePicker style={{ width: "100%" }} />
                                    </Form.Item>
                                </Col>
                                <Col span={16}>
                                    <Form.Item
                                        name="work_done"
                                        label="Work Done"
                                        rules={[{ required: true, message: 'Please describe work done' }]}
                                    >
                                        <Input placeholder="Brief summary of today's work..." />
                                    </Form.Item>
                                </Col>
                            </Row>
                            <Form.Item name="notes" label="Detailed Notes">
                                <TextArea rows={2} placeholder="Additional details, challenges, or notes..." />
                            </Form.Item>
                            <div className="flex justify-end">
                                <Button type="primary" htmlType="submit" loading={actionLoading}>
                                    Post Update
                                </Button>
                            </div>
                        </Form>
                    </Card>
                )}

                <div className="max-h-[400px] overflow-y-auto pr-2">
                    <Spin spinning={loadingUpdates}>
                        <List
                            dataSource={dailyUpdates}
                            renderItem={du => (
                                <div className="border border-gray-200 rounded-lg p-4 mb-3 hover:shadow-sm transition bg-white">
                                    <div className="flex justify-between items-start mb-2">
                                        <div>
                                            <span className="text-xs text-gray-400 block mb-1">
                                                {moment(du.date).format("dddd, DD MMM YYYY")}
                                            </span>
                                            <div className="font-medium text-gray-800">{du.work_done}</div>
                                        </div>
                                        <Tag color={du.approval_status === 'approved' ? 'success' : du.approval_status === 'rejected' ? 'error' : 'warning'}>
                                            {du.approval_status?.toUpperCase() || 'PENDING'}
                                        </Tag>
                                    </div>
                                    {du.notes && (
                                        <div className="text-sm text-gray-500 bg-gray-50 p-2 rounded mb-2">{du.notes}</div>
                                    )}
                                    {/* Photos Section */}
{Array.isArray(du.photos) && du.photos.length > 0 && (
  <div className="mt-3">
    <div className="text-xs text-gray-500 mb-1">Photos</div>

    <Image.PreviewGroup>
      <div className="flex flex-wrap gap-2">
        {du.photos.map((photo, idx) => (
          <Image
            key={idx}
            src={photo}
            width={70}
            height={70}
            className="rounded border border-gray-200 object-cover"
            alt={`Daily update photo ${idx + 1}`}
          />
        ))}
      </div>
    </Image.PreviewGroup>
  </div>
)}


                                    {/* Admin Approval UI */}
                                    {isAdmin && du.approval_status === 'pending' && (
                                        <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-100">
                                            <InputNumber
                                                size="small"
                                                min={0}
                                                max={100}
                                                defaultValue={du.approved_progress || 0}
                                                id={`prog-${du._id}`}
                                                placeholder="%"
                                                style={{ width: 70 }}
                                            />
                                            <Button
                                                type="primary"
                                                size="small"
                                                onClick={() => {
                                                    const input = document.getElementById(`prog-${du._id}`);
                                                    approveDailyUpdate(du._id, input ? input.value : 0);
                                                }}
                                            >
                                                Approve
                                            </Button>
                                            <Button danger size="small" onClick={() => rejectDailyUpdate(du._id)}>
                                                Reject
                                            </Button>
                                        </div>
                                    )}
                                    {du.approval_status === 'approved' && (
                                        <div className="text-xs text-green-600 mt-2 font-medium">
                                            Approved Progress Impact: {du.approved_progress}%
                                        </div>
                                    )}
                                </div>
                            )}
                            locale={{ emptyText: "No updates found" }}
                        />
                    </Spin>
                </div>
            </Modal>
        </div>
    );
};

export default ViewProjects;