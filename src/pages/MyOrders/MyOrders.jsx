import React, { useContext, useEffect, useState, useCallback } from "react";
import { StoreContext } from "../../context/StoreContext";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";
import "./MyOrders.css";

const itemEmoji = {
  Pizza: "🍕",
  Burger: "🍔",
  Salad: "🥗",
  Drink: "🥤",
  default: "🛒",
};

const MyOrders = () => {
  const { url, token } = useContext(StoreContext);
  const navigate = useNavigate();
  const location = useLocation();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleting, setDeleting] = useState(null);

  const fetchOrders = useCallback(async () => {
    if (!token) {
      setError("You must be logged in to view orders.");
      setLoading(false);
      return;
    }

    try {
      setError("");
      const res = await axios.get(`${url}/api/order/userorders`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.data?.success) {
        setOrders(res.data.orders);
      } else {
        setOrders([]);
        setError(res.data?.message || "Failed to load orders.");
      }
    } catch (err) {
      console.error("Error fetching orders:", err);
      if (err.response?.status === 401) navigate("/login");
      else setError("Error loading orders.");
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, [url, token, navigate]);

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

  // 🚀 DELETE ORDER FUNCTION
  const handleDeleteOrder = async (orderId) => {
    if (!window.confirm("Are you sure you want to delete this order?")) return;

    try {
      setDeleting(orderId);
      await axios.delete(`${url}/api/order/${orderId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Remove deleted order locally
      setOrders((prev) => prev.filter((o) => o._id !== orderId));
    } catch (err) {
      console.error("Error deleting order:", err);
      alert("Failed to delete order. Please try again.");
    } finally {
      setDeleting(null);
    }
  };

  if (loading) return <div className="my-orders">Loading orders...</div>;
  if (error) return <div className="my-orders error">{error}</div>;
  if (orders.length === 0)
    return <div className="my-orders">You have no orders yet.</div>;

  return (
    <div className="my-orders">
      <h2>My Orders</h2>
      <div className="orders-container">
        {orders.map((order) => (
          <div key={order._id} className="order-card">
            <p>
              <b>Order ID:</b> <span className="order-id">{order._id}</span>
            </p>

            <p>
              <b>Status:</b>{" "}
              <span
                className={`status-tag ${
                  order.status === "Food Processing"
                    ? "status-pending"
                    : order.status === "Out for Delivery"
                    ? "status-out"
                    : order.status === "Delivered"
                    ? "status-delivered"
                    : ""
                }`}
              >
                {order.status}
              </span>
            </p>

            <p>
              <b>Payment:</b>{" "}
              <span
                className={`status-tag ${
                  order.payment ? "status-paid" : "status-cod"
                }`}
              >
                {order.payment ? "Paid" : "Cash on Delivery"}
              </span>
            </p>

            <p className="items-list">
              <b>Items:</b>{" "}
              {order.items?.map((item, index) => (
                <span key={index}>
                  {itemEmoji[item.name] || itemEmoji.default} {item.name} x{" "}
                  {item.quantity}
                </span>
              ))}
            </p>

            <p className="address">
              <b>Delivery Address:</b>{" "}
              {order.address
                ? `${order.address.street}, ${order.address.city}, ${order.address.state}, ${order.address.zipcode}, ${order.address.country}`
                : "No address provided"}
            </p>

            <p className="amount">
              <b>Amount:</b> ${order.amount?.toFixed(2)}
            </p>

            <div className="order-buttons">
  <button className="track-order" onClick={handleTrackOrder}>
    {loading ? "Updating..." : "Track Order"}
  </button>

  {order.status === "Delivered" && (
    <button
      className="delete-order"
      onClick={() => handleDeleteOrder(order._id)}
      disabled={deleting === order._id}
    >
      {deleting === order._id ? "Deleting..." : "🗑 Delete"}
    </button>
  )}
</div>

          </div>
        ))}
      </div>
    </div>
  );
};

export default MyOrders;
