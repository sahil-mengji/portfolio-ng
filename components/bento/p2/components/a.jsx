import MarqueeAlongSvgPath from "@/fancy/components/blocks/marquee-along-svg-path";
import React from "react";
import { useNavigate } from "react-router";
import {
  motion,
  useScroll,
  useTransform,
  useMotionTemplate,
} from "framer-motion";

const path =
  "M189 113C223 219 255 165 343 252 429 330 413 556 255 492 162 436 161 300 313 262 440 233 467 217 572 290 787 428 795 220 827 165";

const svgs = [
  {
    content: `<svg viewBox="0 0 108.89 108.89" xmlns="http://www.w3.org/2000/svg">
      <polygon fill="#73b6ff" points="37.55 108.89 52.56 108.89 52.56 90.12 90.12 90.12 90.12 75.09 52.56 75.09 52.56 56.33 37.55 56.33 37.55 108.89"/>
      <polygon fill="#73b6ff" points="108.89 71.34 108.89 56.33 90.12 56.33 90.12 18.78 75.09 18.78 75.09 56.33 56.33 56.33 56.33 71.34 108.89 71.34"/>
      <polygon fill="#73b6ff" points="71.34 0 56.33 0 56.33 18.78 18.78 18.78 18.78 33.79 56.33 33.79 56.33 52.56 71.34 52.56 71.34 0"/>
      <polygon fill="#73b6ff" points="0 37.55 0 52.56 18.78 52.56 18.78 90.12 33.79 90.12 33.79 52.56 52.56 52.56 52.56 37.55 0 37.55"/>
    </svg>`,
    color: "#73b6ff",
  },
  {
    content: `<svg viewBox="0 0 108.89 108.89" xmlns="http://www.w3.org/2000/svg">
      <path fill="#a0ec06" d="M58.34,0h-7.78v34.44L37.66,2.51l-7.21,2.91,13.24,32.76L18.7,13.2l-5.5,5.5,23.95,23.95L6.11,29.08l-3.11,7.13,32.83,14.35H0v7.78h35.83L3,72.68l3.11,7.13,31.03-13.56-23.95,23.95,5.5,5.5,24.98-24.98-13.24,32.76,7.21,2.91,12.9-31.93v34.44h7.78v-34.44l12.9,31.93,7.21-2.91-13.23-32.76,24.98,24.98,5.5-5.5-23.95-23.95,31.03,13.56,3.11-7.13-32.83-14.35h35.83v-7.78h-35.83l32.83-14.35-3.11-7.13-31.03,13.56,23.95-23.95-5.5-5.5-24.98,24.98,13.23-32.76-7.21-2.91-12.9,31.93V0Z"/>
    </svg>`,
    color: "#a0ec06",
  },
  {
    content: `<svg viewBox="0 0 98.49 113.72" xmlns="http://www.w3.org/2000/svg">
      <rect fill="#b48dff" x="51.56" y="48.23" width="6.32" height="10.94" transform="translate(-19.52 34.55) rotate(-30)"/>
      <polygon fill="#b48dff" points="60.19 56.86 65.66 66.34 65.66 66.34 71.13 63.18 65.66 53.7 60.19 56.86"/>
      <rect fill="#b48dff" x="51.56" y="35.59" width="6.32" height="10.94" transform="translate(-13.2 32.86) rotate(-30)"/>
      <rect fill="#b48dff" x="62.5" y="41.91" width="6.32" height="10.94" transform="translate(-14.89 39.18) rotate(-30)"/>
      <rect fill="#b48dff" x="51.56" y="22.96" width="6.32" height="10.94" transform="translate(-6.88 31.17) rotate(-30)"/>
      <rect fill="#b48dff" x="62.5" y="29.27" width="6.32" height="10.94" transform="translate(-8.58 37.48) rotate(-30)"/>
      <rect fill="#b48dff" x="51.56" y="10.32" width="6.32" height="10.94" transform="translate(-.57 29.47) rotate(-30)"/>
      <rect fill="#b48dff" x="62.5" y="16.64" width="6.32" height="10.94" transform="translate(-2.26 35.79) rotate(-30)"/>
      <rect fill="#b48dff" x="73.44" y="60.87" width="6.32" height="10.94" transform="translate(-22.91 47.19) rotate(-30)"/>
      <rect fill="#b48dff" x="73.44" y="48.23" width="6.32" height="10.94" transform="translate(-16.59 45.5) rotate(-30)"/>
      <polygon fill="#b48dff" points="49.25 0 54.71 9.47 60.18 6.32 49.25 0"/>
      <polygon fill="#b48dff" points="49.24 113.72 54.71 110.56 43.78 110.56 49.24 113.72"/>
    </svg>`,
    color: "#b48dff",
  },
  {
    content: `<svg viewBox="0 0 108.89 104.88" xmlns="http://www.w3.org/2000/svg">
      <path fill="#ff6666" d="M104.2,16.97l-.34-.58-.02-.02C97.63,6.25,86.49,0,74.59,0c-6.09,0-12.09,1.63-17.34,4.71l-2.81,1.65-2.8-1.64C46.39,1.63,40.39,0,34.3,0,22.16,0,10.82,6.5,4.69,16.97-4.86,33.29.64,54.34,16.96,63.91l3.18,1.86v4.8c0,18.92,15.39,34.31,34.31,34.31s34.31-15.39,34.31-34.31v-4.8l3.19-1.87c16.31-9.56,21.81-30.62,12.26-46.94Z"/>
    </svg>`,
    color: "#ff6666",
  },
  {
    content: `<svg viewBox="0 0 106.73 108.89" xmlns="http://www.w3.org/2000/svg">
      <path fill="#ffcc00" d="M4.48,47.62l13.79-23.89h36.06l22.76,39.43,4.73-8.19L59.07,15.54H16.74c-1.98,0-3.8,1.05-4.79,2.76L1.35,36.66c-.99,1.71-.99,3.82,0,5.53l3.13,5.43Z"/>
      <path fill="#ffcc00" d="M86.23,47.62l4.73-8.19L69.8,2.77C68.81,1.05,66.98,0,65.01,0h-21.2c-1.98,0-3.8,1.05-4.79,2.76l-3.13,5.43h27.58s22.76,39.43,22.76,39.43Z"/>
      <path fill="#ffcc00" d="M26.63,69.47l22.76-39.43h-9.46s-22.76,39.43-22.76,39.43l21.17,36.66c.99,1.71,2.81,2.76,4.79,2.76h21.2c1.98,0,3.8-1.05,4.79-2.76l3.13-5.43h-27.58s-18.03-31.23-18.03-31.23Z"/>
    </svg>`,
    color: "#ffcc00",
  },
  {
    content: `<svg viewBox="0 0 108.89 108.89" xmlns="http://www.w3.org/2000/svg">
      <path fill="#ff6333" d="M8.93,36.7v35.61C3.48,68.28,0,61.74,0,54.56s3.48-13.83,8.93-17.86Z"/>
      <path fill="#ff6333" d="M31.14,32.23v44.43c-12.31,0-22.22-10.02-22.22-22.21s10.02-22.22,22.22-22.22Z"/>
      <path fill="#ff6333" d="M76.66,54.45c0,12.27-9.95,22.21-22.21,22.21s-22.22-9.95-22.22-22.21,9.95-22.22,22.22-22.22,22.21,9.95,22.21,22.22Z"/>
    </svg>`,
    color: "#ff6333",
  },
  {
    content: `<svg viewBox="0 0 100.5 108.89" xmlns="http://www.w3.org/2000/svg">
      <path fill="#66cc99" d="M95.77,29.35c-.81-2.38-.12-5.22-.35-7.74.2-2.1-1.79-1.77-3.27-1.77-1.41-.27-6.57.79-6.69-1.02-.28-1.04.29-2.77-.52-3.62-2.51-.72-5.38-.12-7.97-.31-2.02-.2-4.33.42-6.23-.33-.65-.77-.34-2.04-.42-3.19-.27-1.46.78-6.08-1-6.29-2.55-.3-5.83.21-8.35-.24-2.04-1.66,1.32-5.24-3.38-4.78-3.79,0-7.39,0-11.18,0-1.68.22-4.57-.52-5.93.48-.81,1.66.73,4.87-2.31,4.46-1.77.02-3.34,0-5.13,0-1.02.04-2.68-.28-2.81,1.11Z"/>
    </svg>`,
    color: "#66cc99",
  },
  {
    content: `<svg viewBox="0 0 108.89 108.89" xmlns="http://www.w3.org/2000/svg">
      <polygon fill="#9966ff" points="37.55 108.89 52.56 108.89 52.56 90.12 90.12 90.12 90.12 75.09 52.56 75.09 52.56 56.33 37.55 56.33 37.55 108.89"/>
      <polygon fill="#9966ff" points="108.89 71.34 108.89 56.33 90.12 56.33 90.12 18.78 75.09 18.78 75.09 56.33 56.33 56.33 56.33 71.34 108.89 71.34"/>
      <polygon fill="#9966ff" points="71.34 0 56.33 0 56.33 18.78 18.78 18.78 18.78 33.79 56.33 33.79 56.33 52.56 71.34 52.56 71.34 0"/>
      <polygon fill="#9966ff" points="0 37.55 0 52.56 18.78 52.56 18.78 90.12 33.79 90.12 33.79 52.56 52.56 52.56 52.56 37.55 0 37.55"/>
    </svg>`,
    color: "#9966ff",
  },
  {
    content: `<svg viewBox="0 0 108.89 108.89" xmlns="http://www.w3.org/2000/svg">
      <path fill="#ff99cc" d="M58.34,0h-7.78v34.44L37.66,2.51l-7.21,2.91,13.24,32.76L18.7,13.2l-5.5,5.5,23.95,23.95L6.11,29.08l-3.11,7.13,32.83,14.35H0v7.78h35.83L3,72.68l3.11,7.13,31.03-13.56-23.95,23.95,5.5,5.5,24.98-24.98-13.24,32.76,7.21,2.91,12.9-31.93v34.44h7.78v-34.44l12.9,31.93,7.21-2.91-13.23-32.76,24.98,24.98,5.5-5.5-23.95-23.95,31.03,13.56,3.11-7.13-32.83-14.35h35.83v-7.78h-35.83l32.83-14.35-3.11-7.13-31.03,13.56,23.95-23.95-5.5-5.5-24.98,24.98,13.23-32.76-7.21-2.91-12.9,31.93V0Z"/>
    </svg>`,
    color: "#ff99cc",
  },
  {
    content: `<svg viewBox="0 0 106.73 108.89" xmlns="http://www.w3.org/2000/svg">
      <path fill="#33ccff" d="M4.48,47.62l13.79-23.89h36.06l22.76,39.43,4.73-8.19L59.07,15.54H16.74c-1.98,0-3.8,1.05-4.79,2.76L1.35,36.66c-.99,1.71-.99,3.82,0,5.53l3.13,5.43Z"/>
      <path fill="#33ccff" d="M86.23,47.62l4.73-8.19L69.8,2.77C68.81,1.05,66.98,0,65.01,0h-21.2c-1.98,0-3.8,1.05-4.79,2.76l-3.13,5.43h27.58s22.76,39.43,22.76,39.43Z"/>
    </svg>`,
    color: "#33ccff",
  },
  {
    content: `<svg viewBox="0 0 100.5 108.89" xmlns="http://www.w3.org/2000/svg">
      <path fill="#ccff33" d="M95.77,29.35c-.81-2.38-.12-5.22-.35-7.74.2-2.1-1.79-1.77-3.27-1.77-1.41-.27-6.57.79-6.69-1.02-.28-1.04.29-2.77-.52-3.62-2.51-.72-5.38-.12-7.97-.31-2.02-.2-4.33.42-6.23-.33-.65-.77-.34-2.04-.42-3.19-.27-1.46.78-6.08-1-6.29-2.55-.3-5.83.21-8.35-.24Z"/>
    </svg>`,
    color: "#ccff33",
  },
];

export default function HeroPathMarque() {
  const navigate = useNavigate();
  const [isHovered, setIsHovered] = React.useState(false);
  const { scrollY } = useScroll();
  const { scrollY } = useScroll();

  const scale = useTransform(scrollY, [0, 100], [1, 4]);
  const opacity = useTransform(scrollY, [0, 100], [1, 0.8]);

  const y = useTransform(scrollY, [0, 600], [0, -200]);

  const x = useTransform(scrollY, [0, 600], [0, 200]);
  const pe = useTransform(scrollY, [0, 10], ["", "none"]);

  const blur = useTransform(scrollY, [0, 100], [0, 50]);
  const filter = useMotionTemplate`blur(${blur}px)`;

  return (
    <motion.div
      style={{
        scale,
        opacity,
        y,
        x,
        filter,
        pointerEvents: pe,
      }}
      className="-top-64 -right-48 fixed flex justify-end grayscale hover:grayscale-0 invert hover:invert-0 w-dvw max-w-[800px] h-dvh rotate-[45deg] transition-all duration-300 ease-in-out cursor-pointer"
      onClick={() => {
        navigate("/design");
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="-top-32 -right-64 fixed">hi</div>
      {/* Arrow and text */}
      {
        <div className="bottom-1/3 left-1/2 absolute -rotate-45 -translate-x-1/2 pointer-events-none transform">
          <div
            className={`flex items-center gap-2 font-bold text-white transition-all duration-300 ${
              isHovered ? "scale-110 translate-x-2" : ""
            }`}
          >
            <span
              className={`text-3xl amsterdam transition-all duration-300 ${
                isHovered ? "text-yellow-300 drop-shadow-lg" : ""
              }`}
            >
              Go{" . "} to{" . "} Showcase
            </span>
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className={`transition-all duration-[2s] ${
                isHovered && "animate-pulse scale-125 text-yellow-300 "
              }`}
            >
              <path d="M5 12h14" />
              <path d="m12 5 7 7-7 7" />
            </svg>
          </div>
        </div>
      }
      <MarqueeAlongSvgPath
        path={path}
        baseVelocity={10}
        slowdownOnHover={true}
        draggable={true}
        repeat={2}
        dragSensitivity={0.1}
        className="top-32 -left-24 sm:-left-32 absolute scale-60 sm:scale-100 hover:scale-[1.1] transition-transform hover:-translate-y-8 duration-[3s] ease-in"
        grabCursor
      >
        {svgs.map((svg, i) => (
          <div
            key={i}
            className="w-14 h-full hover:scale-150 duration-300 ease-in-out"
          >
            <div
              className="w-full h-full"
              dangerouslySetInnerHTML={{ __html: svg.content }}
            />
          </div>
        ))}
      </MarqueeAlongSvgPath>
    </motion.div>
  );
}
