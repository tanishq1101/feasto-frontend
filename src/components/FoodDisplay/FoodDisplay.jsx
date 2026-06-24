import React, { useContext } from "react";
import "./FoodDisplay.css";
import { StoreContext } from "../../context/StoreContext";
import FoodItem from "../FoodItem/FoodItem";
import { getEntityId } from "../../utils/entityId";

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

const FoodDisplay = ({ category = "All", showAll = false }) => {
  const { food_list, loading, city, restaurants } = useContext(StoreContext);

  let displayList = food_list || [];

  // ✅ Filter dishes based on the selected city's active restaurant cuisines
  if (city && city !== "All Cities" && city !== "Detecting..." && restaurants && restaurants.length > 0) {
    const cityRests = restaurants.filter(
      (r) => r.city?.toLowerCase() === city.toLowerCase()
    );

    if (cityRests.length > 0) {
      const activeCategories = new Set();
      cityRests.forEach((r) => {
        if (r.cuisine) {
          const tags = r.cuisine.split(",").map((c) => c.trim());
          tags.forEach((tag) => {
            const allowed = cuisineCategoryMap[tag] || [];
            allowed.forEach((cat) => activeCategories.add(cat.toLowerCase()));
          });
        }
      });

      displayList = displayList.filter((item) =>
        activeCategories.has(item.category?.toLowerCase())
      );
    } else {
      displayList = [];
    }
  }

  // ✅ Filter based on category chips selection
  if (!showAll && category !== "All") {
    const cuisineCategories = category
      .split(",")
      .map((c) => c.trim().toLowerCase());

    displayList = displayList.filter((item) =>
      item.category && cuisineCategories.includes(item.category.toLowerCase())
    );
  }

  // ✅ Capped at Top 20 Unique Food Items
  displayList = displayList.slice(0, 20);

  const getRestaurantForFood = (foodItem) => {
    if (!restaurants || restaurants.length === 0) return null;

    const cityRests = (city && city !== "All Cities" && city !== "Detecting...")
      ? restaurants.filter((r) => r.city?.toLowerCase() === city.toLowerCase())
      : restaurants;

    const categoryLower = foodItem.category?.toLowerCase();

    // 1. Try to find a matching restaurant in the user's city
    let match = cityRests.find((r) => {
      if (!r.cuisine) return false;
      const cuisines = r.cuisine.split(",").map((c) => c.trim().toLowerCase());
      return cuisines.some((c) => {
        const mapKey = Object.keys(cuisineCategoryMap).find(
          (k) => k.toLowerCase() === c
        );
        const allowedCats = mapKey ? cuisineCategoryMap[mapKey] : [];
        return allowedCats.some((cat) => cat.toLowerCase() === categoryLower);
      });
    });

    if (match) return match;

    // 2. Fallback to any restaurant globally
    match = restaurants.find((r) => {
      if (!r.cuisine) return false;
      const cuisines = r.cuisine.split(",").map((c) => c.trim().toLowerCase());
      return cuisines.some((c) => {
        const mapKey = Object.keys(cuisineCategoryMap).find(
          (k) => k.toLowerCase() === c
        );
        const allowedCats = mapKey ? cuisineCategoryMap[mapKey] : [];
        return allowedCats.some((cat) => cat.toLowerCase() === categoryLower);
      });
    });

    return match || null;
  };

  return (
    <div className="food-display" id="food-display">
      <h2>Top dishes</h2>
      {loading ? (
        <div className="food-display-list">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="food-item-skeleton pulsing">
              <div className="skeleton-food-image"></div>
              <div className="skeleton-food-info">
                <div className="skeleton-food-title-row">
                  <div className="skeleton-food-name"></div>
                  <div className="skeleton-food-rating"></div>
                </div>
                <div className="skeleton-food-desc"></div>
                <div className="skeleton-food-desc-short"></div>
                <div className="skeleton-food-price"></div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="food-display-list">
          {displayList.map((item) => {
            const matchedRest = getRestaurantForFood(item);
            return (
              <div id={`food-${getEntityId(item)}`} key={getEntityId(item)}>
                <FoodItem
                  id={getEntityId(item)}
                  name={item.name}
                  description={item.description}
                  price={item.price}
                  image={item.image}
                  restaurantName={matchedRest?.name}
                  restaurantId={matchedRest ? getEntityId(matchedRest) : null}
                />
              </div>
            );
          })}
          {displayList.length === 0 && (
            <p className="no-results" style={{ gridColumn: "1 / -1", textAlign: "center", color: "#868e96", padding: "20px" }}>
              No dishes found matching this city's cuisines.
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default FoodDisplay;
