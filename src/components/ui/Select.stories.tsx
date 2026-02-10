import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Select } from "./Select";

const sampleOptions = [
  { label: "Mathematics", value: "math" },
  { label: "Science", value: "science" },
  { label: "English", value: "english" },
  { label: "History", value: "history" },
];

const meta = {
  title: "UI/Select",
  component: Select,
  tags: ["autodocs"],
  argTypes: {
    label: { control: "text" },
    error: { control: "text" },
    placeholder: { control: "text" },
    disabled: { control: "boolean" },
  },
  args: {
    options: sampleOptions,
  },
} satisfies Meta<typeof Select>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    placeholder: "Choose a subject...",
  },
};

export const WithLabel: Story = {
  args: {
    label: "Subject",
    placeholder: "Choose a subject...",
  },
};

export const WithError: Story = {
  args: {
    label: "Subject",
    error: "Please select a subject.",
  },
};
