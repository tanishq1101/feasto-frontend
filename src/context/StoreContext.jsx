import axios from "axios";
import React, { createContext, useState, useEffect, useCallback } from "react";
import { useAuth, useUser } from "@clerk/clerk-react";
import { backendUrl } from "../config/api";
import { getEntityId } from "../utils/entityId";

axios.defaults.withCredentials = true;

// eslint-disable-next-line react-refresh/only-export-components
export const StoreContext = createContext(null);

export const StoreContextProvider = (props) => {
  const [cartItems, setCartItems] = useState({});
  const [food_list, setFoodList] = useState([]);
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [promoDiscount, setPromoDiscount] = useState(0);
  const [appliedPromo, setAppliedPromo] = useState("");
  const [city, setCity] = useState(() => {
    try {
      return localStorage.getItem("userCity") || "Delhi";
    } catch (e) {
      return "Delhi";
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem("userCity", city);
    } catch (e) {
      console.warn("localStorage is not available:", e.message);
    }
  }, [city]);

  // Clerk auth hook — replaces custom JWT token management
  const { getToken, isSignedIn, userId, isLoaded } = useAuth();
  const { user, isLoaded: isUserLoaded } = useUser();

  const url = backendUrl;

  const getSessionToken = useCallback(async () => {
    return await getToken();
  }, [getToken]);

  // Helper to get auth headers for API calls
  const authHeaders = useCallback(async () => {
    const token = await getSessionToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
  }, [getSessionToken]);

  // ---------- Cart Functions ----------
  const addToCart = async (itemId) => {
    setCartItems((prev) => {
      const updatedCart = { ...prev, [itemId]: (prev[itemId] || 0) + 1 };
      try {
        localStorage.setItem("cartItems", JSON.stringify(updatedCart));
      } catch (e) {
        console.warn("Storage not available:", e.message);
      }
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
      try {
        localStorage.setItem("cartItems", JSON.stringify(updatedCart));
      } catch (e) {
        console.warn("Storage not available:", e.message);
      }
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

  const clearItemFromCart = async (itemId) => {
    setCartItems((prev) => {
      const updatedCart = { ...prev };
      delete updatedCart[itemId];
      try {
        localStorage.setItem("cartItems", JSON.stringify(updatedCart));
      } catch (e) {
        console.warn("Storage not available:", e.message);
      }
      return updatedCart;
    });

    if (isSignedIn) {
      try {
        await axios.post(
          `${url}/api/cart/clear`,
          { itemId },
          { headers: await authHeaders() }
        );
      } catch (err) {
        console.error("Error clearing item from cart:", err.message);
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

  const fetchRestaurantsList = async () => {
    try {
      const res = await axios.get(`${url}/api/restaurant/all`);
      setRestaurants(res.data.restaurants || []);
    } catch (err) {
      console.error("Error loading restaurants list:", err.message);
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
        try {
          localStorage.setItem("cartItems", JSON.stringify(res.data.cartData));
        } catch (e) {
          console.warn("Storage not available:", e.message);
        }
      }
    } catch (err) {
      if (err.response?.status !== 401) {
        console.error("Error loading cart:", err.message);
      }
    }
  };

  // Sync user to Postgres after Clerk sign-in
  const syncUserToBackend = async () => {
    if (!isSignedIn || !user) return;
    try {
      const token = await getSessionToken();
      if (!token) return;
      await axios.post(
        `${url}/api/user/sync`,
        {
          id: user.id,
          email: user.primaryEmailAddress?.emailAddress,
          name: user.fullName,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
    } catch (err) {
      if (err.response?.status !== 401) {
        console.error("Error syncing user:", err.message);
      }
    }
  };

  // Expose state globally for the chatbot
  useEffect(() => {
    window.getFeastoState = async () => {
      let orders = [];
      if (isSignedIn) {
        try {
          const token = await getToken();
          const headers = token ? { Authorization: `Bearer ${token}` } : {};
          const res = await axios.get(`${url}/api/order/userorders`, { headers });
          if (res.data?.success) {
            orders = res.data.orders;
          }
        } catch (e) {
          // ignore or log
        }
      }
      return {
        isSignedIn,
        userName: user?.fullName || null,
        cartItems,
        food_list,
        orders
      };
    };
  }, [isSignedIn, user, cartItems, food_list, url, getToken]);

  // ---------- Initial Load ----------
  useEffect(() => {
    if (!isLoaded || !isUserLoaded) return; // Wait for Clerk to finish loading

    async function initialize() {
      try {
        await fetchFoodList();
        await fetchRestaurantsList();

        // Load saved cart from localStorage
        try {
          const savedCart = localStorage.getItem("cartItems");
          if (savedCart) {
            const parsed = JSON.parse(savedCart);
            if (parsed && typeof parsed === "object") {
              setCartItems(parsed);
            }
          }
        } catch (e) {
          console.warn("Failed to load saved cart:", e);
        }

        if (isSignedIn) {
          // Trigger sync and load cart data in background (do not block app loading)
          syncUserToBackend().then(() => loadCartData());
        }
      } catch (err) {
        console.error("Initialization error:", err.message);
      } finally {
        setLoading(false);
      }
    }

    initialize();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    isLoaded,
    isUserLoaded,
    isSignedIn,
    userId,
    user?.primaryEmailAddress?.emailAddress,
    user?.fullName,
  ]);

  // ---------- Context Value ----------
  const contextValue = {
    food_list,
    restaurants,
    cartItems,
    setCartItems,
    addToCart,
    removeFromCart,
    clearItemFromCart,
    getTotalCartAmount,
    url,
    // Expose Clerk auth state instead of custom token
    isSignedIn,
    userId,
    authHeaders,
    loading,
    city,
    setCity,
    promoDiscount,
    setPromoDiscount,
    appliedPromo,
    setAppliedPromo,
  };

  if (!isLoaded || !isUserLoaded) return null;

  return (
    <StoreContext.Provider value={contextValue}>
      {props.children}
    </StoreContext.Provider>
  );
};

export default StoreContextProvider;
