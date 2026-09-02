import React from "react";
import HomeBox from "./Homebox";
import Home from "../Home";
import { Atom } from "lucide-react";

const imageUrls = [
  "/projects/polkaflow/1.png",
  "/projects/ecell/1.png",
  "/projects/soundsynk/1.png",
  "/projects/postgrad/1.png",
  "/projects/esic/1.png",
];

export default function ProjectsFolder() {
  console.log(imageUrls.length);
  return (
    <div className="z-40 bg-white/[.012] p-1 border dark:border-white/10 rounded-[40px] w-full h-full hshowcase">
      <div className="group relative hover:shadow-[100px_-80px_400px_200px_#00000090] rounded-[40px] w-full h-full transition-all">
        <div
          style={{
            clipPath:
              "polygon(0% 0%, 35.75% 0%, 44.48% 13.59%, 100% 13.59%, 100% 100%, 0% 100%)",
            borderRadius: "40px",
          }}
          className="absolute inset-0 bg-[#212121] border border-[#202020] w-full h-full"
        ></div>
        <div
          style={{
            overflow: "hidden",
            background: "#21212134",
            backdropFilter: "blur(10px)",
            WebkitBackdropFilter: "blur(10px)",
            border: "0.5px solid",
            borderColor: "rgba(255, 255, 255, 0.1)",
            color: "white",
          }}
          className="top-[60px] z-10 absolute inset-0 bg-[#212121] shadow-[0px_-20px_10px_10px_#00000040] backdrop-blur-lg p-8 rounded-b-[40px] text-4xl group-hover:-skew-x-12 transition-all group-hover:translate-x-5 duration-500"
        >
          <p className="cristik">Projects</p>
          <p className="font-medium text-violet-00 text-sm sm:text-base md:text-lg leading-6">
            View all Projects →
          </p>
          <Atom className="-right-2 -bottom-2 absolute w-20 h-20 text-violet-500/70" />
        </div>
        <div className="top-[18px] left-[10px] absolute w-[70%] h-full transition-all group-hover:-translate-y-5 group-hover:translate-x-5">
          <RecursiveShowcase keyI={imageUrls.length - 1} data={imageUrls} />
        </div>
      </div>
    </div>
  );
}

function RecursiveShowcase({ keyI, data }) {
  console.log("key", keyI);
  return (
    <div className="top-0 left-0 absolute w-full group-hover:rotate-[40deg] transition-all translate-x-[10px] translate-y-[5px] group-hover:-translate-y-[100px] duration-500 delay-100">
      <img
        src={data[keyI]}
        className="shadow-[0px_10px_10px_10px_#00000040] border-2 border-white/30 rounded-2xl w-full h-[190px] hover:scale-[115%] transition-all hover:-translate-x-[50px] duration-300"
      />
      {/* <div className="top-[100px] right-[150px] absolute bg-white opacity-0 peer-hover:opacity-100 rounded-2xl w-full h-[30px] text-black rotate-[90deg] transition-all">
        Text
      </div> */}
      <div className="top-0 left-0 absolute bg-gradient-to-b from-transparent to-[#00000049] rounded-2xl w-full h-full pointer-events-none"></div>

      {keyI > 0 && <RecursiveShowcase keyI={keyI - 1} data={data} />}
    </div>
  );
}
