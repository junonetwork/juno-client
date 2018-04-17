import {
  nthArg,
  equals,
  omit,
  propEq,
  last,
  path,
}                                    from 'ramda';
import {
  filter as filterStream,
  mergeMap,
  catchError,
  partition,
}                                    from 'rxjs/operators';
import { of }                        from 'rxjs/observable/of';
import { empty }                     from 'rxjs/observable/empty';
import { merge }                     from 'rxjs/observable/merge';
import { batchActions }              from 'redux-batched-actions';
import createCachedSelector          from 're-reselect';
import {
  expandIndicesKeySet,
}                                    from '../../utils/sheet';
import multimethod                   from '../../utils/multimethod';
import {
  formatAddress,
  createCollection,
  createObject,
  createIndex,
  createPredicate,
  destructureAddress,
  getUpCell,
}                                    from '../../utils/cell';
import {
  setInArray,
}                                    from '../../utils/table';
import {
  rangeLength,
}                                    from '../../utils/falcor';
import {
  clearCellInput,
}                                    from './cellInput';


/**
 * utils
 */
// TODO - fix search serialization
const omitTypeLabel = omit(['typeLabel']);
export const serializeSearch = (search) => JSON.stringify(omitTypeLabel(search));

export const createSearchDescriptor = (repository, type, typeLabel) => ({
  repository, type, typeLabel,
});

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

// Arguably this belongs in the sheets directory, but b/c webpack doesn't handle circular deps correctly,
// must be included here: https://github.com/reactjs/reselect/issues/169#issuecomment-381686600
export const getTableAddress = (state, sheetId, tableId) => state.sheets[sheetId].tables
  .find(propEq('id', tableId))
  .address;

export const getTableDimensions = (state, tableId) => {
  const table = getTable(state, tableId);
  return {
    x: table.predicates.length + 1,
    y: table.indices.reduce((length, rangeKey) => length + rangeLength(rangeKey), 1),
  };
};


/**
 * what if we had some form of dynamic dispatch for table->pathSets?
 * also, table->materialized table should concentrate deserialization at the table level
 * allowing for easier definition of new table contexts: sheet, graph, cards, etc
 *
 * or, make table serialization (toPathSets) and deserialization (toMaterializedCells, toJGF, toCards)
 *   - dispatch on the collectionCell type: searchCollection, resourceCollection, resource, predicateCollection (though maybe predicateCollection is the same as searchCollection).
 *   - table gets a collection field: a map of type and type-specific stuff: search, collectionPath, resourcePath,
 *   - there is only one table type
 *   - there are many collectionCell types
 *   - searchCollection vs. predicateCollection vs valueCollection vs. resourceCollection :
 *     ['collection', 'type=Person', '0..10']
 *     ['collection', 'type=Person', '0..10', ':siblings']
 *     ['resource', ':james', ':siblings']
 *     ['resource', ':james']
 *   - table.collectionAddress moves to sheets
 */

/**
 * @param {Object} state
 * @param {String} tableId
 */
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
        }

        return paths;
      },
    ]
  )
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
  getTableAddress,
  (state, _, tableId) => getTable(state, tableId),
  (sheetId, collectionAddress, { collection,  tableId, predicates, indices }) => {
    // console.log('getTableCells');

    const {
      column: collectionColumn,
      row: collectionRow,
    } = destructureAddress(collectionAddress);
    const collectionCell = createCollection(
      collection,
      sheetId,
      tableId,
      collectionColumn,
      collectionRow
    );

    return {
      column: collectionColumn,
      row: collectionRow,
      id: tableId,
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
            collectionAddress,
            predicateURI
          ));
          return matrixRow;
        }, [collectionCell]),
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

export const updateCellValue = (sheetId, column, row, value, matrix) => ({
  type: UPDATE_CELL_VALUE, sheetId, column, row, value, matrix,
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
  // } else if (action.type === MOVE_TABLE) {
  //   return {
  //     ...state,
  //     [action.tableId]: {
  //       ...state[action.tableId],
  //       collectionAddress: formatAddress(action.toSheetId, action.toColumn, action.toRow),
  //     },
  //   };
  // }

  return state;
};


/**
 * epics
 */
const editValueCellEpic = (getState) => (action$) => (
  action$.pipe(
    mergeMap(({ column, row, value, matrix }) => {
      const { type, tableId } = matrix[row][column];

      if (type === 'object' && value === '') {
        // delete object
        // TODO - how should object collections of length > 1 behave?
        // return of(deleteGraphValue(getObjectPath(...)));
        console.log('DELETE OBJECT CELL');
        return of(clearCellInput());
      } else if (type === 'object') {
        // update object
        // return of(updateGraphValue(getObjectPath(...)));
        console.log('UPDATE OBJECT CELL');
        return of(clearCellInput());
      } else if ((type === 'searchCollection' || type === 'valueCollection') && value === '') {
        // delete collection
        return of(batchActions([removeTable(tableId), clearCellInput()]));
      } else if (type === 'searchCollection' || type === 'valueCollection') {
        // update collection
        return of(batchActions([replaceSearchCollection(tableId, value), clearCellInput()]));
      } else if (type === 'predicate' && value === '') {
        // delete column
        const { collectionAddress, predicates } = getTable(getState(), tableId);
        const indexOfDeleteColumn = column - destructureAddress(collectionAddress).column - 1;

        return of(batchActions([
          replacePredicates(
            tableId,
            predicates.filter((_, idx) => idx !== indexOfDeleteColumn)
          ),
          clearCellInput(),
        ]));
      } else if (type === 'index' && value === '') {
        // delete row
        const { collectionAddress, indices } = getTable(getState(), tableId);
        const indexOfDeleteRow = row - destructureAddress(collectionAddress).row - 1;
        // TODO - collapse indicesKeySet
        const newIndices = expandIndicesKeySet(indices)
          .filter((_, idx) => idx !== indexOfDeleteRow);

        return of(batchActions([replaceIndices(tableId, newIndices), clearCellInput()]));
      } else if (type === 'index') {
        // update row
        const { collectionAddress, indices } = getTable(getState(), tableId);
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
        ]));
      }

      throw new Error('Edited a cell with no editValueCellEpic handler');
    }),
    catchError((error, caught) => {
      console.error('EditValueCellEpic Error', error);
      return caught;
    })
  )
);

const editEmptyCellEpic = (getState) => (action$) => (
  action$.pipe(
    filterStream(({ value }) => value !== ''),
    mergeMap(({ column, row, value, matrix }) => {
      // create new row
      const upCell = getUpCell(matrix, column, row);
      if (
        upCell && (
          upCell.type === 'searchCollection' ||
          upCell.type === 'valueCollection' ||
          upCell.type === 'index'
        )
      ) {
        const { indices } = getTable(getState(), upCell.tableId);
        if (Number.isNaN(parseInt(value, 10))) {
          return of(clearCellInput());
        }

        return of(batchActions([
          replaceIndices(upCell.tableId, [...indices, parseInt(value, 10)]),
          clearCellInput(),
        ]));
      }

      // create new column
      // const leftCell = getLeftCell(matrix, column, row);
      // if (
      //   leftCell && (
      //     leftCell.type === 'searchCollection' ||
      //     leftCell.type === 'valueCollection' ||
      //     leftCell.type === 'predicate'
      //   )
      // ) {
      //   return from(
      //     model.getValue(['inverse', `"${value}"`, 'skos:prefLabel', 'uri'])
      //   )
      //     .pipe(
      //       // TODO - handle case of adding non-existent uri
      //       map((uri = {}) => {
      //         // TODO - store label, for cases when predicate label doesn't resolve to anything
      //         const { predicates, } = getTable(getState(), leftCell.tableId);
      //         return [
      //           replacePredicates(
      //             leftCell.tableId,
      //             [...predicates, uri.value || value]
      //           ),
      //           clearCellInput(),
      //         ];
      //       }),
      //     );
      // }

      // create a new collection
      // return of(batchActions([
      //   addSearchCollectionTable(
      //     sheetId,
      //     generateTableId(),
      //     formatAddress(sheetId, column, row),
      //     createSearchDescriptor('yyy', 'xxx', 'XXX'),
      //     // value,
      //     ['skos:prefLabel'],
      //     [0],
      //     'yyy',
      //     'xxx'
      //   ),
      //   clearCellInput(),
      // ]));

      return empty();
    }),
    catchError((error, caught) => {
      console.error('EditEmptyCellEpic error', error);
      return caught;
    })
  )
);


export const editCellEpic = (getState) => (action$) => (
  action$.pipe(
    filterStream(propEq('type', UPDATE_CELL_VALUE)),
    (editCellAction$) => {
      const [editEmptyCellAction$, editValueCellAction$] = partition(
        ({ column, row, matrix }) => matrix[row][column].type === 'empty'
      )(editCellAction$);

      return merge(
        editEmptyCellEpic(getState)(editEmptyCellAction$),
        editValueCellEpic(getState)(editValueCellAction$)
      );
    }
  )
);
