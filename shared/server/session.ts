import {
  getAccessTokenFromRequest,
  verifyAccessToken,
} from "@/shared/server/auth";

export async function getAuthenticatedUserId(
  request: Request,
): Promise<string | null> {
  const token = getAccessTokenFromRequest(request);
  if (!token) {
    return null;
  }

  try {
    const payload = await verifyAccessToken(token);
    return payload.userId;
  } catch {
    return null;
  }
}
