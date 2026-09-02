export interface Education {
  id: string
  degree: string
  school: string
  period: {
    start: string
    end: string
  }
  description?: string
  skills?: string[]
}

export const EDUCATION: Education[] = [
  {
    id: "nitk",
    degree: "B.Tech in Computer Science and Engineering",
    school: "National Institute of Technology Karnataka (NITK), Surathkal",
    period: {
      start: "2023",
      end: "2027",
    },
    skills: ["Computer Science", "Algorithms", "Software Engineering"],
  },
  {
    id: "gurukul",
    degree: "11th and 12th Grade",
    school: "Gurukul Independent PU College of Science, Kalaburagi",
    period: {
      start: "2021",
      end: "2023",
    },
    skills: ["Science", "Mathematics"],
  },
  {
    id: "svpm",
    degree: "Secondary Education",
    school: "Sardar Vallabhbhai Patel Memorial High School, Kalaburagi",
    period: {
      start: "2008",
      end: "2021",
    },
    skills: ["Basic Education"],
  },
]
