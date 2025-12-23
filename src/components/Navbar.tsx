import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { FaBars } from "react-icons/fa";
import { IoCloseCircleSharp } from "react-icons/io5";


import "./NavbarStyle.css";

const Navbar = () => {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const location = useLocation();

    const toggleMobileMenu = () => {
        setIsMobileMenuOpen(!isMobileMenuOpen);
      };

    const toggleDropdown = () => {
        setIsDropdownOpen(!isDropdownOpen);
    };

    const isActive = (path: string) => {
        if (path === '/home') {
            return location.pathname === '/home' || location.pathname === '/';
        }
        return location.pathname.startsWith(path);
    };

    return (
        <>
            <div className="navbar">
                <div id="cubesat-logo">
                    <Link to="/home">
                        <img
                            src="/images/CubeSat_logo.png"
                            alt="UCI CubeSat logo"
                            width={120}
                            height={120}
                        />
                    </Link>
                </div>

                {/* Desktop NavBar */}
                <div className="btnbox">
                    <Link to="/home">
                        <button className={`navbtn ${isActive('/home') ? 'active' : ''}`}>Home</button>
                    </Link>

                    <div
                        className="dropdown"
                        onMouseEnter={() => setIsDropdownOpen(true)}
                        onMouseLeave={() => setIsDropdownOpen(false)}
                    >
                        <button className={`navbtn ${isActive('/aboutus') ? 'active' : ''}`} onClick={toggleDropdown}>About Us</button>
                        {isDropdownOpen && (
                            <div className="dropdown-content">
                                <Link to="/aboutus/what-we-do" className="dropdown-item" onClick={() => setIsDropdownOpen(false)}>
                                    What We Do
                                </Link>
                                <Link to="/aboutus/meet-the-team" className="dropdown-item" onClick={() => setIsDropdownOpen(false)}>
                                    Meet the Team
                                </Link>
                            </div>
                        )}
                    </div>

                    <Link to="/contact">
                        <button className={`navbtn ${isActive('/contact') ? 'active' : ''}`}>Contact</button>
                    </Link>
                </div>
            </div>
            <div className="mobile-navbar">
                <div className="navbar-header">
                    <Link to="/home">
                        <img
                            src="/images/CubeSat_logo.png"
                            alt="UCI CubeSat logo"
                            width={70}
                            height={70}
                        />
                    </Link>
                    <button className="hamburger-menu" onClick={toggleMobileMenu}><FaBars /></button>
                </div>

                {isMobileMenuOpen && (
                    <div className={"mobile-menu"}>
                        <button onClick={toggleMobileMenu}><IoCloseCircleSharp /></button>
                        <div className="btn-box">
                            <Link  onClick={toggleMobileMenu} to="/home" className="mobile-item">HOME</Link>
                            <Link onClick={toggleMobileMenu} to="/aboutus/what-we-do" className="mobile-item">ABOUT</Link>
                            <Link onClick={toggleMobileMenu} to="/aboutus/meet-the-team" className="long-mobile-item">MEET THE TEAM</Link>
                            <Link onClick={toggleMobileMenu} to="/contact" className="mobile-item">CONTACT</Link>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
};

export default Navbar;