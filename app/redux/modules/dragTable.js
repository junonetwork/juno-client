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
export const END_DRAG_TABLE = 'END_DRAG_TABLE';


/**
 * action creators
 */
export const startDragTable = (sheetId, tableId, column, row) => ({
  type: START_DRAG_TABLE, sheetId, tableId, column, row,
});
export const dragTable = (sheetId, column, row) => ({
  type: DRAG_TABLE, sheetId, column, row,
});
export const endDragTable = () => ({
  type: END_DRAG_TABLE,
});


/**
 * reducer
 */
export default (
  // state = {},
  state = {
    // from: {
    //   sheetId: "0",
    //   tableId: "0-0-0",
    //   column: 3,
    //   row: 3,
    // },
    // to: {
    //   sheetId: '0',
    //   column: 1,
    //   row: 7,
    // },
  },
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
  } else if (action.type === END_DRAG_TABLE) {
    return {};
  }

  return state;
};
