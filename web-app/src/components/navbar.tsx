import React from "react";
import logo from "../images/logowithname.png";

const Navbar: React.FC = () => {
  return (
    <nav className="relative bg-blue-600 p-5 flex justify-end items-center text-white">
      <a href="/">
        <img
          src={logo}
          alt="Logo"
          className="absolute left-2 top-1/2 transform -translate-y-1/2 h-32 w-auto object-contain"
        />
      </a>
      <div className="space-x-4">
        <a
          href="/"
          className="px-2 py-1 hover:bg-blue-500 rounded transition-colors duration-200"
        >
          Import data
        </a>
        <a
          href="sessions"
          className="px-2 py-1 hover:bg-blue-500 rounded transition-colors duration-200"
        >
          My Sessions
        </a>
        <a
          href="algorithms"
          className="px-2 py-1 hover:bg-blue-500 rounded transition-colors duration-200"
        >
          My Algorithms
        </a>
        <a
          href="results"
          className="px-2 py-1 hover:bg-blue-500 rounded transition-colors duration-200"
        >
          All Results
        </a>
      </div>
    </nav>
  );
};

export default Navbar;
