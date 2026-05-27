import { screen } from "@testing-library/react";
import { usePathname } from "next/navigation";
import { describe, expect, it } from "vitest";

import {
  mockRouter,
  setMockPathname,
  setMockSearchParams,
} from "@/test/mocks/next-navigation";
import {
  makeTestTasksState,
  renderWithProviders,
} from "@/test/render-with-providers";

function PathnameProbe() {
  return <span data-testid="pathname">{usePathname()}</span>;
}

describe("renderWithProviders", () => {
  it("renders with Redux state and jest-dom matchers", () => {
    renderWithProviders(<div>Taskios</div>, {
      preloadedState: makeTestTasksState(),
    });

    expect(screen.getByText("Taskios")).toBeInTheDocument();
  });
});

describe("next/navigation mock", () => {
  it("exposes controllable router and search params", () => {
    setMockPathname("/boards/board-1");
    setMockSearchParams({ highlightTask: "task-1" });

    renderWithProviders(<PathnameProbe />);

    expect(screen.getByTestId("pathname")).toHaveTextContent("/boards/board-1");
    expect(mockRouter.push).not.toHaveBeenCalled();
  });
});
