import React, { useContext, useEffect, useState, useCallback, useRef } from "react";
import { StoreContext } from "../../context/StoreContext";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";
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
  const status = order.status;

  // Map status to step index: 0=Placed, 1=Preparing, 2=On the Way, 3=Delivered
  const getStatusStepIndexLocal = (statusVal) => {
    switch (statusVal) {
      case "Pending":
      case "Order Placed":
        return 0;
      case "Food Processing":
        return 1;
      case "Out for Delivery":
      case "On The Way":
        return 2;
      case "Delivered":
        return 3;
      default:
        return 0;
    }
  };

  const currentStep = getStatusStepIndexLocal(status);
  const [progress, setProgress] = useState(0);
  const [bikePos, setBikePos] = useState({ x: 20, y: 130 });
  const [etaSeconds, setEtaSeconds] = useState(1500); // 25 mins initial countdown
  const pathRef = useRef(null);

  // Status-based target progress and message
  let targetProgress = 0.15;
  let statusMessage = "Waiting for restaurant to accept your order...";
  let statusTitle = "Order Placed";

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

  // Simulate active scooter movement over time when status is Out for Delivery
  useEffect(() => {
    if (status !== "Out for Delivery" && status !== "On The Way") return;

    const movementInterval = setInterval(() => {
      setProgress((prev) => {
        // Slow creep up to 0.95
        if (prev < 0.95) {
          return prev + 0.003;
        }
        return prev;
      });
    }, 3000);

    return () => clearInterval(movementInterval);
  }, [status]);

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

  // Helper to format simulated timestamps based on order creation date
  const getFormattedTime = (dateStr, addMinutes = 0) => {
    try {
      const d = dateStr ? new Date(dateStr) : new Date();
      d.setMinutes(d.getMinutes() + addMinutes);
      return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    } catch (e) {
      return "";
    }
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
          {/* Gradients & Filters */}
          <defs>
            <linearGradient id="gradient-line" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#ff6b35" />
              <stop offset="100%" stopColor="#ff9f43" />
            </linearGradient>
            <filter id="shadow" x="-10%" y="-10%" width="120%" height="120%">
              <feDropShadow dx="0" dy="4" stdDeviation="4" floodOpacity="0.15" />
            </filter>
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
            className="animated-delivery-path"
          />

          {/* Restaurant Node */}
          <g transform="translate(30, 130)">
            <circle r="16" fill="#e6fcf5" stroke="#0ca678" strokeWidth="2" className="pulsing-node" />
            <text y="5" x="-7" style={{ fontSize: "12px" }}>🏨</text>
          </g>

          {/* Home Node */}
          <g transform="translate(370, 70)">
            <circle r="16" fill="#fff5f5" stroke="#fa5252" strokeWidth="2" />
            <text y="5" x="-7" style={{ fontSize: "12px" }}>🏠</text>
          </g>

          {/* Moving Scooter Badge */}
          <g transform={`translate(${bikePos.x}, ${bikePos.y})`} style={{ transition: "transform 0.1s linear" }}>
            <circle r="18" fill="white" stroke="#ff6b35" strokeWidth="2" style={{ filter: "url(#shadow)" }} />
            <circle r="24" fill="none" stroke="#ff6b35" strokeWidth="1.5" className="scooter-pulse" opacity="0.6" />
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
              <p className="driver-rating">⭐ 4.9 Verified Partner | On his way</p>
            </div>
          </div>
          <button className="driver-call-btn" onClick={() => window.open("tel:+919876543210")}>
            📞 Call Rohan
          </button>
        </div>
      )}

      {/* Activity Timeline */}
      <div className="tracker-timeline-box">
        <h4 className="timeline-heading">Order Milestone Timeline</h4>
        <div className="tracker-timeline-flow">
          {/* Milestone 1: Placed */}
          <div className="timeline-node active">
            <div className="timeline-icon green-glow">✓</div>
            <div className="timeline-details">
              <div className="timeline-meta">
                <span className="timeline-label">Order Placed</span>
                <span className="timeline-timestamp">{getFormattedTime(order.createdAt, 0)}</span>
              </div>
              <p className="timeline-subtext">Order received and confirmed by restaurant</p>
            </div>
          </div>

          {/* Milestone 2: Preparing */}
          <div className={`timeline-node ${currentStep >= 1 ? "active" : ""}`}>
            <div className={`timeline-icon ${currentStep >= 1 ? "green-glow" : "muted-glow"}`}>
              {currentStep >= 1 ? "✓" : "🍳"}
            </div>
            <div className="timeline-details">
              <div className="timeline-meta">
                <span className="timeline-label">Preparing Food</span>
                <span className="timeline-timestamp">
                  {currentStep >= 1 ? getFormattedTime(order.createdAt, 3) : "In Queue"}
                </span>
              </div>
              <p className="timeline-subtext">Chef is preparing your fresh hot meal</p>
            </div>
          </div>

          {/* Milestone 3: Out for Delivery */}
          <div className={`timeline-node ${currentStep >= 2 ? "active" : ""}`}>
            <div className={`timeline-icon ${currentStep >= 2 ? "green-glow" : "muted-glow"}`}>
              {currentStep >= 2 ? "✓" : "🛵"}
            </div>
            <div className="timeline-details">
              <div className="timeline-meta">
                <span className="timeline-label">Out for Delivery</span>
                <span className="timeline-timestamp">
                  {currentStep >= 2 ? getFormattedTime(order.createdAt, 15) : "Waiting"}
                </span>
              </div>
              <p className="timeline-subtext">Rider has picked up food and is riding to you</p>
            </div>
          </div>

          {/* Milestone 4: Delivered */}
          <div className={`timeline-node ${currentStep >= 3 ? "active" : ""}`}>
            <div className={`timeline-icon ${currentStep >= 3 ? "green-glow" : "muted-glow"}`}>
              {currentStep >= 3 ? "✓" : "🏠"}
            </div>
            <div className="timeline-details">
              <div className="timeline-meta">
                <span className="timeline-label">Delivered</span>
                <span className="timeline-timestamp">
                  {currentStep >= 3 ? getFormattedTime(order.createdAt, 25) : "Waiting"}
                </span>
              </div>
              <p className="timeline-subtext">Order handed over. Enjoy your meal!</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const MyOrders = () => {
  const { url, authHeaders, isSignedIn, addToCart, food_list } = useContext(StoreContext);
  const location = useLocation();
  const navigate = useNavigate();

  const handleReorder = async (orderItemsList) => {
    try {
      setLoading(true);
      for (const item of orderItemsList) {
        const foodItem = food_list.find((f) => f.name.toLowerCase() === item.name.toLowerCase());
        if (foodItem) {
          const foodId = foodItem.id || foodItem._id;
          for (let i = 0; i < item.quantity; i++) {
            await addToCart(foodId);
          }
        }
      }
      alert("Items added to your cart!");
      navigate("/cart");
    } catch (err) {
      console.error("Error reordering items:", err);
      alert("Failed to add items to cart.");
    } finally {
      setLoading(false);
    }
  };

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleting, setDeleting] = useState(null);

  // Live tracking visibility state
  const [activeTrackingOrderId, setActiveTrackingOrderId] = useState(null);

  // Bill & Soft Deletion states
  const [selectedBillOrder, setSelectedBillOrder] = useState(null);
  const [showArchived, setShowArchived] = useState(false);

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

  // Calculate bill details
  const getBillDetails = (order) => {
    if (!order) return null;
    const items = order.items || [];
    const itemsSubtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const deliveryFee = 40;
    const computedDiscount = Math.max(0, (itemsSubtotal + deliveryFee) - order.amount);
    
    // Guessing coupon name
    let couponName = "NONE";
    if (computedDiscount > 0) {
      if (Math.abs(computedDiscount - 40) < 2) {
        couponName = "FIRST40";
      } else if (Math.abs(computedDiscount - 80) < 2) {
        couponName = "FIRST5";
      } else {
        couponName = "PROMO DISCOUNT";
      }
    }
    
    return {
      subtotal: itemsSubtotal,
      deliveryFee,
      discount: computedDiscount,
      couponName,
      total: order.amount,
    };
  };

  const handleDeleteOrder = async (orderId, status) => {
    const isCancel = status === "Pending" || status === "Order Placed";
    const promptMessage = isCancel 
      ? "Are you sure you want to cancel this order?" 
      : "Are you sure you want to remove this order from your history?";

    if (!window.confirm(promptMessage)) return;

    try {
      setDeleting(orderId);
      const headers = await authHeaders();
      await axios.delete(`${url}/api/order/${orderId}`, { headers });

      const targetStatus = isCancel ? "Cancelled" : "Archived";
      // Update locally
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: targetStatus } : o))
      );
      alert(isCancel ? "Order cancelled successfully." : "Order removed from history.");
    } catch (err) {
      console.error("Error deleting order:", err);
      alert(isCancel ? "Failed to cancel order. Please try again." : "Failed to remove order. Please try again.");
    } finally {
      setDeleting(null);
    }
  };

  const handleClearDeliveredHistory = async () => {
    const deliveredOrders = orders.filter((o) => o.status === "Delivered");
    if (deliveredOrders.length === 0) return;
    if (!window.confirm(`Are you sure you want to remove all ${deliveredOrders.length} delivered orders from your history?`)) return;

    try {
      setLoading(true);
      const headers = await authHeaders();
      await Promise.all(
        deliveredOrders.map((o) =>
          axios.delete(`${url}/api/order/${o.id}`, { headers })
        )
      );
      setOrders((prev) =>
        prev.map((o) => (o.status === "Delivered" ? { ...o, status: "Archived" } : o))
      );
      alert("Delivered history cleared successfully.");
    } catch (err) {
      console.error("Error clearing delivered orders:", err);
      alert("Failed to clear some orders from history.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="my-orders-page">
        <div className="my-orders-header-row" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "30px" }}>
          <div className="shimmer-bg" style={{ width: "180px", height: "32px", borderRadius: "6px" }}></div>
        </div>
        <div className="orders-container" style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          {[1, 2, 3].map((idx) => (
            <div key={idx} className="order-card-premium" style={{ display: "flex", flexDirection: "column", gap: "15px", padding: "20px" }}>
              {/* Shimmer header */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid rgba(0,0,0,0.05)", paddingBottom: "15px" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  <div className="shimmer-bg" style={{ width: "80px", height: "12px", borderRadius: "3px" }}></div>
                  <div className="shimmer-bg" style={{ width: "150px", height: "18px", borderRadius: "4px" }}></div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "6px", alignItems: "flex-end" }}>
                  <div className="shimmer-bg" style={{ width: "100px", height: "12px", borderRadius: "3px" }}></div>
                  <div className="shimmer-bg" style={{ width: "70px", height: "20px", borderRadius: "4px" }}></div>
                </div>
              </div>
              
              {/* Shimmer body */}
              <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: "20px" }}>
                <div style={{ flex: 1, minWidth: "200px", display: "flex", flexDirection: "column", gap: "10px" }}>
                  <div className="shimmer-bg" style={{ width: "120px", height: "15px", borderRadius: "3px" }}></div>
                  <div className="shimmer-bg" style={{ width: "180px", height: "14px", borderRadius: "3px" }}></div>
                  <div className="shimmer-bg" style={{ width: "160px", height: "14px", borderRadius: "3px" }}></div>
                </div>
                <div style={{ flex: 1, minWidth: "250px", display: "flex", flexDirection: "column", gap: "10px" }}>
                  <div className="shimmer-bg" style={{ width: "100%", height: "14px", borderRadius: "3px" }}></div>
                  <div className="shimmer-bg" style={{ width: "90%", height: "14px", borderRadius: "3px" }}></div>
                </div>
              </div>
              
              {/* Shimmer tracking stepper */}
              <div style={{ padding: "15px 0 5px", display: "flex", flexDirection: "column", gap: "12px" }}>
                <div className="shimmer-bg" style={{ width: "100%", height: "6px", borderRadius: "3px" }}></div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  {[1, 2, 3, 4].map((step) => (
                    <div key={step} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "6px" }}>
                      <div className="shimmer-bg" style={{ width: "32px", height: "32px", borderRadius: "50%" }}></div>
                      <div className="shimmer-bg" style={{ width: "60px", height: "12px", borderRadius: "3px" }}></div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }
  if (error) return <div className="my-orders-error">{error}</div>;

  const activeOrders = orders.filter((o) => o.status !== "Archived");
  const archivedOrders = orders.filter((o) => o.status === "Archived");

  if (orders.length === 0) {
    return (
      <div className="my-orders-empty">
        <div className="empty-orders-visual">📦</div>
        <h2>No Orders Found</h2>
        <p>You haven't placed any orders yet. Head to the menu to order some delicious food!</p>
      </div>
    );
  }

  const hasDeliveredOrders = activeOrders.some((o) => o.status === "Delivered");

  return (
    <div className="my-orders-page">
      <div className="my-orders-header-row" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "30px", flexWrap: "wrap", gap: "15px" }}>
        <h2>My Orders</h2>
        {hasDeliveredOrders && (
          <button 
            className="btn-clear-history" 
            onClick={handleClearDeliveredHistory}
            disabled={loading}
            style={{
              padding: "10px 20px",
              backgroundColor: "#fff1f0",
              color: "#d9383a",
              border: "1px solid #ffd8d6",
              borderRadius: "30px",
              fontWeight: "600",
              cursor: "pointer",
              transition: "all 0.2s ease"
            }}
          >
            🗑 Clear Delivered History
          </button>
        )}
      </div>
      {activeOrders.length === 0 && (
        <div className="active-orders-empty-msg" style={{ padding: "40px", textAlign: "center", color: "#6c757d", background: "#f8f9fa", borderRadius: "10px", border: "1px dashed #dee2e6" }}>
          No active orders in progress.
        </div>
      )}
      <div className="orders-container">
        {activeOrders.map((order) => {
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
                  <button
                    className="btn-bill"
                    onClick={() => setSelectedBillOrder(order)}
                    style={{
                      padding: "10px 20px",
                      backgroundColor: "#fff0eb",
                      color: "#ff6b35",
                      border: "1px solid #ffdcd1",
                      borderRadius: "30px",
                      fontWeight: "600",
                      cursor: "pointer",
                      transition: "all 0.2s ease"
                    }}
                  >
                    📄 Generate Bill
                  </button>

                  {order.status !== "Delivered" && order.status !== "Cancelled" && (
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

                  {order.status !== "Cancelled" && (
                    <button className="btn-track" onClick={handleTrackOrder}>
                      🔄 Refresh Status
                    </button>
                  )}

                  {(order.status === "Pending" || order.status === "Order Placed") && (
                    <button
                      className="btn-delete cancel-btn"
                      onClick={() => handleDeleteOrder(order.id, order.status)}
                      disabled={deleting === order.id}
                      title="Cancel your order"
                    >
                      {deleting === order.id ? "Cancelling..." : "🚫 Cancel Order"}
                    </button>
                  )}

                  {(order.status === "Food Processing" || order.status === "Out for Delivery") && (
                    <button
                      className="btn-delete cancel-btn disabled"
                      disabled
                      title="Cannot cancel active order once food preparation or delivery has started"
                      style={{ cursor: "not-allowed", opacity: 0.5 }}
                    >
                      🚫 Cancel Order
                    </button>
                  )}

                  {order.status === "Delivered" && (
                    <>
                      <button
                        className="btn-track"
                        onClick={() => handleReorder(order.items)}
                        disabled={loading}
                        style={{ backgroundColor: "#ff6b35", color: "white" }}
                      >
                        🔄 Reorder Items
                      </button>
                      <button
                        className="btn-delete"
                        onClick={() => handleDeleteOrder(order.id, order.status)}
                        disabled={deleting === order.id}
                      >
                        {deleting === order.id ? "Deleting..." : "🗑 Remove Order"}
                      </button>
                    </>
                  )}

                  {order.status === "Cancelled" && (
                    <button
                      className="btn-delete"
                      onClick={() => handleDeleteOrder(order.id, order.status)}
                      disabled={deleting === order.id}
                    >
                      {deleting === order.id ? "Removing..." : "🗑 Remove Order"}
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* 📁 Collapsible Archived Orders Section */}
      {archivedOrders.length > 0 && (
        <div className="archived-orders-section" style={{ marginTop: "50px", borderTop: "2px dashed #dee2e6", paddingTop: "30px" }}>
          <div 
            className="archived-section-header" 
            onClick={() => setShowArchived(!showArchived)}
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              cursor: "pointer",
              padding: "15px 20px",
              backgroundColor: "#f8f9fa",
              borderRadius: "10px",
              border: "1px solid #e9ecef",
              userSelect: "none"
            }}
          >
            <h3 style={{ margin: 0, display: "flex", alignItems: "center", gap: "10px", color: "#495057", fontSize: "1.15rem" }}>
              📁 Archived / Removed History ({archivedOrders.length})
            </h3>
            <span className="archive-toggle-arrow" style={{ fontSize: "1.2rem", color: "#6c757d", transition: "transform 0.2s" }}>
              {showArchived ? "▲" : "▼"}
            </span>
          </div>
          
          {showArchived && (
            <div className="orders-container archived-list" style={{ marginTop: "20px", display: "flex", flexDirection: "column", gap: "20px" }}>
              {archivedOrders.map((order) => (
                <div key={order.id} className="order-card-premium archived-card" style={{ opacity: 0.85, border: "1px dashed #ced4da" }}>
                  <div className="order-card-header" style={{ backgroundColor: "#f1f3f5" }}>
                    <div>
                      <span className="order-meta-label" style={{ color: "#868e96" }}>ORDER ID</span>
                      <h4 className="order-id-val" style={{ color: "#495057" }}>{order.id}</h4>
                    </div>
                    <div className="order-meta-right">
                      <span className="order-meta-label" style={{ color: "#868e96" }}>TOTAL AMOUNT</span>
                      <span className="order-price-val" style={{ color: "#495057" }}>₹{order.amount}</span>
                    </div>
                  </div>
                  <div className="order-card-body">
                    <div className="order-details-info">
                      <div className="order-items-list">
                        <strong>Items Ordered:</strong>
                        <ul>
                          {order.items?.map((item, index) => (
                            <li key={index} style={{ color: "#495057" }}>
                              {itemEmoji[item.name] || itemEmoji.default} {item.name}{" "}
                              <span className="item-qty-badge">x {item.quantity}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div className="order-address-box">
                        <strong>Delivery Address:</strong>
                        <p style={{ color: "#6c757d" }}>
                          {order.address
                            ? `${order.address.firstName} ${order.address.lastName}, ${order.address.street}, ${order.address.city}, ${order.address.state} - ${order.address.zipcode}`
                            : "No address provided"}
                        </p>
                      </div>
                    </div>
                    
                    <div className="order-tracking-status-badge archived-badge" style={{ display: "inline-flex", alignSelf: "flex-start", padding: "6px 12px", background: "#e9ecef", borderRadius: "20px", color: "#495057", fontSize: "0.85rem", fontWeight: "600", marginTop: "10px" }}>
                      📂 Archived Record
                    </div>
                  </div>
                  
                  <div className="order-card-footer" style={{ borderTop: "1px solid #f1f3f5" }}>
                    <div className="order-payment-status" style={{ color: "#868e96" }}>
                      Status: <span style={{ fontWeight: "700", color: "#e74c3c" }}>ARCHIVED ({order.status})</span>
                    </div>
                    <div className="order-actions">
                      <button
                        className="btn-bill"
                        onClick={() => setSelectedBillOrder(order)}
                        style={{
                          padding: "10px 20px",
                          backgroundColor: "#f1f3f5",
                          color: "#495057",
                          border: "1px solid #ced4da",
                          borderRadius: "30px",
                          fontWeight: "600",
                          cursor: "pointer",
                          transition: "all 0.2s ease"
                        }}
                      >
                        📄 Generate Bill
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 🧾 Printable Bill Generator Modal */}
      {selectedBillOrder && (() => {
        const details = getBillDetails(selectedBillOrder);
        const orderDate = new Date(selectedBillOrder.createdAt).toLocaleString("en-IN", {
          timeZone: "Asia/Kolkata",
          dateStyle: "medium",
          timeStyle: "short",
        });

        const downloadTextInvoice = () => {
          const invoiceText = `
==================================================
                 FEASTO INVOICE
==================================================
Order ID:       ${selectedBillOrder.id}
Date & Time:    ${orderDate}
Status:         ${selectedBillOrder.status.toUpperCase()}
Payment Method: ${selectedBillOrder.payment ? "Stripe Online Card" : "Cash on Delivery"}
Payment Status: ${selectedBillOrder.payment ? "PAID" : selectedBillOrder.status === "Cancelled" ? "CANCELLED" : "UNPAID (COD)"}
--------------------------------------------------
CUSTOMER DETAILS:
Name:           ${selectedBillOrder.address?.firstName} ${selectedBillOrder.address?.lastName}
Phone:          ${selectedBillOrder.address?.phone || "N/A"}
Address:        ${selectedBillOrder.address?.street}, ${selectedBillOrder.address?.city}, ${selectedBillOrder.address?.state} - ${selectedBillOrder.address?.zipcode}
--------------------------------------------------
ITEMS ORDERED:
${selectedBillOrder.items?.map((item) => `- ${item.name.padEnd(25)} x ${item.quantity.toString().padEnd(2)}   ₹${(item.price * item.quantity).toFixed(2)}`).join("\n")}
--------------------------------------------------
Subtotal:       ₹${details.subtotal.toFixed(2)}
Delivery Fee:   ₹${details.deliveryFee.toFixed(2)}
Discount:       -₹${details.discount.toFixed(2)} (${details.couponName})
Grand Total:    ₹${details.total.toFixed(2)}
==================================================
       Thank you for ordering with Feasto!
==================================================
`;
          const element = document.createElement("a");
          const file = new Blob([invoiceText], { type: "text/plain" });
          element.href = URL.createObjectURL(file);
          element.download = `Feasto_Invoice_${selectedBillOrder.id}.txt`;
          document.body.appendChild(element);
          element.click();
          document.body.removeChild(element);
        };

        return (
          <div className="bill-modal-overlay">
            <div className="bill-modal-content">
              {/* Watermark Stamps */}
              {selectedBillOrder.status === "Cancelled" && <div className="bill-watermark cancelled">CANCELLED</div>}
              {selectedBillOrder.status === "Archived" && <div className="bill-watermark archived">ARCHIVED</div>}
              {selectedBillOrder.status !== "Cancelled" && selectedBillOrder.status !== "Archived" && (
                selectedBillOrder.payment 
                  ? <div className="bill-watermark paid">PAID</div>
                  : <div className="bill-watermark unpaid">COD UNPAID</div>
              )}

              {/* Receipt Header */}
              <div className="bill-receipt-header">
                <h2>FEASTO FOODS</h2>
                <p className="subtitle">Premium Food Delivery App</p>
                <div className="receipt-separator-dash"></div>
                <div className="bill-row">
                  <span><strong>INVOICE NO:</strong></span>
                  <span className="mono">{selectedBillOrder.id}</span>
                </div>
                <div className="bill-row">
                  <span><strong>DATE:</strong></span>
                  <span>{orderDate}</span>
                </div>
                <div className="bill-row">
                  <span><strong>STATUS:</strong></span>
                  <span className={`status-tag-text ${selectedBillOrder.status.toLowerCase()}`}>{selectedBillOrder.status}</span>
                </div>
                <div className="bill-row">
                  <span><strong>PAYMENT METHOD:</strong></span>
                  <span>{selectedBillOrder.payment ? "Stripe Card (Paid)" : "Cash on Delivery"}</span>
                </div>
              </div>

              <div className="receipt-separator-dash"></div>

              {/* Customer Info */}
              <div className="bill-receipt-section">
                <h4>DELIVERY ADDRESS</h4>
                <p><strong>{selectedBillOrder.address?.firstName} {selectedBillOrder.address?.lastName}</strong></p>
                <p>{selectedBillOrder.address?.street}</p>
                <p>{selectedBillOrder.address?.city}, {selectedBillOrder.address?.state} - {selectedBillOrder.address?.zipcode}</p>
                <p>Phone: {selectedBillOrder.address?.phone || "N/A"}</p>
              </div>

              <div className="receipt-separator-dash"></div>

              {/* Items Table */}
              <div className="bill-receipt-section">
                <h4>ORDER DETAILS</h4>
                <table className="bill-items-table">
                  <thead>
                    <tr>
                      <th align="left">ITEM</th>
                      <th align="center">QTY</th>
                      <th align="right">PRICE</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedBillOrder.items?.map((item, idx) => (
                      <tr key={idx}>
                        <td align="left">{item.name}</td>
                        <td align="center">x{item.quantity}</td>
                        <td align="right">₹{item.price * item.quantity}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="receipt-separator-dash"></div>

              {/* Pricing calculations */}
              <div className="bill-receipt-section bill-totals">
                <div className="bill-row sub">
                  <span>Subtotal:</span>
                  <span>₹{details.subtotal}</span>
                </div>
                <div className="bill-row sub">
                  <span>Delivery Fee:</span>
                  <span>₹{details.deliveryFee}</span>
                </div>
                {details.discount > 0 && (
                  <div className="bill-row discount">
                    <span>Discount ({details.couponName}):</span>
                    <span>-₹{details.discount}</span>
                  </div>
                )}
                <div className="receipt-separator-solid"></div>
                <div className="bill-row grand-total">
                  <span>NET TOTAL:</span>
                  <span>₹{details.total}</span>
                </div>
              </div>

              <div className="receipt-separator-dash"></div>
              <p className="bill-thank-you">Thank you for dining with Feasto! Feel free to print or save this receipt.</p>

              {/* Action Buttons */}
              <div className="bill-modal-actions">
                <button className="bill-act-btn print" onClick={() => window.print()}>🖨 Print or Save PDF</button>
                <button className="bill-act-btn download" onClick={downloadTextInvoice}>📥 Download Text Invoice</button>
                <button className="bill-act-btn close" onClick={() => setSelectedBillOrder(null)}>❌ Close</button>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
};

export default MyOrders;
