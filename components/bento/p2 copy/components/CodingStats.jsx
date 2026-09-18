import React, { useState, useEffect } from "react";
import axios from "axios";
import { Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  Title,
  CategoryScale,
  LinearScale,
} from "chart.js";

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  Title,
  CategoryScale,
  LinearScale
);

const CodingStats = ({ leetcodeHandle, codeforcesHandle }) => {
  const [leetcodeStats, setLeetcodeStats] = useState(null);
  const [codeforcesStats, setCodeforcesStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchLeetcodeStats = async () => {
      try {
        const response = await axios.get(
          `https://leetcode-stats-api.herokuapp.com/${leetcodeHandle}`
        );
        setLeetcodeStats(response.data);
      } catch (error) {
        setError(error);
      }
    };

    const fetchCodeforcesStats = async () => {
      try {
        const response = await axios.get(
          `https://codeforces.com/api/user.info?handles=${codeforcesHandle}`
        );
        setCodeforcesStats(response.data.result[0]);
      } catch (error) {
        setError(error);
      }
    };

    const fetchData = async () => {
      await fetchLeetcodeStats();
      await fetchCodeforcesStats();
      setLoading(false);
    };

    fetchData();
  }, [leetcodeHandle, codeforcesHandle]);

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center min-h-[400px] text-white">
        <div className="relative">
          <svg
            className="w-32 h-32 animate-spin duration-[4s]"
            viewBox="0 0 106.73 108.89"
            xmlns="http://www.w3.org/2000/svg"
          >
            <g>
              <path
                className="fill-violet-400/30"
                d="M4.48,47.62l13.79-23.89h36.06l22.76,39.43,4.73-8.19L59.07,15.54H16.74c-1.98,0-3.8,1.05-4.79,2.76L1.35,36.66c-.99,1.71-.99,3.82,0,5.53l3.13,5.43Z"
              />
              <path
                className="fill-violet-400/30"
                d="M86.23,47.62l4.73-8.19L69.8,2.77C68.81,1.05,66.98,0,65.01,0h-21.2c-1.98,0-3.8,1.05-4.79,2.76l-3.13,5.43h27.58s22.76,39.43,22.76,39.43Z"
              />
              <path
                className="fill-violet-400/30"
                d="M26.63,69.47l22.76-39.43h-9.46s-22.76,39.43-22.76,39.43l21.17,36.66c.99,1.71,2.81,2.76,4.79,2.76h21.2c1.98,0,3.8-1.05,4.79-2.76l3.13-5.43h-27.58s-18.03-31.23-18.03-31.23Z"
              />
              <path
                className="fill-violet-400/30"
                d="M31.37,29.9h-9.46S.74,66.56.74,66.56c-.99,1.71-.99,3.82,0,5.53l10.6,18.36c.99,1.71,2.81,2.76,4.79,2.76h6.27s-13.79-23.89-13.79-23.89L31.37,29.9Z"
              />
              <path
                className="fill-violet-400/30"
                d="M80.09,70.6h-45.52s4.73,8.19,4.73,8.19h45.52s21.17-36.66,21.17-36.66c.99-1.71.99-3.82,0-5.53l-10.6-18.36c-.99-1.71-2.81-2.76-4.79-2.76h-6.27s13.79,23.89,13.79,23.89l-18.03,31.23Z"
              />
              <path
                className="fill-violet-400/30"
                d="M102.77,62.39l-13.79,23.89h-45.52l4.73,8.19h42.33c1.98,0,3.8-1.05,4.79-2.76l10.6-18.36c.99-1.71.99-3.82,0-5.53l-3.13-5.43Z"
              />
            </g>
          </svg>
        </div>
        <p className="mt-4 font-medium text-lg">Loading coding stats...</p>
        {/* <p className="opacity-70 mt-2 text-sm">
          Fetching LeetCode & Codeforces data
        </p> */}
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col justify-center items-center rounded-lg min-h-[400px] text-white">
        <div className="flex justify-center items-center bg-red-500/20 mb-4 rounded-full w-20 h-20 scale-">
          <svg
            className="w-12 h-12 text-red-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        <h3 className="mb-2 font-semibold text-red-400 text-xl">
          Failed to load stats
        </h3>
        <p className="opacity-70 mb-4 text-sm text-center">
          {error.message || "Unable to fetch coding statistics"}
        </p>
        <button
          onClick={() => window.location.reload()}
          className="bg-red-500/10 hover:bg-red-600 px-4 py-2 rounded-lg transition-colors duration-200"
        >
          Try Again
        </button>
      </div>
    );
  }

  let totalSolved =
    leetcodeStats?.easySolved +
    leetcodeStats?.mediumSolved +
    leetcodeStats?.hardSolved;

  const data = {
    labels: ["Easy", "Medium", "Hard"],
    datasets: [
      {
        label: "LeetCode",
        data: [
          leetcodeStats?.easySolved || 0,
          leetcodeStats?.mediumSolved || 0,
          leetcodeStats?.hardSolved || 0,
        ],
        backgroundColor: [
          "#22c55e", // Green
          "#eab308", // Yellow
          "#ef4444", // Red
        ],
        borderColor: [
          "rgba(0,255,0,1)", // Green
          "rgba(255,255,0,1)", // Yellow
          "rgba(255,0,0,1)", // Red
        ],
        borderWidth: 1,
      },
    ],
  };

  const options = {
    radius: 90,
    circumference: 180, // Half circle
    rotation: -90, // Start at the top
    cutout: "50%", // Adjust for the speedometer look
    plugins: {
      legend: {
        display: false, // Hide the legend
      },
      tooltip: {
        callbacks: {
          label: (tooltipItem) => `${tooltipItem.label}: ${tooltipItem.raw}`,
        },
      },
    },
  };

  return (
    <div className="relative">
      <div className="flex justify-evenly items-center w-full">
        <img
          className="w-[50px]"
          src="https://cdn.iconscout.com/icon/free/png-256/free-code-forces-3521352-2944796.png?f=webp&w=256"
          alt=""
        />
        <div className="p-4 text-white">
          <p className="flex items-center gap-2">
            Rating - {codeforcesStats.rating}
          </p>
          <p className="flex items-center gap-2">
            Rating - {codeforcesStats.rating}
          </p>
          <p className="flex items-center gap-2">
            <p>Rank - {codeforcesStats.rank}</p>
          </p>
        </div>
      </div>

      <hr className="opacity-30 mx-4" />
      <div className="bottom-[-210px] absolute w-full">
        <div className="relative w-full overflow-hidden">
          <Doughnut data={data} options={options} />

          <p className="top-[50px] left-0 absolute flex flex-col justify-center items-center w-full h-full text-white text-center">
            <p className="mb-4 font-bold text-2xl">{totalSolved}</p>
            <p className="opacity-65">Questions Solved</p>
          </p>
        </div>
      </div>
      <div className="flex justify-evenly items-center w-full">
        <img
          className="w-[50px]"
          src="https://upload.wikimedia.org/wikipedia/commons/8/8e/LeetCode_Logo_1.png"
          alt=""
        />
        <div className="p-4 text-white">
          <p className="flex items-center gap-2">
            <div className="bg-green-500 rounded-full w-[16px] h-[16px]"></div>
            Easy - {leetcodeStats.easySolved}
          </p>
          <p className="flex items-center gap-2">
            <div className="bg-yellow-500 rounded-full w-[16px] h-[16px]"></div>
            Medium - {leetcodeStats.mediumSolved}
          </p>
          <p className="flex items-center gap-2">
            <div className="bg-red-500 rounded-full w-[16px] h-[16px]"></div>
            Hard - {leetcodeStats.hardSolved}
          </p>
        </div>
      </div>
    </div>
  );
};

export default CodingStats;
