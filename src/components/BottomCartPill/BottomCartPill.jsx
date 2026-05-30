import React, { useContext } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { StoreContext } from "../../context/StoreContext";
import { getEntityId } from "../../utils/entityId";
import "./BottomCartPill.css";

const BottomCartPill = () => {
  const { cartItems, food_list, getTotalCartAmount } = useContext(StoreContext);
  const navigate = useNavigate();
  const location = useLocation();

  // Hide the pill on Cart, Order, and Verification pages
  const hidePaths = ["/cart", "/order", "/verify", "/payment-success", "/payment-failed"];
  if (hidePaths.includes(location.pathname)) {
    return null;
  }

  // Calculate total item count in cart
  let totalCount = 0;
  for (const itemId in cartItems) {
    if (cartItems[itemId] > 0) {
      // Confirm item is valid
      const foodItem = food_list.find((f) => String(getEntityId(f)) === String(itemId));
      if (foodItem) {
        totalCount += cartItems[itemId];
      }
    }
  }

  if (totalCount === 0) {
    return null;
  }

  const totalAmount = getTotalCartAmount();

  return (
    <div className="bottom-cart-pill-container" onClick={() => navigate("/cart")}>
      <div className="bottom-cart-pill-left">
        <div className="cart-badge-icon">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="pill-cart-svg">
            <circle cx="8" cy="21" r="1" />
            <circle cx="19" cy="21" r="1" />
            <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
          </svg>
          <span className="cart-count-bubble">{totalCount}</span>
        </div>
        <div className="cart-price-info">
          <span className="pill-item-lbl">{totalCount} {totalCount === 1 ? "item" : "items"}</span>
          <span className="pill-price-val">₹{totalAmount}</span>
        </div>
      </div>
      <div className="bottom-cart-pill-right">
        <span>View Cart</span>
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="pill-arrow-svg">
          <path d="M5 12h14" />
          <path d="m12 5 7 7-7 7" />
        </svg>
      </div>
    </div>
  );
};

export default BottomCartPill;
