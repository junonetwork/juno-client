import {
  nthArg,
  equals,
  omit,
  propEq,
}                                    from 'ramda';
import {
  filter as filterStream,
  map,
  mergeMap,
  catchError,
  partition,
}                                    from 'rxjs/operators';
import { of }                        from 'rxjs/observable/of';
import { from }                      from 'rxjs/observable/from';
import { empty }                     from 'rxjs/observable/empty';
import { merge }                     from 'rxjs/observable/merge';
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
  getUpCell,
  getLeftCell,
}                                    from '../../utils/cell';
// import {
//   deleteGraphValue,
//   updateGraphValue,
// }                                    from '../../redux/modules/falcor';
import model                         from '../../falcor/model';
import {
  setInArray,
}                                    from '../../utils/table';
import {
  clearCellInput,
}                                    from './cellInput';


/**
 * utils
 */
const omitTypeLabel = omit(['typeLabel']);


/**
 * selectors
 */
export const getTable = (state, tableId) =>
  state.tables[tableId];
const serializeSearch = (search) => JSON.stringify(omitTypeLabel(search));

/**
 * @param {Object} state
 * @param {String} tableId
 */
export const getTablePathSets = createCachedSelector(
  getTable,
  ({ search, indices, predicates, }) => {
    const paths = [
      ['resource', search.type, 'skos:prefLabel', 0], // collection
      ['collection', serializeSearch(search), 'length'], // collection length
    ];

    if (predicates.length > 0 && indices.length > 0) {
      paths.push(
        ['resource', predicates, 'skos:prefLabel', 0], // predicates
        ['collection', serializeSearch(search), indices, predicates, 0, ['skos:prefLabel', 'uri'], 0], // object values
        ['collection', serializeSearch(search), indices, predicates, 'length'], // object lengths
      );
    } else if (predicates.length > 0) {
      paths.push(
        ['resource', predicates, 'skos:prefLabel', 0], // predicates
      );
    }

    return paths;
  }
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

export const REPLACE_SEARCH_COLLECTION = 'REPLACE_SEARCH_COLLECTION';
export const REPLACE_PREDICATES = 'REPLACE_PREDICATES';
export const REPLACE_INDICES = 'REPLACE_INDICES';

export const UPDATE_CELL_VALUE = 'UPDATE_CELL_VALUE';

export const MOVE_TABLE = 'MOVE_TABLE';


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
    const { tableId, collectionAddress, search, predicates, indices, } = action;
    return {
      ...state,
      [tableId]: createSearchCollectionTable(
        tableId, collectionAddress, search, predicates, indices
      ),
    };
  } else if (action.type === REMOVE_TABLE) {
    return omit([action.tableId], state);
  } else if (action.type === REPLACE_SEARCH_COLLECTION) {
    return {
      ...state,
      [action.tableId]: {
        ...state[action.tableId],
        search: {
          ...state[action.tableId].search,
          repository: action.repository,
          type: action.resourceType,
          typeLabel: action.resourceTypeLabel,
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
  } else if (action.type === MOVE_TABLE) {
    return {
      ...state,
      [action.tableId]: {
        ...state[action.tableId],
        collectionAddress: formatAddress(action.toSheetId, action.toColumn, action.toRow),
      },
    };
  }

  return state;
};


/**
 * epics
 */
const editValueCellEpic = (getState) => (action$) => (
  action$.pipe(
    mergeMap(({ column, row, value, matrix, }) => {
      const { type, tableId, } = matrix[row][column];

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
      } else if ((type === 'searchCollection' || type === 'objectCollection') && value === '') {
        // delete collection
        return of([removeTable(tableId), clearCellInput()]);
      } else if (type === 'searchCollection' || type === 'objectCollection') {
        // update collection
        return of([replaceSearchCollection(tableId, value), clearCellInput()]);
      } else if (type === 'predicate' && value === '') {
        // delete column
        const { collectionAddress, predicates, } = getTable(getState(), tableId);
        const indexOfDeleteColumn = column - destructureAddress(collectionAddress).column - 1;

        return of([
          replacePredicates(
            tableId,
            predicates.filter((_, idx) => idx !== indexOfDeleteColumn)
          ),
          clearCellInput(),
        ]);
      } else if (type === 'index' && value === '') {
        // delete row
        const { collectionAddress, indices, } = getTable(getState(), tableId);
        const indexOfDeleteRow = row - destructureAddress(collectionAddress).row - 1;
        // TODO - collapse indicesKeySet
        const newIndices = expandIndicesKeySet(indices)
          .filter((_, idx) => idx !== indexOfDeleteRow);

        return of([replaceIndices(tableId, newIndices), clearCellInput()]);
      } else if (type === 'index') {
        // update row
        const { collectionAddress, indices, } = getTable(getState(), tableId);
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

        return of([replaceIndices(tableId, newIndices), clearCellInput()]);
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
    filterStream(({ value, }) => value !== ''),
    mergeMap(({ column, row, value, matrix, }) => {
      // create new row
      const upCell = getUpCell(matrix, column, row);
      if (
        upCell && (
          upCell.type === 'searchCollection' ||
          upCell.type === 'objectCollection' ||
          upCell.type === 'index'
        )
      ) {
        const { indices, } = getTable(getState(), upCell.tableId);
        if (Number.isNaN(parseInt(value, 10))) {
          return of(clearCellInput());
        }

        return of([
          replaceIndices(upCell.tableId, [...indices, parseInt(value, 10)]),
          clearCellInput(),
        ]);
      }

      // create new column
      // const leftCell = getLeftCell(matrix, column, row);
      // if (
      //   leftCell && (
      //     leftCell.type === 'searchCollection' ||
      //     leftCell.type === 'objectCollection' ||
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

      return empty();

      // create a new collection
      // return of([
      //   addSearchCollectionTable(
      //     sheetId,
      //     generateTableId(),
      //     formatAddress(sheetId, column, row),
      //     { repository: 'yyy', resourceType: 'xxx', },
      //     // value,
      //     ['skos:prefLabel'],
      //     [0]
      //   ),
      //   clearCellInput(),
      // ]);
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
        ({ column, row, matrix, }) => matrix[row][column].type === 'empty'
      )(editCellAction$);

      return merge(
        editEmptyCellEpic(getState)(editEmptyCellAction$),
        editValueCellEpic(getState)(editValueCellAction$)
      );
    }
  )
);
