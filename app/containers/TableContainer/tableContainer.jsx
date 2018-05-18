import {
  compose,
  setDisplayName,
  withHandlers,
  mapProps,
}                          from 'recompose';
import Table               from '../../components/Table';
import {
  navigate,
}                          from '../../redux/modules/navigate';
import {
  teaseCell,
}                          from '../../redux/modules/teaser';
import {
  updateCellValue,
}                          from '../../redux/modules/tables';
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


const throttledTeaseCell = throttle((sheetId, column, row) => (
  store.dispatch(teaseCell(sheetId, column, row))
));
const throttledNavigate = throttle((sheetId, column, row, direction, steps) => (
  store.dispatch(navigate(sheetId, column, row, direction, steps))
));
const throttleDragTable = throttle((sheetId, column, row) => (
  store.dispatch(dragTable(sheetId, column, row))
));


export default compose(
  setDisplayName('TableContainer'),
  withHandlers({
    teaseCell: () => throttledTeaseCell,
    navigate: () => throttledNavigate,
    startDragTable: () => (
      sheetId, tableId, type, column, row, absolutePath, cellLength, valueType
    ) => (
      store.dispatch(startDragTable(
        sheetId, tableId, type, column, row, absolutePath, cellLength, valueType
      ))
    ),
    dragTable: () => throttleDragTable,
    onDropTable: ({ canDrop }) => () => {
      if (canDrop) {
        store.dispatch(dropTable());
      } else {
        store.dispatch(cancelDragTable());
      }
    },
    updateValue: ({ sheetMatrix }) => (sheetId, tableId, type, column, row, value) => (
      store.dispatch(streamAction(updateCellValue(
        sheetId, tableId, type, column, row, value, sheetMatrix
      )))
    ),
  }),
  mapProps(({ canDrop, ...rest }) => rest)
)(Table);
