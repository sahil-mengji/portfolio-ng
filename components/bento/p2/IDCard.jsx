import React, { useState } from "react";
import HomeBox from "./Homebox";
import { motion } from "framer-motion";

const skills = [
  { name: "React", color: "bg-blue-500/20 text-blue-300" },
  { name: "Node.js", color: "bg-green-500/20 text-green-300" },
  { name: "TypeScript", color: "bg-cyan-500/20 text-cyan-300" },
  { name: "GraphQL", color: "bg-pink-500/20 text-pink-300" },
  { name: "Docker", color: "bg-indigo-500/20 text-indigo-300" },
];

export default function IDCard() {
  const [isFlipped, setIsFlipped] = useState(false);

  const handleClick = () => setIsFlipped((f) => !f);

  return (
    <div
      className="w-full h-full perspective-1000 cursor-pointer hidcard"
      onClick={handleClick}
    >
      <motion.div
        className="relative w-full h-full"
        style={{ transformStyle: "preserve-3d" }}
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.7, ease: [0.4, 0.2, 0.2, 1] }}
      >
        {/* Front Side */}
        <motion.div
          className="absolute inset-0 w-full h-full"
          style={{
            backfaceVisibility: "hidden",
            WebkitBackfaceVisibility: "hidden",
          }}
        >
          <HomeBox
            outerClassName="w-full h-full"
            color="rgba(39, 39, 42, 0.8)"
            className="flex flex-col justify-between p-6"
          >
            <div className="flex justify-between items-start w-full h-full">
              <div>
                <h2 className="flex items-center gap-2 mb-1 font-mono text-white text-3xl tracking-wide">
                  <span className="text-violet-400 animate-pulse">▍</span>
                  Sahil Mengji
                </h2>
                <p className="font-medium text-violet-400 text-sm">
                  Full Stack Developer
                </p>
                <span className="inline-block bg-violet-700/30 mt-2 px-2 py-1 rounded font-mono text-violet-300 text-xs">
                  {"//"} Code. Create. Inspire.
                </span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <div className="flex justify-center items-center bg-gradient-to-br from-violet-500 to-purple-600 shadow-lg rounded-full w-10 h-10">
                  <span className="font-bold text-white text-lg">{"</>"}</span>
                </div>
                <span className="font-mono text-gray-400 text-xs">
                  #devlife
                </span>
              </div>
            </div>

            <div className="space-y-2 mt-2">
              <div className="flex items-center space-x-2 font-mono text-gray-300 text-sm">
                <span className="text-violet-400">@</span>
                <span>sahil.mengji@email.com</span>
              </div>
              <div className="flex items-center space-x-2 font-mono text-gray-300 text-sm">
                <span className="text-violet-400">🌐</span>
                <span>github.com/sahil-mengji</span>
              </div>
              <div className="flex items-center space-x-2 font-mono text-gray-300 text-sm">
                <span className="text-violet-400">📱</span>
                <span>+91 98765 43210</span>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 mt-2">
              {skills.map((s) => (
                <span
                  key={s.name}
                  className={`px-2 py-1 rounded text-xs font-mono ${s.color} shadow`}
                >
                  {s.name}
                </span>
              ))}
            </div>
          </HomeBox>
        </motion.div>

        {/* Back Side */}
        <motion.div
          className="absolute inset-0"
          style={{
            backfaceVisibility: "hidden",
            WebkitBackfaceVisibility: "hidden",
            transform: "rotateY(180deg)",
          }}
        >
          <HomeBox
            outerClassName="w-full h-full"
            color="rgba(39, 39, 42, 0.8)"
            className="flex flex-col justify-center items-center p-6"
          >
            <div className="mb-4 text-center">
              <h3 className="mb-2 font-mono font-semibold text-white text-lg tracking-wide">
                Scan to Connect
              </h3>
              <p className="font-mono text-gray-400 text-sm">
                Portfolio & Contact Info
              </p>
            </div>

            {/* QR Code Placeholder */}
            <div className="flex justify-center items-center bg-white shadow-lg mb-4 border-2 border-violet-400 rounded-lg w-32 h-32">
              <div className="gap-[1px] grid grid-cols-8 bg-black p-1 rounded w-28 h-28">
                {Array.from({ length: 64 }).map((_, i) => (
                  <div
                    key={i}
                    className={`${
                      Math.random() > 0.5 ? "bg-white" : "bg-black"
                    } rounded-[1px]`}
                  />
                ))}
              </div>
            </div>

            <div className="text-center">
              <p className="font-mono font-medium text-violet-400 text-sm">
                sahil.dev
              </p>
              <p className="mt-1 font-mono text-gray-500 text-xs">
                Crafting digital experiences
              </p>
              <div className="flex justify-center gap-2 mt-2">
                <span className="text-violet-400 text-lg animate-bounce">
                  ⚡
                </span>
                <span className="text-violet-400 text-lg animate-pulse">
                  💻
                </span>
                <span className="text-violet-400 text-lg animate-spin">🚀</span>
              </div>
            </div>
          </HomeBox>
        </motion.div>
      </motion.div>
    </div>
  );
}
