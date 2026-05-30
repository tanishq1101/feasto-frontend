import React from 'react'
import './Footer.css'
import { assets } from '../../assets/assets' 
import { Link } from 'react-router-dom'


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
                <li><Link to="/info/home">Home</Link></li>
                <li><Link to="/info/home-power">Home Power</Link></li>
                <li><Link to="/info/about-us">About us</Link></li>
                <li><Link to="/info/delivery">Delivery</Link></li>
                <li><Link to="/info/privacy-policy">Privacy policy</Link></li>
                <li><Link to="/support">Customer Support</Link></li>
              </ul>

            </div>
            <div className="footer-content-right">
              <h2>GET IN TOUCH</h2>
              <ul>
                <li><Link to="/info/contact-numbers">Contact Numbers</Link></li>
                <li><Link to="/info/get-in-touch">Get in touch</Link></li>
              </ul>

            </div>

        </div>
        <hr />
        <p className="footer-copyright">Copyright 2025 @ Feasto.com - All Right Reserved.</p>
      
    </div>
  )
}

export default Footer

