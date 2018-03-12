import React                   from 'react';
import {
  string,
  shape,
}                              from 'prop-types';
import                              './style.scss';


const Input = ({
  value, refNode, style, onKeyDown, onKeyPress
}) => (
  <div
    tabIndex="0"
    className="input"
    onKeyDown={onKeyDown}
    onKeyPress={onKeyPress}
    style={style}
    ref={refNode}
  >
    {value}
  </div>
);


Input.propTypes = {
  value: string.isRequired,
  style: shape(),
  onKeyDown: func,
  onKeyPress: func,
  refNode: func
};

Input.defaultProps = {
  refNode: () => {},
  style: {}
};


export default Input;
