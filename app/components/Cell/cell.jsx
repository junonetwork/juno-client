/* eslint-disable jsx-a11y/click-events-have-key-events */
import React                   from 'react';
import {}                      from 'prop-types';
import CellValue               from '../CellValue';
import                              './style.scss';


const camel2Kebab = (str) => str.replace(/([A-Z])/g, (g) => `-${g[0].toLowerCase()}`);


const Cell = ({
  column, row, type, value, cellLength, hotKeys, focusView,
  onClick,
}) => (
  <td
    className={`cell ${camel2Kebab(type)} ${focusView ? 'focus' : ''}`}
    role="gridcell"
    onClick={onClick}
    {...hotKeys}
  >
    <div className="cell-body">
      <CellValue
        type="atom"
        value={value}
        cellLength={cellLength}
        pending={false}
      />
    </div>
  </td>
);


Cell.propTypes = {};

export default Cell;
