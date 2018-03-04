/* eslint-disable jsx-a11y/click-events-have-key-events */
import React                   from 'react';
import {}                      from 'prop-types';
import CellValue               from '../CellValue';
import PredicateInput          from '../../containers/PredicateInputContainer';
import IndexInput              from '../../containers/IndexInputContainer';
import                              './style.scss';


const camel2Kebab = (str) => str.replace(/([A-Z])/g, (g) => `-${g[0].toLowerCase()}`);

export const shouldRenderSearchInput = (activeView, enhanceView, cellInput, type) => (
  type === 'searchCollection' &&
  (enhanceView || (activeView && cellInput))
);

export const shouldRenderPredicateInput = (
  activeView, enhanceView, cellInput, type, leftCellType
) => (
  (
    type === 'predicate' || leftCellType === 'predicate' ||
    leftCellType === 'searchCollection' || leftCellType === 'objectCollection'
  ) &&
  (
    (activeView && cellInput) ||
    enhanceView
  )
);

export const shouldRenderIndexInput = (enhanceView, type, upCellType) => (
  enhanceView && (
    type === 'index' || upCellType === 'index' ||
    upCellType === 'searchCollection' || upCellType === 'objectCollection'
  )
);


const Cell = ({
  type, sheetId, tableId, column, row, value, $type, cellLength, cellInput,
  leftCellType, leftCellTableId, upCellType, upCellTableId, predicateIdx,
  hotKeys, activeView, enhanceView, dropTableView, illegalDropTableView,
  dragTableView, illegalDragTableView, activeHint, teaserHint,
  onClick, onMouseEnter, onKeyPress, onDragStart, onDragEnd, onDragEnter, updateValue,
}) => (
  <td
    className={`cell ${camel2Kebab(type)} ${activeView ? 'active' : ''} ${activeHint ? 'active-hint' : ''} ${teaserHint ? 'teaser-hint' : ''} ${enhanceView ? 'enhance' : ''} ${dropTableView ? 'drop-table' : ''} ${illegalDropTableView ? 'illegal-drop-table' : ''} ${dragTableView ? 'drag-table' : ''} ${illegalDragTableView ? 'illegal-drag-table' : ''}`}
    role="gridcell"
    draggable={type !== 'empty'}
    onClick={onClick}
    onMouseEnter={onMouseEnter}
    onKeyPress={onKeyPress}
    onDragStart={onDragStart}
    onDragEnd={onDragEnd}
    onDragEnter={onDragEnter}
    {...hotKeys}
  >
    {
      shouldRenderSearchInput(activeView, enhanceView, cellInput, type) ?
        <div>Search Input</div> :
      shouldRenderPredicateInput(activeView, enhanceView, cellInput, type, leftCellType) ?
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
            $type={$type}
            value={value}
            cellLength={cellLength}
          />
        </div>
    }
  </td>
);


Cell.propTypes = {};

export default Cell;
