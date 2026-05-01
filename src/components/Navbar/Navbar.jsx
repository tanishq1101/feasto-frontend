import React, { useState, useContext } from "react";
import "./Navbar.css";
import { assets } from "../../assets/assets";
import { Link, useNavigate } from "react-router-dom";
import { StoreContext } from "../../context/StoreContext";
import { useClerk, useUser } from "@clerk/clerk-react";
import { getEntityId } from "../../utils/entityId";

const Navbar = ({ setShowLogin }) => {
  const [menu, setMenu] = useState("home");
  const [showSearch, setShowSearch] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const { getTotalCartAmount, food_list } = useContext(StoreContext);
  const navigate = useNavigate();

  // Clerk hooks
  const { signOut } = useClerk();
  const { isSignedIn, user } = useUser();

  const logout = () => {
    signOut(() => navigate("/"));
  };

  // Filter matching food items
  const filteredFoods = food_list.filter((food) =>
    food.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="navbar">
      <Link to="/">
        <img src={assets.logo} alt="" className="logo" />
      </Link>
      <ul className="navbar-menu">
        <li>
          <Link
            to="/"
            onClick={() => setMenu("home")}
            className={menu === "home" ? "active" : ""}
          >
            home
          </Link>
        </li>
        <li>
          <a
            href="#explore-menu"
            onClick={() => setMenu("menu")}
            className={menu === "menu" ? "active" : ""}
          >
            menu
          </a>
        </li>
        <li>
          <a
            href="#app-download"
            onClick={() => setMenu("mobile-app")}
            className={menu === "mobile-app" ? "active" : ""}
          >
            mobile-app
          </a>
        </li>
        <li>
          <a
            href="#footer"
            onClick={() => setMenu("contact-us")}
            className={menu === "contact-us" ? "active" : ""}
          >
            contact-us
          </a>
        </li>
      </ul>

      <div className="navbar-right">
        <div className="navbar-search-area">
          <img
            src={assets.search_icon}
            alt="search"
            onClick={() => setShowSearch(!showSearch)}
            style={{ cursor: "pointer" }}
          />

          {showSearch && (
            <div className="navbar-search-box">
              <input
                type="text"
                placeholder="Search food..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {searchTerm && (
                <ul className="search-results">
                  {filteredFoods.length > 0 ? (
                    filteredFoods.map((food) => (
                      <li
                        key={getEntityId(food)}
                        onClick={() => {
                          const el = document.getElementById(`food-${getEntityId(food)}`);
                          if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
                          setShowSearch(false);
                          setSearchTerm("");
                        }}
                      >
                        {food.name}
                      </li>
                    ))
                  ) : (
                    <li>No items found</li>
                  )}
                </ul>
              )}
            </div>
          )}
        </div>

        <div className="navbar-search-icon">
          <Link to="/cart">
            <img src={assets.basket_icon} alt="" />
          </Link>
          <div className={getTotalCartAmount() === 0 ? "" : "dot"}></div>
        </div>

        {!isSignedIn ? (
          <button onClick={() => setShowLogin(true)}>sign in</button>
        ) : (
          <div className="navbar-profile">
            <img
              src={user?.imageUrl || assets.profile_icon}
              alt={user?.fullName || "profile"}
              style={{ borderRadius: "50%", width: "36px", height: "36px", objectFit: "cover" }}
            />
            <ul className="nav-profile-dropdown">
              <li onClick={() => navigate("/myorders")}>
                <img src={assets.bag_icon} alt="" />
                <p>Orders</p>
              </li>
              <hr />
              <li onClick={logout}>
                <img src={assets.logout_icon} alt="" />
                <p>Logout</p>
              </li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default Navbar;
