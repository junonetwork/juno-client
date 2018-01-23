import React                  from 'react';
import ContainerDimensions    from 'react-container-dimensions';


export default (BaseComponent) => (props) => (
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
);
