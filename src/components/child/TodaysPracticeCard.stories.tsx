import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { fn } from "storybook/test";
import { TodaysPracticeCard } from "./TodaysPracticeCard";

const meta = {
  title: "Components/Child/TodaysPracticeCard",
  component: TodaysPracticeCard,
  tags: ["autodocs"],
  args: {
    onStart: fn(),
  },
  decorators: [
    (Story) => (
      <div className="max-w-2xl mx-auto p-4">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof TodaysPracticeCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const New: Story = {
  args: {
    practice: {
      deck_id: "deck-1",
      deck_name: "Fractions - Chapter 5",
      worksheet_title: "Math Worksheet - Fractions",
      worksheet_date: "2026-02-11",
      subject_name: "Math",
      questions_count: 8,
      ai_generated_count: 3,
      estimated_minutes: 4,
      xp_reward: 80,
      best_stars: 0,
      in_progress_session_id: null,
      status: "new",
    },
  },
};

export const InProgress: Story = {
  args: {
    practice: {
      deck_id: "deck-2",
      deck_name: "Division Basics",
      worksheet_title: "Math Worksheet - Division",
      worksheet_date: "2026-02-10",
      subject_name: "Math",
      questions_count: 12,
      ai_generated_count: 5,
      estimated_minutes: 6,
      xp_reward: 120,
      best_stars: 0,
      in_progress_session_id: "session-abc",
      status: "in_progress",
    },
  },
};

export const NoSimilarExercises: Story = {
  args: {
    practice: {
      deck_id: "deck-3",
      deck_name: "Science Quiz",
      worksheet_title: "Science Worksheet",
      worksheet_date: "2026-02-09",
      subject_name: "Science",
      questions_count: 5,
      ai_generated_count: 0,
      estimated_minutes: 3,
      xp_reward: 50,
      best_stars: 0,
      in_progress_session_id: null,
      status: "new",
    },
  },
};
