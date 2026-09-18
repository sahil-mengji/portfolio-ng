import React, { useState, useEffect } from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  Home,
  User,
  Grid3X3,
  Mail,
  FlaskConical,
  Menu,
  X,
  Github,
  Instagram,
  Linkedin,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const Navbar = () => {
  const [show, setShow] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const location = useLocation();
  const activePath = location.pathname;

  const controlNavbar = () => {
    if (typeof window !== "undefined") {
      if (window.scrollY > lastScrollY) {
        setShow(false);
      } else {
        setShow(true);
      }
      setLastScrollY(window.scrollY);
    }
  };

  useEffect(() => {
    setIsLoaded(true);
    if (typeof window !== "undefined") {
      window.addEventListener("scroll", controlNavbar);
      return () => {
        window.removeEventListener("scroll", controlNavbar);
      };
    }
  }, [lastScrollY]);

  // Handle transition state
  useEffect(() => {
    setIsTransitioning(true);
    const timer = setTimeout(() => {
      setIsTransitioning(false);
    }, 300); // Adjust timing as needed

    return () => clearTimeout(timer);
  }, [activePath]);

  const navItems = [
    {
      path: "/",
      name: "Home",
      icon: Home,
    },
    {
      path: "/about",
      name: "About",
      icon: User,
    },
    {
      path: "/portfolio",
      name: "Portfolio",
      icon: Grid3X3,
    },
    {
      path: "/contact",
      name: "Contact",
      icon: Mail,
    },
    {
      path: "/experiments",
      name: "Experiments",
      icon: FlaskConical,
    },
  ];

  const socialLinks = [
    { icon: Github, href: "#", label: "GitHub" },
    { icon: Instagram, href: "#", label: "Instagram" },
    { icon: Linkedin, href: "#", label: "LinkedIn" },
  ];

  const activeIndex = navItems.findIndex((item) => item.path === activePath);

  return (
    <>
      {/* Unified Navbar for Desktop and Mobile */}
      <motion.nav
        initial={{ y: 100, opacity: 0 }}
        animate={{
          y: show ? 0 : 100,
          opacity: show ? 1 : 0,
        }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="bottom-[30px] md:bottom-[30px] left-0 z-[10] fixed px-4 w-full"
      >
        <div className="mx-auto w-full max-w-[800px]">
          <div
            className="flex justify-between items-center bg-black/5 shadow-lg backdrop-blur-xl px-3 pr-4 border border-white/10 rounded-full h-[80px] text-white"
            style={{
              boxShadow:
                "inset 0 1px 0 rgba(0, 0, 0, 0.1), 0 20px 25px -5px rgba(0, 0, 0, 0.4), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
            }}
          >
            {/* Logo */}
            <motion.div
              className="group flex items-center"
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
            >
              <motion.p
                src="logo.png"
                className="bg-black/10 backdrop-blur-sm p-3 px-6 border border-white/10 rounded-full h-full text-2xl array"
                style={{
                  boxShadow: "inset 0 1px 0 rgba(0, 0, 0, 0.05)",
                }}
                alt="Logo"
                whileHover={{ rotate: 3, scale: 1.1 }}
                transition={{ duration: 0.3 }}
              >
                Sahil
              </motion.p>
            </motion.div>

            {/* Navigation */}
            <div className="relative flex items-center space-x-0 p-0 h-full">
              {navItems.map((item, index) => {
                const IconComponent = item.icon;
                const isActive = activePath === item.path;

                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    className="group relative flex items-center gap-2 px-6 py-4 rounded-full text-gray-400 hover:text-violet-300 hover:scale-105 transition-all duration-300 ]"
                  >
                    <IconComponent
                      size={24}
                      className={`transition-all duration-300 group-hover:rotate-12 ${
                        isActive ? "text-violet-400" : ""
                      }`}
                    />
                    <span className="hidden md:block font-medium text-sm">
                      {item.name}
                    </span>

                    {isActive && (
                      <motion.div
                        layoutId="active-pill"
                        className="-z-10 absolute inset-0 bg-white/5 backdrop-blur-sm border-[0.1px] border-white/10 rounded-full"
                        style={{
                          boxShadow:
                            "inset 0 1px 2px rgba(255, 255, 255, 0.1), inset 0 -1px 6px rgba(255, 255, 255, 0.2), 0 4px 16px rgba(0, 0, 0, 0.2), 0 1px 16px rgba(0, 0, 0, 0.01)",
                        }}
                        animate={{
                          height: isTransitioning ? "120%" : "100%",
                          scaleY: isTransitioning ? 1.1 : 1,
                          scaleX: isTransitioning ? 1.2 : 1,
                          y: isTransitioning ? -6 : 0,
                        }}
                        transition={{
                          type: "spring",
                          bounce: 0.2,
                          duration: 0.6,
                          height: {
                            type: "spring",
                            stiffness: 300,
                            damping: 25,
                          },
                          scaleY: {
                            type: "spring",
                            stiffness: 300,
                            damping: 25,
                          },
                        }}
                      />
                    )}
                  </NavLink>
                );
              })}
            </div>
          </div>
        </div>
      </motion.nav>
    </>
  );
};

export default Navbar;
