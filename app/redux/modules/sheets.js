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
  formatAddress,
  createEmpty,
}                                    from '../../utils/cell';
import {
  updateInMatrix,
}                                    from '../../utils/table';
import {
  createSingleDepthEqualitySelector,
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
          .map((numericColumn) =>
            createEmpty(sheetId, formatAddress(numericColumn, row))
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
// TODO - might not want/need to memoize this...
export const getSheetCells = createCachedSelector(
  (state, sheetId) => getTableIds(state, sheetId)
    .reduce(
      (cells, tableId) => Object.assign(cells, getTableCells(state, sheetId, tableId)),
      {}
    ),
  (cells) => cells
)(
  (_, sheetId) => sheetId,
  {
    selectorCreator: createSingleDepthEqualitySelector,
  }
);


/**
 * @param {Object} state
 * @param {String} sheetId
 */
export const getSheetMatrixWithoutViewState = createCachedSelector(
  nthArg(1),
  getSheetCells,
  createEmptySheet,
  (sheetId, cells, emptySheet) => (
    emptySheet.map((row) => (
      // TODO - don't map over a row whose cells are all empty [don't appear in cells]
      // Or rather, what's the most efficient way to merge cells and emptySheet while maintaining reference equality for all cells that haven't updated
      // use setInMatrix
      // or better yet, rewrite getSheetCells to return a matrix and merge the matrix
      row.map((emptyCell) => (
        cells[emptyCell.address] ? cells[emptyCell.address] : emptyCell)
      )
    ))
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
