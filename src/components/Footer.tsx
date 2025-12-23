import "./FooterStyle.css";
import { FaInstagram, FaLinkedin } from "react-icons/fa";
import { GoArrowUpRight } from "react-icons/go";

const Footer = () => {
    return (
        <>
            <div id="footer">
                <h1 id="connected-header">Stay Connected</h1>
                <div className="socials-box">
                    <div className="icons-box">
                        <div id="instagram-box">
                            <a href="https://www.instagram.com/ucicubesat" target="_blank" rel="noopener noreferrer">
                                <FaInstagram id="instagram-logo"/>
                            </a>
                            <a href="https://www.instagram.com/ucicubesat" target="_blank" rel="noopener noreferrer">
                                <p>@ucicubesat</p>
                            </a>
                        </div>
                        <div id="linkedin-box">
                            <a href="https://www.linkedin.com/company/uci-cubesat/" target="_blank" rel="noopener noreferrer">
                                <FaLinkedin id="linkedin-logo"/>
                            </a>
                        </div>
                    </div>
                    <div className="contact-info">
                        <a href="mailto:team.ucicubesat@gmail.com" id="joinus-box">
                            <p>Join Us</p>
                            <GoArrowUpRight id="joinus-arrow"/>
                        </a>
                        <p>Based in Irvine, CA</p>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Footer;