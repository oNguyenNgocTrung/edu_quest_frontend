import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { fn } from "storybook/test";
import { ChildSelector } from "./ChildSelector";

const meta = {
  title: "Parent/ChildSelector",
  component: ChildSelector,
  tags: ["autodocs"],
} satisfies Meta<typeof ChildSelector>;

export default meta;
type Story = StoryObj<typeof meta>;

const baseProfile = {
  age_range: "7-9" as const,
  daily_goal_minutes: 30,
  pin_protected: false,
  total_xp: 450,
  level: 5,
  coins: 120,
  xp_for_next_level: 50,
};

export const TwoChildren: Story = {
  args: {
    profiles: [
      { ...baseProfile, id: "1", name: "Alex", avatar: "fox" },
      { ...baseProfile, id: "2", name: "Emma", avatar: "owl", age_range: "10-12" },
    ],
    selectedId: "1",
    onSelect: fn(),
  },
};

export const SingleChild: Story = {
  args: {
    profiles: [
      { ...baseProfile, id: "1", name: "Alex", avatar: "fox" },
    ],
    selectedId: "1",
    onSelect: fn(),
  },
};

export const SecondSelected: Story = {
  args: {
    profiles: [
      { ...baseProfile, id: "1", name: "Alex", avatar: "fox" },
      { ...baseProfile, id: "2", name: "Emma", avatar: "owl", age_range: "10-12" },
    ],
    selectedId: "2",
    onSelect: fn(),
  },
};
