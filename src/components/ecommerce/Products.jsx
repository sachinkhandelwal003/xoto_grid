import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  FiEye, FiShoppingCart, FiHeart, FiShare2, FiStar, FiMinus, FiPlus, FiTrash2,
} from "react-icons/fi";
import { MdLocalOffer } from "react-icons/md";
import { motion, AnimatePresence } from "framer-motion";
import { apiService } from "../../manageApi/utils/custom.apiservice";
import { useProducts } from "../../context/ProductContext";
import { toast } from "react-toastify";

/* ─────────────────────────────────────────────────
   PRODUCT CARD
───────────────────────────────────────────────── */
const ProductCard = ({ product, onAddToCart, cartItem, onIncrease, onDecrease, onRemove, updating }) => {
  const navigate = useNavigate();
  const [isLiked, setIsLiked] = useState(false);

  const mainImage = product.photos?.[0] || "https://placehold.co/800";

  const discount =
    product.price > 0 && product.discountedPrice > 0 &&
    product.price > product.discountedPrice
      ? Math.round((1 - product.discountedPrice / product.price) * 100)
      : 0;

  const inCart = cartItem && cartItem.quantity > 0;


const handleShare = async () => {
  const productUrl = `${window.location.origin}/ecommerce/product/${product._id}`;
  const shareData = {
    title: product.name,
    text: `Check out ${product.name} on Xoto — AED ${
      product.discountedPrice > 0
        ? Number(product.discountedPrice).toFixed(2)
        : Number(product.price).toFixed(2)
    }`,
    url: productUrl,
  };

  try {
    // ✅ Mobile pe native share sheet open hoga
    if (navigator.share) {
      await navigator.share(shareData);
    } else {
      // ✅ Desktop pe clipboard copy
      await navigator.clipboard.writeText(
        `${shareData.text}\n${shareData.url}`
      );
      toast.success("Link copied to clipboard! 📋");
    }
  } catch (err) {
    if (err.name !== "AbortError") {
      // User ne share cancel kiya — ignore karo
      toast.error("Failed to share");
    }
  }
};

  return (
    <div className="relative bg-white rounded-xl overflow-hidden flex flex-col h-full
                    transition-all duration-300 hover:shadow-xl hover:-translate-y-0.5"
      style={{ border: "1px solid rgba(0,0,0,0.07)", boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}
    >

      {/* TAGS */}
      <div className="absolute top-3 left-3 z-10 flex flex-col gap-1">
        {product.isFeatured && (
          <span className="bg-purple-600 text-white px-2 py-0.5 text-xs font-bold rounded">
            FEATURED
          </span>
        )}
        {discount > 0 && (
          <span className="bg-red-500 text-white px-2 py-0.5 text-xs font-bold flex items-center gap-1 rounded">
            <MdLocalOffer /> {discount}% OFF
          </span>
        )}
      </div>

      {/* ACTIONS */}
      <div className="absolute top-3 right-3 z-10 flex flex-col gap-2">
  <button
    onClick={() => setIsLiked(!isLiked)}
    className="bg-white p-1.5 rounded-full shadow hover:shadow-md transition"
  >
    <FiHeart size={16} className={isLiked ? "text-red-500 fill-red-500" : "text-gray-400"} />
  </button>

  {/* ✅ Share button — working */}
  <button
    onClick={handleShare}
    className="bg-white p-1.5 rounded-full shadow hover:shadow-md transition"
  >
    <FiShare2 size={16} className="text-gray-400 hover:text-purple-500 transition" />
  </button>
</div>

      {/* IMAGE */}
      <div
        className="h-52 bg-gray-50 cursor-pointer overflow-hidden flex-shrink-0"
        onClick={() => navigate(`/ecommerce/product/${product._id}`)}
        style={{ borderBottom: "1px solid rgba(0,0,0,0.05)" }}
      >
        <img
          src={mainImage}
          alt={product.name}
          className="w-full h-full object-cover hover:scale-105 transition duration-300"
        />
      </div>

      {/* CONTENT */}
      <div className="p-4 flex flex-col flex-1">

        {/* Category + Rating */}
        <div className="flex justify-between items-center mb-1">
          <span className="text-xs text-gray-400 uppercase tracking-wide truncate max-w-[120px]">
            {product.category?.name || "—"}
          </span>
          <div className="flex items-center text-amber-400 flex-shrink-0">
            <FiStar size={12} className="fill-current" />
            <span className="ml-1 text-xs font-semibold text-gray-600">4.8</span>
          </div>
        </div>

        {/* Product Name */}
        <h3 className="font-bold text-gray-800 text-sm leading-snug mb-1 line-clamp-2 min-h-[40px]">
          {product.name}
        </h3>

        {/* Brand */}
        <p className="text-xs text-gray-400 mb-3 truncate">
          {product.brandName?.brandName || "—"} · {product.originCountry || "UAE"}
        </p>

        {/* Price */}
        <div className="mb-4 mt-auto">
          {product.discountedPrice > 0 ? (
            <div className="flex items-baseline gap-2">
              <span className="text-xl font-bold text-purple-700">
                AED {Number(product.discountedPrice).toFixed(2)}
              </span>
              {discount > 0 && (
                <span className="text-sm line-through text-gray-400">
                  AED {Number(product.price).toFixed(2)}
                </span>
              )}
            </div>
          ) : (
            <span className="text-xl font-bold text-purple-700">
              AED {Number(product.price).toFixed(2)}
            </span>
          )}
        </div>

        {/* ── Buttons / Quantity Controls ── */}
        <div className="flex gap-2">

          {/* View button — always visible */}
          <motion.button
            whileHover={{ scale: 1.04 }}
            onClick={() => navigate(`/ecommerce/product/${product._id}`)}
            className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-2.5 
                       rounded-lg flex items-center gap-1.5 text-sm font-medium
                       transition duration-200 flex-shrink-0"
          >
            <FiEye size={14} /> View
          </motion.button>

          {/* ── Add to Cart OR Quantity Controls ── */}
          <AnimatePresence mode="wait">
            {inCart ? (
              /* Quantity controls */
              <motion.div
                key="qty"
                initial={{ opacity: 0, scale: 0.85 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.85 }}
                transition={{ duration: 0.2 }}
                className="flex-1 flex items-center justify-between bg-purple-50 
                           border border-purple-200 rounded-lg px-2 py-1.5"
              >
                {/* Decrease / Remove */}
                <button
                  onClick={() => cartItem.quantity === 1 ? onRemove(cartItem) : onDecrease(cartItem)}
                  disabled={updating}
                  className="w-7 h-7 rounded-md bg-white border border-purple-200 
                             flex items-center justify-center text-purple-600
                             hover:bg-purple-100 transition disabled:opacity-50"
                >
                  {cartItem.quantity === 1
                    ? <FiTrash2 size={12} className="text-red-400" />
                    : <FiMinus size={12} />
                  }
                </button>

                {/* Count */}
                <span className="font-bold text-purple-700 text-sm min-w-[20px] text-center">
                  {updating ? (
                    <span className="inline-block w-3 h-3 border-2 border-purple-500 
                                     border-t-transparent rounded-full animate-spin" />
                  ) : cartItem.quantity}
                </span>

                {/* Increase */}
                <button
                  onClick={() => onIncrease(cartItem)}
                  disabled={updating}
                  className="w-7 h-7 rounded-md bg-purple-600 flex items-center 
                             justify-center text-white hover:bg-purple-700 
                             transition disabled:opacity-50"
                >
                  <FiPlus size={12} />
                </button>
              </motion.div>
            ) : (
              /* Add to Cart button */
              <motion.button
                key="add"
                initial={{ opacity: 0, scale: 0.85 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.85 }}
                transition={{ duration: 0.2 }}
                whileHover={{ scale: updating ? 1 : 1.04 }}
                disabled={updating}
                onClick={() => onAddToCart(product)}
                className={`flex-1 px-3 py-2.5 rounded-lg flex items-center justify-center 
                            gap-1.5 text-sm font-medium transition duration-200
                            ${updating
                              ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                              : "bg-gray-900 hover:bg-black text-white"
                            }`}
              >
                {updating ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-gray-400 border-t-transparent 
                                     rounded-full animate-spin inline-block" />
                    Adding...
                  </>
                ) : (
                  <>
                    <FiShoppingCart size={14} /> Add to Cart
                  </>
                )}
              </motion.button>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────────────
   MAIN COMPONENT
───────────────────────────────────────────────── */
const Products = () => {
  const { t } = useTranslation("ecommerce");
  const navigate = useNavigate();
  const { products, loading } = useProducts();
  const { user, token } = useSelector((state) => state.auth);

  const customerId = user?._id || user?.id;

  // { productId: { _id, quantity, price, ... } }
  const [cartMap, setCartMap]       = useState({});
  const [addingId, setAddingId]     = useState(null);
  const [updatingId, setUpdatingId] = useState(null);

  /* ── Total cart items count ── */
  const totalCartItems = Object.values(cartMap).reduce(
    (acc, item) => acc + (item.quantity || 0), 0
  );

  /* ── Fetch cart on mount ── */
  useEffect(() => {
    if (!customerId || !token) return;
    fetchCart();
  }, [customerId, token]);

  const fetchCart = async () => {
    try {
      const res = await apiService.get(`/products/cart/get?customerId=${customerId}`);
      const items = res?.data?.items || res?.items || [];
      // Build map: productId → cartItem
      const map = {};
      items.forEach(item => {
        const pid = item.productId?._id || item.productId;
        if (pid) map[pid] = item;
      });
      setCartMap(map);
    } catch (err) {
      console.error("Cart fetch failed:", err);
    }
  };

  /* ── Add to Cart ── */
  const handleAddToCart = async (product) => {
    if (!token || !user) {
      toast.error("Please login to add items to cart");
      navigate("/user/login");
      return;
    }

    setAddingId(product._id);
    try {
      const payload = {
        productId: product._id,
        customerId,
        quantity: 1,
      };
      if (product.ProductColors?.[0]?._id) {
        payload.productColorId = product.ProductColors[0]._id;
      }

      const res = await apiService.post("/products/cart/add", payload);
      const cartItem = res?.data?.data || res?.data;

      // Update cartMap instantly
      setCartMap(prev => ({
        ...prev,
        [product._id]: {
          ...cartItem,
          productId: product,
          quantity: cartItem?.quantity || 1,
        }
      }));

      toast.success("Added to cart! 🛒");
    } catch (err) {
      toast.error(err?.message || "Failed to add to cart");
    } finally {
      setAddingId(null);
    }
  };

  /* ── Increase quantity ── */
  const handleIncrease = async (cartItem) => {
    const pid = cartItem.productId?._id || cartItem.productId;
    setUpdatingId(pid);
    try {
      await apiService.put("/products/cart/update", {
        cartItemId: cartItem._id,
        quantity: cartItem.quantity + 1,
      });
      setCartMap(prev => ({
        ...prev,
        [pid]: { ...prev[pid], quantity: prev[pid].quantity + 1 }
      }));
    } catch (err) {
      toast.error("Failed to update");
    } finally {
      setUpdatingId(null);
    }
  };

  /* ── Decrease quantity ── */
  const handleDecrease = async (cartItem) => {
    const pid = cartItem.productId?._id || cartItem.productId;
    setUpdatingId(pid);
    try {
      await apiService.put("/products/cart/update", {
        cartItemId: cartItem._id,
        quantity: cartItem.quantity - 1,
      });
      setCartMap(prev => ({
        ...prev,
        [pid]: { ...prev[pid], quantity: prev[pid].quantity - 1 }
      }));
    } catch (err) {
      toast.error("Failed to update");
    } finally {
      setUpdatingId(null);
    }
  };

  /* ── Remove from cart ── */
  const handleRemove = async (cartItem) => {
    const pid = cartItem.productId?._id || cartItem.productId;
    setUpdatingId(pid);
    try {
      await apiService.delete(`/products/cart/remove?cartItemId=${cartItem._id}`);
      setCartMap(prev => {
        const next = { ...prev };
        delete next[pid];
        return next;
      });
      toast.success("Removed from cart");
    } catch (err) {
      toast.error("Failed to remove");
    } finally {
      setUpdatingId(null);
    }
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-purple-600 font-semibold">Loading XOTO...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50">

      {/* HERO */}
      <section className="py-24 relative text-white text-center">
        <img
          src="https://images.unsplash.com/photo-1618220179428-22790b461013"
          className="absolute inset-0 w-full h-full object-cover"
          alt="hero"
        />
        <div className="absolute inset-0 bg-black/60" />
        <div className="relative z-10">
          <h1 className="text-4xl font-bold">
            {t("experience.title.prefix")}{" "}
            <span className="text-purple-400">{t("experience.title.brand")}</span>{" "}
            {t("experience.title.suffix")}
          </h1>
          <motion.button
            whileHover={{ scale: 1.05 }}
            onClick={() => navigate("/ecommerce/filter")}
            className="mt-8 px-10 py-4 bg-purple-600 hover:bg-purple-700 
                       rounded-xl font-bold transition duration-200"
          >
            Shop Now
          </motion.button>
        </div>
      </section>

      {/* PRODUCTS */}
      <section className="py-16 max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold uppercase">New Arrivals</h2>

          {/* ── Cart button with badge ── */}
          <button
            onClick={() => navigate("/ecommerce/cart")}
            className="relative flex items-center gap-2 bg-purple-600 hover:bg-purple-700 
                       text-white px-5 py-2.5 rounded-xl font-medium transition duration-200"
          >
            <FiShoppingCart size={18} />
            View Cart

            {/* Badge */}
            <AnimatePresence>
              {totalCartItems > 0 && (
                <motion.span
                  key="badge"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  className="absolute -top-2 -right-2 bg-red-500 text-white 
                             text-xs font-bold rounded-full min-w-[20px] h-5 
                             flex items-center justify-center px-1
                             shadow-md"
                >
                  {totalCartItems > 99 ? "99+" : totalCartItems}
                </motion.span>
              )}
            </AnimatePresence>
          </button>
        </div>

        {products.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <div className="text-6xl mb-4">📦</div>
            <p className="text-xl font-medium">No products available</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.slice(0, 8).map((product) => {
              const pid = product._id;
              const cartItem = cartMap[pid] || null;
              return (
                <ProductCard
                  key={pid}
                  product={product}
                  cartItem={cartItem}
                  adding={addingId === pid}
                  updating={updatingId === pid}
                  onAddToCart={handleAddToCart}
                  onIncrease={handleIncrease}
                  onDecrease={handleDecrease}
                  onRemove={handleRemove}
                />
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
};

export default Products;