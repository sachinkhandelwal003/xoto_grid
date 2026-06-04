import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Row,
  Col,
  Button,
  Tag,
  Space,
  Typography,
  Dropdown,
  Spin,
  Modal,
  Avatar,
  Form,
  Input,
  Select,
  DatePicker,
  TimePicker,
  message,
} from "antd";
import {
  EyeOutlined,
  DownOutlined,
  VideoCameraOutlined,
  CheckCircleFilled,
  StarFilled,
  CalendarOutlined,
  ClockCircleOutlined,
} from "@ant-design/icons";
import { motion } from "framer-motion";

const { Text, Title } = Typography;
const { Option } = Select;
const { TextArea } = Input;

const ProductGrid = ({
  products,
  loading,
  showFilters,
  sortOption,
  setSortOption,
}) => {
  const navigate = useNavigate();
  const location = useLocation();

  const [showAll, setShowAll] = useState(false);
  const queryParams = new URLSearchParams(location.search);
  const selectedCategorySlug = queryParams.get("category");

  // Reset "See More" when category changes
  useEffect(() => {
    setShowAll(false);
  }, [selectedCategorySlug]);

  // Step 1: Filter by category
  const filteredByCategory =
    !showAll && selectedCategorySlug
      ? products.filter((p) => {
          const categoryName = p.category?.name || p.category || "";
          const slug = categoryName
            .toLowerCase()
            .replace(/\s+/g, "-")
            .replace(/&/g, "and");
          return slug === selectedCategorySlug;
        })
      : products;

  // Step 2: Sort the filtered results
  const sortedProducts = [...filteredByCategory].sort((a, b) => {
    const priceA = a.discountedPrice ?? a.price ?? 0;
    const priceB = b.discountedPrice ?? b.price ?? 0;

    switch (sortOption) {
      case "price-low-high":
        return priceA - priceB;
      case "price-high-low":
        return priceB - priceA;
      case "newest":
        return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
      case "most-popular":
      default:
        return (b.rating ?? b.popularity ?? 0) - (a.rating ?? a.popularity ?? 0);
    }
  });

  const [hoveredProduct, setHoveredProduct] = useState(null);
  const [showDesignerModal, setShowDesignerModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(9);
  const [bookingForm] = Form.useForm();

  const sortOptions = [
    { value: "most-popular", label: "Most Popular" },
    { value: "price-low-high", label: "Price: Low to High" },
    { value: "price-high-low", label: "Price: High to Low" },
    { value: "newest", label: "Newest" },
  ];

  const handleSortChange = ({ key }) => {
    setSortOption(key);
    setCurrentPage(1); // Reset to page 1 on sort change
  };

  // Pagination uses sortedProducts
  const totalProducts = sortedProducts.length;
  const totalPages = Math.ceil(totalProducts / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalProducts);
  const paginatedProducts = sortedProducts.slice(startIndex, endIndex);

  const designers = [
    {
      id: 1,
      name: "Sarah Chen",
      specialty: "Modern & Minimalist",
      rating: 4.9,
      experience: "8 years",
      projects: "120+",
      avatarColor: "#8b5cf6",
      description:
        "Specializes in creating functional yet beautiful modern spaces.",
    },
    {
      id: 2,
      name: "Marcus Johnson",
      specialty: "Industrial & Loft",
      rating: 4.7,
      experience: "6 years",
      projects: "85+",
      avatarColor: "#6366f1",
      description: "Expert in transforming industrial spaces into cozy homes.",
    },
    {
      id: 3,
      name: "Elena Rodriguez",
      specialty: "Scandinavian & Bohemian",
      rating: 4.8,
      experience: "7 years",
      projects: "95+",
      avatarColor: "#ec4899",
      description:
        "Creates harmonious spaces blending Scandinavian minimalism with boho warmth.",
    },
  ];

  const handleBookingSubmit = (values) => {
    
    message.success(
      "Consultation booked successfully! Our designer will contact you shortly."
    );
    setShowDesignerModal(false);
    bookingForm.resetFields();
  };

  if (loading)
    return (
      <div className="w-full h-64 flex justify-center items-center">
        <Spin size="large" />
      </div>
    );

  if (sortedProducts.length === 0) {
    return (
      <div className="text-center py-16 w-full">
        <div className="text-4xl mb-4">😔</div>
        <Title level={4} style={{ color: "#64748b" }}>
          No products match your filters
        </Title>
        <Text type="secondary">
          Try adjusting your filters to see more products
        </Text>
        {!showAll && (
          <div className="mt-4">
            <Button onClick={() => setShowAll(true)}>
              Show All Products
            </Button>
          </div>
        )}
      </div>
    );
  }

  // Get current sort label for display
  const currentSortLabel =
    sortOptions.find((o) => o.value === sortOption)?.label || "Most Popular";

  return (
    <div className={`p-6 ${showFilters ? "" : "w-full"}`}>
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 pb-6 border-b border-gray-200 gap-4">
        <div>
          <Text className="text-sm text-gray-600">
            Showing{" "}
            <strong>
              {startIndex + 1}-{endIndex}
            </strong>{" "}
            of <strong>{totalProducts}</strong> products
          </Text>
          {totalProducts > 0 && (
            <Text className="block text-sm text-green-600 mt-1">
              <CheckCircleFilled className="mr-2" />
              {totalProducts} products available
            </Text>
          )}
        </div>
        <Space className="w-full md:w-auto">
          <Dropdown
            menu={{
              items: sortOptions.map((o) => ({ key: o.value, label: o.label })),
              onClick: handleSortChange,
              selectedKeys: [sortOption],
            }}
            placement="bottomRight"
          >
            <Button size="large" className="rounded-lg w-full md:w-auto">
              {currentSortLabel} <DownOutlined className="ml-2" />
            </Button>
          </Dropdown>
        </Space>
      </div>

      {/* Grid */}
      <Row gutter={[24, 32]}>
        {paginatedProducts.map((product, index) => {
          const discountPercent =
            product.price && product.discountedPrice
              ? Math.round(
                  ((product.price - product.discountedPrice) / product.price) *
                    100
                )
              : 32;

          const productPrice = product.discountedPrice || 12999;
          const productMrp = product.price || 18999;

          return (
            <Col
              xs={24}
              sm={12}
              md={8}
              lg={showFilters ? 8 : 6}
              key={product._id || index}
            >
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <div
                  className="bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all h-full flex flex-col border border-gray-100"
                  onMouseEnter={() => setHoveredProduct(product._id || index)}
                  onMouseLeave={() => setHoveredProduct(null)}
                >
                  <div className="relative pt-[85%] bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden">
                    <img
                      src={
                        product.photos?.[0] ||
                        "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?q=80&w=2070&auto=format&fit=crop"
                      }
                      alt={product.name || "Nordic Oak Coffee Table"}
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                    <Tag
                      color="white"
                      className="absolute top-3 left-3 px-3 py-0.5 rounded-lg border-none text-[#52c41a] font-bold text-xs shadow-sm"
                    >
                      New
                    </Tag>
                  </div>

                  <div className="p-5 flex flex-col flex-grow">
                    <Title
                      level={4}
                      className="mb-2 !text-lg !font-bold !text-gray-900 line-clamp-1"
                    >
                      {product.name || "Nordic Oak Coffee Table"}
                    </Title>

                    <Text className="text-gray-600 text-sm mb-4 leading-relaxed line-clamp-2">
                      {product.description ||
                        "Minimalist Scandinavian design with solid oak legs."}
                    </Text>

                    <div className="flex items-center gap-3 mb-4">
                      <Text className="text-2xl font-bold text-gray-900">
                        AED{productPrice.toLocaleString()}
                      </Text>
                      <Text delete className="text-base text-gray-500">
                        AED{productMrp.toLocaleString()}
                      </Text>
                      <Tag
                        color="green"
                        className="ml-1 border-none bg-green-50 text-green-600 font-bold text-xs px-2 py-0.5 rounded"
                      >
                        {discountPercent}% OFF
                      </Tag>
                    </div>

                    <div className="flex items-center gap-3 mb-4">
                      <Text className="text-sm text-gray-600 font-medium">
                        Colors:
                      </Text>
                      <div className="flex gap-2">
                        <div
                          className="w-6 h-6 rounded-full border-2 border-white shadow-md"
                          style={{
                            background:
                              "linear-gradient(135deg, #a16207 0%, #d97706 100%)",
                            boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                          }}
                          title="Wood"
                        />
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 mb-6">
                      <Tag className="bg-gray-100 text-gray-700 border-none rounded-md px-3 py-1 font-medium text-sm">
                        Wood
                      </Tag>
                      <Tag className="bg-yellow-50 text-yellow-700 border-none rounded-md px-3 py-1 font-medium text-sm">
                        Tables
                      </Tag>
                      <Tag className="bg-blue-50 text-blue-600 border-none rounded-md px-3 py-1 font-medium text-sm">
                        xoto
                      </Tag>
                    </div>

                    <div className="flex gap-3 mt-auto">
                      <Button
                        size="large"
                        className="flex-[2] rounded-xl h-12 font-bold !text-white border-none flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
                        style={{
                          background:
                            "linear-gradient(135deg, #5C039B 0%, #6366f1 100%)",
                        }}
                        icon={<EyeOutlined />}
                        onClick={() =>
                          product._id &&
                          navigate(`/ecommerce/product/${product._id}`)
                        }
                      >
                        View Details
                      </Button>
                      <Button
                        size="large"
                        className="flex-1 rounded-xl h-12 flex items-center justify-center text-gray-600 font-semibold border border-gray-300 hover:border-purple-400 hover:text-purple-600 bg-white"
                        icon={<VideoCameraOutlined />}
                        onClick={() => setShowDesignerModal(true)}
                      >
                        AR Preview
                      </Button>
                    </div>
                  </div>
                </div>
              </motion.div>
            </Col>
          );
        })}
      </Row>

      {/* SEE MORE BUTTON */}
      {!showAll &&
        selectedCategorySlug &&
        products.length > filteredByCategory.length && (
          <div className="flex justify-center mt-12">
            <Button
              onClick={() => setShowAll(true)}
              size="large"
              className="px-10 h-12 rounded-xl font-bold border-2 border-[#5C039B] text-[#5C039B] hover:bg-[#5C039B] hover:text-white transition-all"
            >
              See More Products
            </Button>
          </div>
        )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex flex-col items-center mt-12 space-y-6">
          <div className="flex flex-wrap justify-center gap-2">
            <Button
              onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              style={{ borderRadius: "8px" }}
            >
              Previous
            </Button>

            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNum;
              if (totalPages <= 5) pageNum = i + 1;
              else if (currentPage <= 3) pageNum = i + 1;
              else if (currentPage >= totalPages - 2)
                pageNum = totalPages - 4 + i;
              else pageNum = currentPage - 2 + i;

              return (
                <button
                  key={pageNum}
                  onClick={() => setCurrentPage(pageNum)}
                  className={`px-4 py-2 rounded-lg font-medium transition-all ${
                    currentPage === pageNum
                      ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}

            <Button
              onClick={() =>
                setCurrentPage((prev) => Math.min(totalPages, prev + 1))
              }
              disabled={currentPage === totalPages}
              style={{ borderRadius: "8px" }}
            >
              Next
            </Button>
          </div>
          <Text className="text-sm text-gray-600">
            Page {currentPage} of {totalPages} • {totalProducts} products
          </Text>
        </div>
      )}

      {/* Modal */}
      <Modal
        title={
          <div className="text-center">
            <Title
              level={3}
              style={{ color: "#5C039B", marginBottom: "4px" }}
            >
              <VideoCameraOutlined className="mr-3" />
              Book a Design Consultation
            </Title>
            <Text type="secondary">
              Free 30-minute session with our expert designers
            </Text>
          </div>
        }
        open={showDesignerModal}
        onCancel={() => setShowDesignerModal(false)}
        footer={null}
        width={800}
        centered
        style={{ maxWidth: "95vw" }}
      >
        {/* Modal content */}
      </Modal>
    </div>
  );
};

ProductGrid.propTypes = {
  products: PropTypes.array.isRequired,
  loading: PropTypes.bool,
  showFilters: PropTypes.bool,
  sortOption: PropTypes.string,
  setSortOption: PropTypes.func,
};

export default React.memo(ProductGrid);