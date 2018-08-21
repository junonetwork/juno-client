import {
  nthArg,
  equals,
  omit,
  prop,
  propEq,
  last,
  path,
}                                    from 'ramda';
import {
  filter as filterStream,
  mergeMap,
  catchError,
}                                    from 'rxjs/operators';
import { of }                        from 'rxjs/observable/of';
import { empty }                     from 'rxjs/observable/empty';
import { batchActions }              from 'redux-batched-actions';
import createCachedSelector          from 're-reselect';
import {
  expandIndicesKeySet,
}                                    from '../../utils/sheet';
import multimethod                   from '../../utils/multimethod';
import {
  destructureAddress,
  getUpCell,
}                                    from '../../utils/cell';
import {
  setInArray,
}                                    from '../../utils/table';
import {
  clearCellInput,
}                                    from './cellInput';
import {
  getTableAddress,
}                                    from './sheets';


/**
 * utils
 */
// TODO - fix search serialization
const omitTypeLabel = omit(['typeLabel']);
export const serializeSearch = (search) => JSON.stringify(omitTypeLabel(search));

export const createSearchDescriptor = (repository, type, typeLabel) => ({
  repository, type, typeLabel,
});

/*
 * table types:
 * - search    ['collection', 'type=Person', '0..10']
 * - value     ['resource', ':james', '0', 'siblings']
 * - resource  ['resource', ':james']
 * - predicate ['collection', 'type=Person', '0..10', 'siblings']
 */
const createSearchCollectionTable = (
  tableId, search,
  predicates, indices, repository, type,
) => ({
  collection: {
    type: 'search',
    search,
  },
  tableId,
  predicates,
  indices,
  repository,
  type,
});

const createValueCollectionTable = (
  tableId, resourcePath,
  predicates, indices, repository, type,
) => ({
  collection: {
    type: 'value',
    resourcePath,
  },
  tableId,
  predicates,
  indices,
  repository,
  type,
});


/**
 * selectors
 */
export const getTable = (state, tableId) =>
  state.tables[tableId];


/**
 * @param {Object} state
 * @param {String} tableId
 */
// TODO - this is sheet-specific.  b/c sheets modules is so large maybe there should be three modules: sheets, tables, collections
export const getTablePathSets = createCachedSelector(
  getTable,
  multimethod(
    path(['collection', 'type']),
    [
      'search', ({ indices, predicates, collection: { search } }) => {
        const paths = [
          ['resource', search.type, 'skos:prefLabel', 0], // collection
          ['collection', serializeSearch(search), 'length'], // collection length
        ];

        if (predicates.length > 0 && indices.length > 0) {
          paths.push(
            ['resource', predicates, 'skos:prefLabel', 0], // predicates
            ['collection', serializeSearch(search), indices, predicates, 0, 'skos:prefLabel', 0], // object values
            ['collection', serializeSearch(search), indices, predicates, 0, 'uri'], // object values
            ['collection', serializeSearch(search), indices, predicates, 'length'], // object lengths
          );
        } else if (predicates.length > 0) {
          paths.push(
            ['resource', predicates, 'skos:prefLabel', 0], // predicates
          );
        }

        return paths;
      },
      'value', ({ indices, predicates, collection: { resourcePath } }) => {
        const paths = [
          ['resource', last(resourcePath), 'skos:prefLabel', 0], // collection
          [...resourcePath, 'length'], // collection length
        ];

        if (predicates.length > 0 && indices.length > 0) {
          paths.push(
            ['resource', predicates, 'skos:prefLabel', 0], // predicates
            [...resourcePath, indices, predicates, 0, 'skos:prefLabel', 0], // object values
            [...resourcePath, indices, predicates, 0, 'uri'], // object values
            [...resourcePath, indices, predicates, 'length'], // object values
          );
        } else if (predicates.length > 0) {
          paths.push(
            ['resource', predicates, 'skos:prefLabel', 0], // predicates
          );
        } else if (indices.length > 0) {
          paths.push(
            [...resourcePath, indices], // value literals
          );
        }

        return paths;
      },
    ]
  )
)(
  nthArg(1)
);


/**
 * constants
 */
export const ADD_SEARCH_COLLECTION_TABLE = 'ADD_SEARCH_COLLECTION_TABLE';
export const ADD_VALUE_COLLECTION_TABLE = 'ADD_VALUE_COLLECTION_TABLE';
export const REMOVE_TABLE = 'REMOVE_TABLE';

export const REPLACE_SEARCH_COLLECTION = 'REPLACE_SEARCH_COLLECTION';
export const REPLACE_PREDICATES = 'REPLACE_PREDICATES';
export const REPLACE_INDICES = 'REPLACE_INDICES';

export const UPDATE_CELL_VALUE = 'UPDATE_CELL_VALUE';

// TODO - move to sheets module
export const MOVE_TABLE = 'MOVE_TABLE';


/**
 * action creators
 */
export const addSearchCollectionTable = (
  sheetId, tableId, address, search,
  predicates, indices, repository, resourceType
) => ({
  type: ADD_SEARCH_COLLECTION_TABLE,
  sheetId,
  tableId,
  address,
  search,
  predicates,
  indices,
  repository,
  resourceType,
});

export const addValueCollectionTable = (
  sheetId, tableId, address, resourcePath,
  predicates, indices, repository, resourceType
) => ({
  type: ADD_VALUE_COLLECTION_TABLE,
  sheetId,
  tableId,
  address,
  resourcePath,
  predicates,
  indices,
  repository,
  resourceType,
});

export const removeTable = (tableId) => ({
  type: REMOVE_TABLE, tableId,
});

export const replaceSearchCollection = (
  tableId, repository, resourceType, resourceTypeLabel
) => ({
  type: REPLACE_SEARCH_COLLECTION, tableId, repository, resourceType, resourceTypeLabel,
});

export const replacePredicates = (tableId, predicates) => ({
  type: REPLACE_PREDICATES, tableId, predicates,
});

export const replaceIndices = (tableId, indices) => ({
  type: REPLACE_INDICES, tableId, indices,
});

export const updateCellValue = (
  sheetId, tableId, cellType, column, row, value, matrix
) => ({
  type: UPDATE_CELL_VALUE, sheetId, tableId, cellType, column, row, value, matrix,
});

export const moveTable = (tableId, fromSheetId, toSheetId, toColumn, toRow) => ({
  type: MOVE_TABLE, tableId, fromSheetId, toSheetId, toColumn, toRow,
});


/**
 * reducer
 */
export default (
  state = {},
  action
) => {
  if (action.type === ADD_SEARCH_COLLECTION_TABLE) {
    const {
      tableId, search, predicates, indices, repository, resourceType,
    } = action;
    return {
      ...state,
      [tableId]: createSearchCollectionTable(
        tableId, search, predicates, indices, repository, resourceType
      ),
    };
  } else if (action.type === ADD_VALUE_COLLECTION_TABLE) {
    const {
      tableId, resourcePath, predicates, indices, repository, resourceType,
    } = action;
    return {
      ...state,
      [tableId]: createValueCollectionTable(
        tableId, resourcePath, predicates, indices, repository, resourceType
      ),
    };
  } else if (action.type === REMOVE_TABLE) {
    return omit([action.tableId], state);
  } else if (action.type === REPLACE_SEARCH_COLLECTION) {
    if (state[action.tableId].collection.type !== 'search') {
      console.warn(
        'Tried to replace a non-search collection using a REPLACE_SEARCH_COLLECTION action'
      );
      return state;
    }

    // TODO - searchTable.collection.search.type and searchTable.type are duplicates and can become inconsistent
    return {
      ...state,
      [action.tableId]: {
        ...state[action.tableId],
        collection: {
          type: 'search',
          search: createSearchDescriptor(
            action.repository,
            action.resourceType,
            action.resourceTypeLabel
          ),
        },
        type: action.resourceType,
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
// TODO - these are sheet operations, not table
const editCollectionCell = ({ value, tableId }) => {
  if (value === '') {
    // delete collection
    return of(batchActions([
      removeTable(tableId),
      clearCellInput(),
    ], 'DELETE_COLLECTION_CELL'));
  }

  // update collection
  return of(batchActions([
    replaceSearchCollection(tableId, value),
    clearCellInput(),
  ], 'UPDATE_COLLECTION_CELL'));
};


export const editCellEpic = (getState) => (action$) => (
  action$.pipe(
    filterStream(propEq('type', UPDATE_CELL_VALUE)),
    mergeMap(multimethod(
      prop('cellType'),
      [
        'searchCollection', editCollectionCell,
        'valueCollection', editCollectionCell,
        'predicate', ({ value, sheetId, tableId, column }) => {
          if (value === '') {
            // delete column
            const state = getState();
            const { predicates } = getTable(state, tableId);
            const collectionAddress = getTableAddress(state, sheetId, tableId);
            const indexOfDeleteColumn = column - destructureAddress(collectionAddress).column - 1;

            return of(batchActions([
              replacePredicates(
                tableId,
                predicates.filter((_, idx) => idx !== indexOfDeleteColumn)
              ),
              clearCellInput(),
            ], 'DELETE_PREDICATE_CELL'));
          }

          console.warn('edit predicate cell handler not implemented');
          return of(clearCellInput);
        },
        'index', ({ value, sheetId, tableId, row }) => {
          if (value === '') {
            // delete row
            const state = getState();
            const { indices } = getTable(state, tableId);
            const collectionAddress = getTableAddress(state, sheetId, tableId);
            const indexOfDeleteRow = row - destructureAddress(collectionAddress).row - 1;
            // TODO - collapse indicesKeySet
            const newIndices = expandIndicesKeySet(indices)
              .filter((_, idx) => idx !== indexOfDeleteRow);

            return of(batchActions([
              replaceIndices(tableId, newIndices),
              clearCellInput(),
            ], 'DELETE_ROW_CELL'));
          }

          // update row
          const state = getState();
          const { indices } = getTable(state, tableId);
          const collectionAddress = getTableAddress(state, sheetId, tableId);
          const indexOfReplaceRow = row - destructureAddress(collectionAddress).row - 1;
          if (Number.isNaN(parseInt(value, 10))) {
            return of(clearCellInput());
          }

          // TODO - collapse indicesKeySet
          const newIndices = setInArray(
            indexOfReplaceRow,
            parseInt(value, 10),
            expandIndicesKeySet(indices)
          );

          return of(batchActions([
            replaceIndices(tableId, newIndices),
            clearCellInput(),
          ], 'UPDATE_ROW_CELL'));
        },
        'object', ({ value }) => {
          if (value === '') {
            // delete object
            console.log('DELETE_OBJECT_CELL');
            return of(clearCellInput());
          }

          // update object
          console.log('UPDATE_OBJECT_CELL');
          return of(clearCellInput());
        },
        'empty', ({ value, column, row, matrix }) => {
          const upCell = getUpCell(matrix, column, row);
          if (
            upCell && (
              upCell.type === 'searchCollection' ||
                upCell.type === 'valueCollection' ||
                upCell.type === 'index'
            ) &&
              value !== ''
          ) {
            // create new row
            const { indices } = getTable(getState(), upCell.tableId);
            if (Number.isNaN(parseInt(value, 10))) {
              return of(clearCellInput());
            }

            return of(batchActions([
              replaceIndices(upCell.tableId, [...indices, parseInt(value, 10)]),
              clearCellInput(),
            ]));
          }

          return empty();
        },
      ]
    )),
    catchError((error, caught) => {
      console.error('EditCellEpic Error', error);
      return caught;
    })
  )
);
