/* eslint-disable arrow-body-style */
import {
  nthArg,
  omit,
  range,
  assoc,
  pipe,
  map,
  any,
  reject,
  pathOr,
  prop,
  propEq,
  ifElse,
  identity,
}                                    from 'ramda';
import createCachedSelector          from 're-reselect';
import {
  getTableCells,
  ADD_SEARCH_COLLECTION_TABLE,
  ADD_VALUE_COLLECTION_TABLE,
  REMOVE_TABLE,
  MOVE_TABLE,
}                                    from './tables';
import {
  getFocus,
}                                    from './focus';
import {
  getCellTeaserDescriptor,
}                                    from './teaser';
import {
  getCellInput,
}                                    from './cellInput';
import {
  isLegalDrop,
  getDragTableId,
  getDragTable,
  getDragTableFrom,
  getDragTableTo,
}                                    from './dragTable';
import {
  materializeCell,
}                                    from '../../utils/materializeCell';
import {
  formatAddress,
  createEmpty,
}                                    from '../../utils/cell';
import {
  setRowInMatrix,
  updateInMatrix,
}                                    from '../../utils/table';
import {
  arraySingleDepthEqualitySelector,
}                                    from '../../utils/selectors';
import {
  getEnhancedCells,
}                                    from './enhanced';


/**
 * utils
 */
const createSheet = (maxColumn, maxRow) => ({
  maxColumn, maxRow, tables: [],
});
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
export function getSheetTableDescriptors(state, sheetId) { return state.sheets[sheetId].tables; }


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
    getSheetTableDescriptors(state, sheetId)
      .map(({ id }) => getTableCells(state, sheetId, id))
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
          const materializedCell = materializeCell(cell, graphJSON, sheetMatrix);
          if (cell.type === 'index') {
            graphPathMap = addPathToPathMap(
              materializedCell.absolutePath,
              materializedCell.column,
              materializedCell.row,
              graphPathMap
            );
          } else if (cell.type === 'object') {
            graphPathMap = addPathToPathMap(
              materializedCell.absolutePath,
              materializedCell.column,
              materializedCell.row,
              graphPathMap
            );
          }

          return materializedCell;
        })
      ));

    return { graphPathMap, matrix: materializedSheetMatrix, hints: {} };
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
  getFocus,
  (
    sheetId,
    hints,
    matrix,
    focus
  ) => {
    if (
      !focus ||
      focus.sheetId !== sheetId
    ) {
      return { matrix, hints, };
    }

    const { column: activeColumn, row: activeRow, } = focus;

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
export const withDropTable = (state, sheetId, matrix) => {
  const dragTableId = getDragTableId(state);
  const dragFrom = getDragTableFrom(state);
  const dragTo = getDragTableTo(state);

  if (
    sheetId !== prop('sheetId', dragTo) &&
    sheetId !== prop('sheetId', dragFrom)
  ) {
    return { matrix, canDrop: false };
  }

  const { sheetId: fromSheetId, column: fromColumn, row: fromRow } = dragFrom;
  const { sheetId: toSheetId, column: toColumn, row: toRow } = dragTo;
  const {
    xLength, yLength, xOffset, yOffset, toTableXOrigin, toTableYOrigin,
  } = getDragTable(
    state, fromSheetId, dragTableId, fromColumn, fromRow, toColumn, toRow,
  );

  const canDrop = isLegalDrop(
    xLength,
    yLength,
    toTableXOrigin,
    toTableYOrigin,
    reject(propEq('id', dragTableId), getSheetTables(state, toSheetId))
  );

  return pipe(
    (_matrix) => (
      toSheetId !== sheetId ?
        _matrix :
        // table xLength truncated to fit on sheet
        range(0, Math.min(yLength, _matrix.length - toTableYOrigin))
        // range(0, yLength)
          // truncate dragTable y length to fit sheet
          // TODO - possible to do this w/i range?
          // .filter((_, rowIdx) => )
          // TODO - row === rowIdx?
          .reduce((matrixWithDropTable, rowIdx) => (
            // range(0, toTableXOrigin + columnIdx < _matrix[0].length)
            range(0, Math.min(xLength, _matrix[0].length - toTableXOrigin))
              // truncate dragTable x length to fit sheet
              // .filter((_, columnIdx) => toTableXOrigin + columnIdx < _matrix[0].length)
              .reduce((_matrixWithDropTable, columnIdx) => (
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
    (_matrix) => (
      toSheetId !== sheetId ?
        _matrix :
        updateInMatrix(
          toTableXOrigin + xOffset,
          toTableYOrigin + yOffset,
          canDrop ?
            assoc('dragTableView', true) :
            assoc('illegalDragTableView', true),
          _matrix
        )
    ),
    (_matrix) => (
      fromSheetId !== sheetId ?
        _matrix :
        updateInMatrix(
          fromColumn,
          fromRow,
          canDrop ?
            assoc('dragTableView', true) :
            assoc('illegalDragTableView', true),
          _matrix
        )
    ),
    (_matrix) => ({
      matrix: _matrix,
      canDrop,
    })
  )(matrix);
};


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
  // ({ state, sheetId, graphPathMap, hints, matrix, }) => ({
  //   state,
  //   sheetId,
  //   graphPathMap,
  //   hints,
  //   matrix: withEnhanced(state, sheetId, matrix),
  // }),
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
  /* state = {} */
  state = { 0: createSheet(40, 40) },
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
  } else if (
    action.type === ADD_SEARCH_COLLECTION_TABLE ||
    action.type === ADD_VALUE_COLLECTION_TABLE
  ) {
    return {
      ...state,
      [action.sheetId]: {
        ...state[action.sheetId],
        tables: [
          ...state[action.sheetId].tables,
          { id: action.tableId, address: action.address },
        ],
      },
    };
  } else if (action.type === REMOVE_TABLE) {
    return map((sheet) => ({
      ...sheet,
      tables: any(propEq('id', action.tableId), sheet.tables) ?
        reject(propEq('id', action.tableId), sheet.tables) :
        sheet.tables,
    }), state);
  } else if (action.type === MOVE_TABLE && action.fromSheetId === action.toSheetId) {
    const {
      tableId, fromSheetId, toSheetId, toColumn, toRow,
    } = action;
    return {
      ...state,
      [fromSheetId]: {
        ...state[fromSheetId],
        tables: map(
          ifElse(
            propEq('id', tableId),
            assoc('address', formatAddress(toSheetId, toColumn, toRow)),
            identity
          ),
          state[fromSheetId].tables
        ),
      },
    };
  } else if (action.type === MOVE_TABLE) {
    const {
      tableId, fromSheetId, toSheetId, toColumn, toRow,
    } = action;
    return {
      ...state,
      [fromSheetId]: {
        ...state[fromSheetId],
        tables: reject(
          propEq('id', tableId),
          state[fromSheetId].tables
        ),
      },
      [toSheetId]: {
        ...state[toSheetId],
        tables: [
          ...state[toSheetId].tables,
          {
            id: tableId,
            address: formatAddress(toSheetId, toColumn, toRow),
          },
        ],
      },
    };
  }

  return state;
};
