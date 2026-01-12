import React from 'react'
import './Footer.css'
import { assets } from '../../assets/assets' 


const Footer = () => {
  return (
    <div className='footer' id='footer'>
        <div className="footer-content">
            <div className="footer-content-left">
                <img src={assets.logo} alt="Logo" className="footer-logo" />

                <p>A simple, direct way to get your favorites from Idea Inn.
                   This exclusive platform is brought to you and fully sponsored by @Feasto, your trusted name in food delivery.</p>
                <div className="footer-social-icons">
                    <img src={assets.facebook_icon} alt="" />
                    <img src={assets.twitter_icon} alt="" />
                    <img src={assets.linkedin_icon} alt="" />
                </div>

            </div>
            <div className="footer-content-center">
              <h2>COMPANY</h2>
              <ul>
                <li>Home</li>
                <li>About us</li>
                <li>Delivery</li>
                <li>Privacy policy</li>
              </ul>

            </div>
            <div className="footer-content-right">
              <h2>GET IN TOUCH</h2>
              <ul>
                <li>+1-212-476-7890</li>
                <li>contact@feasto.com</li>
              </ul>

            </div>

        </div>
        <hr />
        <p className="footer-copyright">Copyright 2025 @ Feasto.com - All Right Reserved.</p>
      
    </div>
  )
}

export default Footer
