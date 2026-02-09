// ─── Auth Types ────────────────────────────────────────────────
export interface User {
  id: string;
  email: string;
  name: string;
  avatar_url: string | null;
  has_pin: boolean;
}

export interface AuthTokens {
  access_token: string;
  refresh_token: string;
}

// ─── Child Profile ─────────────────────────────────────────────
export interface ChildProfile {
  id: string;
  name: string;
  age_range: string;
  avatar: string | null;
  daily_goal_minutes: number;
  pin_protected: boolean;
  total_xp: number;
  level: number;
  coins: number;
  xp_for_next_level: number;
}

// ─── Subject ───────────────────────────────────────────────────
export interface SubjectEnrollment {
  mastery_level: number;
  current_level: number;
  is_pinned: boolean;
  total_xp: number;
  completed_nodes_count: number;
}

export interface Subject {
  id: string;
  name: string;
  description: string;
  icon_name: string;
  display_color: string;
  position: number;
  enrollment?: SubjectEnrollment | null;
  skill_nodes_count: number;
}

// ─── Skill Node ────────────────────────────────────────────────
export interface SkillNode {
  id: string;
  title: string;
  position: number;
  node_type: "lesson" | "boss";
  xp_reward: number;
  max_stars: number;
  level_number: number;
  prerequisites: string[];
  unlocked?: boolean;
  best_stars?: number;
}

// ─── Deck ──────────────────────────────────────────────────────
export interface Deck {
  id: string;
  name: string;
  difficulty: string;
  deck_type: "flashcards" | "quiz" | "exam";
  tags: string[];
  is_published: boolean;
  flashcards_count: number;
  questions_count: number;
}

// ─── Flashcard ─────────────────────────────────────────────────
export interface Flashcard {
  id: string;
  front_text: string;
  back_text: string;
  front_image_url: string | null;
  back_image_url: string | null;
  position: number;
}

// ─── Question ──────────────────────────────────────────────────
export interface Question {
  id: string;
  question_text: string;
  options: string[];
  xp_value: number;
  position: number;
  correct_answer_index?: number;
  explanation?: string;
}

// ─── Learning Session ──────────────────────────────────────────
export interface LearningSession {
  id: string;
  total_questions: number;
  correct_count: number;
  lives_remaining: number;
  total_xp_earned: number;
  status: "in_progress" | "completed" | "failed";
  stars_earned: number;
  completed_at: string | null;
}

export interface SubmitAnswerResponse {
  is_correct: boolean;
  xp_earned: number;
  lives_remaining: number;
  correct_answer_index: number;
  explanation: string | null;
  session_status: string;
}

// ─── Gamification ──────────────────────────────────────────────
export interface Reward {
  id: string;
  name: string;
  icon: string;
  cost_coins: number;
  is_active: boolean;
  expires_at: string | null;
}

export interface Achievement {
  id: string;
  name: string;
  icon: string;
  description: string;
  criteria: Record<string, unknown>;
  unlocked_at?: string | null;
}

export interface DailyQuest {
  id: string;
  date: string;
  goal_type: string;
  required_count: number;
  progress_count: number;
  bonus_xp: number;
  bonus_coins: number;
  completed_at: string | null;
}

export interface Streak {
  id: string;
  start_date: string;
  current_length: number;
  longest_length: number;
  last_activity_date: string;
}

// ─── Analytics ─────────────────────────────────────────────────
export interface PerformanceDataPoint {
  date: string;
  score: number;
  time: number;
}

export interface SubjectBreakdownPoint {
  name: string;
  value: number;
  color: string;
}

export interface AccuracyDataPoint {
  topic: string;
  accuracy: number;
}

export interface MasteryDataPoint {
  category: "Mastered" | "Learning" | "New";
  count: number;
  color: string;
}

// ─── AI Generation ─────────────────────────────────────────────
export interface AiGenerationJob {
  id: string;
  input_text: string;
  content_type: string;
  subject_name: string;
  difficulty: string;
  status: "pending" | "processing" | "completed" | "failed";
  generated_cards: GeneratedCard[] | null;
  error_message: string | null;
}

export interface GeneratedCard {
  id: number;
  front: string;
  back: string;
  approved: boolean | null;
}

// ─── Card Review (Spaced Repetition) ───────────────────────────
export interface CardReview {
  id: string;
  flashcard_id: string;
  difficulty_rating: "again" | "hard" | "good" | "easy";
  next_review_at: string;
  interval_days: number;
  ease_factor: number;
  review_count: number;
}
