export const formatAddress = (sheetId, column, row) => `${sheetId}-${column}-${row}`;

export const destructureAddress = (address) => {
  const [sheetId, column, row] = address.split('-');
  return { sheetId, column: +column, row: +row };
};

export const getUpCell = (matrix, column, row) => matrix[row - 1] && matrix[row - 1][column];

export const getLeftCell = (matrix, column, row) => matrix[row] && matrix[row][column - 1];
