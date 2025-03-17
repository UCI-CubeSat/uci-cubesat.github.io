import { useState } from "react";
import { Link } from "react-router-dom";
import { FaBars } from "react-icons/fa";

import "./NavbarStyle.css";

const Navbar = () => {
    const [isHovered, setIsHovered] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const toggleMobileMenu = () => {
        setIsMobileMenuOpen(!isMobileMenuOpen);
      };

    return (
        <>
            <div className="navbar">
                <div id="cubesat-logo">
                    <Link to="/home">
                        <img
                            src="/images/CubeSat_logo.png"
                            alt="CubeSat logo"
                            width={120}
                            height={120}
                        />
                    </Link>
                </div>

                {/* Desktop NavBar */}
                <div className="btnbox">
                    <Link to="/home">
                        <button className="navbtn">Home</button>
                    </Link>

                    <div
                        className="dropdown"
                        onMouseEnter={() => setIsHovered(true)}
                        onMouseLeave={() => setIsHovered(false)}
                    >
                        <button className="navbtn">About Us</button>
                        {isHovered && (
                            <div className="dropdown-content">
                                <Link to="/aboutus/what-we-do" className="dropdown-item">
                                    What We Do
                                </Link>
                                <Link to="/aboutus/meet-the-team" className="dropdown-item">
                                    Meet the Team
                                </Link>
                            </div>
                        )}
                    </div>

                    <Link to="/contact">
                        <button className="navbtn">Contact</button>
                    </Link>
                </div>
            </div>
            <div className="mobile-navbar">
                <button className="hamburger-menu" onClick={toggleMobileMenu}><FaBars /></button>

                {isMobileMenuOpen && (
                    <div className="mobile-menu">
                        <Link to="/home" className="mobile-item">Home</Link>
                        <Link to="/aboutus/what-we-do" className="mobile-item">What We Do</Link>
                        <Link to="/aboutus/meet-the-team" className="mobile-item">Meet the Team</Link>
                        <Link to="/contact" className="mobile-item">Contact</Link>
                    </div>
                )}
            </div>
        </>
    );
};

export default Navbar;