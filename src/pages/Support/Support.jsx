import React, { useState } from "react";
import "./Support.css";

const FAQs = [
  {
    question: "How do I track my order in real-time?",
    answer: "Go to your 'Orders' page from the profile dropdown menu, then click the 'Live Track' button next to your active order. Savora AI can also give you instant tracking details!"
  },
  {
    question: "What is Savora AI Assistant and how can it help me?",
    answer: "Savora is your personal AI companion on Feasto. You can ask Savora to check your cart items, review order status history, recommend popular dishes, and handle payment queries instantly."
  },
  {
    question: "How do I change my delivery address?",
    answer: "You can update your shipping details on the checkout page. The application automatically stores your last active address so you don't need to re-type it next time."
  },
  {
    question: "What payment options are available?",
    answer: "We support secure card payments powered by Stripe, as well as Cash on Delivery (COD) for your convenience."
  },
  {
    question: "Who do I contact for food quality issues?",
    answer: "You can call our delivery partner directly from the orders page, submit a review here, or chat with Savora AI for instant assistance."
  }
];

const Support = () => {
  const [activeFaq, setActiveFaq] = useState(null);
  const [feedback, setFeedback] = useState({ name: "", email: "", rating: 5, comment: "" });
  const [submitted, setSubmitted] = useState(false);

  const handleToggleFaq = (index) => {
    setActiveFaq(activeFaq === index ? null : index);
  };

  const handleSubmitFeedback = (e) => {
    e.preventDefault();
    if (!feedback.name || !feedback.email || !feedback.comment) {
      return alert("Please fill out all required fields.");
    }
    setSubmitted(true);
    setTimeout(() => {
      setFeedback({ name: "", email: "", rating: 5, comment: "" });
      setSubmitted(false);
      alert("Thank you for your feedback! Your review has been saved.");
    }, 1500);
  };

  const handleTriggerSavora = (msg) => {
    if (typeof window.openSavoraChat === "function") {
      window.openSavoraChat(msg);
    } else {
      alert("Savora AI Assistant is loading. Please try again in a moment.");
    }
  };

  return (
    <div className="support-page animate-fade-in">
      <div className="support-header">
        <h1>Customer Support & reviews</h1>
        <p>Need help with your meal or want to leave feedback? Savora and our support crew are here 24/7.</p>
      </div>

      <div className="support-grid-layout">
        {/* Left column: FAQ & Feedback Form */}
        <div className="support-main">
          {/* FAQ Accordion */}
          <div className="faq-section">
            <h2>Frequently Asked Questions</h2>
            <div className="faq-list">
              {FAQs.map((faq, i) => (
                <div 
                  key={i} 
                  className={`faq-item ${activeFaq === i ? "active" : ""}`}
                  onClick={() => handleToggleFaq(i)}
                >
                  <div className="faq-question">
                    <span>{faq.question}</span>
                    <span className="faq-arrow">{activeFaq === i ? "▲" : "▼"}</span>
                  </div>
                  {activeFaq === i && (
                    <div className="faq-answer animate-slide-down">
                      <p>{faq.answer}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Feedback Form */}
          <div className="feedback-form-section">
            <h2>Submit a Review or Feedback</h2>
            <form onSubmit={handleSubmitFeedback} className="feedback-form">
              <div className="form-row">
                <div className="form-group">
                  <label>Your Name *</label>
                  <input
                    type="text"
                    required
                    value={feedback.name}
                    onChange={(e) => setFeedback({ ...feedback, name: e.target.value })}
                    placeholder="E.g., Raj Malhotra"
                  />
                </div>
                <div className="form-group">
                  <label>Email Address *</label>
                  <input
                    type="email"
                    required
                    value={feedback.email}
                    onChange={(e) => setFeedback({ ...feedback, email: e.target.value })}
                    placeholder="E.g., raj@example.com"
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Rating</label>
                <div className="rating-selector">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <span
                      key={star}
                      className={`star-option ${star <= feedback.rating ? "active" : ""}`}
                      onClick={() => setFeedback({ ...feedback, rating: star })}
                    >
                      ★
                    </span>
                  ))}
                  <span className="rating-label">{feedback.rating} Stars</span>
                </div>
              </div>

              <div className="form-group">
                <label>Feedback / Review Details *</label>
                <textarea
                  required
                  rows="4"
                  value={feedback.comment}
                  onChange={(e) => setFeedback({ ...feedback, comment: e.target.value })}
                  placeholder="Share your experience with Feasto's food quality or delivery services..."
                ></textarea>
              </div>

              <button type="submit" className="btn-submit-feedback" disabled={submitted}>
                {submitted ? "Submitting..." : "Send Feedback"}
              </button>
            </form>
          </div>
        </div>

        {/* Right column: Savora AI Quick Launcher */}
        <div className="support-sidebar">
          <div className="savora-launcher-card">
            <div className="savora-header-icon">🤖</div>
            <h3>Talk to Savora AI</h3>
            <p>Our friendly AI assistant can resolve most support requests in seconds. Try these quick topics:</p>
            
            <div className="savora-quick-buttons">
              <button 
                className="savora-trigger-btn"
                onClick={() => handleTriggerSavora("Track my last order")}
              >
                🛵 Track My Last Order
              </button>
              <button 
                className="savora-trigger-btn"
                onClick={() => handleTriggerSavora("Show me popular desserts")}
              >
                🍰 Recommend Desserts
              </button>
              <button 
                className="savora-trigger-btn"
                onClick={() => handleTriggerSavora("What are some popular vegetarian options?")}
              >
                🥗 Recommend Veg Items
              </button>
              <button 
                className="savora-trigger-btn"
                onClick={() => handleTriggerSavora("How can I contact delivery driver?")}
              >
                📞 Contact Delivery Partner
              </button>
            </div>
            <div className="savora-footer-note">
              Clicking any topic will launch the Savora chat drawer in the bottom right corner.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Support;
