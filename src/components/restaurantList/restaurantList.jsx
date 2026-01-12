import React, { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./restaurantList.css";
import { getUserCity } from "../../utils/getUserCity";
import { indianCities } from "../../data/cities";
import { StoreContext } from "../../context/StoreContext";

const RestaurantList = () => {
  const { url } = useContext(StoreContext);

  const [restaurants, setRestaurants] = useState([]);
  const [filteredRestaurants, setFilteredRestaurants] = useState([]);
  const [city, setCity] = useState("Detecting...");
  const [search, setSearch] = useState("");

  const navigate = useNavigate();

  // ✅ Initial load: detect city & load restaurants
  useEffect(() => {
    const fetchRestaurants = async () => {
      const detectedCity = await getUserCity();
      const selectedCity = detectedCity || "Delhi"; // Fallback default city
      setCity(selectedCity);

      try {
        const res = await axios.get(`${url}/api/restaurant/city/${selectedCity}`);
        if (res.data.success) {
          setRestaurants(res.data.restaurants);
          setFilteredRestaurants(res.data.restaurants);
        }
      } catch (err) {
        console.error("Restaurant load error:", err);
      }
    };

    fetchRestaurants();
  }, [url]);

  // ✅ When user selects/switches city
  useEffect(() => {
    if (!city) return;
    const loadByCity = async () => {
      try {
        const res = await axios.get(`${url}/api/restaurant/city/${city}`);
        if (res.data.success) {
          setRestaurants(res.data.restaurants);
          setFilteredRestaurants(res.data.restaurants);
        }
      } catch (err) {
        console.log("City change fetch error:", err);
      }
    };
    loadByCity();
  }, [city, url]);

  // ✅ Search filter
  useEffect(() => {
    const filtered = restaurants.filter((r) =>
      r.name.toLowerCase().includes(search.toLowerCase()) ||
      r.cuisine.toLowerCase().includes(search.toLowerCase())
    );
    setFilteredRestaurants(filtered);
  }, [search, restaurants]);

  return (
    <div className="restaurant-list">
      <div className="restaurant-header">
        <h2>Restaurants in <span className="highlight">{city}</span></h2>

        {/* ✅ Search Bar */}
        <div className="search-container">
          <input
            type="text"
            className="restaurant-search"
            placeholder="🔍 Search restaurants or choose city..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          {search.length > 0 && (
            <div className="search-suggestions">
              {indianCities
                .filter((c) => c.toLowerCase().includes(search.toLowerCase()))
                .slice(0, 6)
                .map((c, i) => (
                  <div
                    key={i}
                    className="suggestion"
                    onClick={() => {
                      setSearch("");
                      setCity(c);
                    }}
                  >
                    📍 {c}
                  </div>
                ))}
            </div>
          )}
        </div>
      </div>

      {/* ✅ Restaurant Cards */}
      <div className="restaurant-grid">
        {filteredRestaurants.map((r) => (
          <div
            key={r._id}
            className="restaurant-card"
            onClick={() => navigate(`/restaurant/${r._id}`)}
          >
            <img src={r.image || "/default_restaurant.png"} alt={r.name} />
            <h3>{r.name}</h3>
            <p>{r.cuisine} • {r.city}</p>
            <p className="rating">⭐ {r.rating}</p>
          </div>
        ))}

        {filteredRestaurants.length === 0 && (
          <p className="no-results">No restaurants found here.</p>
        )}
      </div>
    </div>
  );
};

export default RestaurantList;
