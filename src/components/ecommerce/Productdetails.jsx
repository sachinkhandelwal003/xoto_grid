import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiArrowLeft, FiShoppingCart, FiHeart, FiShare2,
  FiStar, FiTruck, FiShield, FiRefreshCw,
  FiMinus, FiPlus, FiCheck, FiChevronLeft, FiChevronRight,
  FiTag, FiPackage, FiInfo,
} from "react-icons/fi";
import { apiService } from "../../manageApi/utils/custom.apiservice";
import { toast } from "react-toastify";

/* ─────────────────────────────────────────────────
   SKELETON LOADER
───────────────────────────────────────────────── */
const Skeleton = ({ className }) => (
  <div className={`animate-pulse bg-gray-200 rounded-xl ${className}`} />
);

/* ─────────────────────────────────────────────────
   PRODUCT DETAIL PAGE
───────────────────────────────────────────────── */
const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, token } = useSelector((s) => s.auth);
  const customerId = user?._id || user?.id;

  const [product, setProduct]             = useState(null);
  const [loading, setLoading]             = useState(true);
  const [selectedColor, setSelectedColor] = useState(null);
  const [activeImage, setActiveImage]     = useState(0);
  const [quantity, setQuantity]           = useState(1);
  const [cartItem, setCartItem]           = useState(null);
  const [adding, setAdding]               = useState(false);
  const [updating, setUpdating]           = useState(false);
  const [isLiked, setIsLiked]             = useState(false);
  const [tab, setTab]                     = useState("description");

  // ── Fetch product ──────────────────────────────
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const res = await apiService.get(`/products/get-product-by-id?id=${id}`);
        const data = res?.data?.data || res?.data;
        setProduct(data);
        if (data?.ProductColors?.length > 0) {
          setSelectedColor(data.ProductColors[0]);
        }
      } catch {
        toast.error("Failed to load product");
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchProduct();
  }, [id]);

  // ── Check if already in cart ───────────────────
  useEffect(() => {
    if (!customerId || !token || !product) return;
    const checkCart = async () => {
      try {
        const res = await apiService.get(`/products/cart/get?customerId=${customerId}`);
        const items = res?.data?.items || res?.items || [];
        const found = items.find(i => {
          const pid = i.productId?._id?.toString() || i.productId?.toString();
          return pid === product._id?.toString();
        });
        if (found) {
          setCartItem(found);
          setQuantity(found.quantity || 1);
        } else {
          setCartItem(null);
          setQuantity(1);
        }
      } catch {
        setCartItem(null);
      }
    };
    checkCart();
  }, [product, customerId, token]);

  // ── Images ─────────────────────────────────────
  const images = selectedColor?.photos?.length > 0
    ? selectedColor.photos
    : product?.photos || [];

  // ── Price ──────────────────────────────────────
  const price = product?.discountedPrice > 0
    ? product.discountedPrice
    : product?.salePrice > 0
    ? product.salePrice
    : product?.price || 0;

  const originalPrice = product?.price || 0;
  const discount = originalPrice > price && originalPrice > 0
    ? Math.round((1 - price / originalPrice) * 100)
    : 0;

  // ── Add to cart ────────────────────────────────
  const handleAddToCart = async () => {
    if (!token || !user) {
      toast.error("Please login first");
      navigate("/user/login");
      return;
    }
    setAdding(true);
    try {
      const payload = {
        productId: product._id,
        customerId,
        quantity: 1,
        ...(selectedColor?._id && { productColorId: selectedColor._id }),
      };
      const res = await apiService.post("/products/cart/add", payload);
      const item = res?.data?.data || res?.data;
      setCartItem({ ...item, productId: product, quantity: 1 });
      setQuantity(1);
      toast.success("Added to cart! 🛒");
    } catch (err) {
      toast.error(err?.message || "Failed to add to cart");
    } finally {
      setAdding(false);
    }
  };

  // ── Update quantity ────────────────────────────
  const handleUpdateQuantity = async (newQty) => {
    if (newQty < 1) {
      handleRemoveFromCart();
      return;
    }
    setUpdating(true);
    setQuantity(newQty);
    try {
      await apiService.put("/products/cart/update", {
        cartItemId: cartItem._id,
        quantity: newQty,
      });
      setCartItem(prev => ({ ...prev, quantity: newQty }));
    } catch {
      setQuantity(cartItem.quantity);
      toast.error("Failed to update");
    } finally {
      setUpdating(false);
    }
  };

  // ── Remove from cart ───────────────────────────
  const handleRemoveFromCart = async () => {
    setUpdating(true);
    try {
      await apiService.delete(`/products/cart/remove?cartItemId=${cartItem._id}`);
      setCartItem(null);
      setQuantity(1);
      toast.success("Removed from cart");
    } catch {
      toast.error("Failed to remove");
    } finally {
      setUpdating(false);
    }
  };

  // ── Image nav ──────────────────────────────────
  const prevImage = () => setActiveImage(i => i === 0 ? images.length - 1 : i - 1);
  const nextImage = () => setActiveImage(i => i === images.length - 1 ? 0 : i + 1);

  // ── Color change ───────────────────────────────
  const handleColorSelect = (color) => {
    setSelectedColor(color);
    setActiveImage(0);
  };

  const inCart = !!cartItem;

  /* ─── LOADING ─────────────────────────────────── */
  if (loading) return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="max-w-6xl mx-auto px-4 grid grid-cols-1 lg:grid-cols-2 gap-12">
        <div className="space-y-4">
          <Skeleton className="aspect-square w-full" />
          <div className="flex gap-3">
            {[1,2,3,4].map(i => <Skeleton key={i} className="w-20 h-20 flex-shrink-0" />)}
          </div>
        </div>
        <div className="space-y-5 pt-4">
          <Skeleton className="h-5 w-28" />
          <Skeleton className="h-10 w-3/4" />
          <Skeleton className="h-6 w-1/2" />
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-14 w-full" />
        </div>
      </div>
    </div>
  );

  /* ─── NOT FOUND ───────────────────────────────── */
  if (!product) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="text-6xl mb-4">📦</div>
        <h2 className="text-2xl font-bold text-gray-700 mb-2">Product Not Found</h2>
        <button onClick={() => navigate(-1)}
          className="mt-4 px-6 py-2.5 bg-purple-600 text-white rounded-xl font-semibold">
          Go Back
        </button>
      </div>
    </div>
  );

  /* ─── MAIN UI ─────────────────────────────────── */
  return (
    <div className="min-h-screen bg-gray-50">

      {/* Breadcrumb */}
      <div className="max-w-6xl mx-auto px-4 pt-6 pb-2">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-500 hover:text-purple-600 
                     transition text-sm font-medium group"
        >
          <FiArrowLeft size={16} className="group-hover:-translate-x-1 transition" />
          Back to Products
        </button>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">

          {/* ══ LEFT — Image Gallery ══ */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4 }}
          >
            {/* Main image */}
            <div
              className="relative bg-white rounded-2xl overflow-hidden aspect-square shadow-sm"
              style={{ border: "1px solid rgba(0,0,0,0.07)" }}
            >
              <AnimatePresence mode="wait">
                <motion.img
                  key={images[activeImage] || "placeholder"}
                  src={images[activeImage] || "https://placehold.co/600x600?text=No+Image"}
                  alt={product.name}
                  initial={{ opacity: 0, scale: 1.02 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.25 }}
                  className="w-full h-full object-contain p-6"
                />
              </AnimatePresence>

              {/* Discount badge */}
              {discount > 0 && (
                <div className="absolute top-4 left-4">
                  <span className="bg-red-500 text-white text-xs font-bold 
                                   px-2.5 py-1 rounded-lg flex items-center gap-1">
                    <FiTag size={11} /> {discount}% OFF
                  </span>
                </div>
              )}

              {/* Featured badge */}
              {product.isFeatured && (
                <div className="absolute top-4 right-4">
                  <span className="bg-purple-600 text-white text-xs font-bold px-2.5 py-1 rounded-lg">
                    FEATURED
                  </span>
                </div>
              )}

              {/* Nav arrows */}
              {images.length > 1 && (
                <>
                  <button onClick={prevImage}
                    className="absolute left-3 top-1/2 -translate-y-1/2 
                               bg-white/90 hover:bg-white p-2 rounded-full shadow-md 
                               transition hover:scale-110">
                    <FiChevronLeft size={18} />
                  </button>
                  <button onClick={nextImage}
                    className="absolute right-3 top-1/2 -translate-y-1/2 
                               bg-white/90 hover:bg-white p-2 rounded-full shadow-md 
                               transition hover:scale-110">
                    <FiChevronRight size={18} />
                  </button>
                </>
              )}

              {/* Like + Share */}
              <div className="absolute bottom-4 right-4 flex flex-col gap-2">
                <button
                  onClick={() => setIsLiked(v => !v)}
                  className="bg-white p-2 rounded-full shadow-md hover:scale-110 transition"
                >
                  <FiHeart size={16}
                    className={isLiked ? "text-red-500 fill-red-500" : "text-gray-400"} />
                </button>
                <button className="bg-white p-2 rounded-full shadow-md hover:scale-110 transition">
                  <FiShare2 size={16} className="text-gray-400" />
                </button>
              </div>
            </div>

            {/* Thumbnails */}
            {images.length > 1 && (
              <div className="flex gap-3 mt-4 overflow-x-auto pb-1">
                {images.map((img, idx) => (
                  <button key={idx} onClick={() => setActiveImage(idx)}
                    className={`flex-shrink-0 rounded-xl overflow-hidden transition-all duration-200
                                ${idx === activeImage
                                  ? "ring-2 ring-purple-600 ring-offset-2 scale-105"
                                  : "opacity-60 hover:opacity-100"}`}
                    style={{ width: 68, height: 68, border: "1px solid rgba(0,0,0,0.08)" }}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}

            {/* Dot indicators */}
            {images.length > 1 && (
              <div className="flex justify-center gap-1.5 mt-3">
                {images.map((_, idx) => (
                  <button key={idx} onClick={() => setActiveImage(idx)}
                    className={`h-1.5 rounded-full transition-all duration-300
                                ${idx === activeImage ? "w-6 bg-purple-600" : "w-1.5 bg-gray-300"}`}
                  />
                ))}
              </div>
            )}
          </motion.div>

          {/* ══ RIGHT — Product Info ══ */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="space-y-6"
          >
            {/* Brand + Category */}
            <div className="flex items-center gap-3 flex-wrap">
              {product.brandName?.brandName && (
                <span className="text-xs font-bold text-purple-600 bg-purple-50 
                                 border border-purple-200 px-3 py-1 rounded-full uppercase tracking-wide">
                  {product.brandName.brandName}
                </span>
              )}
              {product.category?.name && (
                <span className="text-xs font-medium text-gray-500 bg-gray-100 
                                 px-3 py-1 rounded-full">
                  {product.category.name}
                </span>
              )}
            </div>

            {/* Product name */}
            <div>
              <h1 className="text-3xl font-bold text-gray-900 leading-tight">
                {product.name}
              </h1>
              {product.originCountry && (
                <p className="text-sm text-gray-400 mt-1.5">
                  Origin: {product.originCountry}
                </p>
              )}
            </div>

            {/* Rating + Stock */}
            <div className="flex items-center gap-4 flex-wrap">
              <div className="flex items-center gap-1 bg-amber-50 border border-amber-200 
                              px-3 py-1.5 rounded-xl">
                {[1,2,3,4,5].map(s => (
                  <FiStar key={s} size={13}
                    className={s <= 4 ? "text-amber-400 fill-amber-400" : "text-gray-300"} />
                ))}
                <span className="text-sm font-bold text-amber-700 ml-1">4.8</span>
              </div>
              <span className={`text-sm font-semibold px-3 py-1.5 rounded-xl
                ${product.quantity > 0
                  ? "bg-green-50 text-green-700 border border-green-200"
                  : "bg-red-50 text-red-600 border border-red-200"}`}>
                {product.quantity > 0 ? `✓ In Stock (${product.quantity})` : "✗ Out of Stock"}
              </span>
            </div>

            {/* Price */}
            <div className="bg-white rounded-2xl p-5"
              style={{ border: "1px solid rgba(0,0,0,0.07)", boxShadow: "0 2px 12px rgba(92,3,155,0.07)" }}>
              <div className="flex items-baseline gap-3 flex-wrap">
                <span className="text-4xl font-black text-gray-900">
                  AED {Number(price).toFixed(2)}
                </span>
                {discount > 0 && (
                  <>
                    <span className="text-xl line-through text-gray-400">
                      AED {Number(originalPrice).toFixed(2)}
                    </span>
                    <span className="text-sm font-bold text-green-600 bg-green-50 
                                     px-2 py-0.5 rounded-lg">
                      Save AED {(originalPrice - price).toFixed(2)}
                    </span>
                  </>
                )}
              </div>
              <p className="text-xs text-gray-400 mt-1.5">Inclusive of all taxes · Free delivery</p>
            </div>

            {/* Color Selection */}
            {product.ProductColors?.length > 0 && (
              <div>
                <p className="text-sm font-semibold text-gray-700 mb-3">
                  Color:{" "}
                  <span className="text-purple-600 font-bold">
                    {selectedColor?.colourName || "—"}
                  </span>
                </p>
                <div className="flex flex-wrap gap-2">
                  {product.ProductColors.map((color) => {
                    const isSelected = selectedColor?._id === color._id;
                    const thumb = color.photos?.[0];
                    return (
                      <button
                        key={color._id}
                        onClick={() => handleColorSelect(color)}
                        className={`relative flex items-center gap-2 px-3 py-2 rounded-xl 
                                    border-2 transition-all duration-200 text-sm font-medium
                                    ${isSelected
                                      ? "border-purple-600 bg-purple-50 text-purple-700"
                                      : "border-gray-200 bg-white text-gray-600 hover:border-purple-300"}`}
                      >
                        {thumb && (
                          <img src={thumb} alt={color.colourName}
                            className="w-6 h-6 rounded-md object-cover flex-shrink-0"
                            style={{ border: "1px solid rgba(0,0,0,0.1)" }} />
                        )}
                        {color.colourName}
                        {isSelected && (
                          <FiCheck size={13} className="text-purple-600 flex-shrink-0" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ── Quantity + Cart CTA ── */}
            <div className="space-y-3">

              {/* Cart status banner — sirf tab jab inCart ho */}
              <AnimatePresence>
                {inCart && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.2 }}
                    className="flex items-center gap-2 bg-green-50 border border-green-200 
                               rounded-xl px-4 py-2.5"
                  >
                    <FiCheck size={15} className="text-green-600 flex-shrink-0" />
                    <span className="text-sm font-semibold text-green-700">
                      This item is in your cart
                    </span>
                    <button
                      onClick={() => navigate("/ecommerce/cart")}
                      className="ml-auto text-xs font-bold text-green-700 underline"
                    >
                      View Cart →
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* ── Button area ── */}
              <AnimatePresence mode="wait">
                {inCart ? (
                  // Cart mein hai — quantity controls + Go to Cart
                  <motion.div
                    key="incart"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className="flex gap-3"
                  >
                    {/* Quantity controls */}
                    <div
                      className="flex items-center gap-1 bg-gray-100 rounded-xl p-1"
                      style={{ border: "1px solid rgba(0,0,0,0.07)" }}
                    >
                      <button
                        onClick={() => handleUpdateQuantity(quantity - 1)}
                        disabled={updating}
                        className="w-9 h-9 rounded-lg bg-white flex items-center justify-center
                                   text-gray-600 hover:bg-red-50 hover:text-red-500
                                   transition disabled:opacity-40 shadow-sm"
                      >
                        <FiMinus size={14} />
                      </button>
                      <span className="w-10 text-center font-bold text-gray-800">
                        {updating ? (
                          <span className="inline-block w-4 h-4 border-2 border-purple-500 
                                           border-t-transparent rounded-full animate-spin" />
                        ) : quantity}
                      </span>
                      <button
                        onClick={() => handleUpdateQuantity(quantity + 1)}
                        disabled={updating}
                        className="w-9 h-9 rounded-lg bg-purple-600 flex items-center 
                                   justify-center text-white hover:bg-purple-700
                                   transition disabled:opacity-40 shadow-sm"
                      >
                        <FiPlus size={14} />
                      </button>
                    </div>

                    {/* Go to Cart */}
                    <button
                      onClick={() => navigate("/ecommerce/cart")}
                      className="flex-1 flex items-center justify-center gap-2 py-3 
                                 rounded-xl font-bold text-white transition duration-200
                                 hover:opacity-90 active:scale-95"
                      style={{ background: "linear-gradient(135deg,#5C039B,#8b5cf6)" }}
                    >
                      <FiShoppingCart size={17} />
                      Go to Cart
                    </button>
                  </motion.div>
                ) : (
                  // Cart mein nahi — sirf Add to Cart full width
                  <motion.button
                    key="addtocart"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    onClick={handleAddToCart}
                    disabled={adding || product.quantity === 0}
                    className="w-full flex items-center justify-center gap-2 py-3.5
                               rounded-xl font-bold text-white transition duration-200
                               hover:opacity-90 active:scale-95 disabled:opacity-60"
                    style={{ background: "linear-gradient(135deg,#5C039B,#8b5cf6)" }}
                  >
                    {adding ? (
                      <>
                        <span className="w-4 h-4 border-2 border-white border-t-transparent 
                                         rounded-full animate-spin inline-block" />
                        Adding...
                      </>
                    ) : (
                      <>
                        <FiShoppingCart size={17} />
                        {product.quantity === 0 ? "Out of Stock" : "Add to Cart"}
                      </>
                    )}
                  </motion.button>
                )}
              </AnimatePresence>

              {/* Total price hint */}
              {inCart && quantity > 1 && (
                <p className="text-xs text-gray-400 text-center">
                  Total:{" "}
                  <strong className="text-purple-700">
                    AED {(price * quantity).toFixed(2)}
                  </strong>{" "}
                  for {quantity} items
                </p>
              )}
            </div>

            {/* Trust badges */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { icon: <FiTruck size={18} className="text-purple-600" />,   label: "Free Delivery", sub: "All UAE" },
                { icon: <FiShield size={18} className="text-green-600" />,   label: "Secure Pay",    sub: "SSL Protected" },
                { icon: <FiRefreshCw size={18} className="text-blue-600" />, label: "Easy Return",   sub: "7 Days" },
              ].map((b, i) => (
                <div key={i}
                  className="flex flex-col items-center text-center bg-white rounded-xl p-3"
                  style={{ border: "1px solid rgba(0,0,0,0.07)" }}>
                  <div className="mb-1.5">{b.icon}</div>
                  <p className="text-xs font-bold text-gray-700">{b.label}</p>
                  <p className="text-xs text-gray-400">{b.sub}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* ══ TABS ══ */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-12 bg-white rounded-2xl overflow-hidden"
          style={{ border: "1px solid rgba(0,0,0,0.07)", boxShadow: "0 2px 12px rgba(0,0,0,0.04)" }}
        >
          {/* Tab headers */}
          <div className="flex border-b border-gray-100">
            {[
              { key: "description", label: "Description", icon: <FiInfo size={14} /> },
              { key: "details",     label: "Details",     icon: <FiPackage size={14} /> },
            ].map(t => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={`flex items-center gap-2 px-6 py-4 text-sm font-semibold 
                            border-b-2 transition-all duration-200
                            ${tab === t.key
                              ? "border-purple-600 text-purple-700 bg-purple-50/50"
                              : "border-transparent text-gray-500 hover:text-gray-700"}`}
              >
                {t.icon} {t.label}
              </button>
            ))}
          </div>

          {/* Tab content */}
          <div className="p-6">
            <AnimatePresence mode="wait">
              {tab === "description" && (
                <motion.div
                  key="desc"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  {product.description ? (
                    <p className="text-gray-600 leading-relaxed text-sm whitespace-pre-line">
                      {product.description}
                    </p>
                  ) : (
                    <p className="text-gray-400 text-sm italic">No description available.</p>
                  )}
                </motion.div>
              )}

              {tab === "details" && (
                <motion.div
                  key="details"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {[
                      { label: "Brand",    value: product.brandName?.brandName },
                      { label: "Category", value: product.category?.name },
                      { label: "Origin",   value: product.originCountry },
                      { label: "SKU",      value: product._id?.slice(-8).toUpperCase() },
                      { label: "Stock",    value: product.quantity > 0
                                              ? `${product.quantity} units`
                                              : "Out of Stock" },
                      { label: "Colors",   value: product.ProductColors?.length > 0
                                              ? product.ProductColors.map(c => c.colourName).join(", ")
                                              : "—" },
                    ].filter(r => r.value).map((row, i) => (
                      <div key={i}
                        className="flex justify-between items-center py-2.5 px-4 
                                   bg-gray-50 rounded-xl"
                        style={{ border: "1px solid rgba(0,0,0,0.05)" }}>
                        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                          {row.label}
                        </span>
                        <span className="text-sm font-medium text-gray-800 text-right max-w-[60%] truncate">
                          {row.value} 
                        </span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

      </div>
    </div>
  );
};

export default ProductDetail;