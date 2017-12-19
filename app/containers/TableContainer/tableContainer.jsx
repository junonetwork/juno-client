import {
  prop,
}                          from 'ramda';
import {
  compose,
  setDisplayName,
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
import throttle            from '../../utils/throttleAnimationFrame';


export default compose(
  setDisplayName('TableContainer'),
  connect(
    (state, { sheetId }) => ({
      sheetPaths: getSheetPathSets(state, sheetId),
    }),
  ),
  mapPropsStream(connectFalcor(prop('sheetPaths'))),
  connect(
    (state, { sheetId, graphFragment }) => ({
      sheetMatrix: getSheetMatrix(state, sheetId, graphFragment.json || {}),
    }),
    (dispatch, { sheetId }) => ({
      focusCell: (column, row) => dispatch(focusCell(sheetId, column, row)), // TODO - add focus to node view
      navigate: throttle((column, row, direction, steps) => (
        dispatch(navigate(column, row, sheetId, direction, steps))
      )),
    })
  )
)(Table);
