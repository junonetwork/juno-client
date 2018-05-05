import {
  batchActions,
} from 'redux-batched-actions';
import {
  getTable,
  addValueCollectionTable,
  moveTable,
} from './tables';
import {
  getTableAddress,
} from './sheets';
import {
  setFocus,
  cellId,
} from './focus';
import multimethod from '../../utils/multimethod';
import {
  generateTableId,
} from '../../utils/table';
import {
  rangeLength,
} from '../../utils/falcor';
import {
  formatAddress,
  destructureAddress,
} from '../../utils/cell';


const MIN_TABLE_YLENGTH = 4;


/**
 * utils
 */
export const isLegalDrop = (
  xLength, yLength, toTableXOrigin, toTableYOrigin, tables
) => (
  tables.reduce((isLegal, table) => {
    const tableXMin = table[0][0].column;
    const tableXMax = table[0][0].column + (table[0].length - 1);
    const tableYMin = table[0][0].row;
    const tableYMax = table[0][0].row + (table.length - 1);

    return isLegal && (
      ((toTableXOrigin + xLength) - 1) < tableXMin ||
      toTableXOrigin > tableXMax ||
      ((toTableYOrigin + yLength) - 1) < tableYMin ||
      toTableYOrigin > tableYMax
    );
  }, true)
);


/**
 * selectors
 */
export const getDragTableId = (state) => state.dragTable.tableId;
export const getDragTableCellType = (state) => state.dragTable.cellType;
export const getDragTableCellLength = (state) => state.dragTable.cellLength;
export const getDragTableAbsolutePath = (state) => state.dragTable.absolutePath;
export const getDragTableValueType = (state) => state.dragTable.valueType;
export const getDragTableFrom = (state) => state.dragTable.from;
export const getDragTableTo = (state) => state.dragTable.to;
// NOTE - xOffset/yOffset might not be necessary if only collection cells can move a table
export const getDragTable = multimethod(
  getDragTableCellType,
  [
    'object', (
      state, fromSheetId, dragTableId, fromColumn, fromRow, toColumn, toRow
    ) => ({
      xLength: getDragTableValueType(state) === 'ref' ? 2 : 1,
      yLength: Math.min(getDragTableCellLength(state) + 1, MIN_TABLE_YLENGTH),
      xOffset: 0,
      yOffset: 0,
      toTableXOrigin: toColumn,
      toTableYOrigin: toRow,
    }),
  ],
  (state, fromSheetId, dragTableId, fromColumn, fromRow, toColumn, toRow) => {
    const {
      column: collectionColumn, row: collectionRow,
    } = destructureAddress(getTableAddress(state, fromSheetId, dragTableId));
    const { x: xLength, y: yLength } = getTableDimensions(state, dragTableId);
    const xOffset = fromColumn - collectionColumn;
    const yOffset = fromRow - collectionRow;

    return {
      xLength,
      yLength,
      xOffset,
      yOffset,
      toTableXOrigin: Math.max(toColumn - xOffset, 0),
      toTableYOrigin: Math.max(toRow - yOffset, 0),
    };
  }
);

export const getTableDimensions = (state, tableId) => {
  const table = getTable(state, tableId);
  return {
    x: table.predicates.length + 1,
    y: table.indices.reduce((length, rangeKey) => length + rangeLength(rangeKey), 1),
  };
};

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
export const startDragTable = (
  sheetId, tableId, cellType, column, row, absolutePath, cellLength, valueType
) => ({
  type: START_DRAG_TABLE, sheetId, tableId, cellType, column, row,
  absolutePath, cellLength, valueType,
});
export const dragTable = (sheetId, column, row) => ({
  type: DRAG_TABLE, sheetId, column, row,
});
const getDropTableAction = multimethod(
  getDragTableCellType,
  [
    'object', (state) => {
      const dragTableId = getDragTableId(state);
      const { sheetId: toSheetId, column: toColumn, row: toRow } = getDragTableTo(state);
      const { repository, type } = getTable(state, dragTableId);
      const valueType = getDragTableValueType(state);

      return batchActions([
        { type: DROP_TABLE },
        addValueCollectionTable(
          toSheetId,
          generateTableId(),
          formatAddress(toSheetId, toColumn, toRow),
          getDragTableAbsolutePath(state),
          valueType === 'ref' ? ['skos:prefLabel'] : [],
          [{ to: Math.min(getDragTableCellLength(state) - 1, MIN_TABLE_YLENGTH - 2) }],
          repository,
          type
        ),
        setFocus(cellId(toSheetId, toColumn, toRow)),
      ], 'DROP_TABLE');
    },
  ],
  (state) => {
    const dragTableId = getDragTableId(state);
    const {
      sheetId: fromSheetId, column: fromColumn, row: fromRow,
    } = getDragTableFrom(state);
    const { sheetId: toSheetId, column: toColumn, row: toRow } = getDragTableTo(state);
    const { toTableXOrigin, toTableYOrigin } = getDragTable(
      state, fromSheetId, dragTableId, fromColumn, fromRow, toColumn, toRow,
    );

    return batchActions([
      { type: DROP_TABLE },
      moveTable(dragTableId, fromSheetId, toSheetId, toTableXOrigin, toTableYOrigin),
      setFocus(cellId(toSheetId, toColumn, toRow)),
    ], 'DROP_TABLE');
  }
);

export const dropTable = () => (dispatch, getState) => (
  dispatch(getDropTableAction(getState()))
);

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
      cellType: action.cellType,
      tableId: action.tableId,
      absolutePath: action.absolutePath,
      cellLength: action.cellLength,
      valueType: action.valueType,
      from: {
        sheetId: action.sheetId,
        column: action.column,
        row: action.row,
      },
      to: {
        sheetId: action.sheetId,
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

    // race condition: when moving table rapidly, DRAG_TABLE can fire before START_DRAG_TABLE
    if (!state.from) {
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
