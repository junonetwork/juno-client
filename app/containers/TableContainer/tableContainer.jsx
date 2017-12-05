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
  getSheetMatrix,
}                          from '../../redux/modules/sheets';


export default compose(
  setDisplayName('TableContainer'),
  connect(
    (state, { sheetId }) => ({
      sheetMatrix: getSheetMatrix(state, sheetId),
    })
  ),
  mapPropsStream(connectFalcor(() => [['app', 'value']])),
)(Table);
