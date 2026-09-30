"use client";

import { MissionsScreen } from "@/components/missions/mission-screen";
import { TeacherMissionsScreen } from "@/components/missions/teacher-missions-screen";
import { useAuth } from "@/contexts/auth-context";

export function MissionsByRole() {
  const { user } = useAuth();

  if (!user) {
    return null;
  }

  return user.role === "student" ? <MissionsScreen /> : <TeacherMissionsScreen />;
}
