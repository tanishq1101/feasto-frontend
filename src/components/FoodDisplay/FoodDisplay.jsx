import React, { useContext } from "react";
import "./FoodDisplay.css";
import { StoreContext } from "../../context/StoreContext";
import FoodItem from "../FoodItem/FoodItem";

const FoodDisplay = ({ category = "All", showAll = false }) => {
  const { food_list } = useContext(StoreContext);

  let displayList = food_list;

  if (!showAll && category !== "All") {
    // convert "South Indian, Pure Veg" → ["south indian", "pure veg"]
    const cuisineCategories = category
      .split(",")
      .map((c) => c.trim().toLowerCase());

    displayList = food_list.filter((item) =>
      cuisineCategories.includes(item.category.toLowerCase())
    );
  }

  return (
    <div className="food-display" id="food-display">
      <h2>Top dishes</h2>
      <div className="food-display-list">
        {displayList.map((item) => (
          <div id={`food-${item._id}`} key={item._id}>
            <FoodItem
              id={item._id}
              name={item.name}
              description={item.description}
              price={item.price}
              image={item.image}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default FoodDisplay;
