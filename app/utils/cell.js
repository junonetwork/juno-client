import {
  nthArg,
}                            from 'ramda';
import createCachedSelector  from 're-reselect';
import {
  cellIsFocused,
}                            from '../redux/modules/focus';


export const formatAddress = (column, row) => `${column}${row}`;

export const getRowFromAddress = (address) => +/[0-9]+$/.exec(address)[0];

export const getColumnFromAddress = (address) => /^[a-z]+/.exec(address)[0];

export const createSearchCollection = (address, sheetId, tableId, uri) => ({
  type: 'searchCollection',
  sheetId,
  tableId,
  address,
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
  address,
  column: getColumnFromAddress(address),
  row: getRowFromAddress(address),
  parentObjectSheetId,
  parentObjectAddress,
});

export const createIndex = (address, sheetId, tableId, collectionAddress, index) => ({
  type: 'index',
  sheetId,
  tableId,
  address,
  column: getColumnFromAddress(address),
  row: getRowFromAddress(address),
  index,
  collectionAddress,
});

export const createPredicate = (address, sheetId, tableId, uri) => ({
  type: 'predicate',
  sheetId,
  tableId,
  address,
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
  address,
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
  address,
  column: getColumnFromAddress(address),
  row: getRowFromAddress(address),
});


/**
 * @param {Object} state
 * @param {String} address
 * @param {String} sheetId
 * @param {String} tableId
 * @param {String} collectionAddress
 * @param {String} indexAddress
 * @param {String} predicateAddress
 */
export const materializeObjectCell = createCachedSelector(
  nthArg(1),
  nthArg(2),
  nthArg(3),
  nthArg(4),
  nthArg(5),
  nthArg(6),
  (state, address, sheetId) => cellIsFocused(state, sheetId, address),
  (address, sheetId, tableId, collectionAddress, indexAddress, predicateAddress, isFocused) => ({
    type: 'object',
    sheetId,
    tableId,
    address,
    column: getColumnFromAddress(address),
    row: getRowFromAddress(address),
    collectionAddress,
    indexAddress,
    predicateAddress,
    focusView: isFocused,
  }),
)(
  (_, address) => address
);


/**
 * @param {Object} state
 * @param {Object} nonMaterializedCell
 */
export const materializeCell = (state, cell) => {
  if (cell.type === 'object') {
    return materializeObjectCell(state, cell);
  }

  return cell;
};


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
