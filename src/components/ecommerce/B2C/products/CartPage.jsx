import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { apiService } from "../../../../manageApi/utils/custom.apiservice";
import { toast } from "react-toastify";

const CartPage = () => {
  const navigate = useNavigate();
  const { user, token } = useSelector((state) => state.auth);
  const customerId = user?._id || user?.id;

  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [purchasing, setPurchasing] = useState(false);

  // ─────────────────────────────────────────────────
  // Redirect if not logged in
  // ─────────────────────────────────────────────────
  useEffect(() => {
    if (!token || !customerId) {
      toast.error("Please login to view your cart");
      navigate("/user/login");
    }
  }, [token, customerId]);

  // ─────────────────────────────────────────────────
  // Fetch Cart Items
  // ─────────────────────────────────────────────────
  const fetchCart = async () => {
    if (!customerId) return;
    setLoading(true);
    try {
      const res = await apiService.get(
        `/products/cart/get?customerId=${customerId}`
      );
      // ✅ Fix
const items = res?.data?.items || res?.items || [];

setCartItems(Array.isArray(items) ? items : []);
    } catch (err) {
      toast.error("Failed to load cart");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (customerId) fetchCart();
  }, [customerId]);

  // ─────────────────────────────────────────────────
  // Update Quantity
  // ─────────────────────────────────────────────────
 const updateQuantity = async (cartItemId, quantity) => {
  try {
    if (quantity < 1) {
      // 0 se kam → remove karo
      await apiService.delete(`/products/cart/remove?cartItemId=${cartItemId}`);
      toast.success("Item removed from cart");
      fetchCart();
      return;
    }
    await apiService.put("/products/cart/update", { cartItemId, quantity });
    fetchCart();
  } catch (err) {
    toast.error("Failed to update");
  }
};

  // ─────────────────────────────────────────────────
  // Remove Item
  // ─────────────────────────────────────────────────
  const removeItem = async (cartItemId) => {
    try {
      await apiService.delete(
        `/products/cart/remove?cartItemId=${cartItemId}`
      );
      toast.success("Item removed from cart");
      fetchCart();
    } catch (err) {
      toast.error("Failed to remove item");
    }
  };

  // ─────────────────────────────────────────────────
  // Clear Cart
  // ─────────────────────────────────────────────────
  const clearCart = async () => {
    try {
      await apiService.delete(
        `/products/cart/clear?customerId=${customerId}`
      );
      toast.success("Cart cleared");
      setCartItems([]);
    } catch (err) {
      toast.error("Failed to clear cart");
    }
  };

  // ─────────────────────────────────────────────────
  // Purchase
  // ─────────────────────────────────────────────────
  const handlePurchase = async () => {
    setPurchasing(true);
    try {
      await apiService.post(
        `/products/cart/purchase?customerId=${customerId}`
      );
      toast.success("Order placed successfully!");
      setCartItems([]);
      navigate("/");
    } catch (err) {
      toast.error("Purchase failed. Please try again.");
    } finally {
      setPurchasing(false);
    }
  };

  // ─────────────────────────────────────────────────
  // Total Price
  // ─────────────────────────────────────────────────
  const totalPrice = cartItems.reduce((acc, item) => {
    return acc + Number(item.price || 0) * Number(item.quantity || 1);
  }, 0);

  // ─────────────────────────────────────────────────
  // Loading State
  // ─────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-500 font-medium">Loading your cart...</p>
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────────
  // Empty Cart
  // ─────────────────────────────────────────────────
  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="text-8xl mb-6">🛒</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Your cart is empty
          </h2>
          <p className="text-gray-500 mb-8">
            Add some products to get started!
          </p>
          <button
            onClick={() => navigate("/ecommerce/b2c")}
            className="bg-purple-600 hover:bg-purple-700 text-white font-semibold 
                       px-8 py-3 rounded-xl transition duration-200"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────────
  // Cart UI
  // ─────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">My Cart</h1>
            <p className="text-gray-500 mt-1">
              {cartItems.length} item{cartItems.length > 1 ? "s" : ""} in your cart
            </p>
          </div>
          <button
            onClick={clearCart}
            className="text-red-500 hover:text-red-700 text-sm font-medium 
                       border border-red-200 hover:border-red-400 px-4 py-2 
                       rounded-lg transition duration-200"
          >
            🗑 Clear Cart
          </button>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">

          {/* Cart Items */}
          <div className="flex-1 space-y-4">
            {cartItems.map((item) => {
              const product = item.productId;
              const color = item.productColorId;
              const image =
                color?.photos?.[0] ||
                product?.images?.[0] ||
                null;

              return (
                <div
                  key={item._id}
                  className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100
                             flex gap-5 items-center"
                >
                  {/* Product Image */}
                  <div className="w-24 h-24 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
                    {image ? (
                      <img
                        src={image}
                        alt={product?.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-3xl">
                        📦
                      </div>
                    )}
                  </div>

                  {/* Product Info */}
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-800 text-lg">
                      {product?.name || "Product"}
                    </h3>
                    {color?.colourName && (
                      <p className="text-sm text-gray-500 mt-0.5">
                        Color: {color.colourName}
                      </p>
                    )}
                    <p className="text-purple-600 font-bold text-lg mt-1">
                      AED {Number(item.price).toFixed(2)}
                    </p>
                  </div>

                  {/* Quantity Controls */}
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() =>
                        updateQuantity(item._id, item.quantity - 1)
                      }
                      className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 
                                 flex items-center justify-center font-bold text-gray-700
                                 transition duration-200"
                    >
                      −
                    </button>
                    <span className="w-8 text-center font-semibold text-gray-800">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() =>
                        updateQuantity(item._id, item.quantity + 1)
                      }
                      className="w-8 h-8 rounded-full bg-purple-100 hover:bg-purple-200 
                                 flex items-center justify-center font-bold text-purple-700
                                 transition duration-200"
                    >
                      +
                    </button>
                  </div>

                  {/* Item Total */}
                  <div className="text-right min-w-[80px]">
                    <p className="font-bold text-gray-800">
                      AED {(Number(item.price) * Number(item.quantity)).toFixed(2)}
                    </p>
                    <button
                      onClick={() => removeItem(item._id)}
                      className="text-red-400 hover:text-red-600 text-sm mt-1 
                                 transition duration-200"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Order Summary */}
          <div className="lg:w-80">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 sticky top-6">
              <h2 className="text-xl font-bold text-gray-800 mb-6">
                Order Summary
              </h2>

              {/* Items breakdown */}
              <div className="space-y-3 mb-6">
                {cartItems.map((item) => (
                  <div key={item._id} className="flex justify-between text-sm text-gray-600">
                    <span className="truncate max-w-[160px]">
                      {item.productId?.name} × {item.quantity}
                    </span>
                    <span className="font-medium">
                      AED {(Number(item.price) * Number(item.quantity)).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="border-t border-gray-100 pt-4 mb-6">
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-gray-700">Total</span>
                  <span className="text-2xl font-bold text-purple-600">
                    AED {totalPrice.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Checkout Button */}
              <button
  onClick={() => navigate("/ecommerce/checkout")}
  disabled={cartItems.length === 0}
  className="w-full bg-purple-600 hover:bg-purple-700 text-white 
             font-bold py-4 rounded-xl transition duration-200
             disabled:opacity-60 disabled:cursor-not-allowed"
>
  Proceed to Checkout →
</button>

              {/* Continue Shopping */}
              <button
                onClick={() => navigate("/ecommerce/b2c")}
                className="w-full mt-3 text-purple-600 hover:text-purple-800 
                           font-medium py-2 text-center transition duration-200"
              >
                ← Continue Shopping
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default CartPage;