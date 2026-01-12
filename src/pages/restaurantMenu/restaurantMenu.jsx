import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import "./restaurantMenu.css";
import { StoreContext } from "../../context/StoreContext";
import FoodItem from "../../components/FoodItem/FoodItem";

const RestaurantMenu = () => {
  const { id } = useParams();
  const { url, food_list } = useContext(StoreContext);
  const [restaurant, setRestaurant] = useState(null);
  const [categories, setCategories] = useState(["All"]);
  const [selectedCategory, setSelectedCategory] = useState("All");

  const [reviews, setReviews] = useState([
    { name: "Aarav", rating: 5, comment: "Excellent food and great ambiance!" },
    { name: "Riya", rating: 4, comment: "Good taste, but service was a bit slow." },
  ]);
  const [newReview, setNewReview] = useState({ name: "", rating: 0, comment: "" });

  // ✅ Cuisine → Food Categories Mapping
  const cuisineCategoryMap = {
    "South Indian": ["Pure Veg", "Noodles", "Rice", "Non-Veg", "Biryani"],
    "North Indian": ["Pure Veg", "Rolls", "Cake", "Sandwich", "Non-Veg"],
    "Punjabi": ["Pure Veg", "Noodles", "Sandwich"],
    "Chinese": ["Noodles", "Rolls", "Sandwich"],
    "Italian": ["Pasta", "Sandwich", "Cake"],
    "Biryani": ["Rice", "Non-Veg", "Pure Veg"],
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
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
      }
    };
    fetchData();
  }, [id, url]);

  // ✅ Filter Food Items Based on Selection
  let filteredFoods = food_list;
  if (selectedCategory !== "All") {
    const allowed = cuisineCategoryMap[selectedCategory] || [];
    filteredFoods = food_list.filter((item) =>
      allowed.some((c) =>
        item.category.toLowerCase().includes(c.toLowerCase())
      )
    );
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
            key={item._id}
            id={item._id}
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
