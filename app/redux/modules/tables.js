import {
  compose,
  equals,
  prop,
  filter,
  omit,
}                                    from 'ramda';
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
export const getTableCells = (state, sheetId, tableId) => {
  const {
    collectionType, collectionAddress,
    predicates, indices,
    collectionURI, parentObjectSheetId, parentObjectAddress,
  } = getTable(state, tableId);

  const column = getColumnFromAddress(collectionAddress);
  const row = getRowFromAddress(collectionAddress);

  return [-1, ...expandIndicesKeySet(indices)].reduce((cells, index, rowIdx) => {
    if (index === -1) {
      const collection = collectionType === 'searchCollection' ?
        createSearchCollection(collectionAddress, sheetId, tableId, collectionURI) :
        createObjectCollection(
          collectionAddress, sheetId, tableId, parentObjectSheetId, parentObjectAddress
        );

      // TODO - this could be made more performant by mutating the collection,
      // rather than creating new object literal w/ each pass
      return {
        ...cells,
        [collectionAddress]: collection,
        ...predicates.reduce((predicateCells, predicateURI, columnIdx) => {
          const predicateAddress = formatAddress(add(column, columnIdx + 1), row);

          // TODO - this could be made more performant by mutating the collection,
          // rather than creating new object literal w/ each pass
          return {
            ...predicateCells,
            [predicateAddress]: createPredicate(predicateAddress, sheetId, tableId, predicateURI),
          };
        }, {}),
      };
    }

    const indexAddress = formatAddress(column, row + rowIdx);
    return {
      ...cells,
      [indexAddress]: createIndex(indexAddress, sheetId, tableId, collectionAddress, index),
      ...predicates.reduce((predicateCells, _, columnIdx) => {
        const objectAddress = formatAddress(add(column, columnIdx + 1), row + rowIdx);

        // TODO - this could be made more performant by mutating the collection,
        // rather than creating new object literal w/ each pass
        return {
          ...predicateCells,
          [objectAddress]: createObject(
            objectAddress, sheetId, tableId, collectionAddress,
            formatAddress(column, row + rowIdx),
            formatAddress(add(column, columnIdx + 1), row)
          ),
        };
      }, {}),
    };
  }, {});
};


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
