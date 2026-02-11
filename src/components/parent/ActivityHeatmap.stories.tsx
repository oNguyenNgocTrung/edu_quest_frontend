import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { ActivityHeatmap } from "./ActivityHeatmap";

const meta = {
  title: "Parent/ActivityHeatmap",
  component: ActivityHeatmap,
  tags: ["autodocs"],
} satisfies Meta<typeof ActivityHeatmap>;

export default meta;
type Story = StoryObj<typeof meta>;

export const ActiveStreak: Story = {
  args: {
    streakDays: 12,
    performanceData: [
      { date: "Mon", score: 75, time: 25 },
      { date: "Tue", score: 82, time: 30 },
      { date: "Wed", score: 0, time: 0 },
      { date: "Thu", score: 85, time: 35 },
      { date: "Fri", score: 88, time: 40 },
      { date: "Sat", score: 90, time: 45 },
      { date: "Sun", score: 87, time: 42 },
    ],
  },
};

export const NoActivity: Story = {
  args: {
    streakDays: 0,
    performanceData: [
      { date: "Mon", score: 0, time: 0 },
      { date: "Tue", score: 0, time: 0 },
      { date: "Wed", score: 0, time: 0 },
      { date: "Thu", score: 0, time: 0 },
      { date: "Fri", score: 0, time: 0 },
      { date: "Sat", score: 0, time: 0 },
      { date: "Sun", score: 0, time: 0 },
    ],
  },
};

export const LongStreak: Story = {
  args: {
    streakDays: 28,
    performanceData: [
      { date: "Mon", score: 92, time: 30 },
      { date: "Tue", score: 88, time: 35 },
      { date: "Wed", score: 95, time: 40 },
      { date: "Thu", score: 90, time: 35 },
      { date: "Fri", score: 85, time: 30 },
      { date: "Sat", score: 93, time: 45 },
      { date: "Sun", score: 91, time: 42 },
    ],
  },
};
