/* eslint-disable arrow-body-style */
import {
  nthArg,
  omit,
  range,
  equals,
  assoc,
  pipe,
}                                    from 'ramda';
import createCachedSelector          from 're-reselect';
import {
  getTablePathSets,
  getTableIds,
  getTableCells,
}                                    from './tables';
import {
  getCellFocusDescriptor,
}                                    from './focus';
import {
  getCellTeaserDescriptor,
}                                    from './teaser';
import {
  materializeSearchCollection,
  materializeIndex,
  materializePredicate,
  materializeObject,
  createEmpty,
}                                    from '../../utils/cell';
import {
  setRowInMatrix, updateInMatrix,
}                                    from '../../utils/table';
import {
  arraySingleDepthEqualitySelector,
}                                    from '../../utils/selectors';
import { getEnhancedCells } from './enhanced';

// console.log('init');
/**
 * utils
 */
const createSheet = (maxColumn, maxRow, tables) =>
  ({ maxColumn, maxRow, tables, });


/**
 * selectors
 */
export const getSheet = (state, sheetId) => state.sheets[sheetId];
export const getSheetMaxColumn = (state, sheetId) => state.sheets[sheetId].maxColumn;
export const getSheetMaxRow = (state, sheetId) => state.sheets[sheetId].maxRow;


/**
 * @param {Object} state
 * @param {String} sheetId
 */
export const getSheetPathSets = createCachedSelector(
  (state, sheetId) => (
    getTableIds(state, sheetId).reduce((pathSets, tableId) => {
      pathSets.push(...getTablePathSets(state, tableId));
      return pathSets;
    }, [])
  ),
  (pathSets) => pathSets
)(
  nthArg(1),
  {
    selectorCreator: arraySingleDepthEqualitySelector,
  }
);


/**
 * @param {Object} state
 * @param {String} sheetId
 */
export const createEmptySheet = createCachedSelector(
  nthArg(1),
  getSheetMaxColumn,
  getSheetMaxRow,
  (sheetId, maxColumn, maxRow) => (
    range(0, maxRow + 1)
      .map((row) =>
        range(0, maxColumn + 1)
          .map((column) =>
            createEmpty(sheetId, column, row)
          )
      )
  )
)(
  nthArg(1)
);


/**
 * @param {Object} state
 * @param {String} sheetId
 */
export const getSheetTables = createCachedSelector(
  (state, sheetId) => (
    getTableIds(state, sheetId)
      .map((tableId) => getTableCells(state, sheetId, tableId))
  ),
  (tables) => {
    // console.log('getSheetTables');

    // TODO - materialize tables here, rather than across entire sheetMatrix
    return tables;
  }
)(
  nthArg(1),
  {
    selectorCreator: arraySingleDepthEqualitySelector,
  }
);


/**
 * @param {Object} state
 * @param {String} sheetId
 * @param {Object} tables
 */
export const tables2SheetMatrix = createCachedSelector(
  nthArg(1),
  nthArg(2),
  createEmptySheet,
  (sheetId, tables, emptySheetMatrix) => {
    // console.log('tables2SheetMatrix');

    return tables
      .reduce(
        (sheetMatrix, { column, row, table, }) => (
          table
            .slice(0, Math.max(sheetMatrix.length - row, 0))
            .reduce((_sheetMatrix, tableRow, idx) => (
              setRowInMatrix(column, row + idx, tableRow, _sheetMatrix)
            ), sheetMatrix)
        ),
        emptySheetMatrix
      );
  }
)(
  nthArg(1)
);


/**
 * @param {String} sheetId
 * @param {Object} graphFragment
 * @param {Object} sheetMatrix
 */
export const materializeSheetMatrix = createCachedSelector(
  nthArg(1),
  nthArg(2),
  (graphFragment, sheetMatrix) => {
    // console.log('materializeSheetMatrix');

    return sheetMatrix
      .map((row) => (
        row.map((cell) => {
          if (cell.type === 'searchCollection') {
            return materializeSearchCollection(cell, graphFragment, sheetMatrix);
          } else if (cell.type === 'index') {
            return materializeIndex(cell, graphFragment, sheetMatrix);
          } else if (cell.type === 'predicate') {
            return materializePredicate(cell, graphFragment, sheetMatrix);
          } else if (cell.type === 'object') {
            return materializeObject(cell, graphFragment, sheetMatrix);
          } else if (cell.type === 'empty') {
            return cell;
          }

          throw new Error('tried to get path for unknown cell type', cell.type);
        })
      ));
  }
)(
  nthArg(0)
);


/**
 * @param {Object} state
 * @param {String} sheetId
 * @param {Object} sheetMatrix
 */
export const withFocus = createCachedSelector(
  nthArg(1),
  nthArg(2),
  getCellFocusDescriptor,
  (
    sheetId,
    matrix,
    { sheetId: focusSheetId, column: focusColumn, row: focusRow, } = {}
  ) => {
    const focusCellAbsolutePath = focusRow &&
      focusColumn &&
      matrix[focusRow][focusColumn].absolutePath ?
      matrix[focusRow][focusColumn].absolutePath :
      [];

    return matrix.map((row) => {
      // TODO - find a more idiomatic way to maintain referential equality for unmutated rows
      let mutatedRow = false;

      const newRow = row.map((cell) => {
        let _cell = cell;

        if (
          focusSheetId === sheetId &&
          focusColumn === cell.column &&
          focusRow === cell.row
        ) {
          mutatedRow = true;
          // TODO - use assoc
          _cell = { ..._cell, focusView: true, };
        }

        if (
          focusCellAbsolutePath.length > 0 &&
          equals(cell.absolutePath, focusCellAbsolutePath)
        ) {
          mutatedRow = true;
          // TODO - use assoc
          _cell = { ..._cell, focusNodeView: true, };
        }

        return _cell;
      });

      return mutatedRow ? newRow : row;
    });
  }
)(
  nthArg(1)
);


/**
 * @param {Object} state
 * @param {String} sheetId
 * @param {Object} sheetMatrix
 */
export const withTeaser = createCachedSelector(
  nthArg(1),
  nthArg(2),
  getCellTeaserDescriptor,
  (
    sheetId,
    matrix,
    { column: teaserColumn, row: teaserRow, } = {},
  ) => {
    const teaserCellAbsolutePath = teaserRow &&
      teaserColumn &&
      matrix[teaserRow][teaserColumn].absolutePath ?
      matrix[teaserRow][teaserColumn].absolutePath :
      [];

    return matrix.map((row) => {
      // TODO - find a more idiomatic way to maintain referential equality for unmutated rows
      let mutatedRow = false;

      const newRow = row.map((cell) => {
        let _cell = cell;

        if (
          teaserCellAbsolutePath.length > 0 &&
          equals(cell.absolutePath, teaserCellAbsolutePath)
        ) {
          mutatedRow = true;
          // TODO - use assoc
          _cell = { ..._cell, teaserNodeView: true, };
        }

        return _cell;
      });

      return mutatedRow ? newRow : row;
    });
  }
)(
  nthArg(1)
);


/**
 * @param {Object} state
 * @param {String} sheetId
 * @param {Object} sheetMatrix
 */
export const withEnhanced = createCachedSelector(
  nthArg(1),
  nthArg(2),
  getEnhancedCells,
  (
    sheetId,
    matrix,
    enhancedCells,
  ) => {
    // TODO - is there a more idiomatic function than reduce?  that presumably takes matrix as the last arg, not enhancedCells
    return enhancedCells
      .reduce((matrixWithEnhancedCells, { sheetId: enhancedSheetId, column, row, }) => (
        enhancedSheetId === sheetId ?
          updateInMatrix(column, row, assoc('enhanceView', true), matrixWithEnhancedCells) :
          matrixWithEnhancedCells
      ), matrix);
  }
)(
  nthArg(1)
);


/**
 * @param {Object} state
 * @param {String} sheetId
 * @param {Object} graphFragment
 */
export const getSheetMatrix = pipe(
  (state, sheetId, graphFragment) => ({
    state,
    sheetId,
    graphFragment,
    tables: getSheetTables(state, sheetId),
  }),
  ({ state, sheetId, graphFragment, tables, }) => ({
    state,
    sheetId,
    graphFragment,
    sheetMatrix: tables2SheetMatrix(state, sheetId, tables),
  }),
  ({ state, sheetId, graphFragment, sheetMatrix, }) => ({
    // TODO - return graphPathMap
    // state, sheetId, ...materializeSheetMatrix(sheetId, graphFragment, sheetMatrix),
    state,
    sheetId,
    sheetMatrix: materializeSheetMatrix(sheetId, graphFragment, sheetMatrix),
  }),
  ({ state, sheetId, sheetMatrix, }) => ({
    state,
    sheetId,
    sheetMatrix: withFocus(state, sheetId, sheetMatrix),
  }),
  ({ state, sheetId, sheetMatrix, }) => ({
    state,
    sheetId,
    sheetMatrix: withTeaser(state, sheetId, sheetMatrix),
  }),
  ({ state, sheetId, sheetMatrix, }) => (
    withEnhanced(state, sheetId, sheetMatrix)
  )
);


/**
 * constants
 */
export const ADD_SHEET = 'ADD_SHEET';
export const REMOVE_SHEET = 'REMOVE_SHEET';
export const INCREASE_SHEET_MAX_COLUMN = 'INCREASE_SHEET_MAX_COLUMN';
export const INCREASE_SHEET_MAX_ROW = 'INCREASE_SHEET_MAX_ROW';


/**
 * action creators
 */
export const addSheet = (sheetId, maxColumn, maxRow, tables = []) =>
  ({ type: ADD_SHEET, sheetId, maxColumn, maxRow, tables, });
export const removeSheet = (sheetId) =>
  ({ type: REMOVE_SHEET, sheetId, });
export const increaseSheetMaxColumn = (sheetId) =>
  ({ type: INCREASE_SHEET_MAX_COLUMN, sheetId, });
export const increaseSheetMaxRow = (sheetId) =>
  ({ type: INCREASE_SHEET_MAX_ROW, sheetId, });


/**
 * reducer
 */
export default (
  state = {},
  action
) => {
  if (action.type === ADD_SHEET) {
    const { maxColumn, maxRow, tables, } = action;

    return {
      ...state,
      [action.sheetId]: createSheet(maxColumn, maxRow, tables),
    };
  } else if (action.type === REMOVE_SHEET) {
    // TODO - remove nested sheets

    return omit([action.sheetId], state);
  } else if (action.type === INCREASE_SHEET_MAX_COLUMN) {
    return {
      ...state,
      [action.sheetId]: {
        ...state[action.sheetId],
        maxColumn: state[action.sheetId].maxColumn + 1,
      },
    };
  } else if (action.type === INCREASE_SHEET_MAX_ROW) {
    return {
      ...state,
      [action.sheetId]: {
        ...state[action.sheetId],
        maxRow: state[action.sheetId].maxRow + 1,
      },
    };
  }

  return state;
};
