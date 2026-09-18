import React, { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

export default function SimpleMarque({
  content,
  direction = "left",
  rate = 0.35,
  className = "",
}) {
  const containerRef = useRef(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });

  // Transform scroll progress to translation values with rate factor
  const translateX = useTransform(
    scrollYProgress,
    [0, 1],
    direction === "left" ? ["0%", `${-100 * rate}%`] : [`${-100 * rate}%`, "0%"]
  );

  return (
    <div
      ref={containerRef}
      className={`overflow-hidden whitespace-nowrap ${className}`}
    >
      <motion.div className="flex" style={{ x: translateX }}>
        <span className="inline-block pr-8">{content}</span>
        <span className="inline-block pr-8">{content}</span>
        <span className="inline-block pr-8">{content}</span>
        <span className="inline-block pr-8">{content}</span>
      </motion.div>
    </div>
  );
}
