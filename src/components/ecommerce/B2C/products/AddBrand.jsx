import React, { useState, useEffect } from 'react';
import {
  Button, Modal, Form, Input, Popconfirm, Card,
  Typography, Row, Col, Statistic, Space, Divider,
  message, notification, Upload, Switch, Tag
} from 'antd';

import {
  PlusOutlined, ShopOutlined, LinkOutlined,
  DeleteOutlined, EditOutlined, SearchOutlined,
  GlobalOutlined, CheckOutlined, CloseOutlined
} from '@ant-design/icons';

import { apiService } from "../../../../manageApi/utils/custom.apiservice";
// 👇 Aapki custom table import kar li hai
import CustomTable from '../../../../components/CMS/pages/custom/CustomTable';

const { Title, Text } = Typography;
const { TextArea } = Input;

const THEME = {
  primary: "#7c3aed"
};

// --- HELPER ---
const getBase64 = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
  });

const CreateBrand = () => {

  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchText, setSearchText] = useState('');

  const [modalVisible, setModalVisible] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [form] = Form.useForm();

  const [fileList, setFileList] = useState([]);

  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState('');
  const [previewTitle, setPreviewTitle] = useState('');

  // ================= FETCH BRANDS =================
  const fetchBrands = async (page = 1, limit = 10, search = '') => {

    setLoading(true);

    try {

      const resData = await apiService.get(
        "/products/get-all-brand",
        { page, limit, search: search || undefined }
      );

      if (resData.success) {
        setBrands(resData.data || []);
        setTotal(resData.pagination?.total || 0);
      }

    } catch (err) {

      console.error(err);

    } finally {

      setLoading(false);

    }

  };

  useEffect(() => {

    const delay = setTimeout(() => {
      fetchBrands(currentPage, pageSize, searchText);
    }, 400);

    return () => clearTimeout(delay);

  }, [currentPage, pageSize, searchText]);

  // ================= FETCH SINGLE BRAND =================
  const fetchBrandById = async (id) => {

    setLoading(true);

    try {

      const resData = await apiService.get(
        "/products/get-brand-by-id",
        { id }
      );

      if (resData.success && resData.data) {

        const brand = resData.data;

        form.setFieldsValue({
          brandName: brand.brandName,
          websiteUrl: brand.websiteUrl,
          country: brand.country,
          description: brand.description,
          isActive: brand.isActive
        });

        if (brand.photo) {

          setFileList([
            {
              uid: "-1",
              name: "logo.png",
              status: "done",
              url: brand.photo
            }
          ]);

        } else {

          setFileList([]);

        }

        setEditingId(brand._id);
        setModalVisible(true);

      }

    } catch (err) {

      message.error("Failed to fetch details");

    } finally {

      setLoading(false);

    }

  };

  // ================= IMAGE PREVIEW =================
  const handlePreview = async (file) => {

    if (!file.url && !file.preview) {
      file.preview = await getBase64(file.originFileObj);
    }

    setPreviewImage(file.url || file.preview);
    setPreviewOpen(true);
    setPreviewTitle(file.name || '');

  };

  const handleChange = ({ fileList: newFileList }) => setFileList(newFileList);

  // ================= UPLOAD IMAGE =================
  const uploadImageFile = async (file) => {

    const formData = new FormData();
    formData.append("file", file);

    try {

      const res = await apiService.post(
        "/upload",
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      return res?.file?.url || res?.url || res?.data;

    } catch (error) {

      throw new Error("Upload failed");

    }

  };

  // ================= SAVE BRAND =================
  const handleSave = async (values) => {

    setSaving(true);

    try {

      let finalPhotoUrl = "";

      const hasNewFile = fileList.length > 0 && fileList[0].originFileObj;
      const hasExistingUrl = fileList.length > 0 && fileList[0].url;

      if (hasNewFile) {

        finalPhotoUrl = await uploadImageFile(fileList[0].originFileObj);

      } else if (hasExistingUrl) {

        finalPhotoUrl = fileList[0].url;

      }

      const payload = {
        brandName: values.brandName,
        websiteUrl: values.websiteUrl,
        country: values.country,
        description: values.description,
        isActive: values.isActive,
        photo: finalPhotoUrl
      };

      let response;

      if (editingId) {

        response = await apiService.post(
          "/products/edit-brand-by-id",
          payload,
          { id: editingId }
        );

      } else {

        response = await apiService.post(
          "/products/create-brand",
          payload
        );

      }

      if (response.success) {

        notification.success({
          message: "Success",
          description: "Brand saved successfully"
        });

        closeModal();
        fetchBrands(currentPage, pageSize);

      }

    } catch (err) {

      message.error("Failed to save brand");

    } finally {

      setSaving(false);

    }

  };

  // ================= DELETE BRAND =================
  const deleteBrand = async (id) => {

    try {

      setLoading(true);

      const res = await apiService.post(
        "/products/delete-brand-by-id",
        {},
        { id }
      );

      if (res.success) {

        message.success("Brand deleted");
        fetchBrands(currentPage, pageSize, searchText);

      }

    } catch (err) {

      message.error("Delete failed");

    } finally {

      setLoading(false);

    }

  };

  // ================= MODAL CLOSE =================
  const closeModal = () => {

    setModalVisible(false);
    setEditingId(null);
    setFileList([]);
    form.resetFields();

  };

  const uploadButton = (
    <div>
      <PlusOutlined />
      <div style={{ marginTop: 8 }}>Upload</div>
    </div>
  );

  // ================= TABLE COLUMNS =================
  // CustomTable "key" property par depend karti hai values map karne ke liye, 
  // isliye har object mein `key` add kar diya gaya hai.
  const columns = [
    {
      title: "Logo",
      dataIndex: "photo",
      key: "photo", 
      render: (photo) => (
        <div style={{ width: 60, height: 60 }}>
          {photo ? (
            <img
              src={photo}
              style={{ width: "100%", height: "100%", objectFit: "contain" }}
            />
          ) : (
            <ShopOutlined />
          )}
        </div>
      )
    },
    {
      title: "Brand",
      dataIndex: "brandName",
      key: "brandName",
      sortable: true,
      render: (text, record) => (
        <>
          <Text strong>{text}</Text>
          <div>
            <Text type="secondary">
              <GlobalOutlined /> {record.country}
            </Text>
          </div>
        </>
      )
    },
    {
      title: "Status",
      dataIndex: "isActive",
      key: "isActive",
      render: (isActive) => (
        <Tag color={isActive ? "success" : "error"}>
          {isActive ? "Active" : "Inactive"}
        </Tag>
      )
    },
    {
      title: "Website",
      dataIndex: "websiteUrl",
      key: "websiteUrl",
      render: (url) =>
        url ? (
          <a href={url} target="_blank" rel="noreferrer">
            <LinkOutlined /> Visit
          </a>
        ) : (
          "-"
        )
    },
    {
      title: "Action",
      key: "actions",
      render: (_, record) => (
        <Space>
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => fetchBrandById(record._id || record.id)}
          />
          <Popconfirm
            title="Delete?"
            onConfirm={() => deleteBrand(record._id || record.id)}
          >
            <Button danger type="text" icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      )
    }
  ];

  return (

    <div className="p-6 bg-gray-50 min-h-screen">

      <div className="flex justify-between mb-6">

        <Title level={3} style={{ margin: 0 }}>Brand Management</Title>

        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => {
            setEditingId(null);
            form.resetFields();
            form.setFieldsValue({ isActive: true });
            setModalVisible(true);
          }}
          style={{ background: THEME.primary }}
        >
          Add Brand
        </Button>

      </div>

      {/* 👇 Yahan par AntD Table aur Search ki jagah CustomTable daal di hai */}
      <CustomTable 
        columns={columns}
        data={brands}
        loading={loading}
        totalItems={total}
        currentPage={currentPage}
        itemsPerPage={pageSize}
        onPageChange={(page, size) => {
          setCurrentPage(page);
          setPageSize(size);
        }}
        onFilter={(filters) => {
          setSearchText(filters.search || '');
          setCurrentPage(1); // Jab bhi search karega toh page 1 par wapas aayega
        }}
      />

      <Modal
        title={editingId ? "Edit Brand" : "Create Brand"}
        open={modalVisible}
        onCancel={closeModal}
        footer={null}
      >

        <Form
          form={form}
          layout="vertical"
          onFinish={handleSave}
          initialValues={{ isActive: true }}
        >

          <Form.Item
            name="brandName"
            label="Brand Name"
            rules={[{ required: true }]}
          >
            <Input />
          </Form.Item>

          <Form.Item name="country" label="Country">
            <Input />
          </Form.Item>

          <Form.Item name="websiteUrl" label="Website">
            <Input />
          </Form.Item>

          <Form.Item name="isActive" label="Status" valuePropName="checked">
            <Switch />
          </Form.Item>

          <Form.Item label="Logo">

            <Upload
              listType="picture-card"
              fileList={fileList}
              onPreview={handlePreview}
              onChange={handleChange}
              beforeUpload={() => false}
              maxCount={1}
            >
              {fileList.length >= 1 ? null : uploadButton}
            </Upload>

          </Form.Item>

          <Form.Item name="description" label="Description">
            <TextArea rows={3} />
          </Form.Item>

          <div className="flex justify-end gap-3">

            <Button onClick={closeModal}>Cancel</Button>

            <Button
              type="primary"
              htmlType="submit"
              loading={saving}
              style={{ background: THEME.primary }}
            >
              {editingId ? "Update Brand" : "Create Brand"}
            </Button>

          </div>

        </Form>

      </Modal>

      <Modal
        open={previewOpen}
        footer={null}
        title={previewTitle}
        onCancel={() => setPreviewOpen(false)}
      >
        <img src={previewImage} style={{ width: "100%" }} alt="preview" />
      </Modal>

    </div>

  );

};

export default CreateBrand;