export type Role = "admin" | "student" | "teacher";

export type MissionType = "quiz" | "vocabulary" | "audio";

export type QuizAnswer = "a" | "b" | "c" | "d";

export type MissionQuestion = {
  question: string;
  options: Record<QuizAnswer, string>;
};

export type Paginated<T> = {
  docs: T[];
  totalDocs: number;
  limit: number;
  page: number;
  totalPages: number;
  hasPrevPage: boolean;
  hasNextPage: boolean;
  prevPage: number | null;
  nextPage: number | null;
};

export type Ref = {
  _id: string;
  name: string;
};

export type TeacherRef = {
  _id: string;
  name: string;
  email: string;
  role: Role;
};

export type StudentRef = {
  _id: string;
  name: string;
  role: Role;
};

export type MissionRef = {
  _id: string;
  title: string;
  type: MissionType;
  active: boolean;
};

export type SchoolClass = {
  _id: string;
  name: string;
  active: boolean;
  teacher: TeacherRef | null;
  students: StudentRef[];
  missions: MissionRef[];
  createdAt?: string;
  updatedAt?: string;
};

export type Mission = {
  _id: string;
  title: string;
  description: string | null;
  type: MissionType;
  xp_reward: number;
  class_id: Ref | null;
  active: boolean;
  createdBy: Ref | null;
  content: string | null;
  content_url: string | null;
  questions?: MissionQuestion[];
  createdAt: string;
  updatedAt: string;
};

export type MissionProgressResult = {
  mission: string;
  student: string;
  done: boolean;
  score: number;
  correct_answers: number | null;
  total_questions: number | null;
  xp_earned: number;
  credited_so_far: number;
  already_rewarded: boolean;
  progression: {
    previous_level: number;
    leveled_up: boolean;
    leveled_down: boolean;
    level: number;
    xp: number;
  } | null;
};

export type LevelProgress = {
  current_level_xp: number;
  next_level_xp: number | null;
  xp_to_next_level: number;
  percentage: number;
};

export type MissionProgressEntry = {
  mission_id: string;
  done: boolean;
  score: number;
  xp_earned: number;
  completed_at: string | null;
};

export type User = {
  _id: string;
  name: string;
  email: string;
  role: Role;
  xp: number;
  level: number;
  progress: LevelProgress;
  class: string | null;
  mission_progress: MissionProgressEntry[];
  streak: number;
  badges: string[];
  active: boolean;
  createdAt: string;
  updatedAt: string;
};

export type LoginResponse = {
  accessToken: string;
  refreshToken: string;
  user: User;
};

export type RankingScope = "global" | "class";

export type RankingUser = {
  _id: string;
  name: string;
  email: string;
  xp: number;
  level: number;
};

export type RankingEntry = {
  user: RankingUser;
  xp: number;
  level: number;
};

export type Ranking = {
  _id: string;
  type: RankingScope;
  class: Ref | null;
  entries: RankingEntry[];
  createdAt: string;
  updatedAt: string;
};

export type ClassSummary = Omit<SchoolClass, "students" | "missions"> & {
  students: string[];
  missions: string[];
};

export type AttitudeType = "positive" | "negative";

export type Attitude = {
  _id: string;
  name: string;
  description: string | null;
  xp_value: number;
  type: AttitudeType;
  active: boolean;
};

export type AttitudeLogResult = {
  _id: string;
  student: string;
  attitude: string;
  xp_applied: number;
};
