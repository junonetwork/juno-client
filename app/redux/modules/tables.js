import {
  omit,
}                                    from 'ramda';
import {
  createSearchCollectionTable,
}                                    from '../../utils/sheet';


/**
 * utils
 */


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
    const { tableId, collectionAddress, search, predicates, indices } = action;
    return {
      ...state,
      [tableId]: createSearchCollectionTable(
        collectionAddress, search, predicates, indices
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
