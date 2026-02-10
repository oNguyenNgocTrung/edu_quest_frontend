import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { fn } from "storybook/test";
import { BrainBoostBanner } from "./BrainBoostBanner";

const meta = {
  title: "Components/Child/BrainBoostBanner",
  component: BrainBoostBanner,
  tags: ["autodocs"],
  args: {
    onReviewClick: fn(),
    onDismiss: fn(),
  },
  argTypes: {
    cardsDue: { control: { type: "number", min: 0, max: 100 } },
  },
  decorators: [
    (Story) => (
      <div className="max-w-md mx-auto p-4">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof BrainBoostBanner>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    cardsDue: 12,
  },
};

export const FewCards: Story = {
  args: {
    cardsDue: 5,
  },
};

export const ManyCards: Story = {
  args: {
    cardsDue: 42,
  },
};

export const BelowThreshold: Story = {
  args: {
    cardsDue: 3,
  },
};
