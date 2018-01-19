/* eslint-disable jsx-a11y/click-events-have-key-events */
import React                   from 'react';
import {}                      from 'prop-types';
import CellValue               from '../CellValue';
import PredicateInput          from '../../containers/PredicateInputContainer';
import IndexInput              from '../../containers/IndexInputContainer';
import                              './style.scss';


const camel2Kebab = (str) => str.replace(/([A-Z])/g, (g) => `-${g[0].toLowerCase()}`);

export const shouldRenderPredicateEnhancedInput = (enhanceView, type, leftCellType) => (
  enhanceView && (
    type === 'predicate' || leftCellType === 'predicate' ||
    leftCellType === 'searchCollection' || leftCellType === 'objectCollection'
  )
);

export const shouldRenderPredicateInput = (focusView, cellInput, type, leftCellType) => (
  focusView && cellInput && (
    type === 'predicate' || leftCellType === 'predicate' ||
    leftCellType === 'searchCollection' || leftCellType === 'objectCollection'
  )
);

export const shouldRenderIndexInput = (enhanceView, type, upCellType) => (
  enhanceView && (
    type === 'index' || upCellType === 'index' ||
    upCellType === 'searchCollection' || upCellType === 'objectCollection'
  )
);


const Cell = ({
  type, sheetId, tableId, column, row, value, cellLength, cellInput,
  leftCellType, leftCellTableId, upCellType, upCellTableId, predicateIdx,
  hotKeys, focusView, enhanceView, focusNodeView, teaserNodeView,
  onClick, onMouseEnter, onKeyPress, updateValue,
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
      shouldRenderPredicateEnhancedInput(enhanceView, type, leftCellType) ?
        <PredicateInput
          value={cellInput}
          sheetId={sheetId}
          type={type}
          tableId={type === 'predicate' ? tableId : leftCellTableId}
          column={column}
          row={row}
          predicateIdx={predicateIdx}
          updateValue={updateValue}
        /> :
      shouldRenderPredicateInput(focusView, cellInput, type, leftCellType) ?
        <PredicateInput
          value={cellInput}
          sheetId={sheetId}
          type={type}
          tableId={type === 'predicate' ? tableId : leftCellTableId}
          column={column}
          row={row}
          predicateIdx={predicateIdx}
          updateValue={updateValue}
        /> :
      shouldRenderIndexInput(enhanceView, type, upCellType) ?
        <IndexInput
          sheetId={sheetId}
          tableId={type === 'index' ? tableId : upCellTableId}
          column={column}
          row={row}
        /> :
      cellInput ?
        <div className="cell-body">
          {cellInput}
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
