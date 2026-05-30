import React, { useContext, useState, useEffect } from "react";
import "./PlaceOrder.css";
import { StoreContext } from "../../context/StoreContext";
import axios from "axios";
import { getEntityId } from "../../utils/entityId";
import { useNavigate } from "react-router-dom";

const PlaceOrder = () => {
  const { getTotalCartAmount, cartItems, food_list, authHeaders, url } =
    useContext(StoreContext);
  const navigate = useNavigate();

  const [paymentMethod, setPaymentMethod] = useState("stripe"); // 'stripe' or 'cod'
  const [data, setData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    street: "",
    city: "",
    state: "",
    zipcode: "",
    country: "",
    phone: "",
  });

  // Load saved address from localStorage on mount
  useEffect(() => {
    const savedAddress = localStorage.getItem("feasto_delivery_address");
    if (savedAddress) {
      try {
        setData(JSON.parse(savedAddress));
      } catch (err) {
        console.error("Error parsing saved address:", err);
      }
    }
  }, []);

  // Save address to localStorage on change
  const onChangeHandler = (e) => {
    const { name, value } = e.target;
    setData((prev) => {
      const updated = { ...prev, [name]: value };
      localStorage.setItem("feasto_delivery_address", JSON.stringify(updated));
      return updated;
    });
  };

  const getOrderItems = () => {
    return food_list
      .filter((item) => {
        const itemId = getEntityId(item);
        return itemId && cartItems[itemId] > 0;
      })
      .map((item) => {
        const itemId = getEntityId(item);
        return {
          id: itemId,
          name: item.name,
          price: item.price,
          quantity: cartItems[itemId],
          image: item.image,
          category: item.category,
        };
      });
  };

  const handlePlaceOrderStripe = async () => {
    const orderItems = getOrderItems();
    if (orderItems.length === 0) return alert("Cart is empty!");

    const orderData = {
      address: data,
      items: orderItems.map(({ name, price, quantity }) => ({ name, price, quantity })),
      amount: getTotalCartAmount() + 40,
    };

    try {
      const config = { headers: await authHeaders() };
      const response = await axios.post(`${url}/api/order/create-checkout-session`, orderData, config);

      if (response.data?.url) {
        window.location.href = response.data.url; // redirect to Stripe
      } else {
        alert("Unable to initialize Stripe checkout.");
      }
    } catch (error) {
      console.error(error);
      alert("Payment failed.");
    }
  };

  const handlePlaceOrderCOD = async () => {
    const orderItems = getOrderItems();
    if (orderItems.length === 0) return alert("Cart is empty!");

    const orderData = {
      address: data,
      items: orderItems.map(({ name, price, quantity }) => ({ name, price, quantity })),
      amount: getTotalCartAmount() + 40,
    };

    try {
      const config = { headers: await authHeaders() };
      const response = await axios.post(`${url}/api/order/place`, orderData, config);

      if (response.data?.success) {
        alert("Order placed successfully (Cash on Delivery)");
        navigate("/myorders", { state: { refresh: true } });
      } else {
        alert(response.data?.message || "COD order failed.");
      }
    } catch (error) {
      console.error(error);
      alert("COD order failed.");
    }
  };

  const onSubmitHandler = (e) => {
    e.preventDefault();
    if (paymentMethod === "stripe") {
      handlePlaceOrderStripe();
    } else {
      handlePlaceOrderCOD();
    }
  };

  const orderItems = getOrderItems();
  const subtotal = getTotalCartAmount();
  const deliveryFee = subtotal === 0 ? 0 : 40;
  const grandTotal = subtotal === 0 ? 0 : subtotal + deliveryFee;

  return (
    <div className="place-order-page">
      <h1 className="checkout-title">Checkout</h1>
      
      <form onSubmit={onSubmitHandler} className="checkout-form">
        <div className="checkout-left-section">
          {/* STEP 1: DELIVERY INFORMATION */}
          <div className="checkout-card">
            <div className="step-badge">1</div>
            <h2>Delivery Information</h2>
            
            <div className="inputs-grid">
              <div className="input-group-row">
                <div className="input-wrapper">
                  <input
                    required
                    name="firstName"
                    value={data.firstName}
                    onChange={onChangeHandler}
                    placeholder="First name"
                  />
                </div>
                <div className="input-wrapper">
                  <input
                    required
                    name="lastName"
                    value={data.lastName}
                    onChange={onChangeHandler}
                    placeholder="Last name"
                  />
                </div>
              </div>

              <div className="input-wrapper full-width">
                <input
                  required
                  type="email"
                  name="email"
                  value={data.email}
                  onChange={onChangeHandler}
                  placeholder="Email address"
                />
              </div>

              <div className="input-wrapper full-width">
                <input
                  required
                  name="street"
                  value={data.street}
                  onChange={onChangeHandler}
                  placeholder="Street Address"
                />
              </div>

              <div className="input-group-row">
                <div className="input-wrapper">
                  <input
                    required
                    name="city"
                    value={data.city}
                    onChange={onChangeHandler}
                    placeholder="City"
                  />
                </div>
                <div className="input-wrapper">
                  <input
                    required
                    name="state"
                    value={data.state}
                    onChange={onChangeHandler}
                    placeholder="State"
                  />
                </div>
              </div>

              <div className="input-group-row">
                <div className="input-wrapper">
                  <input
                    required
                    name="zipcode"
                    value={data.zipcode}
                    onChange={onChangeHandler}
                    placeholder="Zip code"
                  />
                </div>
                <div className="input-wrapper">
                  <input
                    required
                    name="country"
                    value={data.country}
                    onChange={onChangeHandler}
                    placeholder="Country"
                  />
                </div>
              </div>

              <div className="input-wrapper full-width">
                <input
                  required
                  type="tel"
                  name="phone"
                  value={data.phone}
                  onChange={onChangeHandler}
                  placeholder="Phone number"
                />
              </div>
            </div>
          </div>

          {/* STEP 2: PAYMENT METHOD */}
          <div className="checkout-card margin-top-20">
            <div className="step-badge">2</div>
            <h2>Select Payment Method</h2>
            
            <div className="payment-options-grid">
              {/* STRIPE CARD OPTION */}
              <div 
                className={`payment-option-card ${paymentMethod === "stripe" ? "selected" : ""}`}
                onClick={() => setPaymentMethod("stripe")}
              >
                <div className="payment-header">
                  <div className="payment-icon-wrapper stripe-color">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="payment-svg">
                      <rect width="20" height="14" x="2" y="5" rx="2" />
                      <line x1="2" x2="22" y1="10" y2="10" />
                    </svg>
                  </div>
                  <div className="custom-radio">
                    <div className="radio-dot"></div>
                  </div>
                </div>
                <h3 className="payment-name">Stripe Card Payment</h3>
                <p className="payment-desc">Pay instantly using your credit or debit card. Safe & encrypted.</p>
              </div>

              {/* COD OPTION */}
              <div 
                className={`payment-option-card ${paymentMethod === "cod" ? "selected" : ""}`}
                onClick={() => setPaymentMethod("cod")}
              >
                <div className="payment-header">
                  <div className="payment-icon-wrapper cod-color">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="payment-svg">
                      <rect width="6" height="11" x="2" y="9" rx="2" />
                      <rect width="6" height="14" x="16" y="6" rx="2" />
                      <path d="M22 18H2a4 4 0 0 0 4 4h12a4 4 0 0 0 4-4Z" />
                      <path d="M12 2v16" />
                    </svg>
                  </div>
                  <div className="custom-radio">
                    <div className="radio-dot"></div>
                  </div>
                </div>
                <h3 className="payment-name">Cash on Delivery (COD)</h3>
                <p className="payment-desc">Pay with cash to our delivery executive when your meal arrives.</p>
              </div>
            </div>
          </div>
        </div>

        {/* STEP 3: ORDER SUMMARY & SUBMIT */}
        <div className="checkout-right-section">
          <div className="checkout-summary-card">
            <div className="step-badge">3</div>
            <h2>Order Review</h2>
            
            <div className="summary-items-list">
              {orderItems.map((item) => (
                <div key={item.id} className="summary-item-row">
                  <img
                    className="summary-item-img"
                    src={item.image?.startsWith("http") ? item.image : `${url}/images/${item.image}`}
                    alt={item.name}
                  />
                  <div className="summary-item-info">
                    <span className="summary-item-name">{item.name}</span>
                    <span className="summary-item-qty-price">
                      {item.quantity} x ₹{item.price}
                    </span>
                  </div>
                  <span className="summary-item-total">
                    ₹{item.price * item.quantity}
                  </span>
                </div>
              ))}
            </div>

            <hr className="summary-divider" />
            
            <div className="summary-totals-table">
              <div className="summary-total-line">
                <span>Subtotal</span>
                <span>₹{subtotal}</span>
              </div>
              <div className="summary-total-line">
                <span>Delivery Fee</span>
                <span>₹{deliveryFee}</span>
              </div>
              <hr className="summary-divider-thin" />
              <div className="summary-total-line grand-total">
                <span>Grand Total</span>
                <span>₹{grandTotal}</span>
              </div>
            </div>

            <button type="submit" className="place-order-btn">
              {paymentMethod === "stripe" ? (
                <>
                  <span>PROCEED TO PAY</span>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="btn-arrow-svg">
                    <path d="M5 12h14" />
                    <path d="m12 5 7 7-7 7" />
                  </svg>
                </>
              ) : (
                <>
                  <span>CONFIRM ORDER (COD)</span>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="btn-arrow-svg">
                    <path d="M20 6 9 17l-5-5" />
                  </svg>
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default PlaceOrder;
