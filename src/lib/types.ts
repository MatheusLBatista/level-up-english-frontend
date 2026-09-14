export type Role = "admin" | "student" | "teacher";

export type MissionType = "quiz" | "vocabulary" | "audio";

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
  createdAt: string;
  updatedAt: string;
};

export type LevelProgress = {
  current_level_xp: number;
  next_level_xp: number | null;
  xp_to_next_level: number;
  porcentage: number;
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
