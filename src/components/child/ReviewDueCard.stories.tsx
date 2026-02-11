import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { fn } from "storybook/test";
import { ReviewDueCard } from "./ReviewDueCard";

const meta = {
  title: "Components/Child/ReviewDueCard",
  component: ReviewDueCard,
  tags: ["autodocs"],
  args: {
    onStartReview: fn(),
  },
  decorators: [
    (Story) => (
      <div className="max-w-2xl mx-auto p-4">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof ReviewDueCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const SingleItem: Story = {
  args: {
    items: [
      {
        deck_id: "deck-1",
        deck_name: "Fractions - Chapter 5",
        worksheet_title: "Math Worksheet",
        worksheet_date: "2026-02-10",
        subject_name: "Math",
        questions_count: 8,
        ai_generated_count: 3,
        estimated_minutes: 4,
        xp_reward: 80,
        best_stars: 2,
        in_progress_session_id: null,
        status: "review_due",
      },
    ],
  },
};

export const MultipleItems: Story = {
  args: {
    items: [
      {
        deck_id: "deck-1",
        deck_name: "Fractions",
        worksheet_title: "Math Worksheet",
        worksheet_date: "2026-02-10",
        subject_name: "Math",
        questions_count: 8,
        ai_generated_count: 3,
        estimated_minutes: 4,
        xp_reward: 80,
        best_stars: 2,
        in_progress_session_id: null,
        status: "review_due",
      },
      {
        deck_id: "deck-2",
        deck_name: "Planets Quiz",
        worksheet_title: "Science Worksheet",
        worksheet_date: "2026-02-09",
        subject_name: "Science",
        questions_count: 5,
        ai_generated_count: 2,
        estimated_minutes: 3,
        xp_reward: 50,
        best_stars: 1,
        in_progress_session_id: null,
        status: "review_due",
      },
    ],
  },
};

export const Empty: Story = {
  args: {
    items: [],
  },
};
