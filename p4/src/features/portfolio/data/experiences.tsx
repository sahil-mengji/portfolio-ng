import {
  CodeXmlIcon,
  DraftingCompassIcon,
  GlobeIcon,
  RocketIcon,
  PaletteIcon,
  UsersIcon,
  BriefcaseIcon,
} from "lucide-react"

import type { Experience } from "../types/experiences"

export const EXPERIENCES: Experience[] = [
  {
    id: "synkerr",
    companyName: "Synkerr",
    companyLogo: "",
    companyWebsite: "https://synkerr.com",
    positions: [
      {
        id: "1",
        title: "Web and UI/UX Lead",
        employmentPeriod: {
          start: "02.2024",
        },
        employmentType: "Full-time",
        icon: <RocketIcon />,
        description:
          "- Spearheaded the creation of Synkerr's visual identity, ensuring a consistent and compelling brand image across all platforms.\n- Designed intuitive and aesthetically pleasing user interfaces that resonate with the target audience.\n- Developed the actual Synkerr application, ensuring it was responsive, scalable, and user-friendly.",
        skills: ["UI/UX Design", "React", "Node.js", "Brand Identity", "Figma"],
        isExpanded: true,
      },
    ],
    isCurrentEmployer: true,
  },
  {
    id: "ecell-nitk",
    companyName: "E-Cell NITK",
    companyLogo: "https://framerusercontent.com/images/Qdi1VfEDR6sdQ5o88h3f9A2soJc.png",
    companyWebsite: "https://ecell.nitk.ac.in",
    positions: [
      {
        id: "technical-head",
        title: "Technical Head",
        employmentPeriod: {
          start: "04.2026",
        },
        employmentType: "Full-time",
        icon: <RocketIcon />,
        description: "Leading technical initiatives and managing the core engineering team for E-Cell NITK's digital infrastructure.",
        isExpanded: true,
      },
      {
        id: "webmaster",
        title: "Webmaster",
        employmentPeriod: {
          start: "04.2025",
        },
        employmentType: "Part-time",
        icon: <GlobeIcon />,
        description: "Overseeing all web-related operations, maintaining organizational platforms, and ensuring high availability and performance.",
      },
      {
        id: "web-developer",
        title: "Web Developer",
        employmentPeriod: {
          start: "01.2024",
          end: "04.2025",
        },
        employmentType: "Full-time",
        icon: <CodeXmlIcon />,
        description: "As a Web Developer at E-Cell NITK, I helped in Crafting Organizations website's, utilizing modern web technologies to create a responsive and user-friendly platform. My focus on designing, enhancing user experience involved implementing intuitive navigation and optimizing site performance.",
        skills: ["HTML", "CSS", "JavaScript", "React", "UI/UX Design"],
      },
    ],
    isCurrentEmployer: true,
  },
  {
    id: "urban-parents-club",
    companyName: "Urban Parents Club",
    companyLogo: "",
    positions: [
      {
        id: "founders-office",
        title: "Founders office Intern - Tech",
        employmentPeriod: {
          start: "05.2025",
          end: "07.2025",
        },
        employmentType: "Internship",
        icon: <BriefcaseIcon />,
        description: "Working closely with the founders on core technical products and scaling the mobile application ecosystem.",
        skills: ["React Native", "React.js", "Mobile Development"],
      },
    ],
  },
  {
    id: "cosh-nitk",
    companyName: "COSH NITK",
    companyLogo: "",
    positions: [
      {
        id: "graphic-designer",
        title: "Graphic Designer",
        employmentPeriod: {
          start: "11.2024",
        },
        icon: <PaletteIcon />,
        description: "Designing visual identity and promotional assets for the COSH community.",
      },
    ],
    isCurrentEmployer: true,
  },
  {
    id: "ieee-nitk",
    companyName: "IEEE NITK",
    companyLogo: "",
    positions: [
      {
        id: "executive-member",
        title: "Executive member | CompSoc",
        employmentPeriod: {
          start: "09.2024",
        },
        employmentType: "Part-time",
        icon: <UsersIcon />,
        description: "Active member of the Computer Society chapter, organizing technical workshops and managing community engagement.",
      },
    ],
    isCurrentEmployer: true,
  },
  {
    id: "ace-nitk",
    companyName: "ACE-NITK",
    companyLogo: "",
    positions: [
      {
        id: "web-developer-ace",
        title: "Web Developer",
        employmentPeriod: {
          start: "08.2024",
        },
        employmentType: "Part-time",
        icon: <CodeXmlIcon />,
        description: "Developing and maintaining the official website for the Association of Computer Engineers.",
      },
    ],
    isCurrentEmployer: true,
  },
  {
    id: "e-summit-nitk",
    companyName: "E-Summit and Innovation Committee, NITK",
    companyLogo: "",
    positions: [
      {
        id: "web-dev-designer",
        title: "Web Developer and Designer",
        employmentPeriod: {
          start: "05.2024",
        },
        employmentType: "Part-time",
        icon: <DraftingCompassIcon />,
        description: "Designing and developing interactive platforms for the annual E-Summit, focusing on a hybrid event experience.",
        skills: ["CSS", "Figma", "UI/UX Design", "Animation"],
      },
    ],
    isCurrentEmployer: true,
  },
]
