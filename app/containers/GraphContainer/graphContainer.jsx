import {
  compose,
  setDisplayName,
  withHandlers,
}                                 from 'recompose';
import Graph                      from '../../components/Graph';
import mapPropsStream             from '../../falcor/mapPropsStream';
import {
  withGraphLayoutStream,
}                                 from '../../hoc/withGraphLayout';
import withContainerDimensions    from '../../hoc/withContainerDimensions';


export default compose(
  setDisplayName('GraphContainer'),
  withContainerDimensions,
  withHandlers({
    onNodeMouseEnter: () => (id) => {
      console.log('enter', id);
    },
    onNodeMouseLeave: () => (id) => {
      console.log('leave', id);
    },
  }),
  mapPropsStream(withGraphLayoutStream)
)(Graph);
