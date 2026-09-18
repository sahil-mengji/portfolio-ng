import React, { useState, useEffect } from "react";
import axios from "axios";
import * as cheerio from "cheerio";

const FetchLinkData = ({
  url = "https://www.whatsapp.com/",
  sheetOpen,
  alt = "Title",
}) => {
  const [faviconUrl, setFaviconUrl] = useState("");
  const [metaTags, setMetaTags] = useState({ description: "" });
  const [title, setTitle] = useState("");
  const [error, setError] = useState("");

  const handleFetchData = async () => {
    if (!url) {
      setError("Please provide a valid URL");
      return;
    }

    setError("");
    try {
      const proxyUrl = "https://api.allorigins.win/get?url=";
      const response = await axios.get(`${proxyUrl}${encodeURIComponent(url)}`);
      const html = response.data.contents;
      const $ = cheerio.load(html);

      const pageTitle = $("title").text();
      setTitle(pageTitle);

      const link = $('link[rel="icon"], link[rel="shortcut icon"]').attr(
        "href"
      );
      const favicon = link
        ? new URL(link, url).href
        : new URL("/favicon.ico", url).href;
      setFaviconUrl(favicon);

      const meta = {};
      $("meta").each((i, el) => {
        const name = $(el).attr("name");
        const content = $(el).attr("content");
        if (name && content) {
          meta[name] = content;
        }
      });
      setMetaTags(meta);
    } catch (error) {
      console.error("Error fetching data:", error);
      setError(
        error.response
          ? `Error: ${error.response.status} - ${error.response.statusText}`
          : "Error fetching data. Please check the URL and try again."
      );
    }
  };

  useEffect(() => {
    handleFetchData();
  }, [url]); // Remove setSheetOpen from dependencies if it's not used in the effect

  return (
    <a
      href={url}
      className="group bg-[#2b2b2c] hover:bg-[#3a3a3b] p-1 rounded-2xl hover:scale-[1.05] transition-[transform duration-200 cursor-pointer fetchDataLink ,background-color]"
    >
      <div className="transition-transform cursor-pointer">
        <div className="flex items-center gap-3 p-2 rounded-xl">
          <div>
            {faviconUrl ? (
              <img src={faviconUrl} className="mx-2 w-6" alt="Favicon" />
            ) : (
              "🔗"
            )}
          </div>
          <div className="flex justify-between items-center w-full">
            <div>
              <h2 className="font-medium text-white text-sm">{title || alt}</h2>
              <h2 className="font-thin text-[#d6d6dc] text-sm">{url}</h2>
            </div>
            <div className="flex items-center gap-2 bg-[#ffffff25] group-hover:bg-[#c0c0c025] px-3 py-2 rounded-full text-white">
              <ion-icon name="arrow-forward-outline"></ion-icon>
            </div>
          </div>
        </div>
        {/* {metaTags.description && (
					<p className="mt-2 px-2 pb-1 text-[#a2a2a2] text-sm">
						{metaTags.description}
					</p>
				)} */}
      </div>
    </a>
  );
};

export default FetchLinkData;
