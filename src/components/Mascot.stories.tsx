import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Mascot } from "./Mascot";

const meta = {
  title: "Components/Mascot",
  component: Mascot,
  tags: ["autodocs"],
  argTypes: {
    mood: {
      control: "select",
      options: ["waving", "pointing", "celebrating", "encouraging", "excited"],
    },
    size: {
      control: "select",
      options: ["sm", "md", "lg", "xl"],
    },
    animate: { control: "boolean" },
    showSpeechBubble: { control: "boolean" },
    message: { control: "text" },
  },
  decorators: [
    (Story) => (
      <div className="flex items-center justify-center p-12 bg-gray-50 rounded-xl">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Mascot>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Waving: Story = {
  args: {
    mood: "waving",
    size: "lg",
    animate: true,
  },
};

export const Pointing: Story = {
  args: {
    mood: "pointing",
    size: "lg",
    animate: true,
  },
};

export const Celebrating: Story = {
  args: {
    mood: "celebrating",
    size: "lg",
    animate: true,
  },
};

export const Excited: Story = {
  args: {
    mood: "excited",
    size: "lg",
    animate: true,
  },
};

export const WithSpeechBubble: Story = {
  args: {
    mood: "waving",
    size: "lg",
    animate: true,
    showSpeechBubble: true,
    message: "Let's learn something new!",
  },
};

export const AllMoods: Story = {
  render: () => (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
      {(["waving", "pointing", "celebrating", "encouraging", "excited"] as const).map(
        (mood) => (
          <div key={mood} className="text-center">
            <Mascot mood={mood} size="lg" animate />
            <p className="mt-3 text-sm font-semibold text-gray-700 capitalize">
              {mood}
            </p>
          </div>
        )
      )}
    </div>
  ),
};

export const AllSizes: Story = {
  render: () => (
    <div className="flex items-end gap-6">
      {(["sm", "md", "lg", "xl"] as const).map((size) => (
        <div key={size} className="text-center">
          <Mascot mood="waving" size={size} animate={false} />
          <p className="mt-2 text-xs font-semibold text-gray-500">{size}</p>
        </div>
      ))}
    </div>
  ),
};
