import React from "react";
import ZoomImg from "./components/ZoomImg";
import HomeBox from "./Homebox";

export default function Resume() {
  return (
    <HomeBox
      className="group relative p-4 sm:p-6 md:p-8 overflow-hidden hresume homebox"
      outerClassName="hresume relative"
    >
      <div className="z-20 font-regular font-thin text-white text-base sm:text-lg md:text-xl">
        <div className="opacity-45 text-sm sm:text-base md:text-lg cristik">
          Grab My
        </div>
        <div className="text-xl sm:text-2xl md:text-4xl cristik">Resume</div>
        <p className="font-medium text-violet-400 text-sm sm:text-base md:text-lg leading-6">
          View Complete Online <br />
          Resume →
        </p>

        <ZoomImg
          className="peer bottom-[-10px] sm:bottom-[-15px] md:bottom-[-20px] left-[10px] sm:left-[15px] md:left-[20px] z-10 absolute hover:border-8 hover:border-white/10 hover:border-solid rounded-lg w-[70%] sm:w-[75%] md:w-[80%] rotate-12 group-hover:rotate-[16deg] group-hover:scale-[1.1] transition-all cursor-pointer"
          src="resume.jpg"
          alt="Resume"
        />

        <img
          className="bottom-[-10px] sm:bottom-[-15px] md:bottom-[-20px] left-[10px] sm:left-[15px] md:left-[20px] absolute opacity-45 shadow-[10px_10px_10px_rgb(0,0,0,0.8)] rounded-lg w-[70%] sm:w-[75%] md:w-[80%] rotate-16 peer-hover:rotate-4 peer-hover:scale-[1.1] transition-transform"
          src="https://www.jobseeker.com/api/media/documents/48d5e977-d429-4c57-b5b8-6394df3c5e84/resume-example-vertical.1693324156611.svg"
          alt="Resume Background"
        />
      </div>

      <svg
        viewBox="0 0 200 200"
        fill="#7a54b2"
        xmlns="http://www.w3.org/2000/svg"
        className="top-[0%] -left-[5%] -z-2 absolute opacity-5 h-[60%] rotate-12 scale-[1.3] group-hover:scale-[1.5] transition-all translate-y-8 group-hover:translate-y-16 delay-100"
      >
        <g clip-path="url(#clip0_231_82)">
          <path
            fill-rule="evenodd"
            clip-rule="evenodd"
            d="M0 0C0 55.2285 44.7715 100 100 100C44.7715 100 0 144.772 0 200H12C12 151.399 51.3989 112 100 112C148.601 112 188 151.399 188 200H200C200 144.772 155.228 100 100 100C155.228 100 200 55.2285 200 0H188C188 48.6011 148.601 88 100 88C51.3989 88 12 48.6011 12 0H0ZM24 0C24 41.9736 58.0264 76 100 76C141.974 76 176 41.9736 176 0H164C164 35.3462 135.346 64 100 64C64.6538 64 36 35.3462 36 0H24ZM48 0C48 28.7188 71.2812 52 100 52C128.719 52 152 28.7188 152 0H140C140 22.0914 122.091 40 100 40C77.9086 40 60 22.0914 60 0H48ZM100 124C141.974 124 176 158.026 176 200H164C164 164.654 135.346 136 100 136C64.6538 136 36 164.654 36 200H24C24 158.026 58.0264 124 100 124ZM100 148C128.719 148 152 171.281 152 200H140C140 177.909 122.091 160 100 160C77.9086 160 60 177.909 60 200H48C48 171.281 71.2812 148 100 148Z"
          />
        </g>
        <defs>
          <linearGradient
            id="paint0_linear_231_82"
            x1="100"
            y1="0"
            x2="100"
            y2="200"
            gradientUnits="userSpaceOnUse"
          >
            <stop stop-color="#A7B5FF" />
            <stop offset="1" stop-color="#F3ACFF" />
          </linearGradient>
          <clipPath id="clip0_231_82">
            <rect width="200" height="200" fill="white" />
          </clipPath>
        </defs>
      </svg>
    </HomeBox>
  );
}
