import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import "./restaurantMenu.css";
import { StoreContext } from "../../context/StoreContext";
import FoodItem from "../../components/FoodItem/FoodItem";
import { getEntityId } from "../../utils/entityId";

const RestaurantMenu = () => {
  const { id } = useParams();
  const { url, food_list } = useContext(StoreContext);
  const [restaurant, setRestaurant] = useState(null);
  const [categories, setCategories] = useState(["All"]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [loading, setLoading] = useState(true);

  const [reviews, setReviews] = useState([
    { name: "Aarav", rating: 5, comment: "Excellent food and great ambiance!" },
    { name: "Riya", rating: 4, comment: "Good taste, but service was a bit slow." },
  ]);
  const [newReview, setNewReview] = useState({ name: "", rating: 0, comment: "" });

  // ✅ Cuisine → Food Categories Mapping
  const cuisineCategoryMap = {
    "South Indian": ["Pure Veg", "Noodles", "Biryani"],
    "North Indian": ["Pure Veg", "Rolls", "Cake", "Sandwich"],
    "Punjabi": ["Pure Veg", "Noodles", "Sandwich"],
    "Chinese": ["Noodles", "Rolls", "Sandwich"],
    "Italian": ["Pasta", "Sandwich", "Cake", "Pizza"],
    "Biryani": ["Biryani", "Pure Veg"],
    "Hyderabadi": ["Biryani", "Noodles", "Pure Veg"],
    "Awadhi": ["Biryani", "Pure Veg"],
    "Rajasthani": ["Pure Veg", "Salad"],
    "Bengali": ["Deserts", "Cake", "Pure Veg"],
    "Street Food": ["Pure Veg", "Sandwich", "Rolls"],
    "Seafood": ["Noodles", "Pasta", "Pure Veg"],
    "Goan": ["Noodles", "Pasta", "Pure Veg", "Sandwich", "Pizza"],
    "Pizza": ["Pizza", "Pasta"],
    "Pasta": ["Pasta", "Cake"],
    "Salad": ["Salad", "Sandwich"],
    "Rolls": ["Rolls", "Pure Veg"],
    "Sandwich": ["Sandwich", "Salad"],
    "Pure Veg": ["Pure Veg", "Noodles", "Salad"],
    "Cake": ["Cake", "Deserts"],
    "Deserts": ["Deserts", "Cake"],
    "Modern Indian": ["Pasta", "Pizza", "Pure Veg", "Salad"],
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const restRes = await axios.get(`${url}/api/restaurant/details/${id}`);
        const rest = restRes.data.restaurant;
        setRestaurant(rest);

        // Create category tabs from cuisine
        if (rest?.cuisine) {
          const cuisineTabs = rest.cuisine.split(",").map((c) => c.trim());
          setCategories(["All", ...cuisineTabs]);
        }
      } catch (err) {
        console.log("Error loading restaurant info:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, url]);

  // Helper to extract all allowed categories for this restaurant based on its cuisines
  const getCompatibleCategories = (cuisineString) => {
    if (!cuisineString) return [];
    const tags = cuisineString.split(",").map((c) => c.trim());
    const categoriesSet = new Set();
    tags.forEach((tag) => {
      const allowed = cuisineCategoryMap[tag] || [];
      allowed.forEach((cat) => categoriesSet.add(cat.toLowerCase()));
    });
    return Array.from(categoriesSet);
  };

  // ✅ Filter Food Items Based on Selection
  let filteredFoods = [];
  if (restaurant) {
    const compatibleCats = getCompatibleCategories(restaurant.cuisine);
    
    if (selectedCategory === "All") {
      filteredFoods = food_list.filter((item) =>
        compatibleCats.includes(item.category?.toLowerCase())
      );
    } else {
      const allowed = cuisineCategoryMap[selectedCategory] || [];
      filteredFoods = food_list.filter((item) =>
        allowed.some((c) =>
          item.category?.toLowerCase().includes(c.toLowerCase())
        )
      );
    }
  }

  // ✅ Reviews Submit
  const handleReviewSubmit = (e) => {
    e.preventDefault();
    if (!newReview.name || !newReview.rating || !newReview.comment)
      return alert("Please fill all fields");
    setReviews([...reviews, newReview]);
    setNewReview({ name: "", rating: 0, comment: "" });
  };

  const averageRating =
    reviews.reduce((s, r) => s + r.rating, 0) / reviews.length || 0;

  if (loading) {
    return (
      <div className="restaurant-menu-page">
        {/* Shimmer Restaurant Header */}
        <div className="restaurant-header">
          <div className="shimmer-bg" style={{ width: "260px", height: "160px", borderRadius: "10px" }}></div>
          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "10px" }}>
            <div className="shimmer-bg" style={{ width: "280px", height: "30px", borderRadius: "6px" }}></div>
            <div className="shimmer-bg" style={{ width: "180px", height: "18px", borderRadius: "4px" }}></div>
            <div className="shimmer-bg" style={{ width: "80px", height: "18px", borderRadius: "4px" }}></div>
            <div className="shimmer-bg" style={{ width: "220px", height: "18px", borderRadius: "4px" }}></div>
          </div>
        </div>

        {/* Shimmer Category Chips */}
        <div className="category-tabs" style={{ overflow: "hidden" }}>
          {[1, 2, 3, 4, 5].map((idx) => (
            <div key={idx} className="shimmer-bg" style={{ width: "100px", height: "36px", borderRadius: "25px", flexShrink: 0 }}></div>
          ))}
        </div>

        <div className="shimmer-bg" style={{ width: "150px", height: "24px", margin: "20px 0 12px", borderRadius: "4px" }}></div>

        {/* Shimmer Dishes Grid */}
        <div className="menu-grid">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((idx) => (
            <div key={idx} className="food-item" style={{ boxShadow: "0px 0px 10px rgba(0,0,0,0.05)" }}>
              <div className="food-item-img-container">
                <div className="shimmer-bg" style={{ width: "100%", height: "100%" }}></div>
              </div>
              <div className="food-item-info" style={{ display: "flex", flexDirection: "column", gap: "12px", padding: "14px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div className="shimmer-bg" style={{ width: "120px", height: "18px", borderRadius: "4px" }}></div>
                  <div className="shimmer-bg" style={{ width: "50px", height: "18px", borderRadius: "4px" }}></div>
                </div>
                <div className="shimmer-bg" style={{ width: "100%", height: "12px", borderRadius: "3px" }}></div>
                <div className="shimmer-bg" style={{ width: "80%", height: "12px", borderRadius: "3px" }}></div>
                <div className="shimmer-bg" style={{ width: "60px", height: "20px", borderRadius: "4px", marginTop: "auto" }}></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="restaurant-menu-page">
      {restaurant && (
        <div className="restaurant-header">
          <img
            src={
              restaurant.image?.startsWith("http")
                ? restaurant.image
                : `${url}/images/${restaurant.image}`
            }
            alt={restaurant.name}
          />

          <div>
            <h2>{restaurant.name}</h2>
            <p>{restaurant.cuisine}</p>
            <span>⭐ {restaurant.rating}</span>
            <p className="location">{restaurant.address}, {restaurant.city}</p>
          </div>
        </div>
      )}

      {/* ⭐ Animated Category Chips */}
      <div className="category-tabs">
        {categories.map((c, i) => (
          <button
            key={i}
            className={selectedCategory === c ? "active-tab" : "tab-chip"}
            onClick={() => setSelectedCategory(c)}
          >
            {c}
          </button>
        ))}
      </div>

      <h3 className="menu-title">{selectedCategory} Dishes</h3>

      <div className="menu-grid">
        {filteredFoods.map((item) => (
          <FoodItem
            key={getEntityId(item)}
            id={getEntityId(item)}
            name={item.name}
            description={item.description}
            price={item.price}
            image={item.image}
          />
        ))}
      </div>

      {/* ⭐ Reviews Section */}
      <div className="reviews-section">
        <h3>Ratings & Reviews</h3>
        <div className="average-rating">
          <span className="stars">⭐ {averageRating.toFixed(1)}</span>
          <p>Based on {reviews.length} reviews</p>
        </div>

        <div className="reviews-list">
          {reviews.map((r, i) => (
            <div key={i} className="review-card">
              <div className="review-header">
                <strong>{r.name}</strong>
                <span>⭐ {r.rating}</span>
              </div>
              <p>{r.comment}</p>
            </div>
          ))}
        </div>

        <form className="review-form" onSubmit={handleReviewSubmit}>
          <h4>Write a Review</h4>
          <input
            type="text"
            placeholder="Your Name"
            value={newReview.name}
            onChange={(e) => setNewReview({ ...newReview, name: e.target.value })}
          />
          <select
            value={newReview.rating}
            onChange={(e) => setNewReview({ ...newReview, rating: Number(e.target.value) })}
          >
            <option value="0">Rate</option>
            {[1, 2, 3, 4, 5].map((r) => (
              <option key={r} value={r}>{r} Stars</option>
            ))}
          </select>
          <textarea
            placeholder="Write your review..."
            value={newReview.comment}
            onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
          />
          <button type="submit">Submit Review</button>
        </form>
      </div>
    </div>
  );
};

export default RestaurantMenu;
