/* eslint-disable arrow-body-style */
import {
  nthArg,
  omit,
  range,
  assoc,
  pipe,
  map,
  contains,
  reject,
  equals,
  pathOr,
  find,
  propEq,
}                                    from 'ramda';
import createCachedSelector          from 're-reselect';
import {
  getTableCells,
  ADD_SEARCH_COLLECTION_TABLE,
  REMOVE_TABLE,
}                                    from './tables';
import {
  getCellActiveDescriptor,
}                                    from './active';
import {
  getCellTeaserDescriptor,
}                                    from './teaser';
import {
  getCellInput,
}                                    from './cellInput';
import {
  getDragTableFrom,
  getDragTableTo,
}                                    from './dragTable';
import {
  materializeSearchCollection,
  materializeIndex,
  materializePredicate,
  materializeObject,
  createEmpty,
}                                    from '../../utils/cell';
import {
  setRowInMatrix,
  updateInMatrix,
}                                    from '../../utils/table';
import {
  getCellOffsetFromTable,
  isLegalDrop,
}                                    from '../../utils/sheet';
import {
  arraySingleDepthEqualitySelector,
}                                    from '../../utils/selectors';
import {
  getEnhancedCells,
}                                    from './enhanced';


/**
 * utils
 */
const createSheet = (maxColumn, maxRow) =>
  ({ maxColumn, maxRow, tables: [], });
// TODO - what is a safe way to serialize path?  keys can have any url safe character, including '/' and curie special character ':'
// https://perishablepress.com/stop-using-unsafe-characters-in-urls/
export const path2Key = (path) => path.join('|');

const addPathToPathMap = (absolutePath, column, row, graphPathMap) => {
  if (!absolutePath) {
    return graphPathMap;
  } else if (graphPathMap[path2Key(absolutePath)]) {
    graphPathMap[path2Key(absolutePath)]
      .push([column, row]);

    return graphPathMap;
  }

  graphPathMap[path2Key(absolutePath)] = [[column, row]]; // eslint-disable-line no-param-reassign

  return graphPathMap;
};


/**
 * selectors
 */
export const getSheet = (state, sheetId) => state.sheets[sheetId];
export const getSheetMaxColumn = (state, sheetId) => state.sheets[sheetId].maxColumn;
export const getSheetMaxRow = (state, sheetId) => state.sheets[sheetId].maxRow;
export const getSheetTableIds = (state, sheetId) => state.sheets[sheetId].tables;


/**
 * @param {Object} state
 * @param {String} sheetId
 */
export const createEmptySheet = createCachedSelector(
  nthArg(1),
  getSheetMaxColumn,
  getSheetMaxRow,
  (sheetId, maxColumn = 0, maxRow = 0) => (
    // TODO - b/c is 0-indexed, should be maxRow, not maxRow + 1
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
    getSheetTableIds(state, sheetId)
      .map((tableId) => getTableCells(state, sheetId, tableId))
  ),
  (tables) => {
    // console.log('getSheetTables');

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
  ({ json: graphJSON, }, sheetMatrix) => {
    // console.log('materializeSheetMatrix');

    let graphPathMap = {};
    const materializedSheetMatrix = sheetMatrix
      .map((row) => (
        row.map((cell) => {
          if (cell.type === 'searchCollection') {
            return materializeSearchCollection(cell, graphJSON, sheetMatrix);
          } else if (cell.type === 'index') {
            const materializedCell = materializeIndex(cell, graphJSON, sheetMatrix);
            graphPathMap = addPathToPathMap(
              materializedCell.absolutePath,
              materializedCell.column,
              materializedCell.row,
              graphPathMap
            );
            return materializedCell;
          } else if (cell.type === 'predicate') {
            return materializePredicate(cell, graphJSON, sheetMatrix);
          } else if (cell.type === 'object') {
            const materializedCell = materializeObject(cell, graphJSON, sheetMatrix);
            graphPathMap = addPathToPathMap(
              materializedCell.absolutePath,
              materializedCell.column,
              materializedCell.row,
              graphPathMap
            );

            return materializedCell;
          } else if (cell.type === 'empty') {
            return cell;
          }

          throw new Error('tried to get path for unknown cell type', cell.type);
        })
      ));

    return { graphPathMap, matrix: materializedSheetMatrix, hints: {}, };
  }
)(
  nthArg(0)
);


/**
 * @param {Object} state
 * @param {String} sheetId
 * @param {Object} sheetMatrix
 */
export const withCellInput = createCachedSelector(
  nthArg(1),
  nthArg(2),
  getCellInput,
  (
    sheetId,
    matrix,
    { sheetId: inputSheetId, column, row, value, },
  ) => {
    if (value === undefined || sheetId !== inputSheetId) {
      return matrix;
    }

    return updateInMatrix(
      column,
      row,
      assoc('cellInput', value),
      matrix
    );
  }
)(
  nthArg(1)
);


/**
 * @param {Object} state
 * @param {String} sheetId
 * @param {Object} hints
 * @param {Object} sheetMatrix
 */
export const withActive = createCachedSelector(
  nthArg(1),
  nthArg(2),
  nthArg(3),
  getCellActiveDescriptor,
  (
    sheetId,
    hints,
    matrix,
    cellActiveDescriptor
  ) => {
    if (
      !cellActiveDescriptor ||
      cellActiveDescriptor.sheetId !== sheetId
    ) {
      return { matrix, hints, };
    }

    const { column: activeColumn, row: activeRow, } = cellActiveDescriptor;

    return {
      matrix: updateInMatrix(activeColumn, activeRow, assoc('activeView', true), matrix),
      hints: {
        ...hints,
        activeAbsolutePath: matrix[activeRow][activeColumn].absolutePath,
      },
    };
  }
)(
  nthArg(1)
);


/**
 * @param {Object} state
 * @param {String} sheetId
 * @param {Object} hints
 * @param {Object} sheetMatrix
 */
export const withTeaser = createCachedSelector(
  nthArg(1),
  nthArg(2),
  nthArg(3),
  getCellTeaserDescriptor,
  (
    sheetId,
    hints,
    matrix,
    cellTeaserDescriptor
  ) => {
    if (
      !cellTeaserDescriptor ||
      cellTeaserDescriptor.sheetId !== sheetId
    ) {
      return { matrix, hints, };
    }

    const { column: teaserColumn, row: teaserRow, } = cellTeaserDescriptor;

    return {
      matrix: updateInMatrix(teaserColumn, teaserRow, assoc('teaserView', true), matrix),
      hints: {
        ...hints,
        teaserAbsolutePath: matrix[teaserRow][teaserColumn].absolutePath,
      },
    };
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
    // TODO - if sheetId doesn't match, just skip
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
 * @param {Object} sheetMatrix
 */
export const withDropTable = createCachedSelector(
  nthArg(1),
  nthArg(2),
  getSheetTables,
  getDragTableFrom,
  getDragTableTo,
  (
    sheetId,
    matrix,
    tables,
    dragFrom,
    dragTo
  ) => {
    if (
      !dragTo ||
      !dragFrom ||
      dragTo.sheetId !== sheetId
    ) {
      return { matrix, canDrop: false, };
    }

    const fromTable = find(propEq('id', dragFrom.tableId), tables).table;
    const { column: fromColumn, row: fromRow, tableId: fromId, } = dragFrom;
    const [xOffset, yOffset] = getCellOffsetFromTable(fromColumn, fromRow, fromTable);
    const toTableXOrigin = Math.max(dragTo.column - xOffset, 0);
    const toTableYOrigin = Math.max(dragTo.row - yOffset, 0);

    const canDrop = isLegalDrop(
      toTableXOrigin,
      toTableYOrigin,
      fromTable,
      reject(propEq('id', fromId), tables)
    );

    return pipe(
      (_matrix) => (
        fromTable
          .filter((_, rowIdx) => toTableYOrigin + rowIdx < _matrix.length)
          .reduce((matrixWithDropTable, row, rowIdx) => (
            row
              .filter((_, columnIdx) => toTableXOrigin + columnIdx < _matrix[0].length)
              .reduce((_matrixWithDropTable, _, columnIdx) => (
                updateInMatrix(
                  toTableXOrigin + columnIdx,
                  toTableYOrigin + rowIdx,
                  canDrop ?
                    assoc('dropTableView', true) :
                    assoc('illegalDropTableView', true),
                  _matrixWithDropTable
                )
              ), matrixWithDropTable)
          ), _matrix)
      ),
      (_matrix) => updateInMatrix(
        fromColumn,
        fromRow,
        canDrop ?
          assoc('dragTableView', true) :
          assoc('illegalDragTableView', true),
        _matrix
      ),
      (_matrix) => updateInMatrix(
        toTableXOrigin + xOffset,
        toTableYOrigin + yOffset,
        canDrop ?
          assoc('dragTableView', true) :
          assoc('illegalDragTableView', true),
        _matrix
      ),
      (_matrix) => ({
        matrix: _matrix,
        canDrop,
      })
    )(matrix);
  }
)(
  nthArg(1)
);


/**
 * @param {Object} state
 * @param {String} sheetId
 * @param {Object} graphFragment
 * TODO - use a closure rather than pipe all args through
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
    matrix: tables2SheetMatrix(state, sheetId, tables),
  }),
  ({ state, sheetId, graphFragment, matrix, }) => ({
    state,
    sheetId,
    ...materializeSheetMatrix(sheetId, graphFragment, matrix),
  }),
  ({ state, sheetId, graphPathMap, hints, matrix, }) => ({
    state,
    sheetId,
    graphPathMap,
    ...withActive(state, sheetId, hints, matrix),
  }),
  ({ state, sheetId, graphPathMap, hints, matrix, }) => ({
    state,
    sheetId,
    graphPathMap,
    ...withTeaser(state, sheetId, hints, matrix),
  }),
  ({ state, sheetId, graphPathMap, hints, matrix, }) => ({
    state,
    sheetId,
    graphPathMap,
    hints,
    matrix: withEnhanced(state, sheetId, matrix),
  }),
  ({ state, sheetId, graphPathMap, hints, matrix, }) => ({
    state,
    sheetId,
    graphPathMap,
    hints,
    ...withDropTable(state, sheetId, matrix),
  }),
  ({ state, sheetId, graphPathMap, hints, canDrop, matrix, }) => ({
    graphPathMap,
    hints,
    canDrop,
    matrix: withCellInput(state, sheetId, matrix),
  })
);


/**
 * @param {String} sheetId
 * @param {Array} activeAbsolutePath
 * @param {Object} graphPathMap
 * @param {Object} sheetMatrix
 */
export const withActiveHint = createCachedSelector(
  nthArg(0),
  nthArg(1),
  nthArg(2),
  nthArg(3),
  (sheetId, activeAbsolutePath, graphPathMap, matrix) => {
    if (!activeAbsolutePath) {
      return matrix;
    }

    return pathOr([], [path2Key(activeAbsolutePath)], graphPathMap)
      .reduce((_matrix, [column, row]) => (
        updateInMatrix(column, row, assoc('activeHint', true), _matrix)
      ), matrix);
  }
)(
  nthArg(0)
);


/**
 * @param {String} sheetId
 * @param {Array} teaserAbsolutePath
 * @param {Object} graphPathMap
 * @param {Object} sheetMatrix
 */
export const withTeaserHint = createCachedSelector(
  nthArg(0),
  nthArg(1),
  nthArg(2),
  nthArg(3),
  (sheetId, teaserAbsolutePath, graphPathMap, matrix) => {
    if (!teaserAbsolutePath) {
      return matrix;
    }

    return pathOr([], [path2Key(teaserAbsolutePath)], graphPathMap)
      .reduce((_matrix, [column, row]) => (
        updateInMatrix(column, row, assoc('teaserHint', true), _matrix)
      ), matrix);
  }
)(
  nthArg(0)
);


/**
 * @param {String} sheetId
 * @param {Object} graphPathMap
 * @param {Object} hints
 * @param {Object} sheetMatrix
 */
export const withHints = (
  sheetId,
  graphPathMap,
  { activeAbsolutePath, teaserAbsolutePath, },
  matrix
) => pipe(
  (_matrix) => withActiveHint(sheetId, activeAbsolutePath, graphPathMap, _matrix),
  (_matrix) => withTeaserHint(sheetId, teaserAbsolutePath, graphPathMap, _matrix)
)(matrix);


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
export const addSheet = (sheetId, maxColumn, maxRow) =>
  ({ type: ADD_SHEET, sheetId, maxColumn, maxRow, });
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
    const { maxColumn, maxRow, } = action;

    return {
      ...state,
      [action.sheetId]: createSheet(maxColumn, maxRow),
    };
  } else if (action.type === REMOVE_SHEET) {
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
  } else if (action.type === ADD_SEARCH_COLLECTION_TABLE) {
    return {
      ...state,
      [action.sheetId]: {
        ...state[action.sheetId],
        tables: [...state[action.sheetId].tables, action.tableId],
      },
    };
  } else if (action.type === REMOVE_TABLE) {
    // TODO - remove nested tables
    return map((sheet) => ({
      ...sheet,
      tables: contains(action.tableId, sheet.tables) ?
        reject(equals(action.tableId), sheet.tables) :
        sheet.tables,
    }), state);
  }

  return state;
};
