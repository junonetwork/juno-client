import {
  nthArg,
  compose,
  equals,
  prop,
  filter,
  omit,
}                                    from 'ramda';
import {
  filter as filterStream,
  mergeMap,
  catchError,
}                                    from 'rxjs/operators';
import { of }                        from 'rxjs/observable/of';
import { from }                      from 'rxjs/observable/from';
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
  getObjectPath,
}                                    from '../../utils/cell';
import {
  ofType,
}                                    from '../../redux/actionStream';
import {
  deleteGraphValue,
  updateGraphValue,
}                                    from '../../redux/modules/falcor';
import model                         from '../../falcor/model';


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

export const REPLACE_SEARCH_COLLECTION_SEARCH = 'REPLACE_SEARCH_COLLECTION_SEARCH';
export const REPLACE_PREDICATES = 'REPLACE_PREDICATES';
export const REPLACE_INDICES = 'REPLACE_INDICES';

export const UPDATE_CELL_VALUE = 'UPDATE_CELL_VALUE';

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

export const updateCellValue = (sheetId, tableId, column, row, cellType, value) => ({
  type: UPDATE_CELL_VALUE, sheetId, tableId, column, row, cellType, value,
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
export const editValueCellEpic = (store) => (action$) =>
  action$.pipe(
    filterStream(ofType(UPDATE_CELL_VALUE)),
    filterStream(({ cellType, }) => cellType !== 'empty'),
    mergeMap(({ sheetId, tableId, column, row, cellType: type, value, }) => {
      if (type === 'object' && value === '') {
        // delete object
        // TODO - how should object collections of length > 1 behave?
        // return of(deleteGraphValue(getObjectPath(...)));
        console.log('DELETE OBJECT CELL');
        return of(null);
      } else if (type === 'object') {
        // update object
        // return of(updateGraphValue(getObjectPath(...)));
        console.log('UPDATE OBJECT CELL');
        return of(null);
      } else if ((type === 'searchCollection' || type === 'objectCollection') && value === '') {
        // delete collection
        return of(removeTable(sheetId, tableId));
      } else if (type === 'searchCollection' || type === 'objectCollection') {
        // update collection
        return of(replaceSearchCollectionSearch(sheetId, tableId, value));
      } else if (type === 'predicate' && value === '') {
        // delete column
        const { collectionAddress, predicates, } = getTable(store.getState(), tableId);
        const indexOfDeleteColumn = column - destructureAddress(collectionAddress).column - 1;

        return of(replacePredicates(
          sheetId,
          tableId,
          predicates.filter((_, idx) => idx !== indexOfDeleteColumn)
        ));
      } else if (type === 'predicate') {
        // update column
        return from(model.getValue(['inverse', `"${value}"`, 'skos:prefLabel', 'uri']))
          .map(({ value: uri, }) => {
            const { collectionAddress, predicates, } = getTable(store.getState(), tableId);
            const indexOfReplaceColumn = column - destructureAddress(collectionAddress).column - 1;

            return replacePredicates(
              sheetId,
              tableId,
              predicates.map((predicate, idx) => (
                idx === indexOfReplaceColumn ? uri || 'nullURI' : predicate
              ))
            );
          });
      } else if (type === 'index' && value === '') {
        // delete row
        const { collectionAddress, indices, } = getTable(store.getState(), tableId);
        const indexOfDeleteRow = row - destructureAddress(collectionAddress).row - 1;
        // TODO - do I have to collapse indicesKeySet?
        const newIndices = expandIndicesKeySet(indices)
          .filter((_, idx) => idx !== indexOfDeleteRow);

        return of(replaceIndices(sheetId, tableId, newIndices));
      } else if (type === 'index') {
        // update row
        const { collectionAddress, indices, } = getTable(store.getState(), tableId);
        const indexOfReplaceRow = row - destructureAddress(collectionAddress).row - 1;
        // TODO - do I have to collapse indicesKeySet?
        const newIndices = expandIndicesKeySet(indices)
          .map((index, idx) => (idx === indexOfReplaceRow ? value : index));

        return of(replaceIndices(sheetId, tableId, newIndices));
      }

      throw new Error('Edited a cell with no editValueCellEpic handler');
    }),
    catchError((error, caught) => {
      console.error('EditValueCellEpic Error', error);
      return caught;
    })
  );


// export const editEmptyCellEpic = (action$, store) =>
//   action$.ofType(UPDATE_CELL_VALUE)
//     .filter(({ address, sheetId, value }) => (
//       // editEmptyCellEpic conditions:
//       // - cell is empty (wasn't found in lookup of existing cells)
//       // - input value is not ''
//       R.prop('type', getCell(store.getState(), sheetId, address)) === 'empty' && value !== ''
//     ))
//     .mergeMap(({ address, sheetId, value }) => {
//       const state = store.getState();
//       const column = getColumnFromAddress(address);
//       const row = getRowFromAddress(address);

//       // create new row
//       const upCell = getUpCell(state, sheetId, column, row);
//       if (
//         upCell &&
//         (upCell.type === 'searchCollection' || upCell.type === 'objectCollection' || upCell.type === 'index')
//       ) {
//         const { indices } = getTable(state, sheetId, upCell.tableId);
//         return of(replaceIndices(sheetId, upCell.tableId, [...indices, value]));
//       }

//       // create new column
//       const leftCell = getLeftCell(state, sheetId, column, row);
//       if (
//         leftCell &&
//         (leftCell.type === 'searchCollection' || leftCell.type === 'objectCollection' || leftCell.type === 'predicate')
//       ) {
//         return Observable.from(model.getValue(['inverse', `"${value}"`, 'skos:prefLabel', 'uri']))
//           .map((uri) => {
//             // TODO - store label, for cases when predicate label doesn't resolve to anything
//             const { predicates } = getTable(state, sheetId, leftCell.tableId);
//             return replacePredicates(sheetId, leftCell.tableId, [...predicates, uri.value || value]);
//           });
//       }

//       // create a new collection
//       const newTableId = generateTableId(sheetId, address);

//       return of(addSearchCollectionTable(sheetId, newTableId, address, `schema:${value}`, ['skos:prefLabel'], [0]));
//     })
//     .catch((error, caught) => {
//       console.error('EditEmptyCellEpic error', error);
//       return caught.startWith({ type: ':(', error });
//     });
