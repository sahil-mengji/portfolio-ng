import React from "react";
import OrbitingImages from "./components/OrbitingImages";
import TypingEffect from "./components/TypingEffect";
import HomeBox from "./Homebox";

export default function Skills() {
  const textData = [
    { text: "WEB Development" },
    { text: "UI/UX Designing" },
    { text: "APP Development" },
    { text: "Graphic Designing" },
    { text: "Product Designing" },
    { text: "AI-ML" }, // This will use the default white color
  ];
  return (
    <HomeBox
      className="group relative flex flex-col justify-between p-4 sm:p-6 md:p-8 overflow-hidden hskills homebox"
      outerClassName="hskills"
    >
      <div className="font-normal text-white text-xl sm:text-2xl md:text-3xl cristik">
        <TypingEffect textData={textData} />
      </div>
      <p className="text-violet-400 text-base sm:text-lg md:text-xl">
        <span className="cristik">
          View Skills <br />& technologies
        </span>

        <span className="font-regular text-white/70 md:text-[16px] text-sm sm:text-base leading-6">
          See What all I can do →
        </span>
      </p>

      <OrbitingImages />
    </HomeBox>
  );
}
