import axios from "axios";
import React, { createContext, useState, useEffect } from "react";

axios.defaults.withCredentials = true;

// eslint-disable-next-line react-refresh/only-export-components
export const StoreContext = createContext(null);

export const StoreContextProvider = (props) => {
  const [cartItems, setCartItems] = useState({});
  const [token, setToken] = useState(() => localStorage.getItem("token") || "");
  const [food_list, setFoodList] = useState([]);
  const [loading, setLoading] = useState(true);

  const url = import.meta.env.DEV
  ? "http://localhost:4000"
  : "https://fooddel-backend-rux6.onrender.com";

  // Persist token in localStorage
  useEffect(() => {
    if (token) localStorage.setItem("token", token);
    else localStorage.removeItem("token");
  }, [token]);

  // ---------- Cart Functions ----------
  const addToCart = async (itemId) => {
    setCartItems((prev) => {
      const updatedCart = { ...prev, [itemId]: (prev[itemId] || 0) + 1 };
      localStorage.setItem("cartItems", JSON.stringify(updatedCart));
      return updatedCart;
    });

    if (token) {
      try {
        await axios.post(
          `${url}/api/cart/add`,
          { itemId },
          { headers: { Authorization: `Bearer ${token}` } }
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

    if (token) {
      try {
        await axios.post(
          `${url}/api/cart/remove`,
          { itemId },
          { headers: { Authorization: `Bearer ${token}` } }
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
        const itemInfo = food_list.find((p) => p._id === item);
        if (itemInfo) totalAmount += itemInfo.price * cartItems[item];
      }
    }
    return totalAmount;
  };

  // ---------- API Calls ----------
  const fetchFoodList = async () => {
    try {
      const res = await axios.get(`${url}/api/food/list`);
      setFoodList(res.data.data);
    } catch (err) {
      console.error("Error loading food list:", err.message);
    }
  };

const loadCartData = async (userToken) => {
  if (!userToken) return;
  try {
    const res = await axios.get(`${url}/api/cart/get`, {
      headers: { Authorization: `Bearer ${userToken}` }
    });

    if (res.data.cartData) {
      setCartItems(res.data.cartData);
      localStorage.setItem("cartItems", JSON.stringify(res.data.cartData));
    }
  } catch (err) {
    if (err.response && err.response.status === 401) {
      console.warn("Token invalid or expired — logging out.");
      setToken("");
      localStorage.removeItem("token");
    } else {
      console.error("Error loading cart:", err.message);
    }
  }
};


  const verifyToken = async (userToken) => {
    if (!userToken) return false;
    try {
      const res = await axios.get(`${url}/api/user/verify`, {
        headers: { Authorization: `Bearer ${userToken}` },
      });
      return res.data.success;
    } catch (err) {
      console.warn("Token verification failed:", err.message);
      return false;
    }
  };

  // ---------- Initial Load ----------
  useEffect(() => {
    async function initialize() {
      try {
        await fetchFoodList();

        // Load saved cart from localStorage
        const savedCart = localStorage.getItem("cartItems");
        if (savedCart) setCartItems(JSON.parse(savedCart));

        const storedToken = localStorage.getItem("token");
        if (storedToken) {
          console.log("Restored token:", storedToken);
          const valid = await verifyToken(storedToken);
          console.log("Verification result:", valid);

          if (valid) {
            setToken(storedToken);
            await loadCartData(storedToken);
          } else {
            setToken("");
            localStorage.removeItem("token");
          }
        }
      } catch (err) {
        console.error("Initialization error:", err.message);
      } finally {
        setLoading(false);
      }
    }
    initialize();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ---------- Context Value ----------
  const contextValue = {
    food_list,
    cartItems,
    setCartItems,
    addToCart,
    removeFromCart,
    getTotalCartAmount,
    url,
    token,
    setToken,
    loading,
  };

  if (loading) return null;

  return (
    <StoreContext.Provider value={contextValue}>
      {props.children}
    </StoreContext.Provider>
  );
};

export default StoreContextProvider;
