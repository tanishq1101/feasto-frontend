import React from "react";
import { SignIn } from "@clerk/clerk-react";
import "./LoginPopup.css";

const LoginPopup = ({ setShowLogin }) => {
  return (
    <div className="login-popup" onClick={() => setShowLogin(false)}>
      <div
        className="login-popup-clerk-wrapper"
        onClick={(e) => e.stopPropagation()}
      >
        <SignIn
          appearance={{
            elements: {
              rootBox: "clerk-root",
              card: "clerk-card",
              headerTitle: "clerk-header-title",
              headerSubtitle: "clerk-header-subtitle",
              socialButtonsBlockButton: "clerk-social-btn",
              formButtonPrimary: "clerk-primary-btn",
              footerActionLink: "clerk-footer-link",
            },
            variables: {
              colorPrimary: "#ff6b35",
              colorBackground: "#1a1a2e",
              colorText: "#ffffff",
              colorTextSecondary: "rgba(255,255,255,0.65)",
              colorInputBackground: "rgba(255,255,255,0.08)",
              colorInputText: "#ffffff",
              borderRadius: "12px",
              fontFamily: "'Inter', sans-serif",
            },
          }}
          afterSignInUrl="/"
          afterSignUpUrl="/"
          signUpUrl={undefined}
        />
      </div>
    </div>
  );
};

export default LoginPopup;
