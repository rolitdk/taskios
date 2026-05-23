import { describe, expect, it } from "vitest";

import {
  getPostLoginRedirectPath,
  isAuthPagePath,
  isLandingPagePath,
  isPublicPagePath,
} from "@/modules/user/lib/auth-routes";

describe("isLandingPagePath", () => {
  it("matches only root path", () => {
    expect(isLandingPagePath("/")).toBe(true);
    expect(isLandingPagePath("/boards")).toBe(false);
  });
});

describe("isAuthPagePath", () => {
  it("matches login and register", () => {
    expect(isAuthPagePath("/login")).toBe(true);
    expect(isAuthPagePath("/register")).toBe(true);
    expect(isAuthPagePath("/boards")).toBe(false);
  });
});

describe("isPublicPagePath", () => {
  it("matches landing and auth pages", () => {
    expect(isPublicPagePath("/")).toBe(true);
    expect(isPublicPagePath("/login")).toBe(true);
    expect(isPublicPagePath("/register")).toBe(true);
    expect(isPublicPagePath("/boards/abc")).toBe(false);
  });
});

describe("getPostLoginRedirectPath", () => {
  it("defaults to /boards when from is missing or unsafe", () => {
    expect(getPostLoginRedirectPath(null)).toBe("/boards");
    expect(getPostLoginRedirectPath(undefined)).toBe("/boards");
    expect(getPostLoginRedirectPath("")).toBe("/boards");
    expect(getPostLoginRedirectPath("//evil.com")).toBe("/boards");
    expect(getPostLoginRedirectPath("https://evil.com")).toBe("/boards");
  });

  it("redirects public paths to /boards", () => {
    expect(getPostLoginRedirectPath("/")).toBe("/boards");
    expect(getPostLoginRedirectPath("/login")).toBe("/boards");
    expect(getPostLoginRedirectPath("/register")).toBe("/boards");
  });

  it("preserves safe in-app paths", () => {
    expect(getPostLoginRedirectPath("/boards")).toBe("/boards");
    expect(getPostLoginRedirectPath("/boards/board-1")).toBe("/boards/board-1");
    expect(getPostLoginRedirectPath("/boards/board-1?task=t-1")).toBe(
      "/boards/board-1?task=t-1",
    );
  });
});
