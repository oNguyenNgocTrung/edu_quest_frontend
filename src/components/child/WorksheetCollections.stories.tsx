import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { WorksheetCollections } from "./WorksheetCollections";
import type { TodayPracticeResponse } from "@/types";

const mixedData: TodayPracticeResponse = {
  today_practice: [
    {
      deck_id: "d1",
      deck_name: "Addition & Subtraction Practice",
      worksheet_title: "Math Worksheet Week 3",
      worksheet_date: "2025-01-15",
      subject_name: "Mathematics",
      questions_count: 10,
      ai_generated_count: 5,
      estimated_minutes: 8,
      xp_reward: 50,
      best_stars: 0,
      in_progress_session_id: null,
      status: "new",
    },
    {
      deck_id: "d2",
      deck_name: "Vocabulary Builder",
      worksheet_title: "English Homework",
      worksheet_date: "2025-01-14",
      subject_name: "English",
      questions_count: 15,
      ai_generated_count: 8,
      estimated_minutes: 12,
      xp_reward: 75,
      best_stars: 0,
      in_progress_session_id: "s1",
      status: "in_progress",
    },
  ],
  review_due: [
    {
      deck_id: "d3",
      deck_name: "Fractions Review",
      worksheet_title: "Math Test Prep",
      worksheet_date: "2025-01-10",
      subject_name: "Mathematics",
      questions_count: 8,
      ai_generated_count: 4,
      estimated_minutes: 6,
      xp_reward: 40,
      best_stars: 2,
      in_progress_session_id: null,
      status: "review_due",
    },
  ],
  completed: [
    {
      deck_id: "d4",
      deck_name: "Multiplication Tables",
      worksheet_title: "Math Week 1",
      worksheet_date: "2025-01-05",
      subject_name: "Mathematics",
      questions_count: 12,
      ai_generated_count: 6,
      estimated_minutes: 10,
      xp_reward: 60,
      best_stars: 3,
      in_progress_session_id: null,
      status: "completed",
    },
    {
      deck_id: "d5",
      deck_name: "Reading Comprehension",
      worksheet_title: "English Week 1",
      worksheet_date: "2025-01-03",
      subject_name: "English",
      questions_count: 6,
      ai_generated_count: 3,
      estimated_minutes: 5,
      xp_reward: 30,
      best_stars: 2,
      in_progress_session_id: null,
      status: "completed",
    },
  ],
  total_pending: 2,
  total_review: 1,
};

const emptyData: TodayPracticeResponse = {
  today_practice: [],
  review_due: [],
  completed: [],
  total_pending: 0,
  total_review: 0,
};

const allCompleted: TodayPracticeResponse = {
  today_practice: [],
  review_due: [],
  completed: [
    {
      deck_id: "d1",
      deck_name: "Multiplication Tables",
      worksheet_title: "Math Week 1",
      worksheet_date: "2025-01-05",
      subject_name: "Mathematics",
      questions_count: 12,
      ai_generated_count: 6,
      estimated_minutes: 10,
      xp_reward: 60,
      best_stars: 3,
      in_progress_session_id: null,
      status: "completed",
    },
    {
      deck_id: "d2",
      deck_name: "Spelling Bee Practice",
      worksheet_title: "English Week 2",
      worksheet_date: "2025-01-08",
      subject_name: "English",
      questions_count: 8,
      ai_generated_count: 4,
      estimated_minutes: 6,
      xp_reward: 40,
      best_stars: 3,
      in_progress_session_id: null,
      status: "completed",
    },
  ],
  total_pending: 0,
  total_review: 0,
};

const meta = {
  title: "Components/Child/WorksheetCollections",
  component: WorksheetCollections,
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <div className="max-w-md mx-auto p-4 bg-gray-50 min-h-[400px]">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof WorksheetCollections>;

export default meta;
type Story = StoryObj<typeof meta>;

export const MixedItems: Story = {
  args: {
    practiceData: mixedData,
  },
};

export const Empty: Story = {
  args: {
    practiceData: emptyData,
  },
};

export const AllCompleted: Story = {
  args: {
    practiceData: allCompleted,
  },
};
