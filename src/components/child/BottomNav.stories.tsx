import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { BottomNav } from "./BottomNav";

const meta = {
  title: "Components/Child/BottomNav",
  component: BottomNav,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
  },
  decorators: [
    (Story) => (
      <div className="relative bg-gray-50" style={{ height: "200px" }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof BottomNav>;

export default meta;
type Story = StoryObj<typeof meta>;

export const HomeActive: Story = {
  parameters: {
    nextjs: {
      navigation: {
        pathname: "/child/home",
      },
    },
  },
};

export const LearnActive: Story = {
  parameters: {
    nextjs: {
      navigation: {
        pathname: "/child/learn",
      },
    },
  },
};

export const RewardsActive: Story = {
  parameters: {
    nextjs: {
      navigation: {
        pathname: "/child/rewards",
      },
    },
  },
};

export const LeaderboardActive: Story = {
  parameters: {
    nextjs: {
      navigation: {
        pathname: "/child/leaderboard",
      },
    },
  },
};

export const ProfileActive: Story = {
  parameters: {
    nextjs: {
      navigation: {
        pathname: "/child/profile",
      },
    },
  },
};
