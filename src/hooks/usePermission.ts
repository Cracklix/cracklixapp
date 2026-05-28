
import { Permission } from "@/constants/permissions";

/**
 * Utility to check if a user has a specific permission based on their list of permissions.
 */
export function hasPermission(
  userPermissions: string[] | undefined,
  permission: Permission
): boolean {
  if (!userPermissions) return false;
  
  if (userPermissions.includes("all_access")) {
    return true;
  }

  return userPermissions.includes(permission);
}
