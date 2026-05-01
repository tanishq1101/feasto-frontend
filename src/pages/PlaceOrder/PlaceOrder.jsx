import React, { useContext, useState } from "react";
import "./PlaceOrder.css";
import { StoreContext } from "../../context/StoreContext";
import axios from "axios";


const PlaceOrder = () => {
  const { getTotalCartAmount, cartItems, food_list, authHeaders, url } =
    useContext(StoreContext);



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

  const onChangeHandler = (e) => {
    const { name, value } = e.target;
    setData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePlaceOrder = async (e) => {
  e.preventDefault();

  const orderItems = food_list
    .filter((item) => cartItems[item.id] > 0)
    .map((item) => ({
      name: item.name,
      price: item.price,
      quantity: cartItems[item.id],
    }));

  if (orderItems.length === 0) return alert("Cart is empty!");

  const orderData = {
    address: data,
    items: orderItems,
    amount: getTotalCartAmount() + 2,
  };

  try {
    const config = { headers: await authHeaders() };
    const response = await axios.post(`${url}/api/order/create-checkout-session`, orderData, config);

    window.location.href = response.data.url;  // ✅ redirect correctly
  } catch (error) {
    console.error(error);
    alert("Payment failed.");
  }
};

  const handleCOD = async () => {
    const orderItems = food_list
      .filter((item) => cartItems[item.id] > 0)
      .map((item) => ({
        name: item.name,
        price: item.price,
        quantity: cartItems[item.id],
      }));

    if (orderItems.length === 0) return alert("Cart is empty!");

    const orderData = {
      address: data,
      items: orderItems,
      amount: getTotalCartAmount() + 2,
    };

    try {
      const config = { headers: await authHeaders() };
      const response = await axios.post(`${url}/api/order/place`, orderData, config);

      if (response.data.success) {
        alert("Order placed successfully (Cash on Delivery)");
        window.location.href = "/myorders"; // ✅ Redirect
      }
    } catch (error) {
      console.error(error);
      alert("COD order failed.");
    }
  };



  return (
    <div className="place-order">
      <form onSubmit={handlePlaceOrder}>
        <div className="place-order-left">
          <h2 className="title">Delivery Information</h2>
          <div className="delivery-info">
            <div className="multi-fields">
              <input
                required
                name="firstName"
                value={data.firstName}
                onChange={onChangeHandler}
                placeholder="First name"
              />
              <input
                required
                name="lastName"
                value={data.lastName}
                onChange={onChangeHandler}
                placeholder="Last name"
              />
            </div>
            <input
              required
              name="email"
              value={data.email}
              onChange={onChangeHandler}
              placeholder="Email address"
            />
            <input
              required
              name="street"
              value={data.street}
              onChange={onChangeHandler}
              placeholder="Street"
            />
            <div className="multi-fields">
              <input
                required
                name="city"
                value={data.city}
                onChange={onChangeHandler}
                placeholder="City"
              />
              <input
                required
                name="state"
                value={data.state}
                onChange={onChangeHandler}
                placeholder="State"
              />
            </div>
            <div className="multi-fields">
              <input
                required
                name="zipcode"
                value={data.zipcode}
                onChange={onChangeHandler}
                placeholder="Zip code"
              />
              <input
                required
                name="country"
                value={data.country}
                onChange={onChangeHandler}
                placeholder="Country"
              />
            </div>
            <input
              required
              name="phone"
              value={data.phone}
              onChange={onChangeHandler}
              placeholder="Phone"
            />
          </div>
        </div>

        <div className="place-order-right">
          <div className="cart-total">
            <h2>Cart Totals</h2>
            <div className="cart-total-details">
              <p>Subtotal</p>
              <p>${getTotalCartAmount()}</p>
            </div>
            <div className="cart-total-details">
              <p>Delivery Fee</p>
              <p>${getTotalCartAmount() === 0 ? 0 : 2}</p>
            </div>
            <div className="cart-total-details total">
              <b>Total</b>
              <b>${getTotalCartAmount() === 0 ? 0 : getTotalCartAmount() + 2}</b>
            </div>
            <button type="submit">PAY NOW</button>
            <button 
  type="button" 
  onClick={handleCOD} 
  className="cod-btn"
>
  PAY AS COD
</button>

          </div>
        </div>
      </form>
    </div>
  );
};

export default PlaceOrder;
