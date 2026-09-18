import React, { useRef } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import {
  Code,
  Terminal,
  Cpu,
  Database,
  GitBranch,
  Zap,
  Bug,
  Settings,
} from "lucide-react";
import HomeBox from "./Homebox";

export default function NFTCard() {
  const ref = useRef(null);

  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const mouseXSpring = useSpring(x);
  const mouseYSpring = useSpring(y);

  const rotateX = useTransform(mouseYSpring, [0.5, -0.5], ["-45deg", "45deg"]);
  const rotateY = useTransform(mouseXSpring, [0.5, -0.5], ["45deg", "-45deg"]);

  const layer1X = useTransform(mouseXSpring, [-0.5, 0.5], [-10, 10]);
  const layer1Y = useTransform(mouseYSpring, [-0.5, 0.5], [-10, 10]);
  const layer2X = useTransform(mouseXSpring, [-0.5, 0.5], [-20, 20]);
  const layer2Y = useTransform(mouseYSpring, [-0.5, 0.5], [-20, 20]);
  const layer3X = useTransform(mouseXSpring, [-0.5, 0.5], [15, -15]);
  const layer3Y = useTransform(mouseYSpring, [-0.5, 0.5], [15, -15]);
  const layer4X = useTransform(mouseXSpring, [-0.5, 0.5], [-5, 5]);
  const layer4Y = useTransform(mouseYSpring, [-0.5, 0.5], [-5, 5]);

  const codingTerms = [
    "JavaScript",
    "React",
    "Node.js",
    "Python",
    "API",
    "JSON",
    "CSS",
    "HTML",
    "Git",
    "Debug",
    "Deploy",
    "Code",
    "Function",
    "Array",
    "Object",
    "Loop",
  ];

  const icons = [
    <Code key="code" className="w-4 h-4 text-cyan-400" />,
    <Terminal key="terminal" className="w-4 h-4 text-cyan-400" />,
    <Cpu key="cpu" className="w-4 h-4 text-cyan-400" />,
    <Database key="database" className="w-4 h-4 text-cyan-400" />,
    <GitBranch key="git" className="w-4 h-4 text-cyan-400" />,
    <Zap key="zap" className="w-4 h-4 text-cyan-400" />,
    <Bug key="bug" className="w-4 h-4 text-cyan-400" />,
    <Settings key="settings" className="w-4 h-4 text-cyan-400" />,
  ];

  const generateRandomPosition = (layer) => {
    const positions = {
      layer1: [
        { top: "15%", left: "20%" },
        { top: "25%", left: "75%" },
        { top: "45%", left: "10%" },
        { top: "65%", left: "80%" },
      ],
      layer2: [
        { top: "30%", left: "15%" },
        { top: "50%", left: "85%" },
        { top: "70%", left: "25%" },
        { top: "20%", left: "60%" },
      ],
      layer3: [
        { top: "40%", left: "70%" },
        { top: "60%", left: "15%" },
        { top: "80%", left: "65%" },
        { top: "10%", left: "40%" },
      ],
    };
    return positions[layer] || [];
  };

  const handleMouseMove = (event) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const xPct = (event.clientX - rect.left) / rect.width - 0.5;
    const yPct = (event.clientY - rect.top) / rect.height - 0.5;
    x.set(xPct);
    y.set(yPct);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
      className="hnft"
      whileHover={{ scale: 1.05 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
    >
      <HomeBox className="" outerClassName="w-full h-full hnft">
        <div className="relative flex justify-center items-center bg-[linear-gradient(0deg,_rgba(167,139,250,0.15)_0%,_transparent_100%)] rounded-3xl w-full h-full overflow-hidden cursor-pointer">
          {/* Grid Background */}
          <div className="absolute inset-0 opacity-5">
            <div className="grid grid-cols-8 grid-rows-8 w-full h-full">
              {Array.from({ length: 64 }).map((_, i) => (
                <div key={i} className="border border-cyan-400/20"></div>
              ))}
            </div>
          </div>

          {/* Layer 1 */}
          <motion.div
            style={{ x: layer1X, y: layer1Y, transform: "translateZ(10px)" }}
            className="absolute inset-0"
          >
            {codingTerms.slice(0, 4).map((term, index) => {
              const pos = generateRandomPosition("layer1")[index];
              return (
                <motion.p
                  key={index}
                  className="absolute opacity-20 font-mono text-cyan-400 pointer-events-none select-none"
                  style={{
                    top: pos?.top,
                    left: pos?.left,
                    transform: `rotate(${Math.random() * 60 - 30}deg)`,
                    fontSize: `${Math.random() * 8 + 18}px`,
                  }}
                  whileHover={{ opacity: 0.4, scale: 1.3 }}
                >
                  {term}
                </motion.p>
              );
            })}
          </motion.div>

          {/* Layer 2 */}
          <motion.div
            style={{ x: layer2X, y: layer2Y, transform: "translateZ(20px)" }}
            className="absolute inset-0"
          >
            {icons.slice(0, 4).map((icon, index) => {
              const pos = generateRandomPosition("layer2")[index];
              return (
                <motion.div
                  key={index}
                  className="absolute opacity-15 pointer-events-none"
                  style={{
                    top: pos?.top,
                    left: pos?.left,
                    transform: `rotate(${Math.random() * 360}deg)`,
                  }}
                  whileHover={{ opacity: 0.5, scale: 1.4 }}
                >
                  {icon}
                </motion.div>
              );
            })}
            {codingTerms.slice(4, 8).map((term, index) => {
              const pos = generateRandomPosition("layer2")[index];
              return (
                <motion.p
                  key={index}
                  className="absolute opacity-25 font-mono text-violet-400 pointer-events-none select-none"
                  style={{
                    top: pos?.top,
                    left: pos?.left,
                    transform: `rotate(${Math.random() * 60 - 30}deg)`,
                    fontSize: `${Math.random() * 8 + 18}px`,
                  }}
                  whileHover={{ opacity: 0.5, scale: 1.3 }}
                >
                  {term}
                </motion.p>
              );
            })}
          </motion.div>

          {/* Layer 3 */}
          <motion.div
            style={{ x: layer3X, y: layer3Y, transform: "translateZ(30px)" }}
            className="absolute inset-0"
          >
            {["</>", "console.log()", "npm install", "git commit"].map(
              (text, i) => (
                <motion.p
                  key={i}
                  className="absolute font-mono text-violet-400/60 pointer-events-none"
                  style={{
                    fontSize: "1.4rem",
                    ...[
                      { top: "1rem", left: "1rem" },
                      { top: "1.5rem", right: "2rem" },
                      { bottom: "2rem", left: "1.5rem" },
                      { bottom: "1rem", right: "1rem" },
                    ][i],
                  }}
                  whileHover={{ scale: 1.3, opacity: 0.8 }}
                >
                  {text}
                </motion.p>
              )
            )}
          </motion.div>

          {/* Layer 4 */}
          <motion.div
            style={{ x: layer4X, y: layer4Y, transform: "translateZ(15px)" }}
            className="absolute inset-0"
          >
            {["{ }", "[ ]"].map((text, i) => (
              <motion.p
                key={i}
                className="absolute font-mono text-cyan-400/20 text-lg -translate-x-1/2 pointer-events-none"
                style={{
                  fontSize: "1.6rem",
                  top: i === 0 ? "0.5rem" : undefined,
                  bottom: i === 1 ? "0.5rem" : undefined,
                  left: "50%",
                }}
                whileHover={{ scale: 1.2 }}
              >
                {text}
              </motion.p>
            ))}
          </motion.div>

          {/* Center Name */}
          <motion.div
            style={{ transform: "translateZ(50px)" }}
            className="z-10 relative"
            whileHover={{ scale: 1.05 }}
          >
            <motion.div
              className="bg-violet-400/10 backdrop-blur-sm px-6 py-3 border border-cyan-400/30 rounded-lg"
              whileHover={{
                backgroundColor: "rgba(167, 139, 250, 0.2)",
                borderColor: "rgba(103, 232, 249, 0.5)",
              }}
            >
              <motion.p
                className="drop-shadow-lg font-bold text-cyan-400 text-5xl text-center tracking-wider amsterdam"
                whileHover={{ textShadow: "0 0 20px rgba(103, 232, 249, 0.5)" }}
              >
                Sahil
              </motion.p>

              {[
                "-top-1 -left-1",
                "-top-1 -right-1",
                "-bottom-1 -left-1",
                "-right-1 -bottom-1",
              ].map((pos, index) => (
                <motion.div
                  key={index}
                  className={`${pos} absolute bg-cyan-400 opacity-60 rounded-full w-2 h-2`}
                  whileHover={{ scale: 1.5, opacity: 1 }}
                />
              ))}
            </motion.div>
          </motion.div>

          {/* NFT Label */}
          <motion.p
            className="top-3 right-3 absolute font-mono text-cyan-400/60 text-xs tracking-widest pointer-events-none"
            style={{ transform: "translateZ(25px)" }}
            whileHover={{ opacity: 1 }}
          >
            NFT
          </motion.p>

          {/* Corners */}
          <motion.div
            style={{ transform: "translateZ(5px)" }}
            className="absolute inset-0 pointer-events-none"
          >
            {[
              {
                position: "top-0 left-0",
                border: "border-t-2 border-l-2",
                radius: "rounded-tl-3xl",
              },
              {
                position: "top-0 right-0",
                border: "border-t-2 border-r-2",
                radius: "rounded-tr-3xl",
              },
              {
                position: "bottom-0 left-0",
                border: "border-b-2 border-l-2",
                radius: "rounded-bl-3xl",
              },
              {
                position: "right-0 bottom-0",
                border: "border-r-2 border-b-2",
                radius: "rounded-br-3xl",
              },
            ].map((corner, i) => (
              <motion.div
                key={i}
                className={`${corner.position} absolute border-cyan-400/40 ${corner.border} ${corner.radius} w-8 h-8`}
                whileHover={{ borderColor: "rgba(103, 232, 249, 0.8)" }}
              />
            ))}
          </motion.div>
        </div>
      </HomeBox>
    </motion.div>
  );
}
