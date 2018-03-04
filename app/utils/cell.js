export const formatAddress = (sheetId, column, row) => `${sheetId}-${column}-${row}`;

export const destructureAddress = (address) => {
  const [sheetId, column, row] = address.split('-');
  return { sheetId, column: +column, row: +row, };
};

export const getUpCell = (matrix, column, row) => matrix[row - 1] && matrix[row - 1][column];

export const getLeftCell = (matrix, column, row) => matrix[row] && matrix[row][column - 1];


/**
 * @param {String} sheetId
 * @param {String} tableId
 * @param {Number} column
 * @param {Number} row
 * @param {String} search
 */
export const createSearchCollection = (
  sheetId, tableId, column, row, search
) => ({
  type: 'searchCollection',
  sheetId,
  tableId,
  address: formatAddress(sheetId, column, row),
  column,
  row,
  search,
  cellInput: '',
});

/**
 * @param {String} sheetId
 * @param {String} tableId
 * @param {Number} column
 * @param {Number} row
 * @param {String} collectionAddress
 * @param {String} indexAddress
 * @param {String} predicateAddress
 */
export const createObject = (
  sheetId, tableId, column, row, collectionAddress, indexAddress, predicateAddress
) => ({
  type: 'object',
  sheetId,
  tableId,
  address: formatAddress(sheetId, column, row),
  column,
  row,
  collectionAddress,
  indexAddress,
  predicateAddress,
  cellInput: '',
});


/**
 * @param {String} sheetId
 * @param {String} tableId
 * @param {Number} column
 * @param {Number} row
 * @param {String} collectionAddress
 * @param {Number} index
 */
export const createIndex = (
  sheetId, tableId, column, row, collectionAddress, index
) => ({
  type: 'index',
  sheetId,
  tableId,
  address: formatAddress(sheetId, column, row),
  column,
  row,
  index,
  collectionAddress,
  cellInput: '',
});


/**
 * @param {String} sheetId
 * @param {String} tableId
 * @param {Number} column
 * @param {Number} row
 * @param {String} uri
 */
export const createPredicate = (
  sheetId, tableId, column, row, collectionAddress, uri
) => ({
  type: 'predicate',
  sheetId,
  tableId,
  address: formatAddress(sheetId, column, row),
  column,
  row,
  uri,
  collectionAddress,
  predicateIdx: column - destructureAddress(collectionAddress).column - 1,
  cellInput: '',
});


/**
 * @param {String} sheetId
 * @param {Number} column
 * @param {Number} row
 */
export const createEmpty = (
  sheetId, column, row
) => ({
  type: 'empty',
  sheetId,
  address: formatAddress(sheetId, column, row),
  column,
  row,
  cellInput: '',
});
