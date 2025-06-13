"use client";
import React, { useState, useRef, useEffect } from "react";
import { NavLink, Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-toastify";

const Navbar = () => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [isOpen, setIsOpen] = useState(false);
  const [bubbleStyle, setBubbleStyle] = useState({});
  const linkRefs = useRef({});

  const handleLogout = async () => {
    await logout();
    navigate("/login");
    toast.success("Logged out successfully");
  };

  const updateBubble = () => {
    const currentPath = location.pathname;
    const activeRef = linkRefs.current[currentPath];
    if (activeRef) {
      const { offsetLeft, offsetTop, offsetWidth, offsetHeight } = activeRef;
      setBubbleStyle({
        left: offsetLeft,
        top: offsetTop,
        width: offsetWidth,
        height: offsetHeight,
      });
    }
  };

  useEffect(() => {
    updateBubble();
    window.addEventListener("resize", updateBubble);
    return () => window.removeEventListener("resize", updateBubble);
  }, [location.pathname]);

  const navLinks = [
    { to: "/", label: "Home" },
    { to: "/friends", label: "Friends" },
    { to: "/about", label: "About" },
    { to: "/contact", label: "Contact" },
  ];

  return (
    <nav className="fixed left-1/2 transform -translate-x-1/2 w-11/12 top-0 z-50 mt-7 rounded-full border-b bg-white/20 max-w-7xl backdrop-blur-lg shadow-md">
      <div className="container mx-auto flex justify-between items-center px-5 h-16 relative">
        <div className="text-gray-700 text-xl font-bold">Rendezbous</div>

        <div className="hidden md:flex items-center space-x-6 relative">
          {/* Animated Bubble */}
          <div
            className="absolute transition-all duration-500 bg-white/30 backdrop-blur-lg shadow-[inset_0_6px_12px_rgba(0,0,0,0.4)] rounded-full z-0"
            style={{
              ...bubbleStyle,
              position: "absolute",
              pointerEvents: "none",
            }}
          />

          {/* Navigation Links */}
          {navLinks.map(({ to, label }) => (
            <NavLink
              key={to}
              to={to}
              ref={(el) => (linkRefs.current[to] = el)}
              className="relative z-10 px-4 py-2 font-medium text-indigo-600 transition duration-300"
            >
              {label}
            </NavLink>
          ))}

          {/* Auth Button */}
          {user ? (
            <button
              onClick={handleLogout}
              className="ml-4 bg-red-500 text-white px-4 py-2 rounded-full hover:bg-red-600/30 transition duration-300 backdrop-blur-lg shadow-[inset_0_4px_8px_rgba(0,0,0,0.4)]"
            >
              Logout
            </button>
          ) : (
            <Link
              to="/login"
              className="ml-4 bg-green-500 text-white px-4 py-2 rounded-full hover:bg-green-600 transition duration-300"
            >
              Login
            </Link>
          )}
        </div>

        {/* Mobile menu button */}
        <div className="md:hidden">
          <button
            className="text-gray-600 focus:outline-none"
            onClick={() => setIsOpen(!isOpen)}
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <div
        className={`absolute md:hidden top-16 left-0 w-full rounded-b-lg transition-all duration-300 ease-in-out overflow-hidden z-40 ${
          isOpen
            ? "max-h-96 opacity-100 bg-white/20 backdrop-blur-lg"
            : "max-h-0 opacity-0"
        }`}
      >
        <div className="flex flex-col items-center space-y-2 py-4 px-5">
          {navLinks.map(({ to, label }) => (
            <Link
              key={to}
              to={to}
              className="w-full text-center text-gray-700 py-2 rounded-full hover:bg-white/30 transition duration-300"
              onClick={() => setIsOpen(false)}
            >
              {label}
            </Link>
          ))}
          {user ? (
            <button
              onClick={() => {
                handleLogout();
                setIsOpen(false);
              }}
              className="w-full text-center bg-red-500 text-white py-2 rounded-full hover:bg-red-600 transition duration-300"
            >
              Logout
            </button>
          ) : (
            <Link
              to="/login"
              className="w-full text-center bg-green-500 text-white py-2 rounded-full hover:bg-green-600 transition duration-300"
              onClick={() => setIsOpen(false)}
            >
              Login
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
