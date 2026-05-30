import React, { useState, useContext, useEffect } from "react";
import "./Navbar.css";
import { assets } from "../../assets/assets";
import { Link, useNavigate } from "react-router-dom";
import { StoreContext } from "../../context/StoreContext";
import { useClerk, useUser } from "@clerk/clerk-react";
import { getEntityId } from "../../utils/entityId";
import { indianCities } from "../../data/cities";
import axios from "axios";

const Navbar = ({ setShowLogin }) => {
  const [menu, setMenu] = useState("home");
  const [showSearch, setShowSearch] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const { getTotalCartAmount, food_list, url, city, setCity, cartItems, addToCart, removeFromCart } = useContext(StoreContext);
  const navigate = useNavigate();

  // City Picker State
  const [showCityDropdown, setShowCityDropdown] = useState(false);
  const [citySearch, setCitySearch] = useState("");

  // Search Results Restaurants list
  const [restaurants, setRestaurants] = useState([]);

  // Theme Management
  const [theme, setTheme] = useState(() => {
    try {
      return localStorage.getItem("theme") || "light";
    } catch (e) {
      return "light";
    }
  });

  useEffect(() => {
    if (theme === "dark") {
      document.body.classList.add("dark-theme");
    } else {
      document.body.classList.remove("dark-theme");
    }
    try {
      localStorage.setItem("theme", theme);
    } catch (e) {
      console.warn("Theme storage is not available:", e.message);
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  };

  // Clerk hooks
  const { signOut } = useClerk();
  const { isSignedIn, user } = useUser();

  const logout = () => {
    signOut(() => navigate("/"));
  };

  // Fetch all restaurants once when search is activated
  useEffect(() => {
    const fetchRestaurants = async () => {
      try {
        const res = await axios.get(`${url}/api/restaurant/all`);
        setRestaurants(res.data.restaurants || []);
      } catch (err) {
        console.error("Error fetching restaurants for global search:", err);
      }
    };
    if (showSearch) {
      fetchRestaurants();
    }
  }, [showSearch, url]);

  // Filter matching foods & restaurants
  const matchedFoods = (food_list || [])
    .filter((food) => food.name?.toLowerCase().includes(searchTerm.toLowerCase()))
    .slice(0, 5);

  const matchedRestaurants = (restaurants || [])
    .filter(
      (r) =>
        r.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.cuisine?.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .slice(0, 3);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest(".navbar-location-picker")) {
        setShowCityDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="navbar">
      <div className="navbar-left">
        <Link to="/" onClick={() => setMenu("home")}>
          <img src={assets.logo} alt="Feasto Logo" className="logo" />
        </Link>

        {/* PREMIUM LOCATION SELECTOR */}
        <div className="navbar-location-picker">
          <div
            className="location-picker-trigger"
            onClick={() => setShowCityDropdown(!showCityDropdown)}
          >
            <span className="pin-icon">📍</span>
            <span className="city-name">{city}</span>
            <span className="arrow-icon">{showCityDropdown ? "▲" : "▼"}</span>
          </div>

          {showCityDropdown && (
            <div className="location-dropdown-modal">
              <div className="location-dropdown-header">
                <h4>Select City</h4>
                <button
                  className="close-btn"
                  onClick={() => setShowCityDropdown(false)}
                >
                  ×
                </button>
              </div>
              <div className="location-search-input-wrapper">
                <input
                  type="text"
                  placeholder="🔍 Search city..."
                  value={citySearch}
                  onChange={(e) => setCitySearch(e.target.value)}
                  autoFocus
                />
              </div>
              <div className="cities-grid">
                {citySearch === "" && (
                  <div
                    className={`city-item ${city === "All Cities" ? "selected" : ""}`}
                    onClick={() => {
                      setCity("All Cities");
                      setShowCityDropdown(false);
                    }}
                    style={{ gridColumn: "span 2", textAlign: "center", fontWeight: "bold", border: "1px dashed tomato" }}
                  >
                    🌍 Explore All Cities
                  </div>
                )}
                {indianCities
                  .filter((c) => c.toLowerCase().includes(citySearch.toLowerCase()))
                  .map((c, i) => (
                    <div
                      key={i}
                      className={`city-item ${c === city ? "selected" : ""}`}
                      onClick={() => {
                        setCity(c);
                        setShowCityDropdown(false);
                        setCitySearch("");
                      }}
                    >
                      {c}
                    </div>
                  ))}
                {indianCities.filter((c) =>
                  c.toLowerCase().includes(citySearch.toLowerCase())
                ).length === 0 && <div className="no-cities">No cities found</div>}
              </div>
            </div>
          )}
        </div>
      </div>

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
        <li>
          <Link
            to="/support"
            onClick={() => setMenu("support")}
            className={menu === "support" ? "active" : ""}
          >
            support
          </Link>
        </li>
      </ul>

      <div className="navbar-right">
        {/* PREMIUM GLOBAL SEARCH */}
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
                placeholder="Search food or restaurant..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                autoFocus
              />
              {searchTerm && (
                <div className="search-results-premium">
                  {/* matched foods */}
                  {matchedFoods.length > 0 && (
                    <div className="search-section">
                      <h4>Dishes</h4>
                      <div className="search-dishes-list">
                        {matchedFoods.map((food) => {
                          const qty = cartItems?.[food.id] || 0;
                          return (
                            <div key={food.id} className="search-dish-card">
                              <img
                                src={
                                  food.image?.startsWith("http")
                                    ? food.image
                                    : `${url}/images/${food.image}`
                                }
                                alt={food.name}
                                className="search-dish-thumb"
                              />
                              <div className="search-dish-info">
                                <h5>{food.name}</h5>
                                <p className="search-dish-price">₹{food.price}</p>
                              </div>
                              <div className="search-dish-action">
                                {qty === 0 ? (
                                  <button
                                    className="search-add-btn"
                                    onClick={() => addToCart(food.id)}
                                  >
                                    + Add
                                  </button>
                                ) : (
                                  <div className="search-counter-btn">
                                    <span onClick={() => removeFromCart(food.id)}>-</span>
                                    <span>{qty}</span>
                                    <span onClick={() => addToCart(food.id)}>+</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* matched restaurants */}
                  {matchedRestaurants.length > 0 && (
                    <div className="search-section">
                      <h4>Restaurants</h4>
                      <div className="search-restaurants-list">
                        {matchedRestaurants.map((r) => (
                          <div
                            key={getEntityId(r)}
                            className="search-restaurant-card"
                            onClick={() => {
                              navigate(`/restaurant/${getEntityId(r)}`);
                              setShowSearch(false);
                              setSearchTerm("");
                            }}
                          >
                            <img
                              src={
                                r.image?.startsWith("http")
                                  ? r.image
                                  : `${url}/images/${r.image}`
                              }
                              alt={r.name}
                              className="search-restaurant-thumb"
                            />
                            <div className="search-restaurant-info">
                              <h5>{r.name}</h5>
                              <p className="search-restaurant-cuisine">{r.cuisine}</p>
                              <span className="search-restaurant-rating">
                                ⭐ {r.rating || "4.0"}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {matchedFoods.length === 0 && matchedRestaurants.length === 0 && (
                    <div className="search-no-results">No food or restaurants found</div>
                  )}
                </div>
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

        <button
          onClick={toggleTheme}
          className="theme-toggle-btn"
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "8px",
            borderRadius: "50%",
            color: "var(--theme-toggle-color, #495057)",
            transition: "0.3s",
          }}
          title={theme === "light" ? "Switch to Dark Mode" : "Switch to Light Mode"}
        >
          {theme === "light" ? (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
            </svg>
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="4" />
              <path d="M12 2v2" />
              <path d="M12 20v2" />
              <path d="m4.93 4.93 1.41 1.41" />
              <path d="m17.66 17.66 1.41 1.41" />
              <path d="M2 12h2" />
              <path d="M20 12h2" />
              <path d="m6.34 17.66-1.41 1.41" />
              <path d="m19.07 4.93-1.41 1.41" />
            </svg>
          )}
        </button>

        {!isSignedIn ? (
          <button onClick={() => setShowLogin(true)}>sign in</button>
        ) : (
          <div className="navbar-profile">
            <img
              src={user?.imageUrl || assets.profile_icon}
              alt={user?.fullName || "profile"}
              style={{
                borderRadius: "50%",
                width: "36px",
                height: "36px",
                objectFit: "cover",
              }}
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
