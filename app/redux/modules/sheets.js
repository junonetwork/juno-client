import {
  omit,
  range,
}                           from 'ramda';
import {
  add,
  from,
  to,
}                           from 'base26';
import {
  getTableIds,
  getTableCells,
}                           from './tables';
import {
  formatAddress,
  createEmpty,
}                           from '../../utils/cell';


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
export const createEmptySheet = (state, sheetId) =>
  range(1, getSheetMaxRow(state, sheetId) + 1)
    .map((row) =>
      range(1, from(getSheetMaxColumn(state, sheetId)) + 1)
        .map((numericColumn) =>
          createEmpty(formatAddress(to(numericColumn), row), sheetId)
        )
    );

/**
 * @param {Object} state
 * @param {String} sheetId
 */
export const getSheetCells = (state, sheetId) => (
  getTableIds(state, sheetId)
    .reduce(
      (cells, tableId) => Object.assign(cells, getTableCells(state, sheetId, tableId)),
      {}
    )
);


/**
 * @param {Object} state
 * @param {String} sheetId
 */
export const getSheetMatrix = (state, sheetId) => {
  const cells = getSheetCells(state, sheetId);
  console.log('x', cells);

  return createEmptySheet(state, sheetId)
    .map((row) => (
      // TODO - don't map over a row whose cells are all empty [don't appear in cells]
      row.map((emptyCell) => {
        const address = formatAddress(emptyCell.column, emptyCell.row);
        return cells[address] ? cells[address] : emptyCell;
      })
    ));
};


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
        maxColumn: add(state[action.sheetId].maxColumn, 1),
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
