import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Briefcase,
  Calendar,
  DollarSign,
  FileText,
  Download,
  ChevronDown,
  ChevronUp,
  CheckCircle,
  Clock,
  AlertCircle,
  Plus,
  Edit,
  Eye,
} from "lucide-react";
import {
  Tabs,
  Table,
  Tag,
  Button,
  Collapse,
  Card,
  Space,
  Progress,
  Empty,
  Spin,
  Modal,
  Form,
  Input,
  InputNumber,
  DatePicker,
  Select,
  message,
  Popconfirm,
} from "antd";
import jsPDF from "jspdf";
import "jspdf-autotable";
import dayjs from "dayjs";

const { TabPane } = Tabs;
const { Panel } = Collapse;
const { TextArea } = Input;
const { Option } = Select;

const DUMMY_PROJECTS = [
  {
    _id: "690c59818289e277bfbd7c76",
    title: "Beach Resort Landscape",
    budget: 1200000,
    category: { _id: "6909a3b797c3a7739b4e3e86", name: "Hardscape" },
    subcategory: { _id: "6909b9146b8aa6018b482101", name: "Paving (interlock, tiles, stone)" },
    customer: null,
    milestones: [
      {
        title: "Site Survey & Design",
        description: "Topography, soil, irrigation plan",
        start_date: "2025-12-01T00:00:00.000Z",
        end_date: "2025-12-20T00:00:00.000Z",
        due_date: "2025-12-20T00:00:00.000Z",
        amount: 180000,
        status: "pending",
        progress: 0,
        photos: [],
        is_deleted: false,
        _id: "690c59818289e277bfbd7c77",
        daily_updates: [],
        createdAt: "2025-11-06T08:17:05.188Z",
        updatedAt: "2025-11-06T08:17:05.188Z",
      },
      {
        title: "Planting & Softscape",
        description: "Trees, shrubs, lawn",
        start_date: "2025-12-21T00:00:00.000Z",
        end_date: "2026-02-10T00:00:00.000Z",
        due_date: "2026-02-10T00:00:00.000Z",
        amount: 450000,
        status: "pending",
        progress: 0,
        photos: [],
        is_deleted: false,
        _id: "690c59818289e277bfbd7c78",
        daily_updates: [],
        createdAt: "2025-11-06T08:17:05.188Z",
        updatedAt: "2025-11-06T08:17:05.188Z",
      },
    ],
    status: "in_progress",
    createdAt: "2025-11-06T08:17:05.188Z",
    milestones_count: 2,
    completed_milestones: 0,
    progress_percentage: 0,
  },
  {
    _id: "690c59808289e277bfbd7c64",
    title: "Beach Resort Landscape",
    budget: 1200000,
    category: { _id: "6909a3b797c3a7739b4e3e86", name: "Hardscape" },
    subcategory: { _id: "6909b9146b8aa6018b482101", name: "Paving (interlock, tiles, stone)" },
    customer: null,
    milestones: [
      {
        title: "Site Survey & Design",
        description: "Topography, soil, irrigation plan",
        start_date: "2025-12-01T00:00:00.000Z",
        end_date: "2025-12-20T00:00:00.000Z",
        due_date: "2025-12-20T00:00:00.000Z",
        amount: 180000,
        status: "pending",
        progress: 0,
        photos: [],
        is_deleted: false,
        _id: "690c59808289e277bfbd7c65",
        daily_updates: [],
        createdAt: "2025-11-06T08:17:04.031Z",
        updatedAt: "2025-11-06T08:17:04.031Z",
      },
      {
        title: "Planting & Softscape",
        description: "Trees, shrubs, lawn",
        start_date: "2025-12-21T00:00:00.000Z",
        end_date: "2026-02-10T00:00:00.000Z",
        due_date: "2026-02-10T00:00:00.000Z",
        amount: 450000,
        status: "pending",
        progress: 0,
        photos: [],
        is_deleted: false,
        _id: "690c59808289e277bfbd7c66",
        daily_updates: [],
        createdAt: "2025-11-06T08:17:04.031Z",
        updatedAt: "2025-11-06T08:17:04.031Z",
      },
    ],
    status: "in_progress",
    createdAt: "2025-11-06T08:17:04.031Z",
    milestones_count: 2,
    completed_milestones: 0,
    progress_percentage: 0,
  },
  {
    _id: "690c233b72c624347c13b577",
    title: "Beach Resort Landscape",
    budget: 1200000,
    category: { _id: "6909a3b797c3a7739b4e3e86", name: "Hardscape" },
    subcategory: { _id: "6909b9146b8aa6018b482101", name: "Paving (interlock, tiles, stone)" },
    customer: null,
    milestones: [
      {
        title: "Site Survey & Design",
        description: "Topography, soil, irrigation plan",
        start_date: "2025-12-01T00:00:00.000Z",
        end_date: "2025-12-20T00:00:00.000Z",
        due_date: "2025-12-20T00:00:00.000Z",
        amount: 180000,
        status: "release_requested",
        progress: 100,
        photos: [],
        is_deleted: false,
        _id: "690c233b72c624347c13b578",
        daily_updates: [
          {
            date: "2025-12-10T18:29:59.999Z",
            work_done: "Installed 50m² of paving blocks, leveled ground",
            updated_by: "690b766c9dad93bc9ae31c11",
            approval_status: "approved",
            approved_progress: 100,
            _id: "690c2831f2910b1fafa60533",
            createdAt: "2025-11-06T04:46:41.843Z",
            updatedAt: "2025-11-06T04:49:26.771Z",
            approved_at: "2025-11-06T04:49:26.760Z",
          },
          {
            date: "2025-12-11T18:29:59.999Z",
            work_done: "Installed 50m² of paving blocks, leveled ground",
            updated_by: "690b766c9dad93bc9ae31c11",
            approval_status: "pending",
            approved_progress: 0,
            _id: "690c2fb4f8d3db7f2675cd7d",
            createdAt: "2025-11-06T05:18:44.287Z",
            updatedAt: "2025-11-06T05:18:44.287Z",
          },
        ],
        createdAt: "2025-11-06T04:25:31.451Z",
        updatedAt: "2025-11-06T05:44:50.875Z",
      },
      {
        title: "Planting & Softscape",
        description: "Trees, shrubs, lawn",
        start_date: "2025-12-21T00:00:00.000Z",
        end_date: "2026-02-10T00:00:00.000Z",
        due_date: "2026-02-10T00:00:00.000Z",
        amount: 450000,
        status: "in_progress",
        progress: 0,
        photos: [],
        is_deleted: false,
        _id: "690c233b72c624347c13b579",
        daily_updates: [
          {
            date: "2025-12-21T00:00:00.000Z",
            work_done: "Installed 50m² of paving blocks, leveled ground",
            updated_by: "690b766c9dad93bc9ae31c11",
            approval_status: "pending",
            approved_progress: 0,
            _id: "690c434f9edac18c70a969ac",
            createdAt: "2025-11-06T06:42:23.155Z",
            updatedAt: "2025-11-06T06:42:23.155Z",
          },
          {
            date: "2025-12-22T00:00:00.000Z",
            work_done: "sdfsdgsdfsdf",
            updated_by: "690b766c9dad93bc9ae31c11",
            approval_status: "pending",
            approved_progress: 0,
            _id: "690c49039edac18c70a96c00",
            createdAt: "2025-11-06T07:06:43.294Z",
            updatedAt: "2025-11-06T07:06:43.294Z",
          },
        ],
        createdAt: "2025-11-06T04:25:31.452Z",
        updatedAt: "2025-11-06T07:06:43.294Z",
      },
      {
        title: "Irrigation System Installation",
        description: "Install drip lines, valves, controllers",
        start_date: "2025-12-21T00:00:00.000Z",
        end_date: "2026-01-10T00:00:00.000Z",
        due_date: "2026-01-10T00:00:00.000Z",
        amount: 180000,
        status: "in_progress",
        progress: 0,
        photos: [],
        is_deleted: false,
        _id: "690c29fc09e8fa6db536396d",
        daily_updates: [
          {
            date: "2025-12-23T00:00:00.000Z",
            work_done: "sdfgsdgsdg",
            updated_by: "690b766c9dad93bc9ae31c11",
            approval_status: "pending",
            approved_progress: 0,
            _id: "690c497a60f9016d4d29e0d6",
            createdAt: "2025-11-06T07:08:42.158Z",
            updatedAt: "2025-11-06T07:08:42.158Z",
          },
        ],
        createdAt: "2025-11-06T04:54:20.092Z",
        updatedAt: "2025-11-06T07:08:42.158Z",
      },
    ],
    status: "completed",
    createdAt: "2025-11-06T04:25:31.452Z",
    milestones_count: 3,
    completed_milestones: 0,
    progress_percentage: 0,
  },
];

/* ---------- DUMMY INVOICES (one per project) ---------- */
const DUMMY_INVOICES = {
  "690c59818289e277bfbd7c76": [
    {
      _id: "inv-001",
      invoiceNumber: "INV-7C76-1234",
      date: "2025-11-01",
      dueDate: "2025-11-16",
      total: 180000,
      status: "pending",
      items: [
        { description: "Site Survey & Design (Milestone 1)", qty: 1, rate: 180000 },
      ],
      notes: "Payment due in 15 days.",
    },
  ],
  "690c59808289e277bfbd7c64": [
    {
      _id: "inv-002",
      invoiceNumber: "INV-7C64-5678",
      date: "2025-11-02",
      dueDate: "2025-11-17",
      total: 450000,
      status: "paid",
      items: [
        { description: "Planting & Softscape (Milestone 2)", qty: 1, rate: 450000 },
      ],
      notes: "",
    },
  ],
  "690c233b72c624347c13b577": [
    {
      _id: "inv-003",
      invoiceNumber: "INV-B577-9012",
      date: "2025-11-03",
      dueDate: "2025-11-18",
      total: 360000,
      status: "overdue",
      items: [
        { description: "Site Survey & Design (Milestone 1)", qty: 1, rate: 180000 },
        { description: "Irrigation System (partial)", qty: 1, rate: 180000 },
      ],
      notes: "Overdue – please settle ASAP.",
    },
  ],
};

const ManageProjects = () => {
  const [projects] = useState(DUMMY_PROJECTS);
  const [invoices] = useState(DUMMY_INVOICES);
  const [expandedProject, setExpandedProject] = useState(null);
  const [invoiceModalVisible, setInvoiceModalVisible] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [invoiceForm] = Form.useForm();
  const [invoiceLoading, setInvoiceLoading] = useState(false);

  /* ------------------------------------------------------------------ */
  /*  All functions below are EXACTLY the same as in your original file   */
  /* ------------------------------------------------------------------ */

  const createInvoice = async (values) => {
    setInvoiceLoading(true);
    try {
      const invoiceData = {
        projectId: selectedProject._id,
        invoiceNumber: values.invoiceNumber,
        date: values.date.format("YYYY-MM-DD"),
        dueDate: values.dueDate.format("YYYY-MM-DD"),
        items: values.items,
        total: values.items.reduce((s, i) => s + i.rate * i.qty, 0),
        status: "pending",
        notes: values.notes,
      };
      // ---->  No real API call – just fake success
      message.success("Invoice created (demo)");
      setInvoiceModalVisible(false);
      invoiceForm.resetFields();
    } catch (err) {
      message.error("Failed (demo)");
    } finally {
      setInvoiceLoading(false);
    }
  };

  const updateInvoiceStatus = async (invoiceId, status) => {
    message.success(`Invoice ${invoiceId} marked as ${status} (demo)`);
  };

  const downloadInvoicePDF = (project, invoice) => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();

    doc.setFontSize(20);
    doc.setTextColor(40, 116, 166);
    doc.text("INVOICE", pageWidth / 2, 20, { align: "center" });

    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Invoice #: ${invoice.invoiceNumber}`, 20, 35);
    doc.text(`Date: ${new Date(invoice.date).toLocaleDateString()}`, 20, 42);
    doc.text(`Due: ${new Date(invoice.dueDate).toLocaleDateString()}`, 20, 49);

    doc.setFontSize(12);
    doc.setTextColor(0);
    doc.text("Bill To:", 20, 60);
    doc.setFontSize(10);
    doc.text(`Client: ${project.customer?.name || "Beach Resort Ltd."}`, 20, 68);
    doc.text(`Project: ${project.title}`, 20, 75);
    doc.text(`Category: ${project.category.name}`, 20, 82);

    const tableData = invoice.items.map((it, i) => [
      i + 1,
      it.description,
      it.qty,
      `₹${it.rate.toLocaleString()}`,
      `₹${(it.qty * it.rate).toLocaleString()}`,
    ]);

    doc.autoTable({
      head: [["#", "Description", "Qty", "Rate", "Amount"]],
      body: tableData,
      startY: 95,
      theme: "grid",
      styles: { fontSize: 10 },
      headStyles: { fillColor: [40, 116, 166] },
    });

    const finalY = doc.lastAutoTable.finalY + 10;
    doc.setFontSize(12);
    doc.text(`Total: ₹${invoice.total.toLocaleString()}`, pageWidth - 60, finalY);

    doc.text(`Status: ${invoice.status.toUpperCase()}`, 20, finalY + 20);
    if (invoice.notes) doc.text(`Notes: ${invoice.notes}`, 20, finalY + 30);

    doc.save(`invoice-${invoice.invoiceNumber}.pdf`);
  };

  const InvoiceItems = () => (
    <Form.List name="items">
      {(fields, { add, remove }) => (
        <div>
          {fields.map(({ key, name, ...rest }) => (
            <Space key={key} style={{ display: "flex", marginBottom: 8 }} align="baseline">
              <Form.Item {...rest} name={[name, "description"]} rules={[{ required: true, message: "Required" }]}>
                <Input placeholder="Item description" />
              </Form.Item>
              <Form.Item {...rest} name={[name, "qty"]} rules={[{ required: true, message: "Required" }]}>
                <InputNumber min={1} placeholder="Qty" />
              </Form.Item>
              <Form.Item {...rest} name={[name, "rate"]} rules={[{ required: true, message: "Required" }]}>
                <InputNumber min={0} placeholder="Rate" />
              </Form.Item>
              <Button type="link" danger onClick={() => remove(name)}>
                Remove
              </Button>
            </Space>
          ))}
          <Button type="dashed" onClick={() => add()} block icon={<Plus />}>
            Add Item
          </Button>
        </div>
      )}
    </Form.List>
  );

  const getStatusColor = (status) => {
    switch (status) {
      case "completed":
        return "green";
      case "in_progress":
        return "blue";
      case "pending":
        return "orange";
      default:
        return "gray";
    }
  };

  const getInvoiceStatusColor = (status) => {
    switch (status) {
      case "paid":
        return "green";
      case "pending":
        return "orange";
      case "overdue":
        return "red";
      case "cancelled":
        return "gray";
      default:
        return "blue";
    }
  };

  const openCreateInvoice = (project) => {
    setSelectedProject(project);
    setInvoiceModalVisible(true);
    const invNo = `INV-${project._id.slice(-6).toUpperCase()}-${Date.now().toString().slice(-4)}`;
    invoiceForm.setFieldsValue({
      invoiceNumber: invNo,
      date: dayjs(),
      dueDate: dayjs().add(15, "day"),
      items: [{ description: "", qty: 1, rate: 0 }],
    });
  };

  /* ------------------------------------------------------------------ */

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">My Projects</h1>
        <p className="text-gray-500">Track milestones, invoices, and progress</p>
      </motion.div>

      <div className="space-y-6">
        {projects.map((project, idx) => (
          <motion.div
            key={project._id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
          >
            <Card>
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-semibold text-gray-800">{project.title}</h3>
                  <Space size="middle" className="mt-2">
                    <Tag color={getStatusColor(project.status)}>
                      {project.status.replace("_", " ").toUpperCase()}
                    </Tag>
                    <span className="text-sm text-gray-600">
                      <DollarSign className="w-4 h-4 inline" /> ₹{project.budget.toLocaleString()}
                    </span>
                    <span className="text-sm text-gray-600">
                      <Briefcase className="w-4 h-4 inline" /> {project.category.name}
                    </span>
                    <span className="text-sm text-gray-600">Progress: {project.progress_percentage}%</span>
                  </Space>
                </div>
                <Button
                  type="text"
                  icon={expandedProject === project._id ? <ChevronUp /> : <ChevronDown />}
                  onClick={() => setExpandedProject(expandedProject === project._id ? null : project._id)}
                />
              </div>

              {expandedProject === project._id && (
                <Tabs defaultActiveKey="milestones" className="mt-4">
                  {/* ---------- MILESTONES TAB ---------- */}
                  <TabPane tab="Milestones" key="milestones">
                    <Collapse accordion>
                      {project.milestones.map((m) => (
                        <Panel
                          header={
                            <div className="flex justify-between">
                              <span>{m.title}</span>
                              <Space>
                                <Tag
                                  color={m.status === "release_requested" ? "gold" : getStatusColor(m.status)}
                                >
                                  {m.status.replace("_", " ")}
                                </Tag>
                                <span>₹{m.amount.toLocaleString()}</span>
                              </Space>
                            </div>
                          }
                          key={m._id}
                        >
                          <div className="space-y-3">
                            <p className="text-sm text-gray-600">{m.description}</p>
                            <div className="flex gap-4 text-xs text-gray-500">
                              <span>
                                <Calendar className="w-3 h-3 inline" />{" "}
                                {new Date(m.start_date).toLocaleDateString()} -{" "}
                                {new Date(m.end_date).toLocaleDateString()}
                              </span>
                            </div>
                            <Progress percent={m.progress} size="small" />
                            {m.daily_updates.length > 0 && (
                              <div className="mt-3">
                                <p className="font-medium text-sm mb-1">Daily Updates:</p>
                                {m.daily_updates.map((u) => (
                                  <div key={u._id} className="text-xs bg-gray-50 p-2 rounded mb-1">
                                    <strong>{new Date(u.date).toLocaleDateString()}:</strong> {u.work_done}
                                    {u.approval_status && (
                                      <Tag
                                        color={u.approval_status === "approved" ? "green" : "orange"}
                                        className="ml-2"
                                      >
                                        {u.approval_status}
                                      </Tag>
                                    )}
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </Panel>
                      ))}
                    </Collapse>
                  </TabPane>

                  {/* ---------- INVOICES TAB ---------- */}
                  <TabPane tab="Invoices" key="invoices">
                    <div className="mb-4">
                      <Button type="primary" icon={<Plus />} onClick={() => openCreateInvoice(project)}>
                        Create Invoice
                      </Button>
                    </div>

                    <Table
                      dataSource={invoices[project._id] || []}
                      pagination={false}
                      rowKey="_id"
                      size="small"
                    >
                      <Table.Column title="Invoice #" dataIndex="invoiceNumber" />
                      <Table.Column
                        title="Date"
                        render={(_, r) => new Date(r.date).toLocaleDateString()}
                      />
                      <Table.Column
                        title="Due Date"
                        render={(_, r) => new Date(r.dueDate).toLocaleDateString()}
                      />
                      <Table.Column
                        title="Amount"
                        render={(_, r) => `₹${r.total.toLocaleString()}`}
                      />
                      <Table.Column
                        title="Status"
                        render={(_, r) => (
                          <Tag color={getInvoiceStatusColor(r.status)}>{r.status.toUpperCase()}</Tag>
                        )}
                      />
                      <Table.Column
                        title="Actions"
                        render={(_, invoice) => (
                          <Space>
                            <Button
                              size="small"
                              icon={<Download className="w-4 h-4" />}
                              onClick={() => downloadInvoicePDF(project, invoice)}
                            >
                              PDF
                            </Button>
                            {invoice.status === "pending" && (
                              <Popconfirm
                                title="Mark as paid?"
                                onConfirm={() => updateInvoiceStatus(invoice._id, "paid")}
                              >
                                <Button size="small" type="primary">
                                  Mark Paid
                                </Button>
                              </Popconfirm>
                            )}
                          </Space>
                        )}
                      />
                    </Table>

                    {(!invoices[project._id] || invoices[project._id].length === 0) && (
                      <Empty description="No invoices created yet" />
                    )}
                  </TabPane>
                </Tabs>
              )}
            </Card>
          </motion.div>
        ))}
      </div>

      {/* ---------- CREATE INVOICE MODAL ---------- */}
      <Modal
        title="Create New Invoice"
        open={invoiceModalVisible}
        onCancel={() => {
          setInvoiceModalVisible(false);
          invoiceForm.resetFields();
        }}
        footer={null}
        width={700}
      >
        <Form form={invoiceForm} layout="vertical" onFinish={createInvoice}>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <Form.Item label="Invoice Number" name="invoiceNumber" rules={[{ required: true }]}>
              <Input />
            </Form.Item>
            <Form.Item label="Project">
              <Input value={selectedProject?.title} disabled />
            </Form.Item>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <Form.Item label="Invoice Date" name="date" rules={[{ required: true }]}>
              <DatePicker className="w-full" />
            </Form.Item>
            <Form.Item label="Due Date" name="dueDate" rules={[{ required: true }]}>
              <DatePicker className="w-full" />
            </Form.Item>
          </div>

          <Form.Item label="Items">
            <InvoiceItems />
          </Form.Item>

          <Form.Item label="Notes" name="notes">
            <TextArea rows={3} />
          </Form.Item>

          <div className="flex justify-end space-x-2">
            <Button onClick={() => setInvoiceModalVisible(false)}>Cancel</Button>
            <Button type="primary" htmlType="submit" loading={invoiceLoading}>
              Create Invoice
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
};

export default ManageProjects;