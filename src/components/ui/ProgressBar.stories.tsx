import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { ProgressBar } from "./ProgressBar";

const meta = {
  title: "UI/ProgressBar",
  component: ProgressBar,
  tags: ["autodocs"],
  argTypes: {
    value: { control: { type: "range", min: 0, max: 100 } },
    variant: {
      control: "select",
      options: ["xp", "daily", "mastery"],
    },
    size: {
      control: "select",
      options: ["sm", "md", "lg"],
    },
    animated: { control: "boolean" },
  },
} satisfies Meta<typeof ProgressBar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const XP: Story = {
  args: {
    value: 75,
    variant: "xp",
    size: "md",
  },
  decorators: [
    (Story) => (
      <div className="w-80">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-semibold text-gray-700">XP Progress</span>
          <span className="text-sm font-bold text-purple-600">750 / 1000</span>
        </div>
        <Story />
      </div>
    ),
  ],
};

export const DailyGoal: Story = {
  args: {
    value: 66,
    variant: "daily",
    size: "sm",
  },
  decorators: [
    (Story) => (
      <div className="w-80">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-semibold text-gray-700">Daily Goal</span>
          <span className="text-sm font-bold text-orange-600">66%</span>
        </div>
        <Story />
      </div>
    ),
  ],
};

export const MasteryHigh: Story = {
  args: {
    value: 92,
    variant: "mastery",
    size: "lg",
  },
  decorators: [
    (Story) => (
      <div className="w-80">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-semibold text-gray-700">Mastery Level</span>
          <span className="text-sm font-bold text-green-600">92%</span>
        </div>
        <Story />
      </div>
    ),
  ],
};

export const MasteryMedium: Story = {
  args: {
    value: 55,
    variant: "mastery",
    size: "md",
  },
};

export const MasteryLow: Story = {
  args: {
    value: 25,
    variant: "mastery",
    size: "md",
  },
};

export const Animated: Story = {
  args: {
    value: 80,
    variant: "xp",
    animated: true,
  },
  decorators: [
    (Story) => (
      <div className="w-80">
        <Story />
      </div>
    ),
  ],
};
