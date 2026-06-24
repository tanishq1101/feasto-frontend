import React, { useState, useContext, useEffect } from "react";
import "./Home.css";

import Header from "../../components/Header/Header";
import ExploreMenu from "../../components/ExploreMenu/ExploreMenu";
import RestaurantList from "../../components/restaurantList/restaurantList";  // ✅ Correct Import
import FoodDisplay from "../../components/FoodDisplay/FoodDisplay";
import Testimonials from "../../components/Testimonials/Testimonials";

import { StoreContext } from "../../context/StoreContext"; // ✅ Add missing import

const Home = () => {
  const [category, setCategory] = useState("All");
  const { url } = useContext(StoreContext); // ✅ Now works

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("active");
          }
        });
      },
      { threshold: 0.08 }
    );

    const reveals = document.querySelectorAll(".reveal");
    reveals.forEach((el) => observer.observe(el));

    return () => {
      reveals.forEach((el) => observer.unobserve(el));
    };
  }, [category]); // Re-observe if category changes and food displays re-render

  return (
    <div>
      <Header />

      {/* ✅ Restaurant section at top */}
      <div className="reveal">
        <RestaurantList url={url} />
      </div>

      <div className="reveal">
        <ExploreMenu category={category} setCategory={setCategory} />
      </div>
      
      <div className="reveal">
        <FoodDisplay category={category} />
      </div>
      
      <div className="reveal">
        <Testimonials />
      </div>
    </div>
  );
};

export default Home;
