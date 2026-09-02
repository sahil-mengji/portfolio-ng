const Grid = ({ size = 20, dotColor = "#ccc", dotted = false }) => {
	return (
		<div
			className="fixed w-full h-full top-0 left-0 pointer-events-none z-[-50]"
			style={{
				backgroundImage: dotted
					? `radial-gradient(${dotColor} 1px, transparent 1px)`
					: `linear-gradient(to right, ${dotColor} 1px, transparent 1px), 
             linear-gradient(to bottom, ${dotColor} 1px, transparent 1px)`,
				backgroundSize: `${size}px ${size}px`,
				zIndex: 1,
			}}
		/>
	);
};

export default Grid;
