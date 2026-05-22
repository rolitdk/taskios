export type BoardDto = {
  id: string;
  title: string;
};

export type BoardsListResponse = {
  boards: BoardDto[];
};

export type CreateBoardResponse = {
  board: BoardDto;
};

export type UpdateBoardResponse = {
  board: BoardDto;
};
