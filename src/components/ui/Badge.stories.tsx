import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Badge } from "./Badge";

const meta = {
  title: "UI/Badge",
  component: Badge,
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: "select",
      options: ["level", "streak", "coins", "active", "needsPractice", "locked"],
    },
    size: {
      control: "select",
      options: ["sm", "md", "lg"],
    },
  },
} satisfies Meta<typeof Badge>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Level: Story = {
  args: { variant: "level", value: 8 },
};

export const Streak: Story = {
  args: { variant: "streak", value: 12 },
};

export const Coins: Story = {
  args: { variant: "coins", value: 850 },
};

export const Active: Story = {
  args: { variant: "active" },
};

export const NeedsPractice: Story = {
  args: { variant: "needsPractice" },
};

export const Locked: Story = {
  args: { variant: "locked" },
};

export const Gallery: Story = {
  render: () => (
    <div className="flex flex-wrap gap-3">
      <Badge variant="level" value={8} />
      <Badge variant="streak" value={12} />
      <Badge variant="coins" value={850} />
      <Badge variant="active" />
      <Badge variant="needsPractice" />
      <Badge variant="locked" />
      <Badge variant="level" value={3} size="sm" />
      <Badge variant="streak" value={5} size="lg" />
    </div>
  ),
};
