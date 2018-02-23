import {
  compose,
  setDisplayName,
  withHandlers,
  mapProps,
}                          from 'recompose';
import Table               from '../../components/Table';
import {
  makeCellActive,
  navigate,
}                          from '../../redux/modules/active';
import {
  teaseCell,
}                          from '../../redux/modules/teaser';
import {
  addEnhancedCell,
  removeEnhancedCell,
}                          from '../../redux/modules/enhanced';
import {
  updateCellValue,
}                          from '../../redux/modules/tables';
import {
  setCellInput,
  clearCellInput,
}                          from '../../redux/modules/cellInput';
import {
  startDragTable,
  dragTable,
  dropTable,
  cancelDragTable,
}                          from '../../redux/modules/dragTable';
import store               from '../../redux/store';
import {
  streamAction,
}                          from '../../redux/actionStream';
import throttle            from '../../utils/throttleAnimationFrame';

const { dispatch, } = store;


const throttledTeaseCell = throttle((sheetId, column, row) => (
  dispatch(teaseCell(sheetId, column, row))
));
const throttledNavigate = throttle((sheetId, column, row, direction, steps) => (
  dispatch(navigate(sheetId, column, row, direction, steps))
));
const throttleDragTable = throttle((sheetId, column, row) => (
  dispatch(dragTable(sheetId, column, row))
));


export default compose(
  setDisplayName('TableContainer'),
  withHandlers({
    teaseCell: () => throttledTeaseCell,
    navigate: () => throttledNavigate,
    makeCellActive: () => (sheetId, column, row) => dispatch(makeCellActive(sheetId, column, row)),
    enhanceCell: () => (sheetId, column, row) => dispatch(addEnhancedCell(sheetId, column, row)),
    removeEnhanceCell: () => (sheetId, column, row) => (
      dispatch(removeEnhancedCell(sheetId, column, row))
    ),
    setCellInput: () => (sheetId, column, row, value) => (
      dispatch(setCellInput(sheetId, column, row, value))
    ),
    clearCellInput: () => (sheetId, column, row) => (
      dispatch(clearCellInput(sheetId, column, row))
    ),
    startDragTable: () => (sheetId, tableId, column, row) => (
      dispatch(startDragTable(sheetId, tableId, column, row))
    ),
    dragTable: () => throttleDragTable,
    endDragTable: ({ canDrop, }) => () => {
      if (canDrop) {
        dispatch(dropTable());
      } else {
        dispatch(cancelDragTable());
      }
    },
    updateValue: ({ sheetMatrix, }) => (sheetId, column, row, value) => (
      dispatch(streamAction(updateCellValue(sheetId, column, row, value, sheetMatrix)))
    ),
  }),
  mapProps(({ canDrop, ...rest }) => rest)
)(Table);
