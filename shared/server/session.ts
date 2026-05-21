import { resolveAuthFromRequest } from "@/shared/server/resolve-auth";

export async function getAuthenticatedUserId(
  request: Request,
): Promise<string | null> {
  const { authenticated, userId } = await resolveAuthFromRequest(request);
  if (!authenticated || !userId) {
    return null;
  }
  return userId;
}
