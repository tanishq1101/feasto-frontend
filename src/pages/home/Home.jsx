import React, { useState, useContext } from "react";
import "./Home.css";

import Header from "../../components/Header/Header";
import ExploreMenu from "../../components/ExploreMenu/ExploreMenu";
import RestaurantList from "../../components/restaurantList/restaurantList";  // ✅ Correct Import
import FoodDisplay from "../../components/FoodDisplay/FoodDisplay";
import AppDownload from "../../components/AppDownload/AppDownload";

import { StoreContext } from "../../context/StoreContext"; // ✅ Add missing import

const Home = () => {
  const [category, setCategory] = useState("All");
  const { url } = useContext(StoreContext); // ✅ Now works

  return (
    <div>
      <Header />

      {/* ✅ Restaurant section at top */}
      <RestaurantList url={url} />

      <ExploreMenu category={category} setCategory={setCategory} />
      <FoodDisplay category={category} />
      <AppDownload />
    </div>
  );
};

export default Home;
