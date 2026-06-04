// // src/context/CartContext.jsx
// import React, {
//   createContext,
//   useContext,
//   useState,
//   useEffect,
//   useCallback,
// } from 'react';
// import { useSelector } from 'react-redux';
// import { toast } from 'react-toastify';
// import { apiService } from '../../manageApi/utils/custom.apiservice';

// const CartContext = createContext();

// export const CartProvider = ({ children }) => {
//   /* --------------------------------------------------------------------
//    *  STATE
//    * ------------------------------------------------------------------ */
//   const [cart, setCart] = useState(null);
//   const [cartCount, setCartCount] = useState(0);
//   const [loading, setLoading] = useState(false);

//   /* --------------------------------------------------------------------
//    *  SELECT AUTH INFO FROM REDUX (you already use this pattern elsewhere)
//    * ------------------------------------------------------------------ */
//   const { user, token } = useSelector((state) => state.auth);

//   /* --------------------------------------------------------------------
//    *  HELPERS
//    * ------------------------------------------------------------------ */

//   /**
//    * Decode a JWT *without* a library.
//    * Returns the payload object or null if token is missing/invalid.
//    */
//   const decodeToken = (jwt) => {
//     if (!jwt) return null;
//     try {
//       const payload = jwt.split('.')[1];
//       return JSON.parse(atob(payload));
//     } catch {
//       return null;
//     }
//   };

//   /**
//    * Return true only for a logged-in **customer**.
//    * Adjust the strings to match exactly what your backend puts in the token.
//    */
//  const isCustomer = () => {
//   if (!token) return false;

//   // Prefer checking from user object if available
//   if (user?.role?.name) {
//     return user.role.name.toLowerCase() === "customer";
//   }

//   // Fallback: decode token and inspect payload
//   const payload = decodeToken(token);
//   if (!payload) return false;

//   return payload.role?.name?.toLowerCase() === "customer";
// };

//   /* --------------------------------------------------------------------
//    *  FETCH CART
//    * ------------------------------------------------------------------ */
//   const fetchCart = useCallback(async () => {
//     // ------------------------------------------------------------------
//     // 1. Guard: no token OR not a customer → reset & bail out
//     // ------------------------------------------------------------------
//     if (!token || !isCustomer()) {
//       setCart(null);
//       setCartCount(0);
//       return;
//     }

//     setLoading(true);
//     try {
//       const response = await apiService.get('/ecommerce/v1/cart');

//       // Assuming your API always returns { success: true, cart: {...} }
//       if (response.success && response.cart) {
//         setCart(response.cart);
//         const totalItems = response.cart.items.reduce(
//           (sum, item) => sum + item.quantity,
//           0
//         );
//         setCartCount(totalItems);
//       } else {
//         throw new Error(response.message || 'Failed to fetch cart');
//       }
//     } catch (error) {
//       console.error('Failed to fetch cart:', error);
//       // Show toast only for authenticated users – guests never see it
//       toast.error('Failed to load cart');
//       // Optionally keep previous cart data so UI doesn’t flash empty
//       // setCart(null); setCartCount(0);
//     } finally {
//       setLoading(false);
//     }
//   }, [token, user]); // re-run when token or user changes

//   /* --------------------------------------------------------------------
//    *  EFFECT – fetch on mount + auth change
//    * ------------------------------------------------------------------ */
//   useEffect(() => {
//     fetchCart();
//   }, [fetchCart]);

//   /* --------------------------------------------------------------------
//    *  CART ACTIONS
//    * ------------------------------------------------------------------ */

//   const addToCart = async (productId, productType = 'ProductB2C', quantity = 1) => {
//     if (!isCustomer()) {
//       toast.error('You need to be logged in as a customer to add items');
//       return false;
//     }

//     try {
//       const response = await apiService.post('/ecommerce/v1/cart', {
//         product_id: productId,
//         product_type: productType,
//         quantity,
//       });

//       if (response.success) {
//         toast.success('Added to cart successfully!');
//         await fetchCart();
//         return true;
//       }
//       throw new Error(response.message || 'Failed to add to cart');
//     } catch (error) {
//       console.error('Failed to add to cart:', error);
//       toast.error(error.message || 'Failed to add to cart');
//       return false;
//     }
//   };

//   const updateCartItem = async (itemId, quantity) => {
//     if (!cart) return false;

//     const item = cart.items.find((i) => i._id === itemId);
//     if (!item) {
//       toast.error('Item not found in cart');
//       return false;
//     }

//     try {
//       const response = await apiService.post('/ecommerce/v1/cart', {
//         product_id: item.product._id,
//         product_type: item.product_type,
//         quantity,
//       });

//       if (response.success) {
//         if (quantity === 0) {
//           toast.success('Item removed from cart');
//         } else {
//           toast.success('Cart updated successfully!');
//         }
//         await fetchCart();
//         return true;
//       }
//       throw new Error(response.message || 'Failed to update cart');
//     } catch (error) {
//       console.error('Failed to update cart:', error);
//       toast.error(error.message || 'Failed to update cart');
//       return false;
//     }
//   };

//   const removeFromCart = async (itemId, productType) => {
//     try {
//       const response = await apiService.delete(
//         `/ecommerce/v1/cart/${itemId}/${productType}`
//       );

//       if (response.success) {
//         toast.success('Item removed from cart');
//         await fetchCart();
//         return true;
//       }
//       throw new Error(response.message || 'Failed to remove item');
//     } catch (error) {
//       console.error('Failed to remove from cart:', error);
//       toast.error(error.message || 'Failed to remove item');
//       return false;
//     }
//   };

//   // Alternative: set quantity = 0 (uses the same endpoint as add/update)
//   const removeFromCartAlt = async (itemId) => updateCartItem(itemId, 0);

//   /* --------------------------------------------------------------------
//    *  PROVIDE CONTEXT
//    * ------------------------------------------------------------------ */
//   return (
//     <CartContext.Provider
//       value={{
//         cart,
//         cartCount,
//         loading,
//         addToCart,
//         updateCartItem,
//         removeFromCart,
//         removeFromCartAlt,
//         fetchCart, // expose for manual refresh (e.g. after login)
//       }}
//     >
//       {children}
//     </CartContext.Provider>
//   );
// };

// export const useCart = () => {
//   const ctx = useContext(CartContext);
//   if (!ctx) {
//     throw new Error('useCart must be used within a CartProvider');
//   }
//   return ctx;
// };