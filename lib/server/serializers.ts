import type { Comment, Project, User } from "@prisma/client";

export function toPublicUser(
  user: User,
): Omit<User, "passwordHash" | "refreshTokenHash"> {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { passwordHash, refreshTokenHash, ...publicUser } = user;
  return publicUser;
}

export function toPublicProject(project: Project): Project {
  return project;
}

export function toPublicComment(comment: Comment): Comment {
  return comment;
}
