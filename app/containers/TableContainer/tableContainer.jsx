import {
  prop,
}                          from 'ramda';
import {
  compose,
  setDisplayName,
  withHandlers,
}                          from 'recompose';
import {
  connect,
}                          from 'react-redux';
import mapPropsStream      from '../../falcor/mapPropsStream';
import connectFalcor       from '../../falcor/connect';
import Table               from '../../components/Table';
import {
  getSheetPathSets,
  getSheetMatrix,
}                          from '../../redux/modules/sheets';
import {
  focusCell,
  navigate,
}                          from '../../redux/modules/focus';
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
  actionStreamDispatch,
}                          from '../../redux/store';
import throttle            from '../../utils/throttleAnimationFrame';


export default compose(
  setDisplayName('TableContainer'),
  connect(
    (state, { sheetId, }) => ({
      sheetPaths: getSheetPathSets(state, sheetId),
    }),
  ),
  mapPropsStream(connectFalcor(prop('sheetPaths'))),
  connect(
    (state, { sheetId, graphFragment, }) => ({
      // TODO - just pass graphFragment
      sheetMatrix: getSheetMatrix(state, sheetId, graphFragment.json || {}) || [],
    }),
    (dispatch) => ({
      focusCell: (sheetId, column, row) => dispatch(focusCell(sheetId, column, row)),
      teaseCell: throttle((sheetId, column, row) => dispatch(teaseCell(sheetId, column, row))),
      enhanceCell: (sheetId, column, row) => dispatch(addEnhancedCell(sheetId, column, row)),
      removeEnhanceCell: (sheetId, column, row) => (
        dispatch(removeEnhancedCell(sheetId, column, row))
      ),
      navigate: throttle((sheetId, column, row, direction, steps) => (
        dispatch(navigate(column, row, sheetId, direction, steps))
      )),
      dispatchUpdateValue: (sheetId, column, row, value, graphFragment) => (
        actionStreamDispatch(updateCellValue(sheetId, column, row, value, graphFragment))
      ),
    })
  ),
  withHandlers({
    updateValue: ({ graphFragment, dispatchUpdateValue, }) => (sheetId, column, row, value) => (
      dispatchUpdateValue(sheetId, column, row, value, graphFragment)
    ),
  })
)(Table);
