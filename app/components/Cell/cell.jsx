/* eslint-disable jsx-a11y/click-events-have-key-events */
import React                   from 'react';
import {}                      from 'prop-types';
import Input                   from '../Input';
import CellValue               from '../CellValue';
import                              './style.scss';


const camel2Kebab = (str) => str.replace(/([A-Z])/g, (g) => `-${g[0].toLowerCase()}`);


const Cell = ({
  type, value, cellLength, cellInput,
  hotKeys, focusView, enhanceView, focusNodeView, teaserNodeView,
  onClick, onMouseEnter, onKeyPress,
}) => (
  <td
    className={`cell ${camel2Kebab(type)} ${focusView ? 'focus' : ''} ${focusNodeView ? 'node-focus' : ''} ${teaserNodeView ? 'node-tease' : ''} ${enhanceView ? 'node-enhance' : ''}`}
    role="gridcell"
    onClick={onClick}
    onMouseEnter={onMouseEnter}
    onKeyPress={onKeyPress}
    {...hotKeys}
  >
    <div className="cell-body">
      {
        cellInput ?
          <Input
            value={cellInput}
          /> :
          <CellValue
            type="atom"
            value={value}
            cellLength={cellLength}
            pending={false}
          />
      }
    </div>
  </td>
);


Cell.propTypes = {};

export default Cell;
