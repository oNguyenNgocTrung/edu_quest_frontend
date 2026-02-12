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
  is_active: boolean;
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
  worksheet_decks_count?: number;
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
  deck_id?: string | null;
  deck_name?: string | null;
  creator_id?: string | null;
  is_custom?: boolean;
}

// ─── Deck ──────────────────────────────────────────────────────
export interface Deck {
  id: string;
  name: string;
  difficulty: string;
  deck_type: "flashcards" | "quiz" | "exam";
  tags: string[];
  is_published: boolean;
  worksheet_id: string | null;
  subject_id: string | null;
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
  question_type: "mcq" | "fill_blank" | "true_false";
  is_ai_generated: boolean;
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
  correct_answer: string | null;
  explanation: string | null;
  session_status: string;
}

// ─── Practice ─────────────────────────────────────────────────
export interface PracticeItem {
  deck_id: string;
  deck_name: string;
  worksheet_title: string | null;
  worksheet_date: string | null;
  subject_name: string | null;
  questions_count: number;
  ai_generated_count: number;
  estimated_minutes: number;
  xp_reward: number;
  best_stars: number;
  in_progress_session_id: string | null;
  status: "new" | "in_progress" | "review_due" | "completed";
}

export interface TodayPracticeResponse {
  today_practice: PracticeItem[];
  review_due: PracticeItem[];
  completed: PracticeItem[];
  total_pending: number;
  total_review: number;
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

export interface RewardRedemption {
  id: string;
  status: "pending" | "approved" | "denied" | "claimed";
  reward_name: string;
  reward_icon: string;
  reward_cost: number;
  child_name: string;
  created_at: string;
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

// ─── Dashboard Summary ────────────────────────────────────────
export interface DashboardSummary {
  accuracy: number;
  accuracy_change: number;
  daily_avg_minutes: number;
  mastered_count: number;
  streak_days: number;
  streak_longest: number;
  recent_activity: RecentActivity[];
}

export interface RecentActivity {
  id: string;
  subject_name: string;
  subject_color: string;
  lesson_name: string;
  score: number;
  stars: number;
  xp_earned: number;
  completed_at: string;
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

// ─── Worksheet ────────────────────────────────────────────────
export interface WorksheetProcessingStep {
  id: string;
  label: string;
  status: "completed" | "in-progress" | "pending";
  progress: number;
}

export interface WorksheetExtractedQuestion {
  id: number;
  number: number;
  text: string;
  type: "mcq" | "fill-blank" | "true-false";
  options: string[];
  correct_answer: string;
  explanation?: string;
  xp_value?: number;
  confidence: number;
  needs_review: boolean;
  similar_exercises: WorksheetSimilarExercise[];
}

export interface WorksheetSimilarExercise {
  text: string;
  type: "mcq" | "fill-blank" | "true-false";
  options: string[];
  correct_answer: string;
}

export interface Worksheet {
  id: string;
  title: string | null;
  status: "pending" | "processing" | "extracted" | "approved" | "failed";
  school_date: string | null;
  chapter: string | null;
  textbook_reference: string | null;
  questions_count: number;
  ai_confidence: number;
  extracted_questions: WorksheetExtractedQuestion[];
  processing_steps: WorksheetProcessingStep[];
  error_message: string | null;
  image_url: string | null;
  created_at: string;
  updated_at: string;
}

// ─── Curriculum ─────────────────────────────────────────────────
export interface CurriculumSubject {
  id: string;
  name: string;
  description: string;
  icon_name: string;
  display_color: string;
  skill_nodes_count: number;
  is_enrolled: boolean;
  creator_id: string | null;
  is_custom: boolean;
  enrollment: {
    mastery_level: number;
    current_level: number;
    total_xp: number;
    completed_nodes_count: number;
  } | null;
}

export interface CurriculumSkillNode {
  id: string;
  title: string;
  position: number;
  node_type: "lesson" | "boss";
  xp_reward: number;
  max_stars: number;
  level_number: number;
  deck_id: string | null;
  deck_name: string | null;
  creator_id: string | null;
  is_custom: boolean;
  best_stars?: number;
}

export interface AvailableDeck {
  id: string;
  name: string;
  deck_type: string;
  difficulty: string;
  questions_count: number;
  subject_id: string | null;
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
