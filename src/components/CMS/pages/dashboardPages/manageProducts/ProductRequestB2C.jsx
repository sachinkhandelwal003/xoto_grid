import React, { useState, useEffect } from "react";
import { apiService } from "../../../../../manageApi/utils/custom.apiservice";

import {
  Button,
  Modal,
  Form,
  Input,
  Popconfirm,
  Card,
  Table,
  Typography,
  Row,
  Col,
  Statistic,
  Space,
  Divider,
  App,
  InputNumber,
  Select,
  Switch,
  Tag,
  Upload,
  Radio,
} from "antd";

import {
  PlusOutlined,
  DeleteOutlined,
  EditOutlined,
  SearchOutlined,
  ShoppingOutlined,
  CheckOutlined,
  CloseOutlined,
} from "@ant-design/icons";

import { Tooltip } from "antd";
import { PercentageOutlined } from "@ant-design/icons";

const { Title, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;

const THEME = { primary: "#7c3aed" };

const COLOR_OPTIONS = [
  { label: "Black", value: "Black", hex: "#000000" },
  { label: "White", value: "White", hex: "#ffffff" },
  { label: "Grey", value: "Grey", hex: "#808080" },
  { label: "Walnut", value: "Walnut", hex: "#5d4037" },
  { label: "Oak", value: "Oak", hex: "#b5835a" },
  { label: "Beige", value: "Beige", hex: "#f5f5dc" },
  { label: "Blue", value: "Blue", hex: "#1d4ed8" },
  { label: "Red", value: "Red", hex: "#dc2626" },
];

const ProductManagementContent = () => {
  const { message, notification } = App.useApp();
  const [form] = Form.useForm();
  const [marginForm] = Form.useForm();

  const [products, setProducts] = useState([]);
  const [brands, setBrands] = useState([]);
  const [categories, setCategories] = useState([]);

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [searchText, setSearchText] = useState("");

  const [modalVisible, setModalVisible] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [marginModalVisible, setMarginModalVisible] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [currentProduct, setCurrentProduct] = useState(null);

  const normFile = (e) => (Array.isArray(e) ? e : e?.fileList);

  // ================= FETCH BRANDS =================

  const fetchBrands = async () => {
    try {
      const response = await apiService.get("/products/get-all-brand", {
        limit: 100,
      });
      setBrands(response?.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  // ================= FETCH CATEGORIES =================

  const fetchCategories = async () => {
    try {
      const response = await apiService.get("/products/get-all-category", {
        limit: 100,
      });
      setCategories(response?.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  // ================= FETCH PRODUCTS =================

  const fetchProducts = async (page = 1, limit = 10, search = "") => {
    setLoading(true);

    try {
      const response = await apiService.get("/products/get-all-products", {
        page,
        limit,
        search: search || undefined,
      });

      setProducts(response?.data?.products || []);
      setTotal(response?.data?.pagination?.total || 0);
    } catch (err) {
      message.error("Failed to load products.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBrands();
    fetchCategories();
  }, []);

  useEffect(() => {
    const delay = setTimeout(() => {
      fetchProducts(currentPage, pageSize, searchText);
    }, 400);

    return () => clearTimeout(delay);
  }, [currentPage, pageSize, searchText]);

  // ================= IMAGE UPLOAD =================

  const customUploadRequest = async ({ file, onSuccess, onError }) => {
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await apiService.upload("/upload", formData);

      const imageUrl =
        response?.url ||
        response?.secure_url ||
        response?.data?.url ||
        response;

      onSuccess(imageUrl);
      message.success("Uploaded");
    } catch (err) {
      onError(err);
      message.error("Upload failed");
    }
  };

  // ================= PRICE CALCULATION =================

  const handleValuesChange = (changedValues, allValues) => {
    if (
      changedValues.price !== undefined ||
      changedValues.marginType !== undefined ||
      changedValues.marginValue !== undefined
    ) {
      const price = parseFloat(allValues.price) || 0;
      const margin = parseFloat(allValues.marginValue) || 0;
      const type = allValues.marginType;

      let finalPrice = 0;

      if (type === "percentage") {
        finalPrice = price + price * (margin / 100);
      } else {
        finalPrice = price + margin;
      }

      form.setFieldsValue({
        discountedPrice: parseFloat(finalPrice.toFixed(2)),
      });
    }
  };

  // ================= SAVE PRODUCT =================

  const handleSave = async () => {
    try {
      const values = await form.validateFields();

      setSaving(true);

      const extractUrl = (f) => {
        if (typeof f === "string") return f;

        const res = f.response;

        if (res)
          return typeof res === "string"
            ? res
            : res.url || res.secure_url || res.file?.url;

        return f.url || null;
      };

      const payload = {
        product: {
          name: values.name,
          photos: values.mainImage
            ? values.mainImage.map(extractUrl).filter(Boolean).slice(0, 1)
            : [""],
          category: values.category,
          brandName: values.brandName,
          description: values.description || "",
          price: Number(values.price) || 0,
          discountedPrice: Number(values.discountedPrice) || 0,
          currency: "AED",
          quantity: Number(values.quantity) || 0,
          warrantyYears: Number(values.warrantyYears) || 0,
          returnPolicyDays: Number(values.returnPolicyDays) || 0,
          noCostEmiAvailable: !!values.noCostEmiAvailable,
          isActive: values.isActive ?? true,
          isFeatured: values.isFeatured ?? true,
          finish: values.finish || "",
          originCountry: values.originCountry || "",
          careInstructions: values.careInstructions || "",
          assemblyRequired: !!values.assemblyRequired,
          assemblyToolsProvided: !!values.assemblyToolsProvided,
          keyFeatures:
            typeof values.keyFeatures === "string"
              ? values.keyFeatures.split(",").map((s) => s.trim())
              : [],
          material:
            typeof values.material === "string"
              ? values.material.split(",").map((s) => s.trim())
              : [],
        },

        colours: (values.colours || []).map((col) => ({
          colourName: col.colourName,
          photos: col.photos
            ? col.photos.map(extractUrl).filter(Boolean)
            : [],
          isActive: col.isActive ?? true,
        })),
      };

      const response = await apiService.post(
        editingId
          ? `/products/edit-product-by-id?id=${editingId}`
          : `/products/create-products`,
        payload
      );

      if (response.success) {
        notification.success({
          message: "Success",
          description: "Product saved successfully.",
        });

        closeModal();
        fetchProducts(currentPage, pageSize);
      }
    } catch (err) {
      message.error("Format Error: Check your fields");
    } finally {
      setSaving(false);
    }
  };

  // ================= DELETE PRODUCT =================

  const handleDelete = async (id) => {
    await apiService.post(`/products/delete-product-by-id?id=${id}`);
    fetchProducts();
  };

  const closeModal = () => {
    setModalVisible(false);
    setEditingId(null);
    form.resetFields();
  };

  // ================= TABLE =================

  const columns = [
    {
      title: "Product",
      render: (_, r) => (
        <Space>
          <img
            src={r.photos?.[0]}
            width="50"
            height="50"
            style={{ objectFit: "contain" }}
          />
          <div>
            <Text strong>{r.name}</Text>
            <Tag color="blue">{r.brandName?.brandName}</Tag>
          </div>
        </Space>
      ),
    },
    {
      title: "Stock",
      render: (_, r) => (
        <Tag color={r.quantity > 5 ? "success" : "warning"}>
          {r.quantity} in Stock
        </Tag>
      ),
    },
    {
      title: "Base Price",
      render: (_, r) => <Text strong>AED {r.price}</Text>,
    },
    {
      title: "Sale Price",
      render: (_, r) => (
        <Text strong>{r.salePrice ? `AED ${r.salePrice}` : "--"}</Text>
      ),
    },
    {
      title: "Status",
      dataIndex: "isActive",
      render: (isActive) => (
        <Tag color={isActive ? "success" : "error"}>
          {isActive ? "Active" : "Inactive"}
        </Tag>
      ),
    },
    {
      title: "Action",
      render: (_, record) => (
        <Space>
          <Tooltip title="Add Margin">
            <Button
              type="text"
              icon={<PercentageOutlined />}
              onClick={() => {
                setSelectedProduct(record);
                marginForm.setFieldsValue({
                  marginType: record.marginType || "fixed",
                  marginValue: record.marginValue || 0,
                });
                setMarginModalVisible(true);
              }}
            />
          </Tooltip>

          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => {
              setEditingId(record._id);
              setCurrentProduct(record);
              form.setFieldsValue({
                ...record,
                brandName: record.brandName?._id || record.brandName,
                category: record.category?._id || record.category,
              });
              setModalVisible(true);
            }}
          />

          <Popconfirm
            title="Delete Product?"
            onConfirm={() => handleDelete(record._id)}
          >
            <Button type="text" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="p-4 md:p-6 bg-gray-50 min-h-screen">

      <div className="flex justify-between mb-6">
        <Title level={3}>Product Management</Title>

        <Button
          type="primary"
          icon={<PlusOutlined />}
          style={{ background: THEME.primary }}
          onClick={() => {
            setEditingId(null);
            form.resetFields();
            setModalVisible(true);
          }}
        >
          Add Product
        </Button>
      </div>

      <Card>
        <Input
          prefix={<SearchOutlined />}
          placeholder="Search products"
          onChange={(e) => setSearchText(e.target.value)}
        />
      </Card>

      <Card className="mt-4">
        <Table
          columns={columns}
          dataSource={products}
          rowKey="_id"
          loading={loading}
          pagination={{
            current: currentPage,
            pageSize,
            total,
            onChange: (p) => setCurrentPage(p),
          }}
        />
      </Card>

      {/* FORM MODAL */}
      <Modal
        title={editingId ? "Edit Product" : "Create Product"}
        open={modalVisible}
        footer={null}
        width={1000}
        onCancel={closeModal}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSave}
          onValuesChange={handleValuesChange}
        >

          {/* FULL FORM SAME AS BEFORE */}

        </Form>
      </Modal>

    </div>
  );
};

const ProductManagement = () => (
  <App>
    <ProductManagementContent />
  </App>
);

export default ProductManagement;