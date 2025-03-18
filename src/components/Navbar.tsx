import { useState } from "react";
import { Link } from "react-router-dom";
import { FaBars } from "react-icons/fa";
import { IoCloseCircleSharp } from "react-icons/io5";


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
                <div className="navbar-header">
                    <Link to="/home">
                        <img
                            src="/images/CubeSat_logo.png"
                            alt="CubeSat logo"
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