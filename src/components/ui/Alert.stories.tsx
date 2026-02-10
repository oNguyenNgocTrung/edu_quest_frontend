import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Alert } from "./Alert";

const meta = {
  title: "UI/Alert",
  component: Alert,
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: "select",
      options: ["success", "info", "warning"],
    },
    dismissible: { control: "boolean" },
  },
} satisfies Meta<typeof Alert>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Success: Story = {
  args: {
    variant: "success",
    title: "Success!",
    message: "Your changes have been saved successfully.",
  },
};

export const Info: Story = {
  args: {
    variant: "info",
    title: "Information",
    message: "Your daily quest progress has been updated.",
  },
};

export const Warning: Story = {
  args: {
    variant: "warning",
    title: "Warning",
    message: "You have 12 cards due for review today.",
  },
};

export const Dismissible: Story = {
  args: {
    variant: "info",
    title: "Dismissible Alert",
    message: "Click the X to dismiss this alert.",
    dismissible: true,
  },
};
