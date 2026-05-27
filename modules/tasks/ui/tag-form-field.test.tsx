import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import {
  DEFAULT_TAG_TONE,
  TagsFormField,
  type TagFormEntry,
} from "@/modules/tasks/ui/tag-form-field";

function renderTagsField(
  overrides: Partial<{
    tags: TagFormEntry[];
    fieldIds: string[];
    labelErrors: Record<number, string | undefined>;
  }> = {},
) {
  const onLabelChange = vi.fn();
  const onToneChange = vi.fn();
  const onAdd = vi.fn();
  const onRemove = vi.fn();

  const tags = overrides.tags ?? [];
  const fieldIds =
    overrides.fieldIds ?? tags.map((_, index) => `field-${index}`);

  render(
    <TagsFormField
      tags={tags}
      fieldIds={fieldIds}
      onLabelChange={onLabelChange}
      onToneChange={onToneChange}
      onAdd={onAdd}
      onRemove={onRemove}
      labelErrors={overrides.labelErrors}
    />,
  );

  return { onLabelChange, onToneChange, onAdd, onRemove };
}

describe("TagsFormField", () => {
  it("renders empty state when no tags", () => {
    renderTagsField();

    expect(screen.getByText("Теги не добавлены")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Добавить тег" }),
    ).toBeInTheDocument();
  });

  it("calls onAdd when add button is clicked", async () => {
    const user = userEvent.setup();
    const { onAdd } = renderTagsField();

    await user.click(screen.getByRole("button", { name: "Добавить тег" }));

    expect(onAdd).toHaveBeenCalledTimes(1);
  });

  it("renders preview placeholder when label is empty", () => {
    renderTagsField({
      tags: [{ label: "", tone: DEFAULT_TAG_TONE }],
      fieldIds: ["tag-1"],
    });

    expect(screen.getByText("Предпросмотр тега")).toBeInTheDocument();
  });

  it("calls onLabelChange when typing into tag input", async () => {
    const user = userEvent.setup();
    const { onLabelChange } = renderTagsField({
      tags: [{ label: "", tone: DEFAULT_TAG_TONE }],
      fieldIds: ["tag-1"],
    });

    await user.type(screen.getByPlaceholderText("Название тега"), "UI");

    expect(onLabelChange).toHaveBeenNthCalledWith(1, 0, "U");
    expect(onLabelChange).toHaveBeenNthCalledWith(2, 0, "I");
  });

  it("calls onRemove when remove is clicked", async () => {
    const user = userEvent.setup();
    const { onRemove } = renderTagsField({
      tags: [{ label: "UI", tone: DEFAULT_TAG_TONE }],
      fieldIds: ["tag-1"],
    });

    await user.click(screen.getByRole("button", { name: "Удалить тег" }));

    expect(onRemove).toHaveBeenCalledWith(0);
  });

  it("calls onToneChange when tone radio is clicked", async () => {
    const user = userEvent.setup();
    const { onToneChange } = renderTagsField({
      tags: [{ label: "UI", tone: DEFAULT_TAG_TONE }],
      fieldIds: ["tag-1"],
    });

    await user.click(screen.getByRole("radio", { name: "Цвет red" }));

    expect(onToneChange).toHaveBeenCalledWith(0, "red");
  });

  it("marks input invalid and shows error text when labelErrors provided", () => {
    renderTagsField({
      tags: [{ label: "", tone: DEFAULT_TAG_TONE }],
      fieldIds: ["tag-1"],
      labelErrors: { 0: "Введите тег" },
    });

    expect(screen.getByPlaceholderText("Название тега")).toHaveAttribute(
      "aria-invalid",
      "true",
    );
    expect(screen.getByText("Введите тег")).toBeInTheDocument();
  });
});
