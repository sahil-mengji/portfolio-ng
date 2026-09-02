import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import "../App.css";
import FetchLinkData from "./FetchLinkData";
import ZoomImg from "./ZoomImg";
import { useLocation } from "react-router";

export default function PortfolioSheet({ sheetOpen, setSheetOpen, sheetData }) {
  const location = useLocation();

  useEffect(() => {
    if (sheetOpen) {
      window.history.pushState({ fromSheet: true }, "");
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }

    const handlePopState = (event) => {
      if (sheetOpen) {
        setSheetOpen(false);
      }
    };

    window.addEventListener("popstate", handlePopState);

    return () => {
      document.body.style.overflow = "auto";
      window.removeEventListener("popstate", handlePopState);
    };
  }, [sheetOpen, setSheetOpen, location.pathname]);

  return (
    <AnimatePresence>
      {sheetOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="z-10 fixed inset-0 bg-black bg-opacity-50"
            onClick={() => {
              setSheetOpen(false);
              window.history.pushState(null, "");
            }}
          />

          {/* Sheet */}
          <motion.div
            className="top-0 right-0 z-20 fixed w-full max-w-[800px] h-screen overflow-x-hidden overflow-y-auto portfolioSheet no-scrollbar"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{
              type: "spring",
              stiffness: 300,
              damping: 30,
            }}
          >
            <header className="m-8">
              <h2 className="flex justify-between mb-5 font-bold spacegrotesk h2">
                {sheetData.title}
                <button
                  className="hover:scale-110 transition-transform duration-200 cursor-pointer modal-close-btn"
                  onClick={() => {
                    setSheetOpen(false);
                    window.history.pushState(null, "");
                  }}
                >
                  <ion-icon
                    className="cursor-pointer"
                    name="close-outline"
                  ></ion-icon>
                </button>
              </h2>

              <section className="mb-6 about-text">
                <p>{sheetData.description}</p>
              </section>

              <div className="flex flex-wrap gap-3 mb-6">
                {sheetData?.tools?.map((item, index) => (
                  <p key={index} className="technologiesTag">
                    {item}
                  </p>
                ))}
              </div>
            </header>

            <section>
              <ul className="space-x-4 overflow-x-scroll sheet-list has-scrollbar">
                {sheetData.photos?.map((item, index) => (
                  <div key={index} className="sheet-item">
                    <ZoomImg
                      src={item.url}
                      className="sheet-item"
                      alt="portfolio image"
                    />
                  </div>
                ))}
              </ul>
            </section>

            <div className="space-y-3 m-8">
              {sheetData?.url && (
                <h1 className="font-semibold text-white text-lg">
                  🔗 External Links
                </h1>
              )}
              {sheetData?.url?.map((item, index) => (
                <FetchLinkData
                  key={index}
                  alt="External link"
                  sheetOpen={sheetOpen}
                  url={item}
                />
              ))}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
