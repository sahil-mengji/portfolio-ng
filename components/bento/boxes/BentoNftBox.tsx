"use client"
import { HomeBox } from "@/components/bento/HomeBox"

// NFT cell: p2 NFTCard backdrop (violet wash + grid + NFT tag).

export function BentoNftBox() {
  return (
    <HomeBox
      boxKey="nft"
      outerClassName="bento-nft relative z-10 h-full w-full"
      className="h-full w-full"
      allowOverflow
    >
      <div className="relative h-full w-full overflow-hidden rounded-3xl bg-[linear-gradient(0deg,rgba(167,139,250,0.15)_0%,transparent_100%)]">
        {/* Grid background */}
        <div className="absolute inset-0 opacity-5" aria-hidden="true">
          <div className="grid h-full w-full grid-cols-8 grid-rows-8">
            {Array.from({ length: 64 }).map((_, i) => (
              <div key={i} className="border border-cyan-400/20" />
            ))}
          </div>
        </div>

        {/* NFT tag */}
        {/* <p className="pointer-events-none absolute top-3 right-3 font-mono text-xs tracking-widest text-cyan-400/60">
          NFT
        </p> */}

      </div>
    </HomeBox>
  )
}
export default BentoNftBox
