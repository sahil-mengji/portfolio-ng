import React, { useState } from "react";
import "../App.css";
import FetchLinkData from "./FetchLinkData";
import ZoomImg from "./ZoomImg";
export default function PortfolioSheet({ sheetOpen, setSheetOpen, sheetData }) {
	return (
		// <div
		// 	className={` fixed top-0 left-0  w-full h-full z-[20] duration-[400ms] ${
		// 		sheetOpen
		// 			? "bg-[#0000007c]  cursor-pointer"
		// 			: "bg-[#00000000] pointer-events-none"
		// 	}`}
		// >
		<>
			<div className="w-full h-full" onClick={() => setSheetOpen(false)}></div>
			<div
				className={`portfolioSheet absolute right-0 top-0   h-screen max-w-[800px] duration-[400ms] ease-in transition-[width] overflow-y-auto ${
					sheetOpen ? "w-full" : "w-0"
				}`}
			>
				<header className=" m-[30px]">
					<h2 className=" spacegrotesk h2 font-bold mb-[20px] flex justify-between ">
						{sheetData.title}
						<button
							className="modal-close-btn cursor-pointer hover:scale-[1.1] duration-200 transition-transform "
							style={{ position: "relative" }}
							data-modal-close-btn
							onClick={() => setSheetOpen(false)}
						>
							<div className="absolute top-0 left-0 w-full h-full cursor-pointer z-3 bg-[#00000000]"></div>
							<ion-icon
								className="cursor-pointer"
								name="close-outline"
							></ion-icon>
						</button>
					</h2>

					<section className="about-text  ">
						<p className="">{sheetData.description}</p>
					</section>
					<div className="flex flex-wrap gap-3 ">
						{sheetData?.tools?.map((item) => (
							<p className="technologiesTag">{item}</p>
						))}
					</div>
				</header>
				<section className="">
					<ul className="sheet-list has-scrollbar space-x-4">
						{sheetData.img?.map((item) => (
							<div className="sheet-item">
								<ZoomImg src={item} className="sheet-item" alt="client logo" />
							</div>
						))}
					</ul>
				</section>

				<div className="m-[30px] space-y-3">
					{sheetData?.links && (
						<h1 className="text-white font-semibold text-lg">
							🔗 External Links{" "}
						</h1>
					)}
					{sheetData?.links?.map((item) => (
						<FetchLinkData alt="Netflix" sheetOpen={sheetOpen} url={item} />
					))}
				</div>
			</div>
			{/* </div> */}
		</>
	);
}
