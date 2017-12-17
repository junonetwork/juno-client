

export const formatAddress = (column, row) => `${column}-${row}`;

export const getRowFromAddress = (address) => +/[0-9]+$/.exec(address)[0];

export const getColumnFromAddress = (address) => +/^[0-9]+/.exec(address)[0];


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
  address: formatAddress(column, row),
  column,
  row,
  search,
  focusView: false,
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
  address: formatAddress(column, row),
  column,
  row,
  collectionAddress,
  indexAddress,
  predicateAddress,
  focusView: false,
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
  address: formatAddress(column, row),
  column,
  row,
  index,
  collectionAddress,
  focusView: false,
});


/**
 * @param {String} sheetId
 * @param {String} tableId
 * @param {Number} column
 * @param {Number} row
 * @param {String} uri
 */
export const createPredicate = (
  sheetId, tableId, column, row, uri
) => ({
  type: 'predicate',
  sheetId,
  tableId,
  address: formatAddress(column, row),
  column,
  row,
  uri,
  focusView: false,
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
  address: formatAddress(column, row),
  column,
  row,
  focusView: false,
});


// export const materializeCell = createCachedSelector(
//   (state, sheetId, column, row, falcorJSON) => {
//     const cell = getCell(state, sheetId, formatAddress(column, row));
//     const { type, tableId, uri } = cell;

//     const path = cell2Path(state, cell);
//     let cellLength;
//     let absolutePath;

//     if (type === 'index') {
//       // TODO - this is wonky
//       absolutePath = R.path([...path, 'value'], falcorJSON) ?
//         [...R.path([...R.init(path), '$__path'], falcorJSON), R.last(path)] : // nested table - ['resource', <uri>, 'schema:name', 0]
//         R.path([...path, '$__path'], falcorJSON) ||
//         [];
//     } else {
//       absolutePath = R.path([...path, '$__path'], falcorJSON) || [];
//     }

//     // TODO - split materializeCell into separate fns for differnt types
//     // TODO - cellLength is used for both objects and collections, even though
//     // it means two different things to each cell type
//     if (type === 'object') {
//       cellLength = R.path([...path, 'length', 'value'], falcorJSON);
//       cellLength = cellLength === undefined ? 1 : cellLength;
//     }

//     if (type === 'searchCollection') {
//       cellLength = R.path(['collection', uri, 'length', 'value'], falcorJSON);
//     }

//     if (type === 'objectCollection') {
//       const parentPath = cell2Path(
//         state,
//         getCell(state, cell.parentObjectSheetId, cell.parentObjectAddress)
//       );
//       cellLength = R.path([...parentPath, 'length', 'value'], falcorJSON);
//     }
//     const cellUri = R.path([...path, 0, 'uri', 'value'], falcorJSON);
//     const viewPath = getViewPath(type, path, absolutePath, cellLength, cellUri);

//     return {
//       type,
//       column,
//       row,
//       sheetId,
//       tableId,
//       boxValue: getBoxValue(falcorJSON, cell, path),
//       path,
//       viewPath,
//       absolutePath,
//       cellLength,
//       view: {
//         // TODO - create a memoized selector for this
//         ...getCellView(state, sheetId, formatAddress(column, row)),
//         ...getNodeViewForViewPath(state, viewPath),
//         ...cellIsFocused(state, sheetId, formatAddress(cell.column, cell.row)) ?
//           { focus: true } : {},
//       },
//     };
//   },
//   (materializedCell) => materializedCell
// )(
//   (_, sheetId, column, row) => `${sheetId}:${column}:${row}`,
//   createDeepEqualitySelector
// );
