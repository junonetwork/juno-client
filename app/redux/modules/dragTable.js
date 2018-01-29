import {
  batchActions,
}                              from 'redux-batched-actions';
import {
  getTableCells, moveTable,
}                              from './tables';
import {
  getCellOffsetFromTable,
}                              from '../../utils/sheet';
import {
  makeCellActive,
}                              from './active';


/**
 * selectors
 */
export const getDragTableFrom = (state) => state.dragTable.from;
export const getDragTableTo = (state) => state.dragTable.to;
export const canDropTable = () => false;


/**
 * constants
 */
export const START_DRAG_TABLE = 'START_DRAG_TABLE';
export const DRAG_TABLE = 'DRAG_TABLE';
export const DROP_TABLE = 'DROP_TABLE';
export const CANCEL_DRAG_TABLE = 'CANCEL_DRAG_TABLE';


/**
 * action creators
 */
export const startDragTable = (sheetId, tableId, column, row) => ({
  type: START_DRAG_TABLE, sheetId, tableId, column, row,
});
export const dragTable = (sheetId, column, row) => ({
  type: DRAG_TABLE, sheetId, column, row,
});
export const dropTable = () => (dispatch, getState) => {
  // TODO - move active cell to drop location
  const state = getState();
  const {
    sheetId: fromSheetId, column: fromColumn, row: fromRow, tableId: fromTableId,
  } = getDragTableFrom(state);
  const { sheetId: toSheetId, column: toColumn, row: toRow, } = getDragTableTo(state);
  const fromTable = getTableCells(state, fromSheetId, fromTableId).table;
  const [xOffset, yOffset] = getCellOffsetFromTable(fromColumn, fromRow, fromTable);
  const toTableXOrigin = Math.max(toColumn - xOffset, 0);
  const toTableYOrigin = Math.max(toRow - yOffset, 0);

  return dispatch(
    batchActions([
      { type: DROP_TABLE, },
      moveTable(fromTableId, fromSheetId, toSheetId, toTableXOrigin, toTableYOrigin),
      makeCellActive(toSheetId, toColumn, toRow),
    ])
  );
};
export const cancelDragTable = () => ({
  type: CANCEL_DRAG_TABLE,
});


/**
 * reducer
 */
export default (
  state = {},
  action
) => {
  if (action.type === START_DRAG_TABLE) {
    return {
      table: action.table,
      from: {
        sheetId: action.sheetId,
        tableId: action.tableId,
        column: action.column,
        row: action.row,
      },
    };
  } else if (action.type === DRAG_TABLE) {
    // prevent DRAG_TABLE from firing multiple times
    if (
      state.to &&
      state.to.sheetId === action.sheetId &&
      state.to.column === action.column &&
      state.to.row === action.row
    ) {
      return state;
    }

    return {
      ...state,
      to: {
        sheetId: action.sheetId,
        column: action.column,
        row: action.row,
      },
    };
  } else if (action.type === DROP_TABLE) {
    return {};
  } else if (action.type === CANCEL_DRAG_TABLE) {
    return {};
  }

  return state;
};
