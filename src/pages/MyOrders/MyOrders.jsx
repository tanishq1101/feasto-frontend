import React, { useContext, useEffect, useState, useCallback, useRef } from "react";
import { StoreContext } from "../../context/StoreContext";
import axios from "axios";
import { useLocation } from "react-router-dom";
import "./MyOrders.css";

const itemEmoji = {
  Pizza: "🍕",
  Burger: "🍔",
  Salad: "🥗",
  Drink: "🥤",
  default: "🛒",
};

// Map backend order status to step indices (0 to 3)
const getStatusStepIndex = (status) => {
  switch (status) {
    case "Pending":
    case "Order Placed":
      return 0;
    case "Food Processing":
      return 1;
    case "Out for Delivery":
      return 2;
    case "Delivered":
      return 3;
    default:
      return 0;
  }
};

// --- SUB-COMPONENT FOR LIVE ORDER TRACKER ---
const LiveOrderTracker = ({ order }) => {
  const [progress, setProgress] = useState(0);
  const [bikePos, setBikePos] = useState({ x: 20, y: 130 });
  const [etaSeconds, setEtaSeconds] = useState(1500); // 25 mins initial countdown
  const pathRef = useRef(null);

  // Status-based target progress and message
  let targetProgress = 0.15;
  let statusMessage = "Waiting for restaurant to accept your order...";
  let statusTitle = "Order Placed";

  const status = order.status;
  if (status === "Food Processing") {
    targetProgress = 0.48;
    statusTitle = "Preparing Your Meal";
    statusMessage = "Our chef is adding fresh spices and cooking your delicious food.";
  } else if (status === "Out for Delivery" || status === "On The Way") {
    targetProgress = 0.82;
    statusTitle = "Zooming to Your Doorstep";
    statusMessage = "Rohan (your delivery partner) is riding fast to get your food hot.";
  } else if (status === "Delivered") {
    targetProgress = 1.0;
    statusTitle = "Delivered!";
    statusMessage = "Enjoy your hot meal! Don't forget to rate your experience.";
  }

  // Handle live ETA countdown
  useEffect(() => {
    if (status === "Delivered") {
      setEtaSeconds(0);
      return;
    }
    // Set different times based on status
    let initialSeconds = 1500; // 25 mins
    if (status === "Food Processing") initialSeconds = 900; // 15 mins
    if (status === "Out for Delivery") initialSeconds = 420; // 7 mins
    setEtaSeconds(initialSeconds);

    const interval = setInterval(() => {
      setEtaSeconds((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(interval);
  }, [status]);

  // Animate progress bar to its target value on mount or status change
  useEffect(() => {
    setProgress(0); // reset
    let current = 0;
    const interval = setInterval(() => {
      current += 0.01;
      if (current >= targetProgress) {
        current = targetProgress;
        clearInterval(interval);
      }
      setProgress(current);
    }, 25);

    return () => clearInterval(interval);
  }, [targetProgress]);

  // Calculate bicycle position along SVG path
  useEffect(() => {
    if (pathRef.current) {
      try {
        const pathLength = pathRef.current.getTotalLength();
        const point = pathRef.current.getPointAtLength(pathLength * progress);
        setBikePos({ x: point.x, y: point.y });
      } catch (err) {
        // Fallback if path parsing fails
        const xCoord = 20 + (360 - 20) * progress;
        setBikePos({ x: xCoord, y: 115 });
      }
    }
  }, [progress]);

  const formatEta = (seconds) => {
    if (seconds <= 0) return "Delivered";
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs < 10 ? "0" : ""}${secs}s`;
  };

  return (
    <div className="live-tracker-panel animate-slide-down">
      <div className="tracker-header">
        <div className="tracker-eta-block">
          <span className="eta-label">ESTIMATED ARRIVAL</span>
          <h3 className="eta-timer">{formatEta(etaSeconds)}</h3>
        </div>
        <div className="tracker-status-block">
          <span className="status-label-heading">{statusTitle}</span>
          <p className="status-subtext">{statusMessage}</p>
        </div>
      </div>

      {/* SVG ROUTE MAP ANIMATION */}
      <div className="tracker-map-container">
        <svg viewBox="0 0 400 160" width="100%" height="100%" className="route-svg">
          {/* Gradients */}
          <defs>
            <linearGradient id="gradient-line" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#ff6b35" />
              <stop offset="100%" stopColor="#ff9f43" />
            </linearGradient>
          </defs>

          {/* Grid Background Lines for Map Aesthetics */}
          <line x1="50" y1="0" x2="50" y2="160" stroke="#f1f3f5" strokeWidth="1" strokeDasharray="4 4" />
          <line x1="150" y1="0" x2="150" y2="160" stroke="#f1f3f5" strokeWidth="1" strokeDasharray="4 4" />
          <line x1="250" y1="0" x2="250" y2="160" stroke="#f1f3f5" strokeWidth="1" strokeDasharray="4 4" />
          <line x1="350" y1="0" x2="350" y2="160" stroke="#f1f3f5" strokeWidth="1" strokeDasharray="4 4" />
          
          <line x1="0" y1="40" x2="400" y2="40" stroke="#f1f3f5" strokeWidth="1" strokeDasharray="4 4" />
          <line x1="0" y1="100" x2="400" y2="100" stroke="#f1f3f5" strokeWidth="1" strokeDasharray="4 4" />

          {/* Road Path (Gray background road) */}
          <path
            ref={pathRef}
            id="route-path"
            d="M 30 130 Q 100 130 120 70 T 220 50 T 320 120 T 370 70"
            fill="none"
            stroke="var(--map-road, #e2e8f0)"
            strokeWidth="8"
            strokeLinecap="round"
          />

          {/* Progress Path (colored route overlay) */}
          <path
            d="M 30 130 Q 100 130 120 70 T 220 50 T 320 120 T 370 70"
            fill="none"
            stroke="url(#gradient-line)"
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray="500"
            strokeDashoffset={500 - 500 * progress}
            style={{ transition: "stroke-dashoffset 0.1s ease" }}
          />

          {/* Restaurant Node */}
          <g transform="translate(30, 130)">
            <circle r="16" fill="#e6fcf5" stroke="#0ca678" strokeWidth="2" />
            <text y="5" x="-7" style={{ fontSize: "12px" }}>🏨</text>
          </g>

          {/* Home Node */}
          <g transform="translate(370, 70)">
            <circle r="16" fill="#fff5f5" stroke="#fa5252" strokeWidth="2" />
            <text y="5" x="-7" style={{ fontSize: "12px" }}>🏠</text>
          </g>

          {/* Moving Scooter Badge */}
          <g transform={`translate(${bikePos.x}, ${bikePos.y})`} style={{ transition: "transform 0.05s linear" }}>
            <circle r="18" fill="white" stroke="#ff6b35" strokeWidth="2" style={{ filter: "drop-shadow(0px 3px 5px rgba(0,0,0,0.15))" }} />
            <text y="5" x="-9" style={{ fontSize: "14px" }}>🛵</text>
          </g>
        </svg>
      </div>

      {/* DRIVER INFO CARD */}
      {status !== "Delivered" && (
        <div className="driver-card">
          <div className="driver-avatar-wrapper">
            <div className="driver-avatar">🚴</div>
            <div>
              <h5 className="driver-name">Rohan Kumar</h5>
              <p className="driver-rating">⭐ 4.9 Verified Partner</p>
            </div>
          </div>
          <button className="driver-call-btn" onClick={() => window.open("tel:+919876543210")}>
            📞 Call Rohan
          </button>
        </div>
      )}
    </div>
  );
};

const MyOrders = () => {
  const { url, authHeaders, isSignedIn } = useContext(StoreContext);
  const location = useLocation();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleting, setDeleting] = useState(null);

  // Live tracking visibility state
  const [activeTrackingOrderId, setActiveTrackingOrderId] = useState(null);

  const fetchOrders = useCallback(async () => {
    if (!isSignedIn) {
      setError("You must be logged in to view orders.");
      setLoading(false);
      return;
    }

    try {
      setError("");
      const headers = await authHeaders();
      if (!headers.Authorization) {
        setError("Session not ready. Please try again.");
        setOrders([]);
        return;
      }

      const res = await axios.get(`${url}/api/order/userorders`, { headers });

      if (res.data?.success) {
        setOrders(res.data.orders);
      } else {
        setOrders([]);
        setError(res.data?.message || "Failed to load orders.");
      }
    } catch (err) {
      console.error("Error fetching orders:", err);
      if (err.response?.status === 401) {
        setError("Session expired. Please sign in again.");
      } else {
        setError("Error loading orders.");
      }
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, [url, isSignedIn, authHeaders]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders, location.state?.refresh]);

  const handleTrackOrder = async () => {
    setLoading(true);
    try {
      await fetchOrders();
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteOrder = async (orderId) => {
    if (!window.confirm("Are you sure you want to delete this order?")) return;

    try {
      setDeleting(orderId);
      await axios.delete(`${url}/api/order/${orderId}`, {
        headers: await authHeaders(),
      });

      // Remove deleted order locally
      setOrders((prev) => prev.filter((o) => o.id !== orderId));
    } catch (err) {
      console.error("Error deleting order:", err);
      alert("Failed to delete order. Please try again.");
    } finally {
      setDeleting(null);
    }
  };

  if (loading) return <div className="my-orders-loading">Loading your orders...</div>;
  if (error) return <div className="my-orders-error">{error}</div>;

  if (orders.length === 0) {
    return (
      <div className="my-orders-empty">
        <div className="empty-orders-visual">📦</div>
        <h2>No Orders Found</h2>
        <p>You haven't placed any orders yet. Head to the menu to order some delicious food!</p>
      </div>
    );
  }

  return (
    <div className="my-orders-page">
      <h2>My Orders</h2>
      <div className="orders-container">
        {orders.map((order) => {
          const currentStep = getStatusStepIndex(order.status);

          return (
            <div key={order.id} className="order-card-premium">
              {/* Order Metadata Header */}
              <div className="order-card-header">
                <div>
                  <span className="order-meta-label">ORDER ID</span>
                  <h4 className="order-id-val">{order.id}</h4>
                </div>
                <div className="order-meta-right">
                  <span className="order-meta-label">TOTAL AMOUNT</span>
                  <span className="order-price-val">₹{order.amount}</span>
                </div>
              </div>

              {/* Order Items & Details */}
              <div className="order-card-body">
                <div className="order-details-info">
                  <div className="order-items-list">
                    <strong>Items Ordered:</strong>
                    <ul>
                      {order.items?.map((item, index) => (
                        <li key={index}>
                          {itemEmoji[item.name] || itemEmoji.default} {item.name}{" "}
                          <span className="item-qty-badge">x {item.quantity}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="order-address-box">
                    <strong>Delivery Address:</strong>
                    <p>
                      {order.address
                        ? `${order.address.firstName} ${order.address.lastName}, ${order.address.street}, ${order.address.city}, ${order.address.state} - ${order.address.zipcode}`
                        : "No address provided"}
                    </p>
                  </div>
                </div>

                {/* VISUAL STEPPER (Zomato/Swiggy style) */}
                <div className="order-tracking-stepper">
                  <div className="stepper-progress-bar">
                    <div
                      className="stepper-progress-line"
                      style={{ width: `${(currentStep / 3) * 100}%` }}
                    ></div>
                  </div>

                  <div className="stepper-steps-wrapper">
                    {/* STEP 1: PLACED */}
                    <div
                      className={`step-node ${currentStep >= 0 ? "completed" : ""} ${
                        currentStep === 0 ? "active" : ""
                      }`}
                    >
                      <div className="step-circle">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="step-icon"
                        >
                          <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
                          <polyline points="14 2 14 8 20 8" />
                        </svg>
                      </div>
                      <span className="step-label">Placed</span>
                    </div>

                    {/* STEP 2: PREPARING */}
                    <div
                      className={`step-node ${currentStep >= 1 ? "completed" : ""} ${
                        currentStep === 1 ? "active" : ""
                      }`}
                    >
                      <div className="step-circle">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="step-icon"
                        >
                          <path d="M6 18h12a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2z" />
                          <path d="M2 22h20" />
                          <path d="M12 2v16" />
                        </svg>
                      </div>
                      <span className="step-label">Preparing</span>
                    </div>

                    {/* STEP 3: OUT FOR DELIVERY */}
                    <div
                      className={`step-node ${currentStep >= 2 ? "completed" : ""} ${
                        currentStep === 2 ? "active" : ""
                      }`}
                    >
                      <div className="step-circle">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="step-icon"
                        >
                          <rect width="18" height="12" x="2" y="8" rx="2" ry="2" />
                          <path d="M6 22H4a2 2 0 0 1-2-2v-4a2 2 0 0 1 2-2h2" />
                          <path d="M18 22h2c1.1 0 2-.9 2-2v-4a2 2 0 0 0-2-2h-2" />
                          <circle cx="7" cy="22" r="2" />
                          <circle cx="17" cy="22" r="2" />
                        </svg>
                      </div>
                      <span className="step-label">On The Way</span>
                    </div>

                    {/* STEP 4: DELIVERED */}
                    <div
                      className={`step-node ${currentStep >= 3 ? "completed" : ""} ${
                        currentStep === 3 ? "active" : ""
                      }`}
                    >
                      <div className="step-circle">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="step-icon"
                        >
                          <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                          <polyline points="9 22 9 12 15 12 15 22" />
                        </svg>
                      </div>
                      <span className="step-label">Delivered</span>
                    </div>
                  </div>
                </div>

                {/* EXPANDABLE LIVE ROUTE TRACKER DRAWER */}
                {activeTrackingOrderId === order.id && <LiveOrderTracker order={order} />}
              </div>

              {/* Card Footer Actions */}
              <div className="order-card-footer">
                <div className="order-payment-status">
                  Payment Status:{" "}
                  <span className={`payment-badge ${order.payment ? "paid" : "cod"}`}>
                    {order.payment ? "PAID" : "CASH ON DELIVERY"}
                  </span>
                </div>

                <div className="order-actions">
                  {order.status !== "Delivered" && (
                    <button
                      className={`btn-live-track ${
                        activeTrackingOrderId === order.id ? "active" : ""
                      }`}
                      onClick={() =>
                        setActiveTrackingOrderId(
                          activeTrackingOrderId === order.id ? null : order.id
                        )
                      }
                    >
                      {activeTrackingOrderId === order.id ? "❌ Hide Tracker" : "🛰 Live Track"}
                    </button>
                  )}

                  <button className="btn-track" onClick={handleTrackOrder}>
                    🔄 Refresh Status
                  </button>

                  {order.status === "Delivered" && (
                    <button
                      className="btn-delete"
                      onClick={() => handleDeleteOrder(order.id)}
                      disabled={deleting === order.id}
                    >
                      {deleting === order.id ? "Deleting..." : "🗑 Remove Order"}
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MyOrders;
