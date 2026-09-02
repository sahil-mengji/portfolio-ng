// SocialMedia.jsx
import React from "react";
import { Linkedin, Github, Instagram, Dribbble } from "lucide-react";
import HomeBox from "./Homebox";

const SocialMediaLink = ({ href, icon: Icon, label }) => {
  return (
    <div
      className="flex flex-1 justify-center items-center bg-[#212121] md:w-1/4"
      onClick={() => window.open(href, "_blank")}
    >
      <div className="flex justify-center items-center gap-2 text-white">
        <Icon size={20} />
        {label}
      </div>
    </div>
  );
};

const SocialMedia = () => {
  const socialLinks = [
    {
      href: "https://www.linkedin.com/in/sahil-mengji",
      icon: Linkedin,
      label: "Linked In",
    },
    {
      href: "https://www.github.com/sahil-mengji",
      icon: Github,
      label: "Github",
    },
    {
      href: "https://www.instagram.com/sahil_mengji",
      icon: Instagram,
      label: "Instagram",
    },
    {
      href: "https://www.linkedin.com/in/sahil-mengji", // Note: This seems to be duplicated in original
      icon: Dribbble,
      label: "Dribble",
    },
  ];

  return (
    <div className="md:flex lg:flex flex-wrap gap-4 md:gap-4 grid grid-cols-2 grid-rows-2 text-white home-social-media">
      {socialLinks.map((link, index) => (
        <SocialMediaLink
          key={index}
          href={link.href}
          icon={link.icon}
          label={link.label}
        />
      ))}
    </div>
  );
};

export default SocialMedia;
