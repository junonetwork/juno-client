import {
  nthArg,
  compose,
  equals,
  prop,
  filter,
  omit,
}                                    from 'ramda';
import createCachedSelector          from 're-reselect';
import {
  expandIndicesKeySet,
  createSearchCollectionTable,
}                                    from '../../utils/sheet';
import {
  getColumnFromAddress,
  getRowFromAddress,
  formatAddress,
  createSearchCollection,
  createObject,
  createIndex,
  createPredicate,
}                                    from '../../utils/cell';

/**
 * utils
 */
const sheetIdEquals = (val) => compose(equals(val), prop('sheetId'));

/**
 * selectors
 */
export const getTable = (state, tableId) =>
  state.tables[tableId];
export const getTableIds = (state, sheetId) =>
  Object.keys(
    filter(sheetIdEquals(sheetId), state.tables)
  );


/**
 * @param {Object} state
 * @param {String} tableId
 */
export const getTablePathSets = createCachedSelector(
  getTable,
  ({ search, indices, predicates }) => [
    // TODO - mapping search to URIs should move to falcor router
    ['resource', `schema:${search}`, 'skos:prefLabel'], // collection
    ['collection', `schema:${search}`, 'length'], // collection length
    ['resource', predicates, 'skos:prefLabel'], // predicates
    ['collection', `schema:${search}`, indices, predicates, 0, ['skos:prefLabel', 'uri']], // object values
    ['collection', `schema:${search}`, indices, predicates, 'length'], // object lengths
  ]
)(
  nthArg(1)
);


/**
 * @param {Object} state
 * @param {String} sheetId
 * @param {String} tableId
 */
export const getTableCells = createCachedSelector(
  nthArg(1),
  nthArg(2),
  (state, _, tableId) => getTable(state, tableId),
  (sheetId, tableId, { collectionAddress, predicates, indices, search }) => {
    // console.log('getTableCells');

    const collectionColumn = getColumnFromAddress(collectionAddress);
    const collectionRow = getRowFromAddress(collectionAddress);

    return {
      column: collectionColumn,
      row: collectionRow,
      table: expandIndicesKeySet(indices).reduce((matrix, index, rowIdx) => {
        // remaining rows [[index, object, object, ...], ...]
        matrix.push(predicates.reduce((matrixRow, _, columnIdx) => {
          matrixRow.push(createObject(
            sheetId,
            tableId,
            collectionColumn + columnIdx + 1,
            collectionRow + rowIdx + 1,
            collectionAddress,
            formatAddress(collectionColumn, collectionRow + rowIdx + 1),
            formatAddress(collectionColumn + columnIdx + 1, collectionRow)
          ));

          return matrixRow;
        }, [
          createIndex(sheetId,
            tableId,
            collectionColumn,
            collectionRow + rowIdx + 1,
            collectionAddress,
            index
          ),
        ]));

        return matrix;
      }, [
        // top row [[collection, predicate, predicate, ...]]
        predicates.reduce((matrixRow, predicateURI, columnIdx) => {
          matrixRow.push(createPredicate(
            sheetId,
            tableId,
            collectionColumn + columnIdx + 1,
            collectionRow,
            predicateURI
          ));
          return matrixRow;
        }, [createSearchCollection(sheetId, tableId, collectionColumn, collectionRow, search)]),
      ]),
    };
  }
)(
  nthArg(2)
);


/**
 * constants
 */
export const ADD_SEARCH_COLLECTION_TABLE = 'ADD_SEARCH_COLLECTION_TABLE';
export const REMOVE_TABLE = 'REMOVE_TABLE';


/**
 * action creators
 */
export const addSearchCollectionTable = (
  sheetId, tableId, collectionAddress, search, predicates, indices
) => ({
  type: ADD_SEARCH_COLLECTION_TABLE,
  sheetId,
  tableId,
  collectionAddress,
  search,
  predicates,
  indices,
});

export const removeTable = (sheetId, tableId) =>
  ({ type: REMOVE_TABLE, sheetId, tableId });


/**
 * reducer
 */
export default (
  state = {},
  action
) => {
  if (action.type === ADD_SEARCH_COLLECTION_TABLE) {
    const { sheetId, tableId, collectionAddress, search, predicates, indices } = action;
    return {
      ...state,
      [tableId]: createSearchCollectionTable(
        sheetId, tableId, collectionAddress, search, predicates, indices
      ),
    };
  } else if (action.type === REMOVE_TABLE) {
    return omit([action.tableId], state);
  }

  return state;
};


/**
 * epics
 */
