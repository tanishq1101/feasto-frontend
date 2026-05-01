import axios from "axios";
import React, { createContext, useState, useEffect } from "react";
import { useAuth } from "@clerk/clerk-react";
import { getEntityId } from "../utils/entityId";

axios.defaults.withCredentials = true;

// eslint-disable-next-line react-refresh/only-export-components
export const StoreContext = createContext(null);

export const StoreContextProvider = (props) => {
  const [cartItems, setCartItems] = useState({});
  const [food_list, setFoodList] = useState([]);
  const [loading, setLoading] = useState(true);

  // Clerk auth hook — replaces custom JWT token management
  const { getToken, isSignedIn, userId, isLoaded } = useAuth();

  const url = import.meta.env.VITE_BACKEND_URL || "http://localhost:4000";

  const getSessionToken = async () => {
    const token = await getToken({ skipCache: true });
    return token || (await getToken());
  };

  // Helper to get auth headers for API calls
  const authHeaders = async () => {
    const token = await getSessionToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  // ---------- Cart Functions ----------
  const addToCart = async (itemId) => {
    setCartItems((prev) => {
      const updatedCart = { ...prev, [itemId]: (prev[itemId] || 0) + 1 };
      localStorage.setItem("cartItems", JSON.stringify(updatedCart));
      return updatedCart;
    });

    if (isSignedIn) {
      try {
        await axios.post(
          `${url}/api/cart/add`,
          { itemId },
          { headers: await authHeaders() }
        );
      } catch (err) {
        console.error("Error adding to cart:", err.message);
      }
    }
  };

  const removeFromCart = async (itemId) => {
    setCartItems((prev) => {
      if (!prev[itemId]) return prev;
      const updatedCart = { ...prev, [itemId]: prev[itemId] - 1 };
      if (updatedCart[itemId] <= 0) delete updatedCart[itemId];
      localStorage.setItem("cartItems", JSON.stringify(updatedCart));
      return updatedCart;
    });

    if (isSignedIn) {
      try {
        await axios.post(
          `${url}/api/cart/remove`,
          { itemId },
          { headers: await authHeaders() }
        );
      } catch (err) {
        console.error("Error removing from cart:", err.message);
      }
    }
  };

  const getTotalCartAmount = () => {
    let totalAmount = 0;
    for (const item in cartItems) {
      if (cartItems[item] > 0) {
        const itemInfo = food_list.find((p) => String(getEntityId(p)) === String(item));
        if (itemInfo) totalAmount += itemInfo.price * cartItems[item];
      }
    }
    return totalAmount;
  };

  // ---------- API Calls ----------
  const fetchFoodList = async () => {
    try {
      const res = await axios.get(`${url}/api/food/list`);
      const normalized = (res.data.data || []).map((item) => {
        const entityId = getEntityId(item);
        return {
          ...item,
          id: entityId,
          _id: entityId,
        };
      });
      setFoodList(normalized);
    } catch (err) {
      console.error("Error loading food list:", err.message);
    }
  };

  const loadCartData = async () => {
    if (!isSignedIn) return;
    try {
      const headers = await authHeaders();
      if (!headers.Authorization) return;
      const res = await axios.get(`${url}/api/cart/get`, {
        headers,
      });
      if (res.data.cartData) {
        setCartItems(res.data.cartData);
        localStorage.setItem("cartItems", JSON.stringify(res.data.cartData));
      }
    } catch (err) {
      if (err.response?.status !== 401) {
        console.error("Error loading cart:", err.message);
      }
    }
  };

  // Sync user to Postgres after Clerk sign-in
  const syncUserToBackend = async () => {
    if (!isSignedIn) return;
    try {
      const token = await getSessionToken();
      if (!token) return;
      // The backend will auto-upsert via the auth middleware on any protected call
      // But we also explicitly sync with user data on login
      await axios.get(`${url}/api/user/verify`, {
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch (err) {
      if (err.response?.status !== 401) {
        console.error("Error syncing user:", err.message);
      }
    }
  };

  // ---------- Initial Load ----------
  useEffect(() => {
    if (!isLoaded) return; // Wait for Clerk to finish loading

    async function initialize() {
      try {
        await fetchFoodList();

        // Load saved cart from localStorage
        const savedCart = localStorage.getItem("cartItems");
        if (savedCart) setCartItems(JSON.parse(savedCart));

        if (isSignedIn) {
          await syncUserToBackend();
          await loadCartData();
        }
      } catch (err) {
        console.error("Initialization error:", err.message);
      } finally {
        setLoading(false);
      }
    }

    initialize();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoaded, isSignedIn]);

  // ---------- Context Value ----------
  const contextValue = {
    food_list,
    cartItems,
    setCartItems,
    addToCart,
    removeFromCart,
    getTotalCartAmount,
    url,
    // Expose Clerk auth state instead of custom token
    isSignedIn,
    userId,
    authHeaders,
    loading,
  };

  if (!isLoaded || loading) return null;

  return (
    <StoreContext.Provider value={contextValue}>
      {props.children}
    </StoreContext.Provider>
  );
};

export default StoreContextProvider;
