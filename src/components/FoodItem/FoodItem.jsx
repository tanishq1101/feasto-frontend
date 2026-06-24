import React, { useContext } from "react";
import "./FoodItem.css";
import { assets } from "../../assets/assets";
import { StoreContext } from "../../context/StoreContext";
import { useNavigate } from "react-router-dom";
import { animateFlyToCart } from "../../utils/flyToCart";

const FoodItem = ({ id, name, price, description, image, restaurantName, restaurantId }) => {
  const { cartItems, addToCart, removeFromCart, url } =
    useContext(StoreContext);
  const navigate = useNavigate();

  const handleAddToCart = (e) => {
    addToCart(id);
    const itemImage = image?.startsWith("http") ? image : `${url}/images/${image}`;
    animateFlyToCart(e, itemImage);
  };

  return (
    <div className="food-item">
      <div className="food-item-img-container">
        <img
  src={image?.startsWith("http") ? image : `${url}/images/${image}`}
  alt={name}
/>

        {!cartItems?.[id] ? (
          <img
            className="add"
            onClick={handleAddToCart}
            src={assets.add_icon_white}
            alt="Add"
          />
        ) : (
          <div className="food-item-counter">
            <img
              onClick={() => removeFromCart(id)}
              src={assets.remove_icon_red}
              alt="Remove"
            />
            <p>{cartItems[id]}</p>
            <img
              onClick={handleAddToCart}
              src={assets.add_icon_green}
              alt="Add"
            />
          </div>
        )}
      </div>

      <div className="food-item-info">
        <div className="food-item-name-rating">
          <p>{name}</p>
          <img src={assets.rating_starts} alt="Rating" />
        </div>
        <p className="food-item-desc">{description}</p>
        
        {restaurantName && (
          <div 
            className="food-item-restaurant-badge" 
            onClick={() => navigate(`/restaurant/${restaurantId}`)}
            style={{ 
              fontSize: "0.78rem", 
              color: "#ff6b35", 
              fontWeight: "700", 
              marginTop: "4px",
              marginBottom: "6px",
              cursor: "pointer",
              display: "inline-flex",
              alignItems: "center",
              gap: "4px",
              background: "#fff1f0",
              padding: "4px 8px",
              borderRadius: "4px",
              transition: "all 0.2s ease"
            }}
          >
            🏪 {restaurantName}
          </div>
        )}
        
        <p className="food-item-price">₹{price}</p>
      </div>
    </div>
  );
};

export default FoodItem;
