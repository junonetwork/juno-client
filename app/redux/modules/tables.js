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
  add,
}                                    from 'base26';
import {
  expandIndicesKeySet,
  createSearchCollectionTable,
}                                    from '../../utils/sheet';
import {
  getColumnFromAddress,
  getRowFromAddress,
  formatAddress,
  createSearchCollection,
  createObjectCollection,
  createIndex,
  createPredicate,
  createObject,
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
 * @param {String} sheetId
 * @param {String} tableId
 */
export const getTableCells = createCachedSelector(
  nthArg(1),
  nthArg(2),
  (state, _, tableId) => getTable(state, tableId),
  (sheetId, tableId, table) => {
    const {
      collectionType, collectionAddress,
      predicates, indices,
      collectionURI, parentObjectSheetId, parentObjectAddress,
    } = table;

    const column = getColumnFromAddress(collectionAddress);
    const row = getRowFromAddress(collectionAddress);

    const collection = collectionType === 'searchCollection' ?
      createSearchCollection(collectionAddress, sheetId, tableId, collectionURI) :
      createObjectCollection(
        collectionAddress, sheetId, tableId, parentObjectSheetId, parentObjectAddress
      );

    return expandIndicesKeySet(indices).reduce((cells, index, rowIdx) => {
      // remaining rows [[index, object, object, ...], ...]
      const indexAddress = formatAddress(column, row + rowIdx + 1);

      return Object.assign(cells, {
        [indexAddress]: createIndex(indexAddress, sheetId, tableId, collectionAddress, index),
        ...predicates.reduce((objectCells, _, columnIdx) => {
          const objectAddress = formatAddress(add(column, columnIdx + 1), row + rowIdx + 1);

          return Object.assign(objectCells, {
            [objectAddress]: createObject(
              objectAddress, sheetId, tableId, collectionAddress,
              formatAddress(column, row + rowIdx + 1),
              formatAddress(add(column, columnIdx + 1), row)
            ),
          });
        }, {}),
      });
    }, {
      // top row [collection, predicate, predicate, ...]
      [collectionAddress]: collection,
      ...predicates.reduce((predicateCells, predicateURI, columnIdx) => {
        const predicateAddress = formatAddress(add(column, columnIdx + 1), row);

        return Object.assign(predicateCells, {
          [predicateAddress]: createPredicate(predicateAddress, sheetId, tableId, predicateURI),
        });
      }, {}),
    });
  }
)(
  (_, sheetId, tableId) => `s${sheetId}-t${tableId}`
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
