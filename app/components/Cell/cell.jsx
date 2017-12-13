/* eslint-disable jsx-a11y/click-events-have-key-events */
import React                   from 'react';
import {}                      from 'prop-types';
import                              './style.scss';


const camel2Kebab = (str) => str.replace(/([A-Z])/g, (g) => `-${g[0].toLowerCase()}`);


const Cell = ({
  column, row, type, hotKeys, focusView,
  onClick,
}) => (
  <td
    className={`cell ${camel2Kebab(type)} ${focusView ? 'focus' : ''}`}
    role="gridcell"
    onClick={onClick}
    {...hotKeys}
  >
    {type}
  </td>
);


Cell.propTypes = {};

export default Cell;
