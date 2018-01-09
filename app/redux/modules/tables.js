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
  formatAddress,
  createSearchCollection,
  createObject,
  createIndex,
  createPredicate,
  destructureAddress,
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
// TODO - this could return referentially equivalent list if sheetId maintains a list of it's tableIds
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
  ({ search, indices, predicates, }) => [
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
  (sheetId, tableId, { collectionAddress, predicates, indices, search, }) => {
    // console.log('getTableCells');

    const {
      column: collectionColumn,
      row: collectionRow,
    } = destructureAddress(collectionAddress);

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
            formatAddress(sheetId, collectionColumn, collectionRow + rowIdx + 1),
            formatAddress(sheetId, collectionColumn + columnIdx + 1, collectionRow)
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

export const REPLACE_SEARCH_COLLECTION_SEARCH = 'REPLACE_SEARCH_COLLECTION_SEARCH';
export const REPLACE_PREDICATES = 'REPLACE_PREDICATES';
export const REPLACE_INDICES = 'REPLACE_INDICES';


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

export const removeTable = (sheetId, tableId) => ({
  type: REMOVE_TABLE, sheetId, tableId,
});

export const replaceSearchCollectionSearch = (sheetId, tableId, search) => ({
  type: REPLACE_SEARCH_COLLECTION_SEARCH, sheetId, tableId, search,
});

export const replacePredicates = (sheetId, tableId, predicates) => ({
  type: REPLACE_PREDICATES, sheetId, tableId, predicates,
});

export const replaceIndices = (sheetId, tableId, indices) => ({
  type: REPLACE_INDICES, sheetId, tableId, indices,
});


/**
 * reducer
 */
export default (
  state = {},
  action
) => {
  if (action.type === ADD_SEARCH_COLLECTION_TABLE) {
    const { sheetId, tableId, collectionAddress, search, predicates, indices, } = action;
    return {
      ...state,
      [tableId]: createSearchCollectionTable(
        sheetId, tableId, collectionAddress, search, predicates, indices
      ),
    };
  } else if (action.type === REMOVE_TABLE) {
    return omit([action.tableId], state);
  } else if (action.type === REPLACE_SEARCH_COLLECTION_SEARCH) {
    return action.search === state[action.tableId].search ?
      state :
      {
        ...state,
        [action.tableId]: {
          ...state[action.tableId],
          search: action.search,
        },
      };
  } else if (action.type === REPLACE_PREDICATES) {
    return equals(action.predicates, state[action.tableId].predicates) ?
      state :
      {
        ...state,
        [action.tableId]: {
          ...state[action.tableId],
          predicates: action.predicates,
        },
      };
  } else if (action.type === REPLACE_INDICES) {
    return equals(action.indices, state[action.tableId].indices) ?
      state :
      {
        ...state,
        [action.tableId]: {
          ...state[action.tableId],
          indices: action.indices,
        },
      };
  }

  return state;
};


/**
 * epics
 */
