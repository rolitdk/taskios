import "@testing-library/jest-dom/vitest";
import { afterEach } from "vitest";

import { resetNextNavigationMocks } from "@/test/mocks/next-navigation";

afterEach(() => {
  resetNextNavigationMocks();
});
