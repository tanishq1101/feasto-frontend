import React, { useContext } from "react";
import "./Cart.css";
import { StoreContext } from "../../context/StoreContext";
import { useNavigate } from "react-router-dom";
import { getEntityId } from "../../utils/entityId";

const Cart = () => {
  const { cartItems, food_list, addToCart, removeFromCart, clearItemFromCart, getTotalCartAmount, url } =
    useContext(StoreContext);
  const navigate = useNavigate();

  const totalAmount = getTotalCartAmount();
  const deliveryFee = totalAmount === 0 ? 0 : 40;
  const grandTotal = totalAmount === 0 ? 0 : totalAmount + deliveryFee;

  // Find if there are any items in the cart
  const cartHasItems = food_list.some((item) => {
    const itemId = getEntityId(item);
    return itemId && cartItems[itemId] > 0;
  });

  if (!cartHasItems) {
    return (
      <div className="cart-empty-container">
        <div className="cart-empty-visual">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="empty-cart-svg"
          >
            <circle cx="8" cy="21" r="1" />
            <circle cx="19" cy="21" r="1" />
            <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
          </svg>
        </div>
        <h2>Your Cart is Empty</h2>
        <p>Explore our menu and add delicious meals to your cart!</p>
        <button className="browse-menu-btn" onClick={() => navigate("/")}>
          Explore Menu
        </button>
      </div>
    );
  }

  return (
    <div className="cart-page">
      <h1 className="cart-title">Your Order Cart</h1>
      
      <div className="cart-content">
        <div className="cart-items-section">
          <div className="cart-header-row">
            <span className="col-img">Product</span>
            <span className="col-desc">Details</span>
            <span className="col-price">Price</span>
            <span className="col-qty">Quantity</span>
            <span className="col-total">Total</span>
            <span className="col-actions">Actions</span>
          </div>

          <div className="cart-items-list">
            {food_list.map((item) => {
              const itemId = getEntityId(item);
              if (!itemId || !cartItems[itemId] || cartItems[itemId] <= 0) return null;

              return (
                <div key={itemId} className="cart-item-card">
                  <div className="cart-item-image-container">
                    <img
                      className="cart-item-image"
                      src={item.image?.startsWith("http") ? item.image : `${url}/images/${item.image}`}
                      alt={item.name}
                    />
                  </div>
                  
                  <div className="cart-item-info">
                    <h3 className="cart-item-name">{item.name}</h3>
                    <span className="cart-item-category">{item.category}</span>
                  </div>
                  
                  <div className="cart-item-price-col">
                    <span className="mobile-label">Price:</span>
                    <span className="price-val">₹{item.price}</span>
                  </div>
                  
                  <div className="cart-item-qty-col">
                    <span className="mobile-label">Quantity:</span>
                    <div className="qty-controls">
                      <button
                        className="qty-btn minus"
                        onClick={() => removeFromCart(itemId)}
                        aria-label="Decrease quantity"
                      >
                        -
                      </button>
                      <span className="qty-val">{cartItems[itemId]}</span>
                      <button
                        className="qty-btn plus"
                        onClick={() => addToCart(itemId)}
                        aria-label="Increase quantity"
                      >
                        +
                      </button>
                    </div>
                  </div>
                  
                  <div className="cart-item-total-col">
                    <span className="mobile-label">Total:</span>
                    <span className="total-val">₹{item.price * cartItems[itemId]}</span>
                  </div>
                  
                  <div className="cart-item-actions-col">
                    <button
                      className="clear-item-btn"
                      onClick={() => clearItemFromCart(itemId)}
                      title="Remove item"
                      aria-label="Remove item"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M3 6h18" />
                        <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                        <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                      </svg>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="cart-summary-section">
          <div className="cart-total-card">
            <h2>Cart Summary</h2>
            <div className="cart-totals-table">
              <div className="cart-total-line">
                <span>Subtotal</span>
                <span>₹{totalAmount}</span>
              </div>
              <div className="cart-total-line">
                <span>Delivery Fee</span>
                <span>₹{deliveryFee}</span>
              </div>
              <hr className="summary-divider" />
              <div className="cart-total-line grand-total">
                <span>Total</span>
                <span>₹{grandTotal}</span>
              </div>
            </div>
            <button
              className="checkout-btn"
              onClick={() => navigate("/order")}
            >
              PROCEED TO CHECKOUT
            </button>
          </div>

          <div className="promocode-card">
            <p className="promocode-title">Have a promo code?</p>
            <div className="promocode-input-wrapper">
              <input type="text" placeholder="Enter coupon code" />
              <button className="promocode-submit-btn">Apply</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
