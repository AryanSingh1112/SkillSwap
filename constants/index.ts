export const datas: Images[] = [
  {
    id: "1",
    imageName: "Emma Wilson",
    imagePath: "/images/first.png",
    data: {
      skill: "Photography",
      teach: "Guitar Playing",
    },
  },
  {
    id: "2",
    imageName: "Olivia Brown",
    imagePath: "/images/second.png",
    data: {
      skill: "Cooking",
      teach: "Painting",
    },
  },
  {
    id: "3",
    imageName: "Ava Johnson",
    imagePath: "/images/third.png",
    data: {
      skill: "C++",
      teach: "Video Editing",
    },
  },
  {
    id: "4",
    imageName: "Smith",
    imagePath: "/images/fourth.png",
    data: {
      skill: "Dancing",
      teach: "Singing",
    },
  },
  {
    id: "5",
    imageName: "Ova Adam",
    imagePath: "/images/fifth.png",
    data: {
      skill: "Next.js",
      teach: "Prompting",
    },
  },
  {
    id: "6",
    imageName: "Sophia Turner",
    imagePath: "/images/sixth.png",
    data: {
      skill: "Backend Development",
      teach: "DSA",
    },
  },
];


export interface Images {
  id: string;
  imageName: string;
  imagePath: string;
  data: {
    skill: string;
    teach: string;
  };
}