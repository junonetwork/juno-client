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

    return expandIndicesKeySet(indices).reduce((matrix, index, rowIdx) => {
      // remaining rows [[index, object, object, ...], ...]
      const indexAddress = formatAddress(column, row + rowIdx + 1);

      matrix.push(predicates.reduce((matrixRow, _, columnIdx) => {
        matrixRow.push(createObject(
          sheetId,
          tableId,
          formatAddress(column + columnIdx + 1, row + rowIdx + 1),
          collectionAddress,
          indexAddress,
          formatAddress(column + columnIdx + 1, row)
        ));

        return matrixRow;
      }, [createIndex(sheetId, tableId, indexAddress, collectionAddress, index)]));

      return matrix;
    }, [
      // top row [[collection, predicate, predicate, ...]]
      predicates.reduce((matrixRow, predicateURI, columnIdx) => {
        matrixRow.push(createPredicate(
          sheetId,
          tableId,
          formatAddress(column + columnIdx + 1, row), // TODO - createCell helpers should take row/column, not address
          predicateURI
        ));
        return matrixRow;
      }, [createSearchCollection(sheetId, tableId, collectionAddress, collectionURI)])
    ]);
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
