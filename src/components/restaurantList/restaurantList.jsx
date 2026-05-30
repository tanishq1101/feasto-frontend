import React, { useEffect, useState, useContext, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./restaurantList.css";
import { getUserCity } from "../../utils/getUserCity";
import { indianCities } from "../../data/cities";
import { StoreContext } from "../../context/StoreContext";
import { getEntityId } from "../../utils/entityId";

const RestaurantList = () => {
  const { url } = useContext(StoreContext);

  const [restaurants, setRestaurants] = useState([]);
  const [filteredRestaurants, setFilteredRestaurants] = useState([]);
  const [city, setCity] = useState("Detecting...");
  const [heading, setHeading] = useState("Restaurants near you");
  const [search, setSearch] = useState("");

  const navigate = useNavigate();

  const applyRestaurants = (items, title) => {
    setRestaurants(items);
    setFilteredRestaurants(items);
    setHeading(title);
  };

  const loadAllRestaurants = useCallback(async () => {
    const res = await axios.get(`${url}/api/restaurant/all`);
    const allRestaurants = res.data.restaurants || [];
    applyRestaurants(allRestaurants, "Popular restaurants");
  }, [url]);

  const loadRestaurantsByCity = useCallback(
    async (selectedCity) => {
      const res = await axios.get(`${url}/api/restaurant/city/${selectedCity}`);
      const cityRestaurants = res.data.restaurants || [];

      if (cityRestaurants.length > 0) {
        applyRestaurants(cityRestaurants, `Restaurants in ${selectedCity}`);
        return;
      }

      await loadAllRestaurants();
    },
    [loadAllRestaurants, url]
  );

  // ✅ Initial load: detect city & load restaurants
  useEffect(() => {
    const fetchRestaurants = async () => {
      const detectedCity = await getUserCity();
      const selectedCity = detectedCity || "Delhi"; // Fallback default city
      setCity(selectedCity);

      try {
        await loadRestaurantsByCity(selectedCity);
      } catch (err) {
        console.error("Restaurant load error:", err);
        applyRestaurants([], "Popular restaurants");
      }
    };

    fetchRestaurants();
  }, [loadRestaurantsByCity]);

  // ✅ When user selects/switches city
  useEffect(() => {
    if (!city) return;
    const loadByCity = async () => {
      try {
        await loadRestaurantsByCity(city);
      } catch (err) {
        console.log("City change fetch error:", err);
        await loadAllRestaurants();
      }
    };
    loadByCity();
  }, [city, loadAllRestaurants, loadRestaurantsByCity]);

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
        <h2>{heading}</h2>

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
            key={getEntityId(r)}
            className="restaurant-card"
            onClick={() => navigate(`/restaurant/${getEntityId(r)}`)}
          >
            <img
              src={
                r.image?.startsWith("http")
                  ? r.image
                  : r.image
                  ? `${url}/images/${r.image}`
                  : "/default_restaurant.png"
              }
              alt={r.name}
            />
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
