import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useQueryState } from "nuqs";
import ScrambleText from "./ScrambleText";
import ZoomImg from "./ZoomImg";

export default function SideNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const [showContacts, setShowContacts] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  // Using nuqs for state management
  const [filtersState, setFiltersState] = useQueryState("filters", {
    parse: (value) => {
      if (!value) return {};
      return JSON.parse(decodeURIComponent(value));
    },
    serialize: (value) => encodeURIComponent(JSON.stringify(value)),
    defaultValue: {
      web: false,
      mobile: false,
      design: false,
      frontend: false,
      backend: false,
    },
  });

  const [activeSection, setActiveSection] = useQueryState("section", {
    defaultValue: "bio",
  });

  // Define the filter arrays
  const categoryFilters = [
    { id: "web", title: "Web Development", icon: "globe-outline" },
    { id: "mobile", title: "Mobile Apps", icon: "phone-portrait-outline" },
    { id: "design", title: "UI/UX Design", icon: "color-palette-outline" },
  ];

  const technologyFilters = [
    { id: "frontend", title: "Frontend", icon: "code-slash-outline" },
    { id: "backend", title: "Backend", icon: "server-outline" },
  ];

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Reset contacts state when route changes
  useEffect(() => {
    setShowContacts(false);
  }, [location.pathname]);

  const handleFilterChange = (filter) => {
    // If "All" is selected, clear all filters
    if (filter === "all") {
      clearFilters();
      return;
    }

    setFiltersState({
      ...filtersState,
      [filter]: !filtersState[filter],
    });
  };

  const clearFilters = () => {
    setFiltersState({
      web: false,
      mobile: false,
      design: false,
      frontend: false,
      backend: false,
    });
  };

  // Function to handle section navigation
  const scrollToSection = (sectionId) => {
    // First update the URL state
    setActiveSection(sectionId);

    // Navigate to about page if we're not there already
    if (location.pathname !== "/about") {
      navigate("/about");
      // The About component will handle scrolling when it mounts
    }
  };

  // Check if all filters are inactive (equivalent to "All" selected)
  const isAllSelected = Object.values(filtersState).every((val) => !val);

  // FilterPill component
  const FilterPill = ({ filter }) => (
    <button
      key={filter.id}
      onClick={() => handleFilterChange(filter.id)}
      className={`flex items-center gap-2 py-2 px-4 rounded-full mb-3 mr-2 transition-all text-sm ${
        filtersState[filter.id]
          ? "bg-primary font-medium bg-[#443d2f] text-[#ffc562] border-[#383838] border"
          : "hover:bg-[#544a36] hover:text-white border-[#383838] border-solid border-[0.5px]"
      }`}
    >
      <span>{filter.title}</span>
    </button>
  );

  // Animation variants for the whole container
  const pageVariants = {
    initial: {
      opacity: 0,
      y: -20,
      filter: "blur(5px)",
    },
    animate: {
      opacity: 1,
      y: 0,
      filter: "blur(0px)",
      transition: {
        duration: 0.4,
        ease: "easeOut",
      },
    },
    exit: {
      opacity: 0,
      y: 20,
      filter: "blur(5px)",
      transition: {
        duration: 0.3,
        ease: "easeIn",
      },
    },
  };

  // Home route sidebar
  const renderHomeSidebar = () => (
    <div className="p-6 pt-16">
      <div className="sidebar-info">
        <figure className="avatar-box shake">
          <img
            src="my-avatar.png"
            className="shake"
            alt="Richard hanrick"
            width="80"
          />
        </figure>

        <div className="info-content">
          <ScrambleText className="cristik name" title="Richard hanrick">
            Sahil Mengji
          </ScrambleText>
          <div className="flex flex-wrap gap-2">
            <p className="title">Web / App developer</p>
            <p className="title">UI/UX Designer </p>
          </div>
        </div>

        <button
          className="info_more-btn"
          data-sidebar-btn
          onClick={() => setShowContacts(!showContacts)}
        >
          <span>{showContacts ? "Hide Contacts" : "Show Contacts"}</span>
          <ion-icon
            name={showContacts ? "chevron-up" : "chevron-down"}
          ></ion-icon>
        </button>
      </div>

      <motion.div
        key="contacts"
        initial={{ height: 0, opacity: 0 }}
        animate={{ height: "auto", opacity: 1 }}
        exit={{ height: 0, opacity: 0 }}
        transition={{ duration: 0.1 }}
        className="sidebar-info_more active"
      >
        <div className="separator"></div>

        <ul className="contacts-list">
          <li className="contact-item">
            <div className="icon-box">
              <ion-icon name="mail-outline"></ion-icon>
            </div>

            <div className="contact-info">
              <p className="contact-title">Email</p>

              <a href="mailto:sahilanand716@mail.com" className="contact-link">
                sahilanand716@mail.com
              </a>
            </div>
          </li>

          <li className="contact-item">
            <div className="icon-box">
              <ion-icon name="calendar-outline"></ion-icon>
            </div>

            <div className="contact-info">
              <p className="contact-title">Birthday</p>

              <time dateTime="1982-06-23">December 02, 2004</time>
            </div>
          </li>

          <li className="contact-item">
            <div className="icon-box">
              <ion-icon name="location-outline"></ion-icon>
            </div>

            <div className="contact-info">
              <p className="contact-title">Location</p>

              <address>Manglore, Karnataka, India</address>
            </div>
          </li>
        </ul>

        <div className="separator"></div>

        <ul className="social-list">
          <li className="social-item">
            <a href="#" className="social-link">
              <ion-icon name="logo-facebook"></ion-icon>
            </a>
          </li>

          <li className="social-item">
            <a href="#" className="social-link">
              <ion-icon name="logo-twitter"></ion-icon>
            </a>
          </li>

          <li className="social-item">
            <a href="#" className="social-link">
              <ion-icon name="logo-instagram"></ion-icon>
            </a>
          </li>
        </ul>
      </motion.div>
    </div>
  );

  // Portfolio route sidebar (filters)
  const renderPortfolioSidebar = () => (
    <div className="shadow-md p-6 rounded-3xl w-full overflow-auto text-white no-scrollbar">
      <h2 className="w-full font-extralight h2 article-title cristik">
        Filters
      </h2>

      {/* All & Clear Filters Buttons */}
      <div className="flex gap-4">
        <button
          className={`py-2 px-4 rounded-full transition-colors font-sm flex items-center justify-center gap-2 ${
            isAllSelected
              ? "bg-[#443d2f] text-[#fec563]"
              : "hover:bg-[#544a36] hover:text-white border-[#383838] border-solid border-[0.5px]"
          }`}
          onClick={() => handleFilterChange("all")}
        >
          All
        </button>
        {!isAllSelected && (
          <button
            className="flex justify-center items-center gap-2 bg-[#443d2f] hover:bg-[#544a36] px-4 py-2 rounded-full font-sm text-[#fec563] hover:text-white transition-colors"
            onClick={clearFilters}
          >
            <ion-icon name="refresh-outline"></ion-icon>
            Clear Filters
          </button>
        )}
      </div>

      <div className="bg-gray-700 my-6 h-px"></div>

      {/* Category Filters */}
      <div className="mb-6">
        <h4 className="mb-4 font-medium text-white text-lg">Category</h4>
        <div className="flex flex-wrap">
          {categoryFilters.map((filter) => (
            <FilterPill key={filter.id} filter={filter} />
          ))}
        </div>
      </div>

      <div className="bg-gray-700 my-6 h-px"></div>

      {/* Technology Filters */}
      <div className="mb-6">
        <h4 className="mb-4 font-medium text-white text-lg">Technology</h4>
        <div className="flex flex-wrap">
          {technologyFilters.map((filter) => (
            <FilterPill key={filter.id} filter={filter} />
          ))}
        </div>
      </div>
    </div>
  );

  // About route sidebar (resume navigation)
  const renderAboutSidebar = () => {
    const resumeSections = [
      { id: "bio", title: "About", icon: "person-outline" },
      { id: "services", title: "Services", icon: "settings-outline" },
      { id: "experience", title: "Work Experience", icon: "briefcase-outline" },
      { id: "skills", title: "Skills", icon: "code-outline" },
      { id: "education", title: "Education", icon: "school-outline" },
      { id: "testimonials", title: "Testimonials", icon: "star-outline" },
      { id: "clients", title: "Clients", icon: "people-outline" },
      { id: "projects", title: "Projects", icon: "folder-outline" },
    ];

    return (
      <div className="p-8 w-full text-white">
        <header>
          <h2 className="w-full font-extralight h2 article-title cristik">
            Resume
          </h2>
        </header>

        <ZoomImg
          className="top-[60px] right-[-100px] sm:bottom-[-15px] md:bottom-[-20px] z-10 absolute bg-green-300 shadow-[0px_4px_16px_rgba(17,17,50,0.3),_0px_8px_24px_rgba(17,17,26,0.1),_0px_16px_56px_rgba(17,17,26,0.1)] rounded-lg w-[60%] sm:w-[70%] md:w-[75%] -rotate-[32deg] hover:rotate-[-20deg] hover:scale-[1.1] transition-transform hover:translate-x-[-10px] hover:translate-y-[20px] cursor-pointer"
          src="resume.jpg"
          alt="Resume"
        />

        <ul className="flex flex-col gap-3 mt-[120px] w-full">
          {resumeSections.map((section) => (
            <li
              key={section.id}
              className={`relative mr-10 translate-x-[-16px] ${
                activeSection === section.id
                  ? "font-medium text-white "
                  : "text-[#ffc562]"
              }`}
            >
              <button
                onClick={() => {
                  setActiveSection(section.id);
                  scrollToSection(section.id);
                }}
                className={`flex items-center gap-3 w-full py-3 hover:translate-x-[20px] hover:text-white hover:bg-[#443d2f] transition-all rounded-full
							${activeSection === section.id ? " bg-[#443c2f]" : ""}`}
              >
                <div
                  className={`w-1 h-8 rounded-full ${
                    activeSection === section.id
                      ? "bg-primary"
                      : "bg-transparent"
                  }`}
                ></div>
                <ion-icon
                  name={section.icon}
                  style={{
                    color: "#fec563",
                    backgroundColor: "#443c2f",
                    borderRadius: "50%",
                    padding: "5px",
                  }}
                  className="text-lg"
                ></ion-icon>
                <span className="text-white whitespace-nowrap">
                  {section.title}
                </span>
                {activeSection === section.id && (
                  <div className="right-3 absolute bg-primary rounded-full w-2 h-2"></div>
                )}
              </button>
            </li>
          ))}
        </ul>
      </div>
    );
  };

  // Don't render sidebar on mobile - component completely hidden
  if (isMobile) {
    return null;
  }

  // Render different sidebar based on route
  const renderSidebarContent = () => {
    switch (location.pathname) {
      case "/portfolio":
        return renderPortfolioSidebar();
      case "/about":
        return renderAboutSidebar();
      default:
        return renderHomeSidebar();
    }
  };

  return (
    <aside
      className="hidden lg:block sidebar"
      style={{ padding: 0 }}
      data-sidebar
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={location.pathname}
          variants={pageVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          className="w-full h-full"
        >
          {renderSidebarContent()}
        </motion.div>
      </AnimatePresence>
    </aside>
  );
}
