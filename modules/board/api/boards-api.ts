import type { ApiErrorBody } from "@/modules/user/model/auth-types";
import type {
  BoardDto,
  BoardsListResponse,
  CreateBoardResponse,
  UpdateBoardResponse,
} from "@/modules/board/model/board-api-types";
import {
  fetchDataApi,
  getApiErrorMessage,
  readResponseJson,
} from "@/shared/lib/api-client";
import { dedupeAsync } from "@/shared/lib/dedupe-async";

const BOARDS_API = "/api/boards";

export class BoardsApiError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "BoardsApiError";
  }
}

async function parseBoardsResponse<T>(
  response: Response,
  fallbackMessage: string,
): Promise<T> {
  const body = await readResponseJson<T | ApiErrorBody>(response);

  if (!response.ok) {
    throw new BoardsApiError(getApiErrorMessage(body, fallbackMessage));
  }

  if (!body || (typeof body === "object" && body !== null && "error" in body)) {
    throw new BoardsApiError(fallbackMessage);
  }

  return body as T;
}

export async function fetchBoards(): Promise<BoardDto[]> {
  return dedupeAsync("boards:list", async () => {
    const response = await fetchDataApi(BOARDS_API, { method: "GET" });
    const body = await parseBoardsResponse<BoardsListResponse>(
      response,
      "Не удалось загрузить доски",
    );

    return body.boards;
  });
}

export async function createBoard(title: string): Promise<BoardDto> {
  const response = await fetchDataApi(BOARDS_API, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title }),
  });
  const body = await parseBoardsResponse<CreateBoardResponse>(
    response,
    "Не удалось создать доску",
  );

  return body.board;
}

export async function updateBoard(
  boardId: string,
  title: string,
): Promise<BoardDto> {
  const response = await fetchDataApi(`${BOARDS_API}/${boardId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title }),
  });
  const body = await parseBoardsResponse<UpdateBoardResponse>(
    response,
    "Не удалось обновить доску",
  );

  return body.board;
}

export async function deleteBoard(boardId: string): Promise<void> {
  const response = await fetchDataApi(`${BOARDS_API}/${boardId}`, {
    method: "DELETE",
  });

  if (response.status === 204) {
    return;
  }

  const body = await readResponseJson<ApiErrorBody>(response);
  throw new BoardsApiError(
    getApiErrorMessage(body, "Не удалось удалить доску"),
  );
}
