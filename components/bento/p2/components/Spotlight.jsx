import React, { useState, useEffect } from "react";

const Spotlight = ({ baseColor = "40" }) => {
	const [cursorPos, setCursorPos] = useState({ x: 0, y: 0 });

	const gradient = `radial-gradient(
    50% 50% at 50% 50%,
    hsla(${baseColor}, 100%, 50%, 0.60) 0%,
    hsla(${baseColor}, 100%, 45%, 0.30) 10%,
    hsla(${baseColor}, 100%, 30%, 0.15) 50%,
     hsla(${baseColor}, 100%, 30%, 0.1) 80%,
    hsla(${baseColor}, 100%, 20%, 0) 100%
  )`;

	const fGrad = `radial-gradient(
    50% 50% at 50% 50%,
    hsla(${baseColor}, 100%, 90%, 0.30) 0%,
    hsla(${baseColor}, 100%, 55%, 0.20) 50%,
    hsla(${baseColor}, 100%, 45%, 0.0) 100%
  )`;
	useEffect(() => {
		const handleMouseMove = (e) => {
			setCursorPos({
				x: e.pageX,
				y: e.pageY,
			});
		};

		window.addEventListener("mousemove", handleMouseMove);
		return () => window.removeEventListener("mousemove", handleMouseMove);
	}, []);

	return (
		<>
			<div
				className="top-0 left-0 fixed w-full h-screen flex items-center justify-center pointer-events-none "
				style={{ boxShadow: "inset 0px 80px 100px rgba(0, 0, 0, 1)" }}
			>
				{/* Background Glow */}
				<div
					className="glow absolute w-[160%] h-[140%] top-[-70%] rounded-full  left-[-30%]"
					style={{
						background: gradient,
						filter: "blur(80px)",
					}}
				></div>
				{/* Cursor Spotlight */}
			</div>
			<div
				className="absolute w-[500px] h-[500px] rounded-full pointer-events-none"
				style={{
					background: fGrad,
					filter: "blur(80px)",
					opacity: 0.3,
					transform: `translate(${cursorPos.x - 250}px, ${
						cursorPos.y - 250
					}px)`,
					transition: "transform 1s ease-out",
				}}
			/>
		</>
	);
};

export default Spotlight;
