/* eslint-disable jsx-a11y/click-events-have-key-events */
import React                   from 'react';
import {}                      from 'prop-types';
import CellValue               from '../CellValue';
import Input                   from '../Input';
import PredicateInput          from '../../containers/PredicateInputContainer';
import                              './style.scss';


const camel2Kebab = (str) => str.replace(/([A-Z])/g, (g) => `-${g[0].toLowerCase()}`);


const Cell = ({
  type, sheetId, tableId, column, row, value, cellLength, cellInput,
  leftCellType, leftCellTableId, upCellType, upCellTableId, predicateIdx,
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
    {
      enhanceView && (
        type === 'predicate' || leftCellType === 'predicate' ||
        leftCellType === 'searchCollection' || leftCellType === 'objectCollection'
      ) ?
        <PredicateInput
          value={cellInput}
          sheetId={sheetId}
          tableId={type === 'predicate' ? tableId : leftCellTableId}
          column={column}
          row={row}
          predicateIdx={predicateIdx}
        /> :
      cellInput ?
        <div className="cell-body">
          <Input
            value={cellInput}
          />
        </div> :
        <div className="cell-body">
          <CellValue
            type="atom"
            value={value}
            cellLength={cellLength}
            pending={false}
          />
        </div>
    }
  </td>
);


Cell.propTypes = {};

export default Cell;
