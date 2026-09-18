import React from "react";
import CodingStats from "./components/CodingStats";
import HomeBox from "./Homebox";

export default function Library() {
  return (
    <HomeBox
      className="hlibrary homebox overflow-hidden"
      outerClassName="hlibrary"
    >
      <p className="cristik text-white text-4xl  p-6">
        DSA
        <p className="opacity-60 text-xl">Tracker</p>
      </p>
      <CodingStats leetcodeHandle="sahil_mengji" />
    </HomeBox>
  );
}
