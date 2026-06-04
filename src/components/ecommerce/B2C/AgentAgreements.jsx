import { useCallback, useEffect, useState } from "react";
import {
  Button,
  Card,
  Col,
  DatePicker,
  Empty,
  Form,
  Input,
  Modal,
  Popconfirm,
  Progress,
  Row,
  Space,
  Spin,
  Tag,
  Typography,
  Upload,
  message,
} from "antd";
import {
  DeleteOutlined,
  EyeOutlined,
  FileImageOutlined,
  FilePdfOutlined,
  FileTextOutlined,
  PlusOutlined,
  UploadOutlined,
} from "@ant-design/icons";
import { apiService } from "../../../manageApi/utils/custom.apiservice";
import dayjs from "dayjs";

const { Title, Text } = Typography;
const { TextArea } = Input;

const formatDate = (date) => {
  if (!date) return "No expiry";
  return new Date(date).toLocaleDateString("en-US", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const formatSize = (bytes = 0) => {
  if (!bytes) return "";
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const isImage = (doc) => (doc.mime_type || "").startsWith("image/") || /\.(png|jpe?g|webp|gif)$/i.test(doc.url || "");
const isPdf = (doc) => (doc.mime_type || "").includes("pdf") || /\.pdf($|\?)/i.test(doc.url || "");
const statusColor = (agreement) => {
  if (agreement.is_expiring_soon) return "gold";
  if (agreement.status === "active") return "green";
  if (agreement.status === "expired") return "red";
  if (agreement.status === "superseded") return "default";
  return "blue";
};

const statusLabel = (agreement) => {
  if (agreement.is_expiring_soon) return "Expiring Soon";
  return agreement.status?.replace(/_/g, " ") || "Active";
};

const AgentAgreements = () => {
  const [loading, setLoading] = useState(true);
  const [uploadingId, setUploadingId] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadPhase, setUploadPhase] = useState("");
  const [uploadModal, setUploadModal] = useState({ open: false, agreement: null, file: null });
  const [editModal, setEditModal] = useState({ open: false, agreement: null, document: null, file: null });
  const [savingEdit, setSavingEdit] = useState(false);
  const [agreementData, setAgreementData] = useState(null);
  const [uploadForm] = Form.useForm();
  const [editForm] = Form.useForm();

  const fetchAgreements = useCallback(async () => {
    try {
      setLoading(true);
      const res = await apiService.get("agent/agreements");
      setAgreementData(res?.data || null);
    } catch (err) {
      console.error("Failed to fetch agreements", err);
      message.error("Failed to load agreements");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAgreements();
  }, [fetchAgreements]);

  const agreements = agreementData?.agreements || [];
  const summary = agreementData?.summary || {};

  const openUploadModal = useCallback((agreement = null) => {
    if (agreement && !agreement.can_manage_documents) {
      message.warning("Only agent-signed agreements can be updated here.");
      return;
    }
    uploadForm.resetFields();
    setUploadProgress(0);
    setUploadPhase("");
    setUploadModal({ open: true, agreement, file: null });
  }, [uploadForm]);

  const stageUploadFile = useCallback((file) => {
    if (file.size / 1024 / 1024 > 25) {
      message.error("Maximum file size is 25MB.");
      return Upload.LIST_IGNORE;
    }

    uploadForm.setFieldsValue({
      documentName: file.name?.replace(/\.[^/.]+$/, "") || "Agreement document",
    });
    setUploadModal((prev) => ({ ...prev, file }));
    return Upload.LIST_IGNORE;
  }, [uploadForm]);

  const closeUploadModal = useCallback((force = false) => {
    if (uploadingId && !force) return;
    uploadForm.resetFields();
    setUploadProgress(0);
    setUploadPhase("");
    setUploadModal({ open: false, agreement: null, file: null });
  }, [uploadForm, uploadingId]);

  const submitUploadDocument = useCallback(async () => {
    const agreement = uploadModal.agreement;
    const file = uploadModal.file;

    if (!file) {
      message.warning("Please choose a document to upload.");
      return;
    }

    try {
      const values = await uploadForm.validateFields();
      const targetId = agreement?.id || "new-agreement";
      setUploadingId(targetId);
      setUploadProgress(3);
      setUploadPhase("Preparing document");
      const formData = new FormData();
      formData.append("file", file);
      const uploadStartedAt = performance.now();
      const uploadRes = await apiService.upload("upload", formData, (event) => {
        if (!event.total) return;
        const percent = Math.max(3, Math.round((event.loaded * 88) / event.total));
        setUploadProgress(percent);
        setUploadPhase("Uploading document");
      });
      const uploadSeconds = ((performance.now() - uploadStartedAt) / 1000).toFixed(1);
      const uploaded = uploadRes?.file || uploadRes?.data?.file || {};
      const url = uploaded.url;

      if (!url) {
        throw new Error("Upload completed but no file URL was returned");
      }

      const documentEndpoint = agreement?.id
        ? `agent/agreements/${agreement.id}/documents`
        : "agent/agreements/documents";

      setUploadProgress(92);
      setUploadPhase("Saving agreement details");
      await apiService.post(documentEndpoint, {
        name: values.documentName?.trim() || uploaded.originalName || file.name,
        remarks: values.remarks?.trim() || "",
        expiryDate: values.expiryDate ? values.expiryDate.toISOString() : null,
        url,
        mimeType: uploaded.mimeType || file.type,
        size: uploaded.size || file.size,
      });

      setUploadProgress(100);
      setUploadPhase("Refreshing agreement list");
      message.success(`Document uploaded in ${uploadSeconds}s`);
      closeUploadModal(true);
      await fetchAgreements();
    } catch (err) {
      console.error("Agreement document upload failed", err);
      if (err?.errorFields) return;
      message.error("Document upload failed");
    } finally {
      setUploadingId(null);
      setUploadPhase("");
    }
  }, [closeUploadModal, fetchAgreements, uploadForm, uploadModal]);

  const deleteDocument = useCallback(async (agreementId, documentId) => {
    try {
      await apiService.delete(`agent/agreements/${agreementId}/documents/${documentId}`);
      message.success("Document deleted");
      await fetchAgreements();
    } catch (err) {
      console.error("Agreement document delete failed", err);
      message.error("Failed to delete document");
    }
  }, [fetchAgreements]);

  const openEditModal = useCallback((agreement, document) => {
    editForm.setFieldsValue({
      documentName: document.name || "Agreement document",
      remarks: document.remarks || "",
      expiryDate: agreement.expiry_date ? dayjs(agreement.expiry_date) : null,
    });
    setEditModal({ open: true, agreement, document, file: null });
  }, [editForm]);

  const closeEditModal = useCallback(() => {
    if (savingEdit) return;
    editForm.resetFields();
    setEditModal({ open: false, agreement: null, document: null, file: null });
  }, [editForm, savingEdit]);

  const stageReplacementFile = useCallback((file) => {
    if (file.size / 1024 / 1024 > 25) {
      message.error("Maximum file size is 25MB.");
      return Upload.LIST_IGNORE;
    }
    setEditModal((prev) => ({ ...prev, file }));
    return Upload.LIST_IGNORE;
  }, []);

  const submitEditDocument = useCallback(async () => {
    const agreement = editModal.agreement;
    const document = editModal.document;
    if (!agreement || !document) return;

    try {
      const values = await editForm.validateFields();
      setSavingEdit(true);

      let replacement = {};
      if (editModal.file) {
        const formData = new FormData();
        formData.append("file", editModal.file);
        const uploadRes = await apiService.upload("upload", formData);
        const uploaded = uploadRes?.file || uploadRes?.data?.file || {};
        if (!uploaded.url) {
          throw new Error("Replacement upload completed but no file URL was returned");
        }
        replacement = {
          url: uploaded.url,
          mimeType: uploaded.mimeType || editModal.file.type,
          size: uploaded.size || editModal.file.size,
        };
      }

      await apiService.patch(`agent/agreements/${agreement.id}/documents/${document.id}`, {
        name: values.documentName?.trim() || "Agreement document",
        remarks: values.remarks?.trim() || "",
        expiryDate: values.expiryDate ? values.expiryDate.toISOString() : null,
        ...replacement,
      });
      message.success(editModal.file ? "Document replaced" : "Document updated");
      editForm.resetFields();
      setEditModal({ open: false, agreement: null, document: null, file: null });
      await fetchAgreements();
    } catch (err) {
      console.error("Agreement document update failed", err);
      if (err?.errorFields) return;
      message.error("Failed to update document");
    } finally {
      setSavingEdit(false);
    }
  }, [editForm, editModal, fetchAgreements]);

  const renderDocumentIcon = (doc) => {
    if (isImage(doc)) return <FileImageOutlined style={{ color: "#2563eb" }} />;
    if (isPdf(doc)) return <FilePdfOutlined style={{ color: "#dc2626" }} />;
    return <FileTextOutlined style={{ color: "#64748b" }} />;
  };

  const renderDocumentList = (agreement) => {
    const docs = agreement.documents || [];
    if (!docs.length) {
      return (
        <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50 p-4 text-center">
          <Text type="secondary">No documents uploaded yet</Text>
        </div>
      );
    }

    return (
      <div className="space-y-2">
        {docs.map((doc) => (
          <div
            key={doc.id}
            className="flex flex-col gap-3 rounded-lg border border-slate-200 bg-white p-3 sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="flex min-w-0 items-center gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-50 text-lg">
                {renderDocumentIcon(doc)}
              </span>
              <div className="min-w-0">
                <Text strong className="block truncate">
                  {doc.name}
                </Text>
                <Text type="secondary" className="block text-xs">
                  {formatSize(doc.size)} {doc.uploaded_at ? `- Uploaded ${formatDate(doc.uploaded_at)}` : ""}
                </Text>
                {doc.remarks && (
                  <Text type="secondary" className="block text-xs">
                    Remarks: {doc.remarks}
                  </Text>
                )}
              </div>
            </div>

            <Space wrap className="document-actions">
              <Button size="small" icon={<EyeOutlined />} href={doc.url} target="_blank" rel="noreferrer">
                Open
              </Button>
              {agreement.can_manage_documents && !doc.locked && (
                <>
                  <Button size="small" icon={<UploadOutlined />} onClick={() => openEditModal(agreement, doc)}>
                    Replace
                  </Button>
                  <Popconfirm
                    title="Delete document?"
                    description="This removes it from the agreement document list."
                    okText="Delete"
                    okButtonProps={{ danger: true }}
                    onConfirm={() => deleteDocument(agreement.id, doc.id)}
                  >
                    <Button size="small" danger icon={<DeleteOutlined />} />
                  </Popconfirm>
                </>
              )}
            </Space>
          </div>
        ))}
      </div>
    );
  };

  const renderAgreementCard = (agreement) => (
    <div key={agreement.id} className="agreement-panel">
      <div className="agreement-panel-header">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <Text strong className="agreement-title">
              {agreement.agreement_type}
            </Text>
            <Tag color={statusColor(agreement)} className="capitalize">
              {statusLabel(agreement)}
            </Tag>
          </div>
          <Text type="secondary" className="block text-xs">
            Version {agreement.version} - {agreement.party_type === "agent" ? "Agent signed" : "Agency signed"}
          </Text>
        </div>

        <Button
          icon={<PlusOutlined />}
          loading={uploadingId === agreement.id}
          disabled={!agreement.can_manage_documents}
          onClick={() => openUploadModal(agreement)}
          className="theme-soft"
        >
          Add Document
        </Button>
      </div>

      <div className="agreement-meta-grid">
        <div>
          <Text type="secondary" className="block text-xs">Effective</Text>
          <Text strong>{formatDate(agreement.effective_date)}</Text>
        </div>
        <div>
          <Text type="secondary" className="block text-xs">Expiry</Text>
          <Text strong type={agreement.is_expiring_soon || agreement.status === "expired" ? "danger" : undefined}>
            {formatDate(agreement.expiry_date)}
          </Text>
        </div>
        <div>
          <Text type="secondary" className="block text-xs">Commission</Text>
          <Text strong>{agreement.commission_split_percent || 0}%</Text>
        </div>
        <div className="agreement-actions">
          <Text type="secondary" className="block text-xs">Documents</Text>
          <Text strong>{agreement.documents?.length || 0}</Text>
        </div>
      </div>

      <div className="mt-4">
        <div className="mb-2 flex items-center justify-between gap-3">
          <Text strong>Signed Documents</Text>
          <Text type="secondary" className="text-xs">Open, replace, or remove uploaded files</Text>
        </div>
        {renderDocumentList(agreement)}
      </div>
    </div>
  );

  return (
    <Spin spinning={loading}>
      <div className="agent-agreements min-h-screen bg-[#f6f8fb] px-3 py-4 sm:px-5 lg:px-6">
        <style>{`
          .agent-agreements .ant-card {
            border: 1px solid #e8edf5 !important;
            border-radius: 10px !important;
            box-shadow: 0 8px 24px rgba(15, 23, 42, 0.04) !important;
            height: 100%;
          }

          .agent-agreements .ant-card-body {
            padding: 18px !important;
          }

          .agent-agreements .ant-table-thead > tr > th {
            background: #f8fafc !important;
            color: #475569;
            font-size: 12px;
            font-weight: 800;
          }

          .agent-agreements .hero-card .ant-card-body {
            padding: 22px 24px !important;
          }

          .agent-agreements .agreement-hero {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 18px;
          }

          .agent-agreements .agreement-hero-title {
            max-width: 720px;
          }

          .agent-agreements .agreement-hero-actions {
            display: flex;
            align-items: center;
            justify-content: flex-end;
            gap: 12px;
            flex-shrink: 0;
          }

          .agent-agreements .theme-primary {
            background: #5C039B !important;
            border-color: #5C039B !important;
            color: #ffffff !important;
            font-weight: 700;
          }

          .agent-agreements .theme-soft {
            border-color: #d8b4fe !important;
            color: #5C039B !important;
            font-weight: 700;
          }

          .agent-agreements .agreement-panel {
            border: 1px solid #e2e8f0;
            border-radius: 10px;
            background: #ffffff;
            padding: 16px;
          }

          .agent-agreements .agreement-panel + .agreement-panel {
            margin-top: 14px;
          }

          .agent-agreements .agreement-panel-header {
            display: flex;
            align-items: flex-start;
            justify-content: space-between;
            gap: 12px;
            border-bottom: 1px solid #edf2f7;
            padding-bottom: 14px;
          }

          .agent-agreements .agreement-title {
            color: #0f172a;
            font-size: 16px;
          }

          .agent-agreements .agreement-meta-grid {
            display: grid;
            grid-template-columns: repeat(4, minmax(0, 1fr));
            gap: 12px;
            margin-top: 14px;
          }

          .agent-agreements .agreement-meta-grid > div {
            min-height: 64px;
            border: 1px solid #eef2f7;
            border-radius: 8px;
            background: #f8fafc;
            padding: 10px 12px;
          }

          .agent-agreements .document-actions .ant-btn {
            border-radius: 8px;
          }

          .agent-agreements .upload-modal .ant-upload-drag {
            border-radius: 10px;
            background: #fafcff;
          }

          @media (max-width: 768px) {
            .agent-agreements .agreement-hero {
              align-items: stretch;
              flex-direction: column;
            }

            .agent-agreements .agreement-hero-actions {
              align-items: stretch;
              flex-direction: column;
            }

            .agent-agreements .agreement-hero-actions .ant-btn {
              width: 100%;
            }

            .agent-agreements .agreement-panel-header {
              flex-direction: column;
            }

            .agent-agreements .agreement-panel-header .ant-btn {
              width: 100%;
            }

            .agent-agreements .agreement-meta-grid {
              grid-template-columns: repeat(2, minmax(0, 1fr));
            }
          }

          @media (max-width: 480px) {
            .agent-agreements .agreement-meta-grid {
              grid-template-columns: 1fr;
            }
          }
        `}</style>

        <Row gutter={[16, 16]} className="mb-4">
          <Col xs={24}>
            <Card className="hero-card">
              <div className="agreement-hero">
                <div className="agreement-hero-title">
                  <Text type="secondary" style={{ fontSize: 12, fontWeight: 800, textTransform: "uppercase" }}>
                    My Agreements
                  </Text>
                  <Title level={3} style={{ margin: 0, fontWeight: 900, color: "#0f172a" }}>
                    Signed A2A Agreements
                  </Title>
                  <Text type="secondary">
                    Upload, preview, download, and manage signed agreement documents.
                  </Text>
                </div>
                <div className="agreement-hero-actions">
                  {agreementData?.agent?.agency && (
                    <Tag color="purple" style={{ margin: 0, borderRadius: 6, padding: "3px 10px" }}>
                      {agreementData.agent.agency.name}
                    </Tag>
                  )}
                  <Button
                    type="primary"
                    icon={<UploadOutlined />}
                    loading={uploadingId === "new-agreement"}
                    onClick={() => openUploadModal()}
                    className="theme-primary"
                  >
                    Upload Signed Agreement
                  </Button>
                </div>
              </div>
            </Card>
          </Col>
        </Row>

        <Card
          title={
            <Space size={10} wrap>
              <Text strong>Agreement Library</Text>
              <Tag color="blue">{summary.total || 0} total</Tag>
              <Tag color="green">{summary.active || 0} active</Tag>
            </Space>
          }
        >
          {agreements.length > 0 ? (
            <div>{agreements.map(renderAgreementCard)}</div>
          ) : (
            <div className="py-6 text-center">
              <Empty description="No signed agreements found. Use the upload button above to add your signed A2A agreement." />
            </div>
          )}
        </Card>

        <Modal
          open={uploadModal.open}
          title="Add Agreement Document"
          className="upload-modal"
          onCancel={closeUploadModal}
          okText={uploadingId ? "Uploading..." : "Upload Document"}
          okButtonProps={{ icon: <UploadOutlined />, loading: Boolean(uploadingId) }}
          onOk={submitUploadDocument}
          maskClosable={!uploadingId}
          destroyOnClose
        >
          <Form form={uploadForm} layout="vertical" preserve={false}>
            <Form.Item label="Document file" required>
              <Upload.Dragger
                multiple={false}
                maxCount={1}
                showUploadList={false}
                beforeUpload={stageUploadFile}
                disabled={Boolean(uploadingId)}
              >
                <p className="ant-upload-drag-icon">
                  <UploadOutlined style={{ color: "#5C039B" }} />
                </p>
                <p className="ant-upload-text">Click or drag any document type here</p>
                <p className="ant-upload-hint">PDF, image, Word, Excel, CSV, ZIP, and other signed agreement files up to 25MB.</p>
              </Upload.Dragger>
              {uploadModal.file && (
                <div className="mt-3 rounded-lg border border-slate-200 bg-slate-50 p-3">
                  <Text strong className="block truncate">{uploadModal.file.name}</Text>
                  <Text type="secondary" className="text-xs">{formatSize(uploadModal.file.size)} - {uploadModal.file.type || "Unknown file type"}</Text>
                </div>
              )}
            </Form.Item>

            {uploadingId && (
              <div className="mb-4 rounded-lg border border-purple-100 bg-purple-50 p-3">
                <div className="mb-2 flex items-center justify-between">
                  <Text strong style={{ color: "#4c1d95" }}>{uploadPhase || "Uploading document"}</Text>
                  <Text style={{ color: "#4c1d95" }}>{uploadProgress}%</Text>
                </div>
                <Progress percent={uploadProgress} showInfo={false} strokeColor="#5C039B" />
              </div>
            )}

            <Form.Item
              name="documentName"
              label="Document name"
              rules={[{ required: true, whitespace: true, message: "Enter document name" }]}
            >
              <Input placeholder="Signed A2A Agreement" maxLength={120} />
            </Form.Item>

            <Form.Item name="expiryDate" label="Agreement expiry">
              <DatePicker style={{ width: "100%" }} placeholder="No expiry" />
            </Form.Item>

            <Form.Item name="remarks" label="Remarks">
              <TextArea placeholder="Add notes for this document" rows={3} maxLength={500} showCount />
            </Form.Item>
          </Form>
        </Modal>

        <Modal
          open={editModal.open}
          title="Replace Agreement Document"
          onCancel={closeEditModal}
          okText={editModal.file ? "Replace Document" : "Save Details"}
          okButtonProps={{ loading: savingEdit }}
          onOk={submitEditDocument}
          destroyOnClose
        >
          <Form form={editForm} layout="vertical" preserve={false}>
            <Form.Item label="Replace file">
              <Upload.Dragger
                multiple={false}
                maxCount={1}
                showUploadList={false}
                beforeUpload={stageReplacementFile}
                disabled={savingEdit}
              >
                <p className="ant-upload-drag-icon">
                  <UploadOutlined style={{ color: "#5C039B" }} />
                </p>
                <p className="ant-upload-text">Drop a new file here to replace the current one</p>
                <p className="ant-upload-hint">Leave empty if you only want to update name, expiry, or remarks.</p>
              </Upload.Dragger>
              {editModal.file && (
                <div className="mt-3 rounded-lg border border-slate-200 bg-slate-50 p-3">
                  <Text strong className="block truncate">{editModal.file.name}</Text>
                  <Text type="secondary" className="text-xs">{formatSize(editModal.file.size)} - replacement selected</Text>
                </div>
              )}
            </Form.Item>

            <Form.Item
              name="documentName"
              label="Document name"
              rules={[{ required: true, whitespace: true, message: "Enter document name" }]}
            >
              <Input placeholder="Signed A2A Agreement" maxLength={120} />
            </Form.Item>

            <Form.Item name="expiryDate" label="Agreement expiry">
              <DatePicker style={{ width: "100%" }} placeholder="No expiry" />
            </Form.Item>

            <Form.Item name="remarks" label="Remarks">
              <TextArea placeholder="Add notes for this document" rows={3} maxLength={500} showCount />
            </Form.Item>
          </Form>
        </Modal>
      </div>
    </Spin>
  );
};

export default AgentAgreements;
