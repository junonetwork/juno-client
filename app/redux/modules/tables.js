import {
  nthArg,
  compose,
  equals,
  prop,
  filter,
  omit,
}                                    from 'ramda';
import {
  add,
}                                    from 'base26';
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
 * @param {String} sheetId
 * @param {String} tableId
 */
/**
 * TODO - this really should be memoized (as should the whole sheet materialization process)
 * there are three types of state
 * - graph state: changes slowly, large
 * - table state: changes medium, large
 * - view state: changes quickly, small
 *
 * possible approach:
 * - materialize the table state (memoized), either as a flat map, or as a 2-D matrix
 *   - materializing table state can involve injecting graph state, assuming it can be determined to be referentially equivalent via some selector
 *   - need to find the most efficient way to merge tables w/ empty sheet matrix
 * - go back and setIn map/matrix to inject relatively small view state
 *
 */
export const getTableCells = createCachedSelector(
  nthArg(1),
  nthArg(2),
  (state, _, tableId) => getTable(state, tableId),
  (sheetId, tableId, { collectionAddress, predicates, indices, collectionURI }) => {
    const column = getColumnFromAddress(collectionAddress);
    const row = getRowFromAddress(collectionAddress);

    const collection = createSearchCollection(
      sheetId, tableId, collectionAddress, collectionURI
    );

    return expandIndicesKeySet(indices).reduce((cells, index, rowIdx) => {
      // remaining rows [[index, object, object, ...], ...]
      const indexAddress = formatAddress(column, row + rowIdx + 1);

      return Object.assign(cells, {
        [indexAddress]: createIndex(sheetId, tableId, indexAddress, collectionAddress, index),
        ...predicates.reduce((objectCells, _, columnIdx) => {
          const objectAddress = formatAddress(add(column, columnIdx + 1), row + rowIdx + 1);

          objectCells[objectAddress] = createObject( // eslint-disable-line no-param-reassign
            sheetId,
            tableId,
            objectAddress,
            collectionAddress,
            formatAddress(column, row + rowIdx + 1),
            formatAddress(add(column, columnIdx + 1), row)
          );

          return objectCells;
        }, {}),
      });
    }, {
      // top row [collection, predicate, predicate, ...]
      [collectionAddress]: collection,
      ...predicates.reduce((predicateCells, predicateURI, columnIdx) => {
        const predicateAddress = formatAddress(add(column, columnIdx + 1), row);

        return Object.assign(predicateCells, {
          [predicateAddress]: createPredicate(sheetId, tableId, predicateAddress, predicateURI),
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
