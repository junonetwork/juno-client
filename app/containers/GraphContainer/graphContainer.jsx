/* eslint-disable jsx-a11y/no-noninteractive-tabindex */
import React                      from 'react';
import {
  compose,
  setDisplayName,
  withHandlers,
}                                 from 'recompose';
import ContainerDimensions        from 'react-container-dimensions';
import Graph                      from '../../components/Graph';
import mapPropsStream             from '../../falcor/mapPropsStream';
import {
  withGraphLayoutStream,
}                                 from '../../hoc/withGraphLayout';
import store                      from '../../redux/store';
import throttle                   from '../../utils/throttleAnimationFrame';
import {
  addCollection2Graph,
} from '../../redux/modules/graphs';
import {
  teaseGraphNode,
  clearTeaser,
}                                 from '../../redux/modules/teaser';
import                                 './style.scss';

const throttledTeaseGraphNode = throttle((graphId, absolutePath) => (
  store.dispatch(teaseGraphNode(graphId, absolutePath))
));
const throttledClearTeaser = throttle(() => (
  store.dispatch(clearTeaser())
));


export default compose(
  setDisplayName('GraphContainer'),
  (BaseComponent) => (props) => (
    <div
      className="graph-window"
      tabIndex="0"
    >
      <ContainerDimensions>
        {
          ({ top, right, bottom, left, width, height }) => (
            <BaseComponent
              {...props}
              top={top}
              right={right}
              bottom={bottom}
              left={left}
              width={width}
              height={height}
            />
          )
        }
      </ContainerDimensions>
    </div>
  ),
  withHandlers({
    onNodeMouseEnter: () => throttledTeaseGraphNode,
    onNodeMouseLeave: () => throttledClearTeaser,
    onGraphDrop: ({ graphId }) => () => {
      store.dispatch(addCollection2Graph(graphId));
    },
  }),
  mapPropsStream(withGraphLayoutStream)
)(Graph);
