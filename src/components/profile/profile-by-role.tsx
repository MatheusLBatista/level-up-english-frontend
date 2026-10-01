"use client";

import { ProfileScreen } from "@/components/profile/profile-screen";
import { TeacherProfileScreen } from "@/components/profile/teacher-profile-screen";
import { useAuth } from "@/contexts/auth-context";

export function ProfileByRole() {
  const { user } = useAuth();

  if (!user) {
    return null;
  }

  return user.role === "student" ? <ProfileScreen /> : <TeacherProfileScreen />;
}
