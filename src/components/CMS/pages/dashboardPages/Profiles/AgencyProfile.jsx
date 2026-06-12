import React, { useEffect, useState } from "react";
import { 
  Card, Avatar, Badge, Descriptions, Tag, Space, Row, Col, 
  Divider, Typography, Button, Modal, Form, Input, 
  message, Upload, Tooltip, Tabs, Alert, Skeleton, 
  Steps, List
} from "antd"; 
import {
  UserOutlined, MailOutlined, PhoneOutlined, EnvironmentOutlined,
  GlobalOutlined, FileProtectOutlined, InfoCircleOutlined, 
  CheckCircleOutlined, EditOutlined, CameraOutlined, 
  LoadingOutlined, UploadOutlined, SafetyCertificateOutlined,
  BankOutlined, VerifiedOutlined, ClockCircleOutlined, 
  CloseCircleOutlined, EyeOutlined, DownloadOutlined, InboxOutlined,
  FilePdfOutlined, DeleteOutlined, IdcardOutlined,
  CheckCircleFilled, WarningOutlined, SyncOutlined
} from "@ant-design/icons";
import { apiService } from "../../../../../manageApi/utils/custom.apiservice";

const { Text, Title, Paragraph } = Typography;
const { Step } = Steps;

const AgencyProfile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [form] = Form.useForm();
  const [imageUploading, setImageUploading] = useState(false);

  const [kycStatusData, setKycStatusData] = useState(null);
  const [kycLoading, setKycLoading] = useState(false);
  const [submittingKyc, setSubmittingKyc] = useState(false);
  const [kycFiles, setKycFiles] = useState({
    trade_license: null,
    rera_licence: null,
    letter_of_authority: null
  });
  const [existingKycDocs, setExistingKycDocs] = useState([]);

  const [agreementData, setAgreementData] = useState(null);
  const [uploadingAgreement, setUploadingAgreement] = useState(false);
  const [stagedAgreements, setStagedAgreements] = useState([]); 

  const isKycVerified = () => {
    return kycStatusData?.kycStatus === 'approved' || profile?.kycStatus === 'approved';
  };
  
  const isKycUnderReview = () => {
    return kycStatusData?.kycStatus === 'pending' || profile?.kycStatus === 'pending' || 
           kycStatusData?.onboardingStatus === 'kyc_submitted' || profile?.onboardingStatus === 'kyc_submitted';
  };
  
  const isKycRejected = () => {
    return kycStatusData?.kycStatus === 'rejected' || profile?.kycStatus === 'rejected';
  };

  const hasKycDocuments = () => {
    return existingKycDocs.length > 0 || (profile?.kycDocuments && profile.kycDocuments.length > 0);
  };
  
  const isAgreementSigned = () => {
    return agreementData?.agreementSigned === true || profile?.agreementSigned === true;
  };
  
  const isAgreementUnderReview = () => {
    return agreementData?.agreementUnderReview === true || 
           (profile?.agreementDocuments && profile.agreementDocuments.length > 0 && !profile?.agreementSigned);
  };

  const hasAgreementDocuments = () => {
    return (agreementData?.agreementDocuments && agreementData.agreementDocuments.length > 0) || 
           (profile?.agreementDocuments && profile.agreementDocuments.length > 0);
  };

  const isAgreementRejected = () => {
    return agreementData?.agreementStatus === 'changes_requested' || profile?.agreementStatus === 'changes_requested' ||
           agreementData?.agreementStatus === 'rejected' || profile?.agreementStatus === 'rejected';
  };

  const getProfile = async () => {
    try {
      const response = await apiService.get("agency/profile");
      const data = response?.data?.data || response?.data;
      setProfile(data);
      
      if (data?.kycDocuments?.length > 0) {
        setExistingKycDocs(data.kycDocuments);
        const existingDocsMap = {};
        data.kycDocuments.forEach(doc => {
          existingDocsMap[doc.type] = {
            type: doc.type,
            name: doc.name,
            url: doc.url,
            _id: doc._id,
            uploadedAt: doc.uploadedAt
          };
        });
        setKycFiles(prev => ({ ...prev, ...existingDocsMap }));
      }
    } catch (error) {
      console.error(error);
      message.error("Failed to fetch profile data");
    }
  };

  const getKycStatus = async () => {
    try {
      const response = await apiService.get("agency/kyc/status");
      if (response?.data?.success) {
        setKycStatusData(response.data.data);
      }
    } catch (error) {
      console.error("Failed to fetch KYC status", error);
    }
  };

  const getAgreement = async () => {
    try {
      const response = await apiService.get("agency/agreement");
      const data = response?.data?.data || response?.data;
      setAgreementData(data);
    } catch (error) {
      console.error("Failed to fetch agreement", error);
    }
  };

  const fetchAllData = async () => {
    setLoading(true);
    await Promise.all([getProfile(), getKycStatus(), getAgreement()]);
    setLoading(false);
  };

  useEffect(() => { fetchAllData(); }, []);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await Promise.all([getProfile(), getKycStatus(), getAgreement()]);
    setIsRefreshing(false);
    message.success("Data refreshed successfully!");
  };

  const beforeImageUpload = (file) => {
    const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png';
    if (!isJpgOrPng) message.error('You can only upload JPG/PNG file!');
    const isLt2M = file.size / 1024 / 1024 < 2;
    if (!isLt2M) message.error('Image must be smaller than 2MB!');
    return isJpgOrPng && isLt2M;
  };

 const handleImageUploadRequest = async ({
  file,
  onSuccess,
  onError
}) => {
  const formData = new FormData();
  formData.append("file", file);

  setImageUploading(true);

  try {
    const response = await apiService.post(
      `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'}/upload`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

    console.log("UPLOAD RESPONSE:", response);

    // different response formats handle
    const fileUrl =
      response?.data?.data?.url ||
      response?.data?.file?.url ||
      response?.data?.url ||
      response?.file?.url ||
      response?.url;

    console.log("FILE URL:", fileUrl);

    if (!fileUrl) {
      throw new Error("URL not found");
    }

    const saveResponse = await apiService.post(
      "agency/profile/logo",
      {
        logo: fileUrl,
      }
    );

    console.log("SAVE RESPONSE:", saveResponse);

   await getProfile();

// 🔥 Notify topbar
window.dispatchEvent(
  new Event("agencyProfileUpdated")
);

onSuccess("ok");
message.success("Logo updated successfully");

  } catch (error) {
    console.log("LOGO ERROR:", error);

    onError(error);

    message.error(
      error?.response?.data?.message ||
      error?.message ||
      "Failed to upload logo"
    );
  } finally {
    setImageUploading(false);
  }
};

  const showEditModal = () => {
    form.setFieldsValue({
      companyName: profile?.companyName,
      primaryContactEmail: profile?.primaryContactEmail,
      primaryContactPhone: profile?.primaryContactPhone,
      address: profile?.address?.addressLine,
      city: profile?.address?.city,
      country: profile?.address?.country,
    });
    setIsModalVisible(true);
  };

  const handleUpdate = async (values) => {
    setUpdating(true);
    try {
      const updates = {};
      if (values.primaryContactPhone) updates.primaryContactPhone = values.primaryContactPhone;
      if (values.address) {
        updates.address = {
          ...(profile.address || {}),
          addressLine: values.address
        };
      }
      if (values.city) {
        updates.address = {
          ...(updates.address || profile.address || {}),
          city: values.city
        };
      }
      if (values.country) {
        updates.address = {
          ...(updates.address || profile.address || {}),
          country: values.country
        };
      }

      await apiService.patch("agency/profile", updates);
      message.success("Profile updated successfully!");
      setIsModalVisible(false);
      getProfile(); 
    } catch (error) {
      message.error(error?.response?.data?.message || "Failed to update profile");
    } finally {
      setUpdating(false);
    }
  };

  const handleKycFileChange = async (type, options) => {
    const { file, onSuccess, onError } = options;
    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await apiService.post(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'}/upload`, formData);
      const resData = response?.data ?? response;
      const fileUrl = resData?.file?.url;

      if (!fileUrl) throw new Error("No URL returned from upload");

      const extension = file.name.substring(file.name.lastIndexOf('.'));
      const defaultName = file.name.substring(0, file.name.lastIndexOf('.'));

      setKycFiles(prev => ({
        ...prev,
        [type]: { type, name: file.name, customName: defaultName, extension: extension, url: fileUrl }
      }));

      onSuccess("ok");
      message.success(`${file.name} attached! You can rename it below.`);
    } catch (err) {
      console.error(err);
      onError(err);
      message.error(`Failed to attach ${file.name}`);
    }
  };

  const handleRemoveKycDoc = async (type) => {
    if (!isKycRejected()) {
      message.warning("Cannot remove documents after submission");
      return;
    }
    try {
      await apiService.delete(`agency/kyc/document/${type}`);
      setKycFiles(prev => ({ ...prev, [type]: null }));
      setExistingKycDocs(prev => prev.filter(doc => doc.type !== type));
      message.success("Document removed successfully");
    } catch (error) {
      message.error("Failed to remove document");
    }
  };

  const submitKyc = async () => {
    if (isKycVerified()) return message.warning("KYC is already verified");
    if (isKycUnderReview()) return message.warning("KYC is already under review");
    if (!kycFiles.trade_license?.url || !kycFiles.rera_licence?.url || !kycFiles.letter_of_authority?.url) {
      return message.warning("Please attach all required KYC documents.");
    }

    setSubmittingKyc(true);
    try {
      const payload = {
        kycDocuments: [
          { type: "trade_license", name: `${kycFiles.trade_license.customName.trim()}${kycFiles.trade_license.extension}`, url: kycFiles.trade_license.url },
          { type: "rera_licence", name: `${kycFiles.rera_licence.customName.trim()}${kycFiles.rera_licence.extension}`, url: kycFiles.rera_licence.url },
          { type: "letter_of_authority", name: `${kycFiles.letter_of_authority.customName.trim()}${kycFiles.letter_of_authority.extension}`, url: kycFiles.letter_of_authority.url }
        ],
        kycStatus: "pending",
        onboardingStatus: "kyc_submitted"
      };

      await apiService.post("agency/kyc/submit", payload);
      message.success("KYC Documents submitted successfully!");
      setKycStatusData(prev => ({ ...prev, kycStatus: 'pending', onboardingStatus: 'kyc_submitted' }));
      getProfile();
      getKycStatus();
    } catch (error) {
      message.error(error?.response?.data?.message || "Failed to submit KYC");
    } finally {
      setSubmittingKyc(false);
    }
  };

  const submitStagedAgreements = async () => {
    if (stagedAgreements.length === 0) return;
    setUploadingAgreement(true);
    try {
      const uploadedDocs = [];
      for (let i = 0; i < stagedAgreements.length; i++) {
        const item = stagedAgreements[i];
        const formData = new FormData();
        formData.append("file", item.file);

        const response = await apiService.post(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'}/upload`, formData);
        const resData = response?.data ?? response;
        const fileUrl = resData?.file?.url;

        if (!fileUrl) throw new Error(`Failed to upload ${item.customName}`);

        uploadedDocs.push({
          type: i === 0 ? "main_agreement" : "addendum", 
          name: `${item.customName.trim()}.pdf`,
          url: fileUrl,
        });
      }

      const payload = { agreementDocuments: uploadedDocs , agreementStatus: "pending"};
      await apiService.post("agency/agreement/upload", payload);

      message.success("Agreement(s) submitted successfully!");
      setStagedAgreements([]); 
      getAgreement();
      getProfile();
    } catch (error) {
      message.error(error.message || "Agreement upload failed");
    } finally {
      setUploadingAgreement(false);
    }
  };

  const getKycStatusConfig = () => {
    if (isKycVerified()) {
      return { status: 'verified', color: '#52c41a', bgColor: '#f6ffed', borderColor: '#b7eb8f', icon: <CheckCircleFilled style={{ fontSize: 40 }} />, title: 'KYC Verified', description: 'Your identity has been successfully verified.', showDocuments: true, step: 2 };
    }
    if (isKycUnderReview() || (hasKycDocuments() && !isKycRejected())) {
      return { status: 'review', color: '#faad14', bgColor: '#fff7e6', borderColor: '#ffd666', icon: <ClockCircleOutlined style={{ fontSize: 40 }} />, title: 'KYC Under Review', description: 'Your KYC documents are currently under review.', showDocuments: true, step: 1 };
    }
    if (isKycRejected()) {
      return { status: 'rejected', color: '#ff4d4f', bgColor: '#fff2f0', borderColor: '#ffccc7', icon: <CloseCircleOutlined style={{ fontSize: 40 }} />, title: 'KYC Rejected', description: 'Your KYC submission was rejected. Please review and resubmit.', showDocuments: true, showResubmit: true, step: 1 };
    }
    return { status: 'not_started', color: '#ff4d4f', bgColor: '#fff2f0', borderColor: '#ffccc7', icon: <WarningOutlined style={{ fontSize: 40 }} />, title: 'Action Required', description: 'Complete your KYC verification to unlock all features.', showDocuments: false, showForm: true, step: 0 };
  };

  const getAgreementStatusConfig = () => {
    if (isAgreementRejected()) {
      return { status: 'rejected', color: '#ff4d4f', bgColor: '#fff2f0', borderColor: '#ffccc7', icon: <CloseCircleOutlined style={{ fontSize: 40 }} />, title: 'Agreement Revision Required', description: 'Changes requested by admin. Please review the remarks above and re-upload.', showDocuments: true, showForm: true, step: 0 };
    }

    const isVerifiedByAdmin = agreementData?.agreementVerified === true || profile?.agreementVerified === true || agreementData?.agreementStatus === 'approved' || profile?.agreementStatus === 'approved';
    
    if (isVerifiedByAdmin) {
      return { status: 'signed', color: '#52c41a', bgColor: '#f6ffed', borderColor: '#b7eb8f', icon: <CheckCircleFilled style={{ fontSize: 40 }} />, title: 'Agreement Signed & Active', description: 'Your agency agreement has been verified and is active.', showDocuments: true, showForm: false, step: 2 };
    }
    
    if (isAgreementUnderReview() || hasAgreementDocuments() || isAgreementSigned()) {
      return { status: 'review', color: '#faad14', bgColor: '#fff7e6', borderColor: '#ffd666', icon: <ClockCircleOutlined style={{ fontSize: 40 }} />, title: 'Agreement Under Review', description: 'Your signed agreement has been uploaded and is being reviewed by our team.', showDocuments: true, showForm: false, step: 1 };
    }
    
    return { status: 'pending', color: '#ff4d4f', bgColor: '#fff2f0', borderColor: '#ffccc7', icon: <WarningOutlined style={{ fontSize: 40 }} />, title: 'Action Required', description: 'Please sign the agency agreement to start managing agents.', showDocuments: false, showForm: true, step: 0 };
  };

  const kycConfig = getKycStatusConfig();
  const agreementConfig = getAgreementStatusConfig();

  const renderKycDocumentsList = () => {
    const documents = existingKycDocs.length > 0 ? existingKycDocs : Object.values(kycFiles).filter(doc => doc?.url);
    if (documents.length === 0) return null;
    const showRemoveButton = isKycRejected();

    return (
      <div className="mt-6 text-left">
        <Text strong className="block mb-3">Uploaded Documents:</Text>
        <List
          dataSource={documents}
          renderItem={(doc) => (
            <List.Item className="hover:bg-gray-50 rounded-lg transition-colors border px-4 mb-2 bg-white shadow-sm"
              actions={[
                <Button type="link" icon={<EyeOutlined />} onClick={() => window.open(doc.url, '_blank')} className="text-purple-600">View</Button>,
                <Button type="link" icon={<DownloadOutlined />} onClick={() => window.open(doc.url, '_blank')} className="text-purple-600">Download</Button>,
                ...(showRemoveButton ? [
                  <Button type="link" danger icon={<DeleteOutlined />} onClick={() => handleRemoveKycDoc(doc.type)}>Remove</Button>
                ] : [])
              ]}
            >
              <List.Item.Meta avatar={<FilePdfOutlined style={{ fontSize: 28, color: '#ff4d4f' }} />}
                title={<Text strong className="text-sm">{doc.name}</Text>}
                description={
                  <Space direction="vertical" size={0}>
                    <Text type="secondary" className="text-xs capitalize">{doc.type?.replace('_', ' ').toUpperCase()}</Text>
                    {doc.uploadedAt && <Text type="secondary" className="text-xs">Uploaded: {new Date(doc.uploadedAt).toLocaleDateString()}</Text>}
                  </Space>
                }
              />
            </List.Item>
          )}
        />
      </div>
    );
  };

  const renderAgreementDocuments = () => {
    const docsToRender = agreementData?.agreementDocuments?.length ? agreementData.agreementDocuments : profile?.agreementDocuments;
    if (!docsToRender || docsToRender.length === 0) return null;
    return (
      <div className="mt-6 text-left">
        <Text strong className="block mb-3">Uploaded Documents:</Text>
        <List dataSource={docsToRender} renderItem={(doc) => (
            <List.Item className="hover:bg-gray-50 rounded-lg transition-colors border px-4 mb-2 bg-white shadow-sm"
              actions={[
                <Button type="link" icon={<EyeOutlined />} onClick={() => window.open(doc.url, '_blank')} className="text-purple-600">View</Button>,
                <Button type="link" icon={<DownloadOutlined />} onClick={() => window.open(doc.url, '_blank')} className="text-purple-600">Download</Button>
              ]}
            >
              <List.Item.Meta avatar={<FilePdfOutlined style={{ fontSize: 28, color: '#ff4d4f' }} />} title={<Text strong>{doc.name || doc.type?.replace('_', ' ').toUpperCase()}</Text>} description={`Uploaded: ${new Date(doc.uploadedAt || Date.now()).toLocaleDateString()}`} />
            </List.Item>
          )}
        />
      </div>
    );
  };

  const renderKycUploadForm = () => {
    if (hasKycDocuments() && !isKycRejected()) return null;
    return (
      <Card title={<div className="flex items-center gap-2"><UploadOutlined className="text-purple-500 text-lg" /><span className="font-semibold">Attach & Rename Documents</span></div>} className="shadow-sm border rounded-lg mt-6 bg-gray-50">
        <Row gutter={[24, 24]}>
          <Col span={24} md={8}>
            <div className="border rounded-xl p-6 text-center hover:shadow-lg transition-all duration-300 bg-white">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4"><BankOutlined className="text-purple-500 text-2xl" /></div>
              <Text strong className="block mb-3 text-base">1. Trade License</Text>
              {!kycFiles.trade_license ? (
                <><Text type="secondary" className="text-xs block mb-3">PDF or Image (Max 5MB)</Text><Upload customRequest={(options) => handleKycFileChange('trade_license', options)} showUploadList={false} maxCount={1}><Button icon={<UploadOutlined />} size="large" className="mt-2">Select File</Button></Upload></>
              ) : (
                <div className="mt-3 text-left">
                  <div className="text-green-600 text-sm flex items-center justify-center gap-1 mb-2"><CheckCircleOutlined /> File Attached</div>
                  <Input value={kycFiles.trade_license.customName} onChange={(e) => setKycFiles(prev => ({...prev, trade_license: { ...prev.trade_license, customName: e.target.value }}))} placeholder="Document Name" suffix={<span className="text-gray-400">{kycFiles.trade_license.extension}</span>} className="mb-2" />
                  <Upload customRequest={(options) => handleKycFileChange('trade_license', options)} showUploadList={false} maxCount={1}><Button type="link" size="small">Change File</Button></Upload>
                </div>
              )}
            </div>
          </Col>
          <Col span={24} md={8}>
            <div className="border rounded-xl p-6 text-center hover:shadow-lg transition-all duration-300 bg-white">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4"><FileProtectOutlined className="text-blue-500 text-2xl" /></div>
              <Text strong className="block mb-3 text-base">2. RERA Licence</Text>
              {!kycFiles.rera_licence ? (
                <><Text type="secondary" className="text-xs block mb-3">PDF or Image (Max 5MB)</Text><Upload customRequest={(options) => handleKycFileChange('rera_licence', options)} showUploadList={false} maxCount={1}><Button icon={<UploadOutlined />} size="large" className="mt-2">Select File</Button></Upload></>
              ) : (
                <div className="mt-3 text-left">
                  <div className="text-green-600 text-sm flex items-center justify-center gap-1 mb-2"><CheckCircleOutlined /> File Attached</div>
                  <Input value={kycFiles.rera_licence.customName} onChange={(e) => setKycFiles(prev => ({...prev, rera_licence: { ...prev.rera_licence, customName: e.target.value }}))} placeholder="Document Name" suffix={<span className="text-gray-400">{kycFiles.rera_licence.extension}</span>} className="mb-2" />
                  <Upload customRequest={(options) => handleKycFileChange('rera_licence', options)} showUploadList={false} maxCount={1}><Button type="link" size="small">Change File</Button></Upload>
                </div>
              )}
            </div>
          </Col>
          <Col span={24} md={8}>
            <div className="border rounded-xl p-6 text-center hover:shadow-lg transition-all duration-300 bg-white">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4"><SafetyCertificateOutlined className="text-green-500 text-2xl" /></div>
              <Text strong className="block mb-3 text-base">3. Letter of Authority</Text>
              {!kycFiles.letter_of_authority ? (
                <><Text type="secondary" className="text-xs block mb-3">PDF or Image (Max 5MB)</Text><Upload customRequest={(options) => handleKycFileChange('letter_of_authority', options)} showUploadList={false} maxCount={1}><Button icon={<UploadOutlined />} size="large" className="mt-2">Select File</Button></Upload></>
              ) : (
                <div className="mt-3 text-left">
                  <div className="text-green-600 text-sm flex items-center justify-center gap-1 mb-2"><CheckCircleOutlined /> File Attached</div>
                  <Input value={kycFiles.letter_of_authority.customName} onChange={(e) => setKycFiles(prev => ({...prev, letter_of_authority: { ...prev.letter_of_authority, customName: e.target.value }}))} placeholder="Document Name" suffix={<span className="text-gray-400">{kycFiles.letter_of_authority.extension}</span>} className="mb-2" />
                  <Upload customRequest={(options) => handleKycFileChange('letter_of_authority', options)} showUploadList={false} maxCount={1}><Button type="link" size="small">Change File</Button></Upload>
                </div>
              )}
            </div>
          </Col>
        </Row>
        <Divider className="my-6" />
        <div className="text-center">
          <Button type="primary" size="large" onClick={submitKyc} loading={submittingKyc} icon={<SafetyCertificateOutlined />} className="bg-purple-600 hover:bg-purple-700 border-purple-600 px-8 h-12 text-base font-semibold" disabled={!kycFiles.trade_license?.url || !kycFiles.rera_licence?.url || !kycFiles.letter_of_authority?.url}>
            Submit KYC Documents
          </Button>
        </div>
      </Card>
    );
  };

  const renderAgreementUploadForm = () => {
    if (!agreementConfig.showForm) {
      return null;
    }
    
    return (
      <div className="mt-6 border-t pt-6">
        <Title level={5} className="!mb-4">Sign & Upload Agreements (Up to 2 files)</Title>
        <Space size="middle" className="flex-wrap justify-center mb-4">
          <Button size="large" icon={<DownloadOutlined />} className="h-10 px-6" onClick={() => window.open('https://cdn.reelly.io/agreements/agency_template.pdf', '_blank')}>
            Download Template
          </Button>
          <Upload multiple beforeUpload={(file) => {
              setStagedAgreements(prev => {
                if (prev.length >= 2) { message.warning("You can only upload a maximum of 2 agreements."); return prev; }
                const defaultName = file.name.substring(0, file.name.lastIndexOf('.'));
                return [...prev, { uid: file.uid, file, customName: defaultName }];
              });
              return false; 
            }} showUploadList={false}
          >
            <Button size="large" type="dashed" icon={<UploadOutlined />} className="h-10 px-6" disabled={stagedAgreements.length >= 2}>
              Select PDF File
            </Button>
          </Upload>
        </Space>

        {stagedAgreements.length > 0 && (
          <div className="max-w-lg mx-auto text-left bg-gray-50 p-4 rounded-xl border mb-4 mt-2">
            <Text strong className="block mb-3 text-gray-700">Selected Files (Rename if needed):</Text>
            {stagedAgreements.map((item) => (
              <div key={item.uid} className="flex items-center gap-3 mb-3 bg-white p-2 border rounded-lg shadow-sm">
                <FilePdfOutlined className="text-red-500 text-2xl" />
                <div className="flex-1">
                  <Input value={item.customName} onChange={(e) => { const newName = e.target.value; setStagedAgreements(prev => prev.map(f => f.uid === item.uid ? { ...f, customName: newName } : f)); }} placeholder="Enter document name" suffix={<span className="text-gray-400">.pdf</span>} />
                </div>
                <Button type="text" danger icon={<DeleteOutlined />} onClick={() => setStagedAgreements(prev => prev.filter(f => f.uid !== item.uid))} />
              </div>
            ))}
            <Button type="primary" block size="large" loading={uploadingAgreement} onClick={submitStagedAgreements} className="bg-purple-600 hover:bg-purple-700 mt-2">
              Submit Agreement(s)
            </Button>
          </div>
        )}
        <Text type="secondary" className="text-xs block mt-2">
          * Please download the template, sign it, and upload the signed PDF. You can upload up to 2 files.
        </Text>
      </div>
    );
  };

  const tabItems = [
    {
      key: "1",
      label: <span className="text-base font-medium"><InfoCircleOutlined className="mr-2" />Profile Details</span>,
      children: (
        <div className="pt-6">
          <Descriptions bordered column={{ xxl: 2, xl: 2, lg: 2, md: 1, sm: 1, xs: 1 }} size="middle" labelStyle={{ fontWeight: 600, background: "#FAFAFA", width: '180px' }}>
            <Descriptions.Item label={<><MailOutlined className="mr-2 text-purple-500" /> Email</>}><Text copyable className="text-gray-700">{profile?.primaryContactEmail || "N/A"}</Text></Descriptions.Item>
            <Descriptions.Item label={<><PhoneOutlined className="mr-2 text-purple-500" /> Phone</>}><Text className="text-gray-700">{profile?.primaryContactPhone || "N/A"}</Text></Descriptions.Item>
            <Descriptions.Item label={<><EnvironmentOutlined className="mr-2 text-purple-500" /> Location</>} span={2}>
              <div><Text strong className="text-gray-700">{profile?.address?.addressLine || "N/A"}</Text>{profile?.address?.city && (<div className="text-gray-500 text-sm mt-1">{profile.address.city}, {profile.address.country || "UAE"}</div>)}</div>
            </Descriptions.Item>
            <Descriptions.Item label={<><FileProtectOutlined className="mr-2 text-purple-500" /> RERA Number</>}>{profile?.reraRegistrationNumber || "N/A"}</Descriptions.Item>
          </Descriptions>
        </div>
      ),
    },
    {
      key: "2",
      label: <span className="text-base font-medium"><SafetyCertificateOutlined className="mr-2" />KYC & Verification</span>,
      children: (
        <div className="pt-6">
          {kycLoading ? (
            <div className="text-center p-10"><Skeleton.Avatar active size="large" /><Skeleton paragraph={{ rows: 3 }} className="mt-4" /></div>
          ) : (
            <div>
              {isKycRejected() && (
                <Alert 
                  message={<Text strong className="text-red-700">Action Required: KYC Rejected</Text>}
                  description={kycStatusData?.kycRejectionReason || profile?.kycRejectionReason || "Your documents were rejected by the admin. Please review and re-submit."}
                  type="error" showIcon className="mb-6 rounded-lg border-red-200"
                />
              )}

              <Card className="shadow-sm rounded-lg" style={{ background: kycConfig.bgColor, borderColor: kycConfig.borderColor }}>
                <div className="mb-6 border-b pb-6" style={{ borderColor: kycConfig.borderColor }}>
                  <Steps current={kycConfig.step} size="small" className="max-w-2xl mx-auto"><Step title="Upload Documents" /><Step title="Under Review" /><Step title="Verified" /></Steps>
                </div>
                <div className="text-center pb-4">
                  <div className="mx-auto mb-6" style={{ color: kycConfig.color }}>{kycConfig.icon}</div>
                  <Title level={4} className="mb-3">{kycConfig.title}</Title>
                  <Text type="secondary" className="text-base block mb-6">{kycConfig.description}</Text>
                  {hasKycDocuments() && renderKycDocumentsList()}
                  {kycConfig.showResubmit && (
                    <div className="mt-6">
                      <Button size="large" type="primary" onClick={() => { setKycStatusData(prev => ({ ...prev, kycStatus: 'not_submitted', onboardingStatus: null })); }} icon={<UploadOutlined />} className="bg-purple-600 hover:bg-purple-700 border-purple-600 h-12 px-6">
                        Resubmit KYC
                      </Button>
                    </div>
                  )}
                </div>
              </Card>
              {renderKycUploadForm()}
            </div>
          )}
        </div>
      ),
    },
    {
      key: "3",
      label: <span className="text-base font-medium"><FileProtectOutlined className="mr-2" />Agency Agreement</span>,
      children: (
        <div className="pt-6">
          {agreementConfig && (
            <div>
              {isAgreementRejected() && (
                <Alert 
                  message={<Text strong className="text-red-700">Action Required: Agreement Revision Needed</Text>}
                  description={
                    <div className="mt-2 text-sm text-red-800">
                      <div className="mb-1">
                        <Text strong>Reason:</Text> {agreementData?.agreementFeedback?.message || profile?.agreementFeedback?.message || "Please revise and upload again."}
                      </div>
                      {(agreementData?.agreementFeedback?.remarks || profile?.agreementFeedback?.remarks) && (
                        <div>
                          <Text strong>Remarks:</Text> {agreementData?.agreementFeedback?.remarks || profile?.agreementFeedback?.remarks}
                        </div>
                      )}
                    </div>
                  }
                  type="error" showIcon className="mb-6 rounded-lg border-red-200"
                />
              )}

              <Card className="shadow-sm rounded-lg" style={{ background: agreementConfig.bgColor, borderColor: agreementConfig.borderColor }}>
                <div className="mb-6 border-b pb-6" style={{ borderColor: agreementConfig.borderColor }}>
                  <Steps current={agreementConfig.step} size="small" className="max-w-2xl mx-auto">
                    <Step title="Upload Agreement" />
                    <Step title="Under Review" />
                    <Step title="Verified" />
                  </Steps>
                </div>
                <div className="text-center pb-4">
                  <div className="mx-auto mb-6" style={{ color: agreementConfig.color }}>{agreementConfig.icon}</div>
                  <Title level={4} className="mb-3">{agreementConfig.title}</Title>
                  <Text type="secondary" className="text-base block mb-6">{agreementConfig.description}</Text>
                  {agreementConfig.showDocuments && renderAgreementDocuments()}
                  {renderAgreementUploadForm()}
                </div>
              </Card>
            </div>
          )}
        </div>
      ),
    },
  ];

  if (loading && !profile) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <Card className="w-full max-w-4xl rounded-xl"><Skeleton active avatar paragraph={{ rows: 6 }} /></Card>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <Card className="w-full rounded-2xl overflow-hidden shadow-lg border-0 mb-8" cover={<div className="h-48 bg-gradient-to-r from-purple-600 via-purple-500 to-purple-700 relative"><div className="absolute inset-0 bg-black/10" /></div>} bodyStyle={{ padding: 0 }}>
          <div className="relative px-8 pt-2 pb-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
              <div className="relative -mt-16">
                <Badge dot status={profile?.isActive ? "success" : "warning"} offset={[-5, 85]}>
                  <Upload showUploadList={false} beforeUpload={beforeImageUpload} customRequest={handleImageUploadRequest} disabled={imageUploading}>
                    <Tooltip title="Change Logo">
                      <div className="relative group cursor-pointer">
                        {imageUploading && (<div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center z-20"><LoadingOutlined className="text-white text-3xl" spin /></div>)}
                        <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10"><CameraOutlined className="text-white text-3xl" /></div>
                        <Avatar size={128} icon={<BankOutlined />} src={profile?.logo} className="border-4 border-white shadow-xl bg-white" />
                      </div>
                    </Tooltip>
                  </Upload>
                </Badge>
              </div>

              <div className="flex-1 mt-4 md:mt-0">
                <div className="flex flex-wrap justify-between items-start gap-4">
                  <div>
                    <Title level={2} className="mb-2 !text-gray-800">{profile?.companyName || "Company Name"}</Title>
                    <Space size={12} wrap>
                      <Tag color="purple" icon={<BankOutlined />} className="rounded-full px-4 py-1.5 text-sm font-medium border-0 bg-purple-100 text-purple-700">Real Estate Agency</Tag>
                      {profile?.isActive ? (
                        <Tag color="success" icon={<VerifiedOutlined />} className="rounded-full px-4 py-1.5 text-sm font-medium border-0 bg-green-100 text-green-700">Active Agency</Tag>
                      ) : (
                        <Tag color="warning" icon={<ClockCircleOutlined />} className="rounded-full px-4 py-1.5 text-sm font-medium border-0 bg-yellow-100 text-yellow-700">Pending Verification</Tag>
                      )}
                    </Space>
                  </div>
                  <Space>
                    <Button icon={<SyncOutlined spin={isRefreshing} />} onClick={handleRefresh} size="large" className="font-medium shadow-sm rounded-lg h-10 px-4">Refresh</Button>
                    <Button icon={<EditOutlined />} onClick={showEditModal} size="large" className="font-medium shadow-sm rounded-lg h-10 px-6">Edit Profile</Button>
                  </Space>
                </div>
              </div>
            </div>
          </div>
        </Card>

        <Card className="w-full rounded-xl shadow-sm border-0" bodyStyle={{ padding: "0 24px 24px 24px" }}>
          <Tabs defaultActiveKey="1" items={tabItems} size="large" className="profile-tabs" tabBarStyle={{ borderBottom: '2px solid #f0f0f0', paddingTop: '10px', marginBottom: '0' }} />
        </Card>
      </div>

      <Modal title={<div className="flex items-center gap-2"><EditOutlined className="text-purple-500 text-xl" /><span className="text-xl font-semibold">Edit Profile Information</span></div>} open={isModalVisible} onCancel={() => setIsModalVisible(false)} footer={null} width={800} destroyOnClose className="edit-profile-modal">
        <Form form={form} layout="vertical" onFinish={handleUpdate} className="mt-4" initialValues={profile}>
          <Divider orientation="left" className="!text-sm !mt-0"><Space><BankOutlined /> Basic Information</Space></Divider>
          <Row gutter={16}>
            <Col span={24}><Form.Item name="companyName" label="Company Name" rules={[{ required: true, message: 'Please enter company name' }]}><Input size="large" placeholder="e.g. Acme Real Estate Agency" disabled /></Form.Item></Col>
            <Col span={12}><Form.Item name="primaryContactEmail" label="Email"><Input size="large" disabled placeholder="Email" /></Form.Item></Col>
            <Col span={12}><Form.Item name="primaryContactPhone" label="Phone Number"><Input size="large" placeholder="Phone Number" /></Form.Item></Col>
            <Col span={24}><Form.Item name="reraRegistrationNumber" label="RERA Registration Number"><Input size="large" placeholder="RERA Registration Number" disabled /></Form.Item></Col>
            <Col span={24}><Form.Item name="address" label="Address"><Input size="large" placeholder="Street Address" /></Form.Item></Col>
            <Col span={12}><Form.Item name="city" label="City"><Input size="large" placeholder="City" /></Form.Item></Col>
            <Col span={12}><Form.Item name="country" label="Country"><Input size="large" placeholder="Country" /></Form.Item></Col>
          </Row>
          <div className="flex justify-end gap-3 mt-6">
            <Button size="large" onClick={() => setIsModalVisible(false)}>Cancel</Button>
            <Button type="primary" htmlType="submit" loading={updating} size="large" icon={<EditOutlined />} className="bg-purple-600 hover:bg-purple-700 border-purple-600">Update Profile</Button>
          </div>
        </Form>
      </Modal>

      <style jsx="true">{`
        .profile-tabs :global(.ant-tabs-tab) { padding: 16px 24px; margin: 0 !important; font-weight: 500; font-size: 15px; }
        .profile-tabs :global(.ant-tabs-tab:hover) { color: #7C3AED; }
        .profile-tabs :global(.ant-tabs-tab-active) { color: #7C3AED; font-weight: 600; }
        .profile-tabs :global(.ant-tabs-tab-active .ant-tabs-tab-btn) { color: #7C3AED; }
        .profile-tabs :global(.ant-tabs-ink-bar) { background: #7C3AED; height: 3px !important; border-radius: 2px; }
        .edit-profile-modal :global(.ant-modal-header) { border-bottom: 2px solid #f0f0f0; padding: 20px 24px; border-radius: 12px 12px 0 0; }
        .edit-profile-modal :global(.ant-modal-body) { padding: 24px; max-height: 70vh; overflow-y: auto; }
      `}</style>
    </div>
  );
};

export default AgencyProfile;
