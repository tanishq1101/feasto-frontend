import React, { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./FooterDetails.css";

const FooterDetails = () => {
  const { section } = useParams();
  const navigate = useNavigate();

  const tabs = [
    { id: "home", label: "Feasto Home" },
    { id: "home-power", label: "Platform Power" },
    { id: "about-us", label: "About Us" },
    { id: "delivery", label: "Delivery Information" },
    { id: "privacy-policy", label: "Privacy Policy" },
    { id: "get-in-touch", label: "Get In Touch" },
    { id: "contact-numbers", label: "Contact Numbers" },
  ];

  // Default to 'home' if route parameter doesn't match a tab
  const activeTab = tabs.some((t) => t.id === section) ? section : "home";

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [activeTab]);

  const handleTabClick = (tabId) => {
    navigate(`/info/${tabId}`);
  };

  const renderContent = () => {
    switch (activeTab) {
      case "home":
        return (
          <div className="tab-details-content">
            <h2>Welcome to Feasto</h2>
            <p className="tab-subtitle">Your simple, direct way to get your favorites from local kitchens.</p>
            <div className="content-card">
              <h3>Our Mission</h3>
              <p>Feasto was founded to bridge the gap between hungry food lovers and local culinary creators. We believe food delivery should be straightforward, fast, and delightful.</p>
            </div>
            <div className="content-card-grid">
              <div className="feature-small-card">
                <div className="feature-icon">✨</div>
                <h4>Curated Menus</h4>
                <p>Enjoy a handpicked selection of top dishes from premium local restaurants, tailored to your tastes.</p>
              </div>
              <div className="feature-small-card">
                <div className="feature-icon">⚡</div>
                <h4>Direct Connection</h4>
                <p>No intermediaries or hidden steps. Connect directly with the kitchen making your meal.</p>
              </div>
              <div className="feature-small-card">
                <div className="feature-icon">🎁</div>
                <h4>Sponsor Support</h4>
                <p>Our platform is proudly sponsored and supported by Feasto Corporate, ensuring smooth transactions.</p>
              </div>
            </div>
          </div>
        );
      case "home-power":
        return (
          <div className="tab-details-content">
            <h2>Platform Power & Technology</h2>
            <p className="tab-subtitle">How Feasto optimizes your experience behind the scenes.</p>
            <div className="content-card">
              <h3>High-Performance Tech Stack</h3>
              <p>Feasto utilizes cutting-edge web performance features (including modern databases, quick API synchronization, and responsive rendering engines) to ensure a flawless experience.</p>
            </div>
            <div className="stats-box-grid">
              <div className="stat-item">
                <span className="stat-number">99.9%</span>
                <span className="stat-label">Order Success Rate</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">&lt; 30m</span>
                <span className="stat-label">Average Delivery Time</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">10k+</span>
                <span className="stat-label">Daily Delivered Meals</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">100+</span>
                <span className="stat-label">Partner Restaurants</span>
              </div>
            </div>
            <div className="content-card">
              <h3>Core Capabilities</h3>
              <ul>
                <li><strong>Advanced Search & Filters</strong>: Quickly locate meals by cuisine, rating, price, or restaurant name.</li>
                <li><strong>Secure Payments</strong>: Real-time payments processed seamlessly via Stripe Checkout.</li>
                <li><strong>Adaptive Dark Theme</strong>: A fully-realized dark mode layout designed to reduce eye strain.</li>
                <li><strong>Interactive AI Chatbot</strong>: Dedicated virtual chatbot helping you choose, track, and modify orders instantly.</li>
              </ul>
            </div>
          </div>
        );
      case "about-us":
        return (
          <div className="tab-details-content">
            <h2>About Us</h2>
            <p className="tab-subtitle">Learn more about the team and history of Feasto.</p>
            <div className="content-card">
              <h3>Our Culinary Story</h3>
              <p>Feasto started as a collaborative project at Idea Inn, aimed at creating a community-focused delivery app. Today, we stand as one of the fastest growing food platforms in the area.</p>
            </div>
            <div className="content-card">
              <h3>Our Core Values</h3>
              <div className="values-list">
                <div className="value-item">
                  <strong>Quality First</strong>: We only partner with restaurants that maintain strict food safety and high quality taste standards.
                </div>
                <div className="value-item">
                  <strong>Transparency</strong>: No hidden fees, no mystery surcharges. You see exactly what you pay for.
                </div>
                <div className="value-item">
                  <strong>Supporting Partners</strong>: We charge lower commissions to local restaurants, helping local business owners thrive.
                </div>
              </div>
            </div>
          </div>
        );
      case "delivery":
        return (
          <div className="tab-details-content">
            <h2>Delivery Information</h2>
            <p className="tab-subtitle">Everything you need to know about our logistics and safety protocols.</p>
            <div className="content-card">
              <h3>Delivery Zones & Times</h3>
              <p>We deliver 24/7 across major metro zones. Standard delivery times range from 20 to 45 minutes depending on distance and order size. You can track your order status live under your "My Orders" panel.</p>
            </div>
            <div className="content-card-grid">
              <div className="feature-small-card">
                <div className="feature-icon">🛡️</div>
                <h4>Contactless Delivery</h4>
                <p>All orders are delivered contactless by default to prioritize safety. Drivers leave orders at your door and notify you.</p>
              </div>
              <div className="feature-small-card">
                <div className="feature-icon">💵</div>
                <h4>Flat Delivery Rate</h4>
                <p>Enjoy a simple, flat delivery fee of ₹40 on all orders. No distance-based surcharges or peak multipliers.</p>
              </div>
            </div>
          </div>
        );
      case "privacy-policy":
        return (
          <div className="tab-details-content">
            <h2>Privacy Policy</h2>
            <p className="tab-subtitle">We protect your personal data with industrial security standard methods.</p>
            <div className="content-card">
              <h3>Data Safeguards & Management</h3>
              <p>We take user data privacy seriously. Here is a summary of how we keep you safe:</p>
              <ul>
                <li><strong>Clerk Auth integration</strong>: Your account management is handled by Clerk, meaning your passwords and credentials are never stored on our servers.</li>
                <li><strong>Stripe Transactions</strong>: Payment details are parsed and billed directly on Stripe's hosted platform. Feasto never sees or stores your credit card details.</li>
                <li><strong>Local Retention</strong>: Your theme choices and delivery addresses are cached locally on your device (`localStorage`) for quick access and comfort.</li>
                <li><strong>Information Control</strong>: You can request account deletion or data exports at any time by contacting our support team.</li>
              </ul>
            </div>
          </div>
        );
      case "get-in-touch":
        return (
          <div className="tab-details-content">
            <h2>Get In Touch</h2>
            <p className="tab-subtitle">Have questions or feedback? We'd love to hear from you.</p>
            <div className="content-card">
              <h3>Customer Support Center</h3>
              <p>Our dedicated support representatives are standing by to assist you with order status issues, refunds, restaurant inquiries, or general feedback.</p>
              
              <div className="support-info-details">
                <div className="support-info-line">
                  <strong>Support Hours:</strong>
                  <span>8:00 AM - 11:00 PM Daily</span>
                </div>
                <div className="support-info-line">
                  <strong>General Support Email:</strong>
                  <span>support@feasto.com</span>
                </div>
                <div className="support-info-line">
                  <strong>Corporate Inquiries:</strong>
                  <span>info@feasto.com</span>
                </div>
                <div className="support-info-line">
                  <strong>Partnership Details:</strong>
                  <span>partners@feasto.com</span>
                </div>
              </div>
            </div>
          </div>
        );
      case "contact-numbers":
        return (
          <div className="tab-details-content">
            <h2>Contact Numbers</h2>
            <p className="tab-subtitle">Call us directly to speak to one of our department specialists.</p>
            <div className="content-card">
              <h3>Direct Telephone Directories</h3>
              <div className="phone-directory">
                <div className="phone-row">
                  <div>
                    <h4>Customer Care Line</h4>
                    <p>For urgent questions regarding active delivery orders.</p>
                  </div>
                  <span className="phone-number">+1-212-476-7890</span>
                </div>
                <hr className="directory-divider" />
                <div className="phone-row">
                  <div>
                    <h4>Restaurant Partner Helpline</h4>
                    <p>For kitchen operators needing help with menus or tablet systems.</p>
                  </div>
                  <span className="phone-number">+1-212-476-7891</span>
                </div>
                <hr className="directory-divider" />
                <div className="phone-row">
                  <div>
                    <h4>Corporate Headquarters</h4>
                    <p>For business inquiries, real estate, and sponsorships.</p>
                  </div>
                  <span className="phone-number">+1-212-476-7800</span>
                </div>
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="footer-details-page">
      <div className="footer-details-sidebar">
        <h3>Information Center</h3>
        <ul className="sidebar-tabs-list">
          {tabs.map((tab) => (
            <li
              key={tab.id}
              className={`sidebar-tab-item ${activeTab === tab.id ? "active" : ""}`}
              onClick={() => handleTabClick(tab.id)}
            >
              {tab.label}
            </li>
          ))}
        </ul>
      </div>

      <div className="footer-details-main">{renderContent()}</div>
    </div>
  );
};

export default FooterDetails;
