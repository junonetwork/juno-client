import {
  path,
}                 from 'ramda';


export const formatAddress = (column, row) => `${column}-${row}`;

export const getRowFromAddress = (address) => +/[0-9]+$/.exec(address)[0];

export const getColumnFromAddress = (address) => +/^[0-9]+/.exec(address)[0];

const getRow = getRowFromAddress;
const getColumn = getColumnFromAddress;


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


export const cell2PathFragment = (cell, sheetMatrix) => {
  if (cell.type === 'searchCollection') {
    return ['collection', `schema:${cell.search}`];
  } else if (cell.type === 'objectCollection') {
    // recurse to calculate pathFragment for parentObject
    return cell2PathFragment(
      sheetMatrix[getRow(cell.parentObjectAddress)][getColumn(cell.parentObjectAddress)],
      sheetMatrix
    );
  } else if (cell.type === 'predicate') {
    return [cell.uri];
  } else if (cell.type === 'index') {
    return [cell.index];
  } else if (cell.type === 'object') {
    // recurse to caculate pathFragment for collection, index, and address
    return [
      ...cell2PathFragment(
        sheetMatrix[getRow(cell.collectionAddress)][getColumn(cell.collectionAddress)],
        sheetMatrix
      ),
      ...cell2PathFragment(
        sheetMatrix[getRow(cell.indexAddress)][getColumn(cell.indexAddress)],
        sheetMatrix
      ),
      ...cell2PathFragment(
        sheetMatrix[getRow(cell.predicateAddress)][getColumn(cell.predicateAddress)],
        sheetMatrix
      ),
    ];
  }

  throw new Error('Tried to get path for unknown cell type', cell.type);
};


// TODO - mapping search to URIs should move to falcor router
export const getSearchCollectionPath = (search) => ['resource', `schema:${search}`, 'skos:prefLabel'];


export const getPredicatePath = (uri) => ['resource', uri, 'skos:prefLabel'];


export const getObjectPath = (collectionAddress, indexAddress, predicateAddress, sheetMatrix) => ([
  ...cell2PathFragment(
    sheetMatrix[getRow(collectionAddress)][getColumn(collectionAddress)],
    sheetMatrix
  ),
  ...cell2PathFragment(
    sheetMatrix[getRow(indexAddress)][getColumn(indexAddress)],
    sheetMatrix
  ),
  ...cell2PathFragment(
    sheetMatrix[getRow(predicateAddress)][getColumn(predicateAddress)],
    sheetMatrix
  ),
]);


export const materializeSearchCollection = (cell, graphFragment) => {
  const relativePath = getSearchCollectionPath(cell.search);

  // TODO - mapping search to URIs should move to falcor router
  return {
    ...cell,
    cellLength: path(['collection', `schema:${cell.search}`, 'length', 'value'], graphFragment),
    value: path([...relativePath, 'value'], graphFragment),
  };
};


export const materializeIndex = (cell) => ({
  ...cell,
  value: cell.index,
});


export const materializePredicate = (cell, graphFragment) => {
  const relativePath = getPredicatePath(cell.uri);

  return {
    ...cell,
    value: path([...relativePath, 'value'], graphFragment),
  };
};


export const materializeObject = (cell, graphFragment, sheetMatrix) => {
  const relativePath = getObjectPath(
    cell.collectionAddress, cell.indexAddress, cell.predicateAddress, sheetMatrix
  );
  const cellLength = path([...relativePath, 'length', 'value'], graphFragment);

  let absolutePath;

  if (cellLength === 1 && path([...relativePath, 0, '$__path'], graphFragment)) {
    absolutePath = path([...relativePath, 0, '$__path'], graphFragment);
  } else if (path([...relativePath, '$__path'], graphFragment)) {
    absolutePath = path([...relativePath, '$__path'], graphFragment);
  } else {
    absolutePath = [];
  }

  let boxValue = path(relativePath, graphFragment);

  // if boxValue is multivalue (not singleton), get first value
  if (boxValue && boxValue['0']) {
    boxValue = boxValue['0'];
  }

  // if boxValue points to an object, get its skos:prefLabel
  if (boxValue && boxValue['skos:prefLabel']) {
    boxValue = boxValue['skos:prefLabel'];
  }

  if (cell.row === 1 && cell.column === 2 && graphFragment) {
    console.log('materialize', path([...relativePath, '$__path'], graphFragment));
  }

  return {
    ...cell,
    cellLength: cellLength === undefined ? 1 : cellLength,
    absolutePath,
    value: boxValue && boxValue.value,
  };
};
