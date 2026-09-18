import CardSwap, { Card } from "./components/CardSwap";
import HomeBox from "./Homebox";
import React from "react";

export default function ExperimentsCarousel() {
  return (
    <HomeBox className="" outerClassName="hexperiments">
      <div className="group relative p-6 w-full h-[500px]">
        <div className="text-xl sm:text-2xl md:text-4xl cristik">
          Experiments
        </div>
        <p className="font-medium text-violet-400 text-sm sm:text-base md:text-lg leading-6">
          View Complete Online Resume →
        </p>
        <div
          style={{ height: "400px", position: "relative" }}
          className="mt-16"
        >
          <CardSwap
            skewAmount={0}
            cardDistance={100}
            verticalDistance={50}
            delay={5000}
            pauseOnHover={false}
          >
            <Card>
              <div className="bg-gradient-to-br from-[#30302f] to-[#101010] rounded-xl w-full h-full">
                <div className="flex items-center gap-2 bg-[#121212] bg-gradient-to-br from-[#30302f] to-[#101010] p-1 px-3 border-b border-b-[#6a717f] rounded-t-xl">
                  <img
                    src="projects/logos/polkaflow.svg"
                    alt="Polkaflow"
                    className="w-4 h-4"
                  />
                  Polkaflow
                </div>
                <div className="bg-[#080707] p-1">
                  <img
                    className="border-[#6a717f] border-[0.5px] rounded-xl w-full h-full"
                    src="/projects/polkaflow/1.png"
                    alt=""
                  />
                </div>
              </div>
            </Card>
            <Card>
              <div className="bg-gradient-to-br from-[#30302f] to-[#101010] rounded-xl w-full h-full">
                <div className="flex items-center gap-2 bg-[#121212] bg-gradient-to-br from-[#30302f] to-[#101010] p-1 px-3 border-b border-b-[#6a717f] rounded-t-xl">
                  <img
                    src="projects/logos/devdao.svg"
                    alt="DevDao"
                    className="w-4 h-4"
                  />
                  DevDao
                </div>
                <div className="bg-[#121212] p-1">
                  <img
                    className="border-[#6a717f] border-[0.5px] rounded-xl w-full h-full"
                    src="/projects/ecell/1.png"
                    alt=""
                  />
                </div>
              </div>
            </Card>
            <Card>
              <div className="bg-gradient-to-br from-[#30302f] to-[#101010] rounded-xl w-full h-full">
                <div className="flex items-center gap-2 bg-[#121212] bg-gradient-to-br from-[#30302f] to-[#101010] p-1 px-3 border-b border-b-[#6a717f] rounded-t-xl">
                  <img
                    src="projects/logos/aa.png"
                    alt="SoundSynk"
                    className="w-4 h-4"
                  />
                  SoundSynk
                </div>
                <div className="bg-[#121212] p-1">
                  <img
                    className="border-[#6a717f] border-[0.5px] rounded-xl w-full h-full"
                    src="/projects/soundsynk/1.png"
                    alt=""
                  />
                </div>
              </div>
            </Card>
            <Card>
              <div className="bg-gradient-to-br from-[#30302f] to-[#101010] rounded-xl w-full h-full">
                <div className="flex items-center gap-2 bg-[#121212] bg-gradient-to-br from-[#30302f] to-[#101010] p-1 px-3 border-b border-b-[#6a717f] rounded-t-xl">
                  <img
                    src="/projects/logos/pg.svg"
                    alt="Postgrad Pinnacle"
                    className="w-4 h-4"
                  />
                  Postgrad Pinnacle
                </div>
                <div className="bg-[#121212] p-1">
                  <img
                    className="border-[#6a717f] border-[0.5px] rounded-xl w-full h-full"
                    src="/projects/postgrad/1.png"
                    alt=""
                  />
                </div>
              </div>
            </Card>
            <Card>
              <div className="bg-gradient-to-br from-[#30302f] to-[#101010] rounded-xl w-full h-full">
                <div className="flex items-center gap-2 bg-[#121212] bg-gradient-to-br from-[#30302f] to-[#101010] p-1 px-3 border-b border-b-[#6a717f] rounded-t-xl">
                  <img
                    src="projects/logos/ace.png"
                    alt="ESIC"
                    className="w-4 h-4"
                  />
                  ESIC
                </div>
                <div className="bg-[#121212] p-1">
                  <img
                    className="border-[#6a717f] border-[0.5px] rounded-xl w-full h-full"
                    src="/projects/esic/1.png"
                    alt=""
                  />
                </div>
              </div>
            </Card>
          </CardSwap>
        </div>
      </div>
    </HomeBox>
  );
}
