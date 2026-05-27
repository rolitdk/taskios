import { vi } from "vitest";

export const mockRouter = {
  push: vi.fn(),
  replace: vi.fn(),
  back: vi.fn(),
  forward: vi.fn(),
  refresh: vi.fn(),
  prefetch: vi.fn(),
};

let mockPathname = "/";
let mockSearchParams = new URLSearchParams();

export function setMockPathname(pathname: string) {
  mockPathname = pathname;
}

export function setMockSearchParams(
  params: URLSearchParams | Record<string, string>,
) {
  mockSearchParams =
    params instanceof URLSearchParams ? params : new URLSearchParams(params);
}

export function resetNextNavigationMocks() {
  mockRouter.push.mockReset();
  mockRouter.replace.mockReset();
  mockRouter.back.mockReset();
  mockRouter.forward.mockReset();
  mockRouter.refresh.mockReset();
  mockRouter.prefetch.mockReset();
  mockPathname = "/";
  mockSearchParams = new URLSearchParams();
}

vi.mock("next/navigation", () => ({
  useRouter: () => mockRouter,
  usePathname: () => mockPathname,
  useSearchParams: () => mockSearchParams,
}));
