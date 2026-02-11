import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { fn } from "storybook/test";
import { SubjectBrowserCard } from "./SubjectBrowserCard";
import type { Subject } from "@/types";

const unlockedWithProgress: Subject = {
  id: "1",
  name: "Mathematics",
  description: "Numbers and operations",
  icon_name: "calculator",
  display_color: "#7C3AED",
  position: 1,
  skill_nodes_count: 8,
  enrollment: {
    mastery_level: 50,
    current_level: 2,
    is_pinned: false,
    total_xp: 480,
    completed_nodes_count: 4,
  },
};

const newSubject: Subject = {
  id: "2",
  name: "Science",
  description: "Explore the world",
  icon_name: "flask",
  display_color: "#10B981",
  position: 2,
  skill_nodes_count: 10,
  enrollment: {
    mastery_level: 0,
    current_level: 1,
    is_pinned: false,
    total_xp: 0,
    completed_nodes_count: 0,
  },
};

const lockedSubject: Subject = {
  id: "5",
  name: "Art",
  description: "Creative expression",
  icon_name: "palette",
  display_color: "#EC4899",
  position: 5,
  skill_nodes_count: 6,
  enrollment: null,
};

const highProgress: Subject = {
  id: "3",
  name: "Reading",
  description: "Stories and comprehension",
  icon_name: "book-open",
  display_color: "#F59E0B",
  position: 3,
  skill_nodes_count: 12,
  enrollment: {
    mastery_level: 85,
    current_level: 5,
    is_pinned: true,
    total_xp: 1640,
    completed_nodes_count: 10,
  },
};

const meta = {
  title: "Components/Child/SubjectBrowserCard",
  component: SubjectBrowserCard,
  tags: ["autodocs"],
  args: {
    onClick: fn(),
    index: 0,
  },
  decorators: [
    (Story) => (
      <div className="max-w-md mx-auto p-4 bg-gray-50">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof SubjectBrowserCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const UnlockedWithProgress: Story = {
  args: {
    subject: unlockedWithProgress,
  },
};

export const NewSubject: Story = {
  args: {
    subject: newSubject,
    index: 1,
  },
};

export const Locked: Story = {
  args: {
    subject: lockedSubject,
    index: 4,
  },
};

export const HighProgress: Story = {
  args: {
    subject: highProgress,
    index: 2,
  },
};
