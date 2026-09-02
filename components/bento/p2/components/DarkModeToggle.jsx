import { useEffect, useState } from "react";

export default function DarkModeToggle() {
  const [darkMode, setDarkMode] = useState(
    () => localStorage.getItem("theme") === "dark"
  );

  useEffect(() => {
    const root = window.document.documentElement;
    // if (darkMode) {
    //   root.classList.add("dark");
    //   localStorage.setItem("theme", "dark");
    // } else {
    //   root.classList.remove("dark");
    //   localStorage.setItem("theme", "light");
    // }

    root.classList.add("dark");
  }, [darkMode]);

  return (
    <button
      onClick={() => setDarkMode(!darkMode)}
      className="bg-gray-200 dark:bg-gray-800 p-2 rounded text-black dark:text-white"
    >
      {darkMode ? "🌙 Dark" : "☀️ Light"}
    </button>
  );
}
