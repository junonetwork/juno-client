import {
  nthArg,
  omit,
  range,
}                                    from 'ramda';
import createCachedSelector          from 're-reselect';
import {
  getTableIds,
  getTableCells,
}                                    from './tables';
import {
  getCellFocusDescriptor,
}                                    from './focus';
import {
  createEmpty,
}                                    from '../../utils/cell';
import {
  updateInMatrix,
  setRowInMatrix,
}                                    from '../../utils/table';
import {
  arraySingleDepthEqualitySelector,
}                                    from '../../utils/selectors';


/**
 * utils
 */
const createSheet = (maxColumn, maxRow, tables) =>
  ({ maxColumn, maxRow, tables });


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
  (_, sheetId) => sheetId
);


/**
 * @param {Object} state
 * @param {String} sheetId
 */
export const getSheetTables = createCachedSelector(
  (state, sheetId) => getTableIds(state, sheetId)
    .reduce((tables, tableId) => {
      tables.push(getTableCells(state, sheetId, tableId));
      return tables;
    }, []),
  (cells) => cells
)(
  (_, sheetId) => sheetId,
  {
    selectorCreator: arraySingleDepthEqualitySelector,
  }
);


/**
 * @param {Object} state
 * @param {String} sheetId
 */
export const getSheetMatrixWithoutViewState = createCachedSelector(
  nthArg(1),
  getSheetTables,
  createEmptySheet,
  (sheetId, tables, emptySheetMatrix) => tables.reduce(
    (sheetMatrix, tableMatrix) => (
      tableMatrix
        .slice(0, Math.max(sheetMatrix.length - tableMatrix[0][0].row, 0))
        .reduce((_sheetMatrix, tableRow, idx) => (
          setRowInMatrix(
            tableMatrix[0][0].column,
            tableMatrix[0][0].row + idx,
            tableRow,
            _sheetMatrix)
        ), sheetMatrix)
    ),
    emptySheetMatrix
  )
)(
  (_, sheetId) => sheetId
);


/**
 * @param {Object} state
 * @param {String} sheetId
 */
export const getSheetMatrix = createCachedSelector(
  nthArg(1),
  getSheetMatrixWithoutViewState,
  getCellFocusDescriptor,
  (
    sheetId,
    matrix,
    cellFocusDescriptor
  ) => {
    if (cellFocusDescriptor && cellFocusDescriptor.sheetId === sheetId) {
      return updateInMatrix(
        cellFocusDescriptor.column,
        cellFocusDescriptor.row,
        (cell) => ({ ...cell, focusView: true }),
        matrix
      );
    }

    return matrix;
  }
)(
  (_, sheetId) => sheetId
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
  ({ type: ADD_SHEET, sheetId, maxColumn, maxRow, tables });
export const removeSheet = (sheetId) =>
  ({ type: REMOVE_SHEET, sheetId });
export const increaseSheetMaxColumn = (sheetId) =>
  ({ type: INCREASE_SHEET_MAX_COLUMN, sheetId });
export const increaseSheetMaxRow = (sheetId) =>
  ({ type: INCREASE_SHEET_MAX_ROW, sheetId });


/**
 * reducer
 */
export default (
  state = {},
  action
) => {
  if (action.type === ADD_SHEET) {
    const { maxColumn, maxRow, tables } = action;

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
