export const formatAddress = (column, row) => `${column}${row}`;

export const getRowFromAddress = (address) => +/[0-9]+$/.exec(address)[0];

export const getColumnFromAddress = (address) => /^[a-z]+/.exec(address)[0];

export const createEmpty = (address, sheetId) => ({
  type: 'empty',
  sheetId,
  column: getColumnFromAddress(address),
  row: getRowFromAddress(address),
});
