import React, { useState, useEffect } from "react";
import "./Testimonials.css";

const testimonialData = [
  {
    id: 1,
    name: "Aarav Mehta",
    city: "Delhi",
    avatar: "https://api.dicebear.com/7.x/adventurer/svg?seed=Aarav",
    rating: 5,
    text: "Feasto has completely changed how I order food! The delivery is lightning fast, and Savora AI helps me track everything effortlessly. Absolutely love the hot meals!",
    tag: "Verified Gourmet"
  },
  {
    id: 2,
    name: "Sneha Iyer",
    city: "Mumbai",
    avatar: "https://api.dicebear.com/7.x/adventurer/svg?seed=Sneha",
    rating: 5,
    text: "The restaurant-specific menu selections and coupon discounts like FIRST5 are amazing. I get delicious meals from my favorite local spots at a discount every time.",
    tag: "Super Saver"
  },
  {
    id: 3,
    name: "Vikram Malhotra",
    city: "Bangalore",
    avatar: "https://api.dicebear.com/7.x/adventurer/svg?seed=Vikram",
    rating: 5,
    text: "Outstanding customer support! Savora AI resolved my checkout query in seconds. The UI is incredibly clean, responsive, and a pleasure to navigate.",
    tag: "Elite Foodie"
  }
];

const Testimonials = () => {
  const [activeIndex, setActiveIndex] = useState(0);

  // Auto-rotate testimonials every 6 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % testimonialData.length);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="testimonials-section" id="testimonials-section">
      <div className="testimonials-container">
        <div className="testimonials-header">
          <span className="sub-title">TESTIMONIALS</span>
          <h2>What Our Foodies Say</h2>
          <p className="description">
            Discover why thousands of food lovers trust Feasto every day for their favorite meals.
          </p>
        </div>

        {/* Carousel View (active on mobile/alternating) */}
        <div className="testimonials-carousel">
          <div className="testimonial-card-premium active-card">
            <div className="card-top">
              <div className="user-profile">
                <img src={testimonialData[activeIndex].avatar} alt={testimonialData[activeIndex].name} className="user-avatar" />
                <div>
                  <h4>{testimonialData[activeIndex].name}</h4>
                  <span className="user-location">📍 {testimonialData[activeIndex].city}</span>
                </div>
              </div>
              <span className="user-tag">{testimonialData[activeIndex].tag}</span>
            </div>

            <div className="rating-stars">
              {Array.from({ length: testimonialData[activeIndex].rating }).map((_, i) => (
                <span key={i} className="star-icon">★</span>
              ))}
            </div>

            <p className="feedback-text">
              “ {testimonialData[activeIndex].text} ”
            </p>
          </div>

          {/* Dots Indicator */}
          <div className="carousel-dots">
            {testimonialData.map((_, i) => (
              <span 
                key={i} 
                className={`dot-indicator ${activeIndex === i ? "active" : ""}`}
                onClick={() => setActiveIndex(i)}
              ></span>
            ))}
          </div>
        </div>

        {/* Grid View (visible on desktop for full social proof impact) */}
        <div className="testimonials-grid">
          {testimonialData.map((t) => (
            <div key={t.id} className="testimonial-card-static">
              <div className="card-top">
                <div className="user-profile">
                  <img src={t.avatar} alt={t.name} className="user-avatar" />
                  <div>
                    <h4>{t.name}</h4>
                    <span className="user-location">📍 {t.city}</span>
                  </div>
                </div>
                <span className="user-tag">{t.tag}</span>
              </div>

              <div className="rating-stars">
                {Array.from({ length: t.rating }).map((_, i) => (
                  <span key={i} className="star-icon">★</span>
                ))}
              </div>

              <p className="feedback-text">
                “ {t.text} ”
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Testimonials;
