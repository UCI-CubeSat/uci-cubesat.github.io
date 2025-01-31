import { useState } from "react";
import { Link } from "react-router-dom";
import "./NavbarStyle.css";

const Navbar = () => {
    const [isHovered, setIsHovered] = useState(false);

    return (
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
    );
};

export default Navbar;