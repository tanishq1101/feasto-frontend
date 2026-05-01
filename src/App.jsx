import React, { useState, useContext } from "react";
import { StoreContext } from "./context/StoreContext";
import Navbar from "./components/Navbar/Navbar";
import Footer from "./components/Footer/Footer";
import Home from "./pages/home/Home.jsx";
import Cart from "./pages/Cart/Cart.jsx";
import PlaceOrder from "./pages/PlaceOrder/PlaceOrder.jsx";
import { Route, Routes } from "react-router-dom";
import LoginPopup from "./components/LoginPopup/LoginPopup";
import Verify from "./pages/Verify/Verify.jsx";
import MyOrders from "./pages/MyOrders/MyOrders.jsx";
import PaymentSuccess from "./pages/payment-success.jsx";
import PaymentFailed from "./pages/payment-failed.jsx";
import RestaurantMenu from "./pages/restaurantMenu/restaurantMenu";
import { useUser } from "@clerk/clerk-react";

const App = () => {
  const [showLogin, setShowLogin] = useState(false);
  const { loading } = useContext(StoreContext);
  const { isSignedIn } = useUser();

  if (loading) return null;

  // Only show login popup if not already signed in
  const showLoginPopup = showLogin && !isSignedIn;

  return (
    <>
      {showLoginPopup && <LoginPopup setShowLogin={setShowLogin} />}
      <div className="app">
        <Navbar setShowLogin={setShowLogin} />

        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/order" element={<PlaceOrder />} />
          <Route path="/verify" element={<Verify />} />
          <Route path="/myorders" element={<MyOrders />} />
          <Route path="/payment-success" element={<PaymentSuccess />} />
          <Route path="/payment-failed" element={<PaymentFailed />} />
          <Route path="/restaurant/:id" element={<RestaurantMenu />} />
        </Routes>

      </div>
      <Footer />
    </>
  );
};

export default App;
