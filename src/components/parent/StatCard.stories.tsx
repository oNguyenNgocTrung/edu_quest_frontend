import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { StatCard } from "./StatCard";
import { TrendingUp, Clock, Award, Flame } from "lucide-react";

const meta = {
  title: "Parent/StatCard",
  component: StatCard,
  tags: ["autodocs"],
} satisfies Meta<typeof StatCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const TrendUp: Story = {
  args: {
    icon: TrendingUp,
    iconColor: "text-green-600",
    iconBg: "bg-green-100",
    value: "87%",
    label: "Average Score",
    change: "+12%",
    trend: "up",
    index: 0,
  },
};

export const TrendDown: Story = {
  args: {
    icon: Clock,
    iconColor: "text-blue-600",
    iconBg: "bg-blue-100",
    value: "25 min",
    label: "Daily Average",
    change: "-5 min",
    trend: "down",
    index: 1,
  },
};

export const NoTrend: Story = {
  args: {
    icon: Award,
    iconColor: "text-purple-600",
    iconBg: "bg-purple-100",
    value: "45",
    label: "Cards Mastered",
    index: 2,
  },
};

export const Gallery: Story = {
  args: {
    icon: TrendingUp,
    iconColor: "text-green-600",
    iconBg: "bg-green-100",
    value: "87%",
    label: "Average Score",
  },
  render: () => (
    <div className="grid grid-cols-4 gap-4 max-w-4xl">
      <StatCard
        icon={TrendingUp}
        iconColor="text-green-600"
        iconBg="bg-green-100"
        value="87%"
        label="Average Score"
        change="+12%"
        trend="up"
        index={0}
      />
      <StatCard
        icon={Clock}
        iconColor="text-blue-600"
        iconBg="bg-blue-100"
        value="35 min"
        label="Daily Average"
        index={1}
      />
      <StatCard
        icon={Award}
        iconColor="text-purple-600"
        iconBg="bg-purple-100"
        value="45"
        label="Cards Mastered"
        change="+15"
        trend="up"
        index={2}
      />
      <StatCard
        icon={Flame}
        iconColor="text-orange-600"
        iconBg="bg-orange-100"
        value="12 days"
        label="Current Streak"
        change="Record!"
        trend="up"
        index={3}
      />
    </div>
  ),
};
