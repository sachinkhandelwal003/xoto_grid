import React, { useState, useEffect } from 'react';
import {
  FaShoppingBag, FaHeart, FaTimes, FaChevronRight,
  FaMapMarkerAlt, FaShippingFast, FaTicketAlt,
  FaMinus, FaPlus, FaTrash, FaArrowLeft,
  FaShieldAlt, FaCreditCard, FaTruck, FaStar
} from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Chip, Divider, CircularProgress } from '@mui/material';
import { apiService } from "../../../../manageApi/utils/custom.apiservice";
import { toast } from 'react-toastify';

const SHIPPING_COST = 0; // Free shipping

const CartPage = () => {
  const navigate = useNavigate();
  const { user, token } = useSelector((state) => state.auth);
  const customerId = user?._id || user?.id;

  const [cartItems, setCartItems]     = useState([]);
  const [loading, setLoading]         = useState(true);
  // { [cartItemId]: true } — track which item is being updated
  const [updatingIds, setUpdatingIds] = useState({});

  // ─────────────────────────────────────────────
  // Fetch cart
  // ─────────────────────────────────────────────
  const fetchCart = async () => {
    if (!customerId) return;
    try {
      const res = await apiService.get(`/products/cart/get?customerId=${customerId}`);
      const items = res?.data?.items || res?.items || [];
      setCartItems(items);
    } catch (err) {
      toast.error("Failed to load cart");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!token || !customerId) {
      navigate("/user/login");
      return;
    }
    fetchCart();
  }, [customerId]);

  // ─────────────────────────────────────────────
  // Set updating state for one item
  // ─────────────────────────────────────────────
  const setItemUpdating = (id, val) =>
    setUpdatingIds(prev => ({ ...prev, [id]: val }));

  // ─────────────────────────────────────────────
  // Increase quantity
  // ─────────────────────────────────────────────
  const handleIncrease = async (item) => {
    const newQty = item.quantity + 1;
    setItemUpdating(item._id, true);

    // ✅ Optimistic update — UI turant change ho
    setCartItems(prev =>
      prev.map(i => i._id === item._id ? { ...i, quantity: newQty } : i)
    );

    try {
      await apiService.put("/products/cart/update", {
        cartItemId: item._id,
        quantity: newQty,
      });
    } catch (err) {
      // Rollback on error
      setCartItems(prev =>
        prev.map(i => i._id === item._id ? { ...i, quantity: item.quantity } : i)
      );
      toast.error("Failed to update quantity");
    } finally {
      setItemUpdating(item._id, false);
    }
  };

  // ─────────────────────────────────────────────
  // Decrease quantity
  // ─────────────────────────────────────────────
  const handleDecrease = async (item) => {
    if (item.quantity <= 1) {
      handleRemove(item);
      return;
    }

    const newQty = item.quantity - 1;
    setItemUpdating(item._id, true);

    // ✅ Optimistic update
    setCartItems(prev =>
      prev.map(i => i._id === item._id ? { ...i, quantity: newQty } : i)
    );

    try {
      await apiService.put("/products/cart/update", {
        cartItemId: item._id,
        quantity: newQty,
      });
    } catch (err) {
      // Rollback
      setCartItems(prev =>
        prev.map(i => i._id === item._id ? { ...i, quantity: item.quantity } : i)
      );
      toast.error("Failed to update quantity");
    } finally {
      setItemUpdating(item._id, false);
    }
  };

  // ─────────────────────────────────────────────
  // Remove item
  // ─────────────────────────────────────────────
  const handleRemove = async (item) => {
    setItemUpdating(item._id, true);

    // ✅ Optimistic remove
    setCartItems(prev => prev.filter(i => i._id !== item._id));

    try {
      await apiService.delete(`/products/cart/remove?cartItemId=${item._id}`);
      toast.success("Item removed from cart");
    } catch (err) {
      // Rollback
      setCartItems(prev => [...prev, item]);
      toast.error("Failed to remove item");
    } finally {
      setItemUpdating(item._id, false);
    }
  };

  // ─────────────────────────────────────────────
  // Clear cart
  // ─────────────────────────────────────────────
  const handleClearCart = async () => {
    try {
      await apiService.delete(`/products/cart/clear?customerId=${customerId}`);
      setCartItems([]);
      toast.success("Cart cleared");
    } catch {
      toast.error("Failed to clear cart");
    }
  };

  // ─────────────────────────────────────────────
  // Totals — computed from state, no re-render needed
  // ─────────────────────────────────────────────
  const subtotal = cartItems.reduce(
    (acc, item) => acc + Number(item.price || 0) * Number(item.quantity || 1), 0
  );
  const total = subtotal + SHIPPING_COST;
  const totalItems = cartItems.reduce((acc, item) => acc + Number(item.quantity || 1), 0);

  // ─────────────────────────────────────────────
  // Loading
  // ─────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-purple-600 font-semibold">Loading your cart...</p>
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────
  // Empty cart
  // ─────────────────────────────────────────────
  if (cartItems.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-md"
        >
          <FaShoppingBag className="text-6xl text-gray-300 mb-6 mx-auto" />
          <h2 className="text-3xl font-bold text-gray-800 mb-3">Your Cart is Empty</h2>
          <p className="text-gray-600 mb-8 text-lg">
            Looks like you haven't added any products yet.
          </p>
          <button
            onClick={() => navigate('/ecommerce/b2c')}
            className="bg-purple-600 text-white px-8 py-3 rounded-lg hover:bg-purple-700 
                       transition-all duration-200 font-semibold text-lg shadow-lg"
          >
            Start Shopping
          </button>
        </motion.div>
      </div>
    );
  }

  // ─────────────────────────────────────────────
  // Cart UI
  // ─────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={() => navigate('/ecommerce/b2c')}
              className="flex items-center text-purple-600 hover:text-purple-700 transition-colors font-medium"
            >
              <FaArrowLeft className="mr-2" /> Continue Shopping
            </button>
            <h1 className="text-3xl font-bold text-gray-900">Shopping Cart</h1>
            <button
              onClick={handleClearCart}
              className="text-sm text-red-400 hover:text-red-600 font-medium transition"
            >
              🗑 Clear All
            </button>
          </div>

          {/* Summary strip */}
          <div className="bg-white rounded-xl shadow-sm p-5 mb-6 flex justify-between items-center"
            style={{ border: "1px solid rgba(0,0,0,0.06)" }}>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                {totalItems} {totalItems === 1 ? "Item" : "Items"} in Cart
              </h2>
              <p className="text-gray-500 text-sm">Review your items and proceed to checkout</p>
            </div>
            <Chip
              label={`Total: AED ${total.toFixed(2)}`}
              sx={{ backgroundColor: '#5C039B', color: 'white', fontWeight: 700, fontSize: 14 }}
            />
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* ── Cart Items ── */}
          <div className="lg:col-span-2 space-y-4">
  <AnimatePresence mode="popLayout">   {/* ✅ popLayout */}
    {cartItems.map((item) => {          {/* ✅ index hata diya */}
      const product    = item.productId;
      const color      = item.productColorId;
      const image      = color?.photos?.[0] || product?.images?.[0] || null;
      const isUpdating = updatingIds[item._id];

      return (
        <motion.div
          key={item._id}
          layout                                       // ✅ smooth layout shift
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, x: -40, scale: 0.96 }}
          transition={{ duration: 0.2 }}              // ✅ no index delay
          className="bg-white rounded-2xl overflow-hidden"
          style={{ border: "1px solid rgba(0,0,0,0.07)", boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}
        >
          <div className="p-5 flex gap-5 items-center">

            {/* Product Image */}
            <div className="w-24 h-24 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0"
              style={{ border: "1px solid rgba(0,0,0,0.06)" }}>
              {image ? (
                <img src={image} alt={product?.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-3xl">📦</div>
              )}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-gray-800 text-base leading-snug mb-1 truncate">
                {product?.name || "Product"}
              </h3>
              {color?.colourName && (
                <p className="text-xs text-gray-400 mb-2">🎨 {color.colourName}</p>
              )}
              <p className="text-purple-700 font-bold text-lg">
                AED {Number(item.price).toFixed(2)}
              </p>
              {/* ✅ Subtotal bhi live update hoga */}
              <p className="text-xs text-gray-400 mt-0.5">
                Subtotal: AED {(Number(item.price) * Number(item.quantity)).toFixed(2)}
              </p>
            </div>

            {/* Quantity Controls */}
            <div className="flex flex-col items-end gap-3 flex-shrink-0">
              <div className="flex items-center gap-1 bg-gray-50 rounded-xl p-1"
                style={{ border: "1px solid rgba(0,0,0,0.08)" }}>

                <button
                  onClick={() => handleDecrease(item)}
                  disabled={isUpdating}
                  className="w-8 h-8 rounded-lg bg-white flex items-center justify-center
                             text-gray-600 hover:bg-red-50 hover:text-red-500
                             transition disabled:opacity-40"
                  style={{ border: "1px solid rgba(0,0,0,0.08)" }}
                >
                  {item.quantity === 1
                    ? <FaTrash size={11} className="text-red-400" />
                    : <FaMinus size={11} />
                  }
                </button>

                {/* ✅ Sirf count area update hoga — baaki nahi */}
                <div className="w-10 text-center">
                  {isUpdating ? (
                    <span className="inline-block w-4 h-4 border-2 border-purple-500 
                                     border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <span className="font-bold text-gray-800 text-sm">
                      {item.quantity}
                    </span>
                  )}
                </div>

                <button
                  onClick={() => handleIncrease(item)}
                  disabled={isUpdating}
                  className="w-8 h-8 rounded-lg bg-purple-600 flex items-center 
                             justify-center text-white hover:bg-purple-700
                             transition disabled:opacity-40"
                >
                  <FaPlus size={11} />
                </button>
              </div>

              <button
                onClick={() => handleRemove(item)}
                disabled={isUpdating}
                className="text-xs text-red-400 hover:text-red-600 flex items-center 
                           gap-1 font-medium transition disabled:opacity-40"
              >
                <FaTrash size={10} /> Remove
              </button>
            </div>

          </div>
        </motion.div>
      );
    })}
  </AnimatePresence>
</div>

          {/* ── Order Summary Sidebar ── */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="sticky top-6 space-y-5"
            >

              {/* Summary box */}
              <div className="bg-white rounded-2xl p-6"
                style={{ border: "1px solid rgba(0,0,0,0.07)", boxShadow: "0 2px 12px rgba(92,3,155,0.08)" }}>
                <h3 className="text-lg font-bold mb-5 text-gray-900">Order Summary</h3>

                <div className="space-y-3 mb-5">
                  <div className="flex justify-between text-gray-600 text-sm">
                    <span>Subtotal ({totalItems} items)</span>
                    <span className="font-medium">AED {subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-gray-600 text-sm">
                    <span>Shipping</span>
                    <span className="text-green-600 font-medium">Free</span>
                  </div>
                  <Divider />
                  <div className="flex justify-between font-bold text-gray-900 text-lg">
                    <span>Total</span>
                    <span className="text-purple-700">AED {total.toFixed(2)}</span>
                  </div>
                </div>

                {/* Checkout button */}
                <button
                  onClick={() => navigate('/ecommerce/checkout')}
                  className="w-full py-3.5 rounded-xl font-bold text-white text-base
                             transition duration-200 hover:opacity-90 active:scale-95"
                  style={{ background: "linear-gradient(135deg,#5C039B,#8b5cf6)" }}
                >
                  Proceed to Checkout →
                </button>

                {/* Coupon */}
                <button className="w-full mt-3 border border-purple-200 text-purple-600 py-2.5 
                                   rounded-xl flex items-center justify-center gap-2 
                                   hover:bg-purple-50 transition font-medium text-sm">
                  <FaTicketAlt /> Apply Coupon Code
                </button>
              </div>

              {/* Security box */}
              <div className="bg-white rounded-2xl p-5"
                style={{ border: "1px solid rgba(0,0,0,0.07)" }}>
                <h4 className="font-semibold mb-4 text-gray-800 text-sm">Secure Checkout</h4>
                <div className="space-y-3">
                  {[
                    { icon: <FaCreditCard className="text-purple-600" />, text: "SSL Secure Payment" },
                    { icon: <FaShieldAlt className="text-green-500" />, text: "100% Payment Protection" },
                    { icon: <FaTruck className="text-purple-600" />, text: "Free Delivery" },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-3 text-gray-500 text-sm">
                      {item.icon}
                      <span>{item.text}</span>
                    </div>
                  ))}
                </div>
              </div>

            </motion.div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default CartPage;