import { useRef, useState, useEffect } from "react";

const HomeBox = ({
  outerClassName = "",
  children,
  color = "rgba(255, 255, 255, 0.1)",
  size = 300,
  className = "",
}) => {
  const spotlightCardRef = useRef(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (event) => {
      if (spotlightCardRef.current) {
        const rect = spotlightCardRef.current.getBoundingClientRect();
        setMousePosition({
          x: event.clientX - rect.left,
          y: event.clientY - rect.top,
        });
      }
    };

    const element = spotlightCardRef.current;
    if (element) {
      element.addEventListener("mousemove", handleMouseMove);
      return () => {
        element.removeEventListener("mousemove", handleMouseMove);
      };
    }
  }, []);

  const spotlightStyle = {
    "--x": `${mousePosition.x}px`,
    "--y": `${mousePosition.y}px`,
    "--spotlight-color-stops": `${color}, transparent`,
    "--spotlight-size": `${size}px`,
  };

  useEffect(() => {
    const style = document.createElement("style");
    style.textContent = `
      .spotlight-card:before {
        opacity: 0;
        transition: opacity 0.3s;
        background-image: radial-gradient(
          var(--spotlight-size) circle at var(--x) var(--y),
          var(--spotlight-color-stops)
        );
      }
      .spotlight-card:hover:before {
        opacity: 1;
        transition: opacity 0.3s;
      }
    `;
    document.head.appendChild(style);
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  const borders = [
    {
      position: "top-[-4px] left-[-4px]",
      border: "border-t-[4px] border-l-[4px]",
      radius: "rounded-tl-[28px]",
    },
    {
      position: "top-[-4px] right-[-4px]",
      border: "border-t-[4px] border-r-[4px]",
      radius: "rounded-tr-[28px]",
    },
    {
      position: "bottom-[-4px] left-[-4px]",
      border: "border-b-[4px] border-l-[4px]",
      radius: "rounded-bl-[28px]",
    },
    {
      position: "right-[-4px] bottom-[-4px]",
      border: "border-r-[4px] border-b-[4px]",
      radius: "rounded-br-[28px]",
    },
  ];

  return (
    <div
      className={`relative group p-[2px] rounded-[26px] bg-gradient-to-br from-[#30302f]  to-[#101010] hover:scale-[1.02] transition-all shadow-sm dark:shadow-md ${outerClassName}`}
    >
      <div
        className="relative bg-[#18181b] shadow-neutral-50/50 dark:shadow-neutral-950/50 rounded-[24px] w-full h-full cursor-pointer"
        ref={spotlightCardRef}
      >
        <div
          style={{ transform: "translateZ(5px)" }}
          className="hidden group-hover:block absolute inset-0 border border-white/20 rounded-[30px] pointer-events-none"
        >
          {borders.map((corner, index) => (
            <div
              key={index}
              className={`${corner.position} absolute 
                ${corner.border} ${corner.radius}
                w-8 h-8 border-violet-400`}
            />
          ))}
        </div>

        <div
          style={spotlightStyle}
          className="before:top-0 before:left-0 before:absolute relative bg-neutral-950/[.012] dark:bg-white/5 rounded-[24px] w-full before:w-full h-full before:h-full overflow-hidden before:content-[''] transform-gpu spotlight-card"
        >
          <div
            className={`w-full h-full bg-gradient-to-b from-[#181818] to-[#101010] ${className}`}
          >
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomeBox;
