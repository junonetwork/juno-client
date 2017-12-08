export const formatAddress = (column, row) => `${column}${row}`;

export const getRowFromAddress = (address) => +/[0-9]+$/.exec(address)[0];

export const getColumnFromAddress = (address) => /^[a-z]+/.exec(address)[0];

export const createSearchCollection = (address, sheetId, tableId, uri) => ({
  type: 'searchCollection',
  sheetId,
  tableId,
  column: getColumnFromAddress(address),
  row: getRowFromAddress(address),
  uri,
});

export const createObjectCollection = (
  address, sheetId, tableId, parentObjectSheetId, parentObjectAddress
) => ({
  type: 'objectCollection',
  sheetId,
  tableId,
  column: getColumnFromAddress(address),
  row: getRowFromAddress(address),
  parentObjectSheetId,
  parentObjectAddress,
});

export const createIndex = (address, sheetId, tableId, collectionAddress, index) => ({
  type: 'index',
  sheetId,
  tableId,
  column: getColumnFromAddress(address),
  row: getRowFromAddress(address),
  index,
  collectionAddress,
});

export const createPredicate = (address, sheetId, tableId, uri) => ({
  type: 'predicate',
  sheetId,
  tableId,
  column: getColumnFromAddress(address),
  row: getRowFromAddress(address),
  uri,
});

export const createObject = (
  address, sheetId, tableId, collectionAddress, indexAddress, predicateAddress
) => ({
  type: 'object',
  sheetId,
  tableId,
  column: getColumnFromAddress(address),
  row: getRowFromAddress(address),
  collectionAddress,
  // indexAddress and predicateAddress can be inferred from objectAddress and collectionAddress
  // remove?
  indexAddress,
  predicateAddress,
});

export const createEmpty = (address, sheetId) => ({
  type: 'empty',
  sheetId,
  column: getColumnFromAddress(address),
  row: getRowFromAddress(address),
});
