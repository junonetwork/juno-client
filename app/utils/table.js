export const generateTableId = (sheetId, address) => `${sheetId}:${address}`;


export const setInMatrix = (column, row, value, matrix) => {
  const newRow = [
    ...matrix[row].slice(0, column),
    value,
    ...matrix[row].slice(column + 1, matrix[row].length),
  ];

  return [
    ...matrix.slice(0, row),
    newRow,
    ...matrix.slice(row + 1, matrix.length),
  ];
};


export const updateInMatrix = (column, row, updater, matrix) => {
  const newRow = [
    ...matrix[row].slice(0, column),
    updater(matrix[row][column]),
    ...matrix[row].slice(column + 1, matrix[row].length),
  ];

  return [
    ...matrix.slice(0, row),
    newRow,
    ...matrix.slice(row + 1, matrix.length),
  ];
};


export const setRowInMatrix = (column, row, mergeRow, matrix) => {
  if (row >= matrix.length) {
    throw new Error('Row must be in matrix');
  }

  const newRow = [
    ...matrix[row].slice(0, column),
    ...mergeRow.slice(0, matrix[row].length - column),
    ...matrix[row].slice(
      column + mergeRow.length,
      matrix[row].length
    ),
  ];

  return [
    ...matrix.slice(0, row),
    newRow,
    ...matrix.slice(row + 1, matrix.length),
  ];
};
