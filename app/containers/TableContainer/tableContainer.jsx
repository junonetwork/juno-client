import {
  compose,
}                          from 'recompose';
import mapPropsStream      from '../../falcor/mapPropsStream';
import connectFalcor       from '../../falcor/connect';
import Table               from '../../components/Table';


export default compose(
  mapPropsStream(connectFalcor(() => [['app', 'value']])),
)(Table);
