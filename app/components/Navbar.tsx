import { useState } from "react";
import { Link, useLocation } from "react-router";
import { FaBars } from "react-icons/fa";
import { IoCloseCircleSharp } from "react-icons/io5";

const Navbar = () => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const location = useLocation();

    const toggleMobileMenu = () => {
        setIsMobileMenuOpen(!isMobileMenuOpen);
    };

    const isActive = (path: string) => {
        if (path === '/') {
            return location.pathname === '/';
        }
        return location.pathname.startsWith(path);
    };

    return (
        <>
            <a
                href="#main-content"
                className="absolute -top-full left-4 z-[10000] py-2 px-4 bg-earth text-white rounded text-sm font-medium focus:top-2"
            >
                Skip to content
            </a>
            <nav className="sticky top-0 z-[1000] bg-orbital/85 backdrop-blur-[12px] border-b border-starlight">
                <div className="flex items-center justify-between max-w-[1200px] mx-auto px-6 h-[72px]">
                    <Link to="/" className="flex items-center">
                        <img
                            src="/images/logov2.png"
                            alt="UCI CubeSat logo"
                            width={152}
                            height={40}
                            className="block h-10 w-auto max-w-[152px] object-contain"
                        />
                    </Link>

                    <div className="hidden sm:flex items-center gap-2">
                        <Link
                            to="/"
                            className={`text-[15px] font-medium py-2 px-4 rounded-md transition-colors ${isActive('/') ? 'text-primary' : 'text-muted hover:text-primary'}`}
                        >
                            Home
                        </Link>

                        <div className="relative group">
                            <Link
                                to="/aboutus/what-we-do"
                                className={`text-[15px] font-medium py-2 px-4 rounded-md transition-colors ${isActive('/aboutus') ? 'text-primary' : 'text-muted hover:text-primary'}`}
                            >
                                About Us
                            </Link>
                            <div className="absolute top-full left-1/2 -translate-x-1/2 translate-y-1 opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto group-hover:translate-y-0 transition-all duration-200 bg-orbital border border-starlight rounded-lg min-w-[180px] py-1 shadow-[0_8px_32px_rgba(0,0,0,0.4)] before:content-[''] before:absolute before:-top-3 before:left-0 before:right-0 before:h-3">
                                <Link to="/aboutus/what-we-do" className="block py-2.5 px-4 text-sm font-medium text-muted transition-colors hover:text-primary hover:bg-white/[0.04]">
                                    What We Do
                                </Link>
                                <Link to="/aboutus/meet-the-team" className="block py-2.5 px-4 text-sm font-medium text-muted transition-colors hover:text-primary hover:bg-white/[0.04]">
                                    Meet the Team
                                </Link>
                            </div>
                        </div>

                        <Link
                            to="/join-the-team"
                            className={`text-[15px] font-medium py-2 px-4 rounded-md transition-colors ${isActive('/join-the-team') ? 'text-primary' : 'text-muted hover:text-primary'}`}
                        >
                            Join the Team
                        </Link>

                        <Link to="/contact" className="text-sm font-medium text-white bg-earth py-2 px-5 rounded-md ml-2 transition-colors hover:bg-[#2570d4]">
                            Contact Us
                        </Link>
                    </div>

                    <button
                        className="flex sm:hidden items-center bg-transparent border-none text-muted text-[22px] p-2 hover:text-primary"
                        onClick={toggleMobileMenu}
                        aria-label="Open navigation menu"
                    >
                        <FaBars />
                    </button>
                </div>
            </nav>

            {isMobileMenuOpen && (
                <div className="fixed inset-0 z-[9999] bg-orbital flex flex-col">
                    <button
                        className="self-end bg-transparent border-none text-muted text-[40px] py-4 px-5 hover:text-primary"
                        onClick={toggleMobileMenu}
                        aria-label="Close navigation menu"
                    >
                        <IoCloseCircleSharp />
                    </button>
                    <div className="flex flex-col py-4 px-6 gap-1">
                        <Link onClick={toggleMobileMenu} to="/" className="text-[32px] font-bold text-muted py-3 transition-colors hover:text-primary">Home</Link>
                        <Link onClick={toggleMobileMenu} to="/aboutus/what-we-do" className="text-[32px] font-bold text-muted py-3 transition-colors hover:text-primary">What We Do</Link>
                        <Link onClick={toggleMobileMenu} to="/aboutus/meet-the-team" className="text-[32px] font-bold text-muted py-3 transition-colors hover:text-primary">Meet the Team</Link>
                        <Link onClick={toggleMobileMenu} to="/join-the-team" className="text-[32px] font-bold text-muted py-3 transition-colors hover:text-primary">Join the Team</Link>
                        <Link onClick={toggleMobileMenu} to="/contact" className="text-[32px] font-bold text-muted py-3 transition-colors hover:text-primary">Contact</Link>
                    </div>
                </div>
            )}
        </>
    );
};

export default Navbar;
