
export type Permission = 
  | "all_access"
  | "manage_mocks"
  | "manage_questions"
  | "manage_current_affairs"
  | "manage_users"
  | "manage_admins"
  | "manage_pdfs"
  | "view_users"
  | "view_reports"
  | "manage_ai";

export const ROLE_PERMISSIONS: Record<string, Permission[]> = {
  superadmin: ["all_access"],
  admin: [
    "manage_mocks",
    "manage_questions",
    "manage_current_affairs",
    "manage_users",
    "manage_pdfs",
    "manage_ai"
  ],
  editor: [
    "manage_current_affairs",
    "manage_pdfs"
  ],
  support: [
    "view_users",
    "view_reports"
  ],
};
