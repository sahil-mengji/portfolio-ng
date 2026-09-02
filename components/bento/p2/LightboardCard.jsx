// Example usage of the Dock component with animated cards and dividers
import React from "react";

import HomeBox from "./Homebox";
import { LightBoard } from "@/components/ui/lightboard";

const LightBoardCard = () => {
  return (
    <HomeBox className="p-4 -pb-4 w-full" outerClassName="hlightboard">
      <LightBoard
        lightSize={5}
        gap={2}
        text="H.e.l . l . o  ...  W . o . r . l . d ..."
        font="default"
        rows={16}
        updateInterval={400}
        colors={{
          background: "#2a1a40",
          textDim: "#a78bfa",
          drawLine: "#3b2a6d",
          textBright: "#2a1a40",
        }}
      />
    </HomeBox>
  );
};

export default LightBoardCard;
