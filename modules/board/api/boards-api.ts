import type { ApiErrorBody } from "@/modules/user/model/auth-types";
import type {
  BoardMetaDto,
  BoardsListResponse,
  CreateBoardResponse,
} from "@/modules/board/model/board-api-types";
import { getApiErrorMessage, readResponseJson } from "@/shared/lib/api-client";

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

  if (
    !body ||
    (typeof body === "object" && body !== null && "error" in body)
  ) {
    throw new BoardsApiError(fallbackMessage);
  }

  return body as T;
}

export async function fetchBoards(): Promise<BoardMetaDto[]> {
  const response = await fetch(BOARDS_API, { method: "GET" });
  const body = await parseBoardsResponse<BoardsListResponse>(
    response,
    "Не удалось загрузить доски",
  );

  return body.boards;
}

export async function createBoard(title: string): Promise<BoardMetaDto> {
  const response = await fetch(BOARDS_API, {
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
