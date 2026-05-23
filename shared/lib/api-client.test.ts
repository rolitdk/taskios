import { describe, expect, it } from "vitest";

import { getApiErrorMessage, readResponseJson } from "@/shared/lib/api-client";

describe("getApiErrorMessage", () => {
  it("returns API error message when body matches ApiErrorBody", () => {
    expect(
      getApiErrorMessage(
        { error: { code: "UNAUTHORIZED", message: "Сессия истекла" } },
        "Ошибка",
      ),
    ).toBe("Сессия истекла");
  });

  it("returns fallback for null, primitives, and malformed objects", () => {
    const fallback = "Не удалось выполнить запрос";
    expect(getApiErrorMessage(null, fallback)).toBe(fallback);
    expect(getApiErrorMessage("error", fallback)).toBe(fallback);
    expect(getApiErrorMessage({ error: { code: "X" } }, fallback)).toBe(fallback);
    expect(getApiErrorMessage({ message: "plain" }, fallback)).toBe(fallback);
  });
});

describe("readResponseJson", () => {
  it("parses JSON body", async () => {
    const response = new Response(JSON.stringify({ ok: true, count: 2 }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });

    await expect(readResponseJson<{ ok: boolean; count: number }>(response)).resolves.toEqual({
      ok: true,
      count: 2,
    });
  });

  it("returns null when body is not valid JSON", async () => {
    const response = new Response("not json", {
      status: 500,
      headers: { "Content-Type": "text/plain" },
    });

    await expect(readResponseJson(response)).resolves.toBeNull();
  });
});
