import {
  compose,
  setDisplayName,
  withHandlers,
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
import store, {
  actionStreamDispatch,
}                          from '../../redux/store';
import throttle            from '../../utils/throttleAnimationFrame';

const { dispatch, } = store;


const throttledTeaseCell = throttle((sheetId, column, row) => (
  dispatch(teaseCell(sheetId, column, row))
));
const throttledNavigate = throttle(((sheetId, column, row, direction, steps) => (
  dispatch(navigate(sheetId, column, row, direction, steps))
)));


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
    updateValue: ({ sheetMatrix, }) => (sheetId, column, row, value) => (
      actionStreamDispatch(updateCellValue(sheetId, column, row, value, sheetMatrix))
    ),
  })
)(Table);
