import React, { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import "./restaurantList.css";
import { getUserCity } from "../../utils/getUserCity";
import { indianCities } from "../../data/cities";
import { StoreContext } from "../../context/StoreContext";
import { getEntityId } from "../../utils/entityId";

const RestaurantList = () => {
  const { url, city, setCity, restaurants } = useContext(StoreContext);

  const [filteredRestaurants, setFilteredRestaurants] = useState([]);
  const [heading, setHeading] = useState("Popular restaurants");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  // Detect city initially if default or unset
  useEffect(() => {
    const detect = async () => {
      if (!city || city === "Detecting...") {
        const detectedCity = await getUserCity();
        setCity(detectedCity || "Delhi");
      }
    };
    detect();
  }, [city, setCity]);

  // Dynamic Filtering based on selected city & global restaurants list
  useEffect(() => {
    if (!restaurants || restaurants.length === 0) {
      setLoading(true);
      return;
    }
    setLoading(false);

    if (city === "All Cities" || !city || city === "Detecting...") {
      setFilteredRestaurants(restaurants);
      setHeading("Popular restaurants");
    } else {
      const cityRests = restaurants.filter(
        (r) => r.city?.toLowerCase() === city.toLowerCase()
      );
      if (cityRests.length > 0) {
        setFilteredRestaurants(cityRests);
        setHeading(`Restaurants in ${city}`);
      } else {
        setFilteredRestaurants([]);
        setHeading(`No restaurants in ${city}`);
      }
    }
  }, [city, restaurants]);

  // Search filter
  useEffect(() => {
    const activeList =
      city === "All Cities" || !city || city === "Detecting..."
        ? restaurants
        : restaurants.filter((r) => r.city?.toLowerCase() === city.toLowerCase());

    const filtered = activeList.filter(
      (r) =>
        r.name?.toLowerCase().includes(search.toLowerCase()) ||
        r.cuisine?.toLowerCase().includes(search.toLowerCase())
    );
    setFilteredRestaurants(filtered);
  }, [search, city, restaurants]);

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

      {/* ✅ Restaurant Cards Grid / Skeletons */}
      {loading ? (
        <div className="restaurant-grid">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="restaurant-card-skeleton pulsing">
              <div className="skeleton-image"></div>
              <div className="skeleton-info">
                <div className="skeleton-title"></div>
                <div className="skeleton-meta">
                  <div className="skeleton-rating"></div>
                  <div className="skeleton-distance"></div>
                </div>
                <div className="skeleton-footer">
                  <div className="skeleton-cuisine"></div>
                  <div className="skeleton-cost"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="restaurant-grid">
          {filteredRestaurants.map((r) => {
            const ratingNum = r.rating || 4.0;
            const timeEst = 20 + Math.round((ratingNum * 7) % 15);
            const distanceEst = (((ratingNum * 4) % 3) + 1.1).toFixed(1);
            const costForTwo = 200 + Math.round((ratingNum * 120) % 250);

            return (
              <div
                key={getEntityId(r)}
                className="restaurant-card-premium"
                onClick={() => navigate(`/restaurant/${getEntityId(r)}`)}
              >
                <div className="restaurant-img-wrapper">
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
                  <span className="time-tag">🕒 {timeEst} mins</span>
                </div>
                <div className="restaurant-info-premium">
                  <h3 className="restaurant-name-premium">{r.name}</h3>
                  <div className="restaurant-meta-row">
                    <span className="rating-pill">⭐ {ratingNum}</span>
                    <span className="distance-txt">📍 {distanceEst} km</span>
                  </div>
                  <div className="restaurant-footer-row">
                    <span className="cuisine-txt">{r.cuisine}</span>
                    <span className="cost-two-txt">₹{costForTwo} for two</span>
                  </div>
                </div>
              </div>
            );
          })}

          {filteredRestaurants.length === 0 && (
            <p className="no-results">No restaurants found here.</p>
          )}
        </div>
      )}
    </div>
  );
};

export default RestaurantList;
