// Subject icon and color constants for the curriculum system

export const SUBJECT_ICONS = [
  { key: "math", emoji: "🔢", label: "Math" },
  { key: "science", emoji: "🔬", label: "Science" },
  { key: "english", emoji: "📖", label: "English" },
  { key: "history", emoji: "🏛️", label: "History" },
  { key: "geography", emoji: "🌍", label: "Geography" },
  { key: "art", emoji: "🎨", label: "Art" },
  { key: "music", emoji: "🎵", label: "Music" },
  { key: "book", emoji: "📚", label: "Book" },
  { key: "computer", emoji: "💻", label: "Computer" },
  { key: "language", emoji: "🗣️", label: "Language" },
  { key: "sports", emoji: "⚽", label: "Sports" },
  { key: "nature", emoji: "🌿", label: "Nature" },
  { key: "chemistry", emoji: "⚗️", label: "Chemistry" },
  { key: "writing", emoji: "✏️", label: "Writing" },
  { key: "puzzle", emoji: "🧩", label: "Puzzle" },
  { key: "star", emoji: "⭐", label: "Star" },
];

const iconMap: Record<string, string> = {};
for (const icon of SUBJECT_ICONS) {
  iconMap[icon.key] = icon.emoji;
}
// Seed aliases
iconMap["calculator"] = "🔢";
iconMap["flask"] = "🔬";
iconMap["globe"] = "🌍";
iconMap["palette"] = "🎨";

export const SUBJECT_COLORS = [
  { value: "#6366F1", label: "Indigo" },
  { value: "#8B5CF6", label: "Violet" },
  { value: "#9333EA", label: "Purple" },
  { value: "#EC4899", label: "Pink" },
  { value: "#EF4444", label: "Red" },
  { value: "#F97316", label: "Orange" },
  { value: "#F59E0B", label: "Amber" },
  { value: "#22C55E", label: "Green" },
  { value: "#14B8A6", label: "Teal" },
  { value: "#3B82F6", label: "Blue" },
  { value: "#06B6D4", label: "Cyan" },
  { value: "#64748B", label: "Slate" },
];

export function getSubjectIcon(iconName: string | null): string {
  if (!iconName) return "📚";
  return iconMap[iconName.toLowerCase()] || "📚";
}
