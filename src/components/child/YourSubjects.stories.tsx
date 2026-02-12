import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { fn } from "storybook/test";
import { YourSubjects } from "./YourSubjects";
import type { Subject } from "@/types";

const mockSubjects: Subject[] = [
  {
    id: "1",
    name: "Mathematics",
    description: "Numbers and operations",
    icon_name: "calculator",
    display_color: "#3B82F6",
    position: 1,
    skill_nodes_count: 20,
    enrollment: {
      mastery_level: 75,
      current_level: 4,
      is_pinned: true,
      is_active: true,
      total_xp: 1200,
      completed_nodes_count: 15,
    },
  },
  {
    id: "2",
    name: "Science",
    description: "Explore the world",
    icon_name: "flask",
    display_color: "#10B981",
    position: 2,
    skill_nodes_count: 18,
    enrollment: {
      mastery_level: 55,
      current_level: 3,
      is_pinned: false,
      is_active: true,
      total_xp: 800,
      completed_nodes_count: 10,
    },
  },
  {
    id: "3",
    name: "English",
    description: "Reading and writing",
    icon_name: "book-open",
    display_color: "#8B5CF6",
    position: 3,
    skill_nodes_count: 15,
    enrollment: {
      mastery_level: 90,
      current_level: 6,
      is_pinned: false,
      is_active: true,
      total_xp: 2000,
      completed_nodes_count: 14,
    },
  },
  {
    id: "4",
    name: "Geography",
    description: "Countries and cultures",
    icon_name: "globe",
    display_color: "#F59E0B",
    position: 4,
    skill_nodes_count: 12,
    enrollment: {
      mastery_level: 30,
      current_level: 2,
      is_pinned: false,
      is_active: true,
      total_xp: 400,
      completed_nodes_count: 4,
    },
  },
];

const manySubjects: Subject[] = [
  ...mockSubjects,
  {
    id: "5",
    name: "History",
    description: "Past events",
    icon_name: "landmark",
    display_color: "#EF4444",
    position: 5,
    skill_nodes_count: 16,
    enrollment: {
      mastery_level: 45,
      current_level: 3,
      is_pinned: false,
      is_active: true,
      total_xp: 600,
      completed_nodes_count: 7,
    },
  },
  {
    id: "6",
    name: "Music",
    description: "Rhythm and melody",
    icon_name: "music",
    display_color: "#EC4899",
    position: 6,
    skill_nodes_count: 10,
    enrollment: {
      mastery_level: 20,
      current_level: 1,
      is_pinned: false,
      is_active: true,
      total_xp: 200,
      completed_nodes_count: 2,
    },
  },
  {
    id: "7",
    name: "Art",
    description: "Creative expression",
    icon_name: "palette",
    display_color: "#14B8A6",
    position: 7,
    skill_nodes_count: 8,
    enrollment: null,
  },
];

const meta = {
  title: "Components/Child/YourSubjects",
  component: YourSubjects,
  tags: ["autodocs"],
  args: {
    onSubjectClick: fn(),
  },
  decorators: [
    (Story) => (
      <div className="max-w-md mx-auto p-4 bg-gray-50 min-h-[400px]">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof YourSubjects>;

export default meta;
type Story = StoryObj<typeof meta>;

export const WithEnrollments: Story = {
  args: {
    subjects: mockSubjects,
  },
};

export const EmptyState: Story = {
  args: {
    subjects: [],
  },
};

export const ManySubjects: Story = {
  args: {
    subjects: manySubjects,
  },
};
