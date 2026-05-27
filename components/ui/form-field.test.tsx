import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { FormField } from "@/components/ui/form-field";

describe("FormField", () => {
  it("renders label and children", () => {
    render(
      <FormField label="Название">
        <input aria-label="Ввод" />
      </FormField>,
    );

    expect(screen.getByText("Название")).toBeInTheDocument();
    expect(screen.getByLabelText("Ввод")).toBeInTheDocument();
  });

  it("shows error instead of hint when both are provided", () => {
    render(
      <FormField label="Название" error="Ошибка" hint="Подсказка">
        <input aria-label="Ввод" />
      </FormField>,
    );

    expect(screen.getByText("Ошибка")).toBeInTheDocument();
    expect(screen.queryByText("Подсказка")).not.toBeInTheDocument();
  });

  it("shows hint when there is no error", () => {
    render(
      <FormField label="Название" hint="Подсказка">
        <input aria-label="Ввод" />
      </FormField>,
    );

    expect(screen.getByText("Подсказка")).toBeInTheDocument();
  });
});
