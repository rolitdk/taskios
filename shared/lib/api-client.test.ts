import { afterEach, describe, expect, it, vi } from "vitest";

import {
  fetchDataApi,
  getApiErrorMessage,
  readResponseJson,
  refreshAuthSession,
} from "@/shared/lib/api-client";

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
    expect(getApiErrorMessage({ error: { code: "X" } }, fallback)).toBe(
      fallback,
    );
    expect(getApiErrorMessage({ message: "plain" }, fallback)).toBe(fallback);
  });
});

describe("readResponseJson", () => {
  it("parses JSON body", async () => {
    const response = new Response(JSON.stringify({ ok: true, count: 2 }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });

    await expect(
      readResponseJson<{ ok: boolean; count: number }>(response),
    ).resolves.toEqual({
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

describe("fetchDataApi", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("returns non-401 responses without calling refresh", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(new Response(null, { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);

    const response = await fetchDataApi("/api/boards");

    expect(response.status).toBe(200);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("does not refresh on 401 for login", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(new Response(null, { status: 401 }));
    vi.stubGlobal("fetch", fetchMock);

    const response = await fetchDataApi("/api/auth/login", { method: "POST" });

    expect(response.status).toBe(401);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("refreshes once and retries data API on 401", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(new Response(null, { status: 401 }))
      .mockResolvedValueOnce(new Response(null, { status: 200 }))
      .mockResolvedValueOnce(new Response(null, { status: 200 }));

    vi.stubGlobal("fetch", fetchMock);

    const response = await fetchDataApi("/api/boards");

    expect(response.status).toBe(200);
    expect(fetchMock).toHaveBeenCalledTimes(3);
    expect(fetchMock).toHaveBeenNthCalledWith(1, "/api/boards", undefined);
    expect(fetchMock).toHaveBeenNthCalledWith(2, "/api/auth/refresh", {
      method: "POST",
    });
    expect(fetchMock).toHaveBeenNthCalledWith(3, "/api/boards", undefined);
  });

  it("dedupes parallel refresh calls", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(new Response(null, { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);

    await Promise.all([refreshAuthSession(), refreshAuthSession()]);

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock).toHaveBeenCalledWith("/api/auth/refresh", {
      method: "POST",
    });
  });
});
