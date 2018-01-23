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
import                                 './style.scss';


export default compose(
  setDisplayName('GraphContainer'),
  (BaseComponent) => (props) => (
    <div
      className="graph-window"
      tabIndex="0"
    >
      <ContainerDimensions>
        {
          ({ top, right, bottom, left, width, height, }) => (
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
    onNodeMouseEnter: () => (id) => {
      console.log('enter', id);
    },
    onNodeMouseLeave: () => (id) => {
      console.log('leave', id);
    },
  }),
  mapPropsStream(withGraphLayoutStream)
)(Graph);
