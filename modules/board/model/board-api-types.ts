export type BoardMetaDto = {
  id: string;
  title: string;
};

export type BoardsListResponse = {
  boards: BoardMetaDto[];
};

export type CreateBoardResponse = {
  board: BoardMetaDto;
};

export type UpdateBoardResponse = {
  board: BoardMetaDto;
};
