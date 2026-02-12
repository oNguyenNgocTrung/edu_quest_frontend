export interface Avatar {
  id: string;
  category: "characters" | "animals" | "robots";
  emoji: string;
  name: string;
  bgColor: string;
}

export const avatars: Avatar[] = [
  // Characters
  { id: "char-1", category: "characters", emoji: "\u{1F466}", name: "Boy", bgColor: "#DBEAFE" },
  { id: "char-2", category: "characters", emoji: "\u{1F467}", name: "Girl", bgColor: "#FCE7F3" },
  { id: "char-3", category: "characters", emoji: "\u{1F9D2}", name: "Child", bgColor: "#FEF3C7" },
  { id: "char-4", category: "characters", emoji: "\u{1F476}", name: "Baby", bgColor: "#D1FAE5" },

  // Animals
  { id: "animal-1", category: "animals", emoji: "\u{1F989}", name: "Owl", bgColor: "#EDE9FE" },
  { id: "animal-2", category: "animals", emoji: "\u{1F98A}", name: "Fox", bgColor: "#FFEDD5" },
  { id: "animal-3", category: "animals", emoji: "\u{1F43C}", name: "Panda", bgColor: "#F3F4F6" },
  { id: "animal-4", category: "animals", emoji: "\u{1F430}", name: "Bunny", bgColor: "#FEE2E2" },

  // Robots/Fantasy
  { id: "robot-1", category: "robots", emoji: "\u{1F916}", name: "Robot", bgColor: "#E0E7FF" },
  { id: "robot-2", category: "robots", emoji: "\u{1F409}", name: "Dragon", bgColor: "#FEE2E2" },
  { id: "robot-3", category: "robots", emoji: "\u{1F984}", name: "Unicorn", bgColor: "#FCE7F3" },
  { id: "robot-4", category: "robots", emoji: "\u{1F47D}", name: "Alien", bgColor: "#D1FAE5" },
];
