import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Trophy, Calculator, Sparkles } from "lucide-react";
import { Card } from "./Card";

const meta = {
  title: "UI/Card",
  component: Card,
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: "select",
      options: ["default", "stat", "subject", "gradient"],
    },
  },
} satisfies Meta<typeof Card>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: (
      <div>
        <h3 className="text-lg font-bold text-gray-800 mb-2">Default Card</h3>
        <p className="text-sm text-gray-500">
          A simple card container with hover animation.
        </p>
      </div>
    ),
  },
};

export const StatCard: Story = {
  args: {
    variant: "stat",
    children: (
      <>
        <div className="flex items-start justify-between mb-3">
          <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
            <Trophy className="w-6 h-6 text-purple-600" />
          </div>
          <span className="text-xs font-semibold px-2 py-1 rounded-full bg-green-100 text-green-700">
            +12%
          </span>
        </div>
        <p className="text-3xl font-black text-gray-800 mb-1">750 XP</p>
        <p className="text-sm text-gray-500">Total Experience</p>
      </>
    ),
  },
};

export const SubjectCard: Story = {
  args: {
    variant: "subject",
    children: (
      <>
        <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center mb-4 mx-auto">
          <Calculator className="w-8 h-8 text-white" />
        </div>
        <h3 className="font-bold text-gray-800 text-center mb-1">
          Mathematics
        </h3>
        <p className="text-sm text-gray-500 text-center mb-3">Level 4 - 75%</p>
        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-blue-500 rounded-full"
            style={{ width: "75%" }}
          />
        </div>
      </>
    ),
  },
};

export const GradientCard: Story = {
  args: {
    variant: "gradient",
    gradient: "linear-gradient(to bottom right, #fb923c, #ec4899)",
    children: (
      <>
        <div className="flex items-center gap-3 mb-3">
          <Sparkles className="w-6 h-6" />
          <h3 className="font-bold text-lg">Daily Quest</h3>
        </div>
        <p className="text-white/90 mb-3">Complete 3 lessons today!</p>
        <div className="flex items-center gap-2">
          <div className="flex-1 h-2 bg-white/30 rounded-full overflow-hidden">
            <div
              className="h-full bg-white rounded-full"
              style={{ width: "66%" }}
            />
          </div>
          <span className="text-sm font-bold">2/3</span>
        </div>
      </>
    ),
  },
};
