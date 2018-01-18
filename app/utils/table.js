// TODO - this will have to change, as tables can move
export const formatTableId = (sheetId, column, row) => `${sheetId}-${column}-${row}`;

export const setInArray = (index, value, array) => ([
  ...array.slice(0, index),
  value,
  ...array.slice(index + 1, array.length),
]);

export const updateInArray = (index, updater, array) => ([
  ...array.slice(0, index),
  updater(array[index]),
  ...array.slice(index + 1, array.length),
]);

export const setInMatrix = (column, row, value, matrix) => ([
  ...matrix.slice(0, row),
  [
    ...matrix[row].slice(0, column),
    value,
    ...matrix[row].slice(column + 1, matrix[row].length),
  ],
  ...matrix.slice(row + 1, matrix.length),
]);


export const updateInMatrix = (column, row, updater, matrix) => ([
  ...matrix.slice(0, row),
  [
    ...matrix[row].slice(0, column),
    updater(matrix[row][column]),
    ...matrix[row].slice(column + 1, matrix[row].length),
  ],
  ...matrix.slice(row + 1, matrix.length),
]);


export const setRowInMatrix = (column, row, mergeRow, matrix) => {
  if (row >= matrix.length) {
    throw new Error('Row must be in matrix');
  }

  return [
    ...matrix.slice(0, row),
    [
      ...matrix[row].slice(0, column),
      ...mergeRow.slice(0, matrix[row].length - column),
      ...matrix[row].slice(
        column + mergeRow.length,
        matrix[row].length
      ),
    ],
    ...matrix.slice(row + 1, matrix.length),
  ];
};
