import React                   from 'react';
import {}                      from 'prop-types';
import {
  equals,
}                              from 'ramda';
import CellValue               from '../CellValue';
import {
  predicateInputId,
  indexInputId,
}                              from '../../redux/modules/focus';
import SearchInput             from '../../containers/SearchInputContainer';
import PredicateInput          from '../../containers/PredicateInputContainer';
import IndexInput              from '../../containers/IndexInputContainer';
import                              './style.scss';


const camel2Kebab = (str) => str.replace(/([A-Z])/g, (g) => `-${g[0].toLowerCase()}`);


const Cell = ({
  type, search, sheetId, tableId, column, row, value, valueType, cellLength, cellInput, focus,
  leftCellTableId, upCellTableId, predicateIdx,
  hotKeys, activeView, dropTableView, illegalDropTableView,
  dragTableView, illegalDragTableView, activeHint, teaserHint,
  onMouseEnter, onKeyPress, onDragStart, onDragEnd, onDragEnter, updateValue,
}) => (
  /* console.log('render', sheetId, row, column) || */
  <td
    className={`cell ${camel2Kebab(type)} ${activeView ? 'active' : ''} ${activeHint ? 'active-hint' : ''} ${teaserHint ? 'teaser-hint' : ''} ${dropTableView ? 'drop-table' : ''} ${illegalDropTableView ? 'illegal-drop-table' : ''} ${dragTableView ? 'drag-table' : ''} ${illegalDragTableView ? 'illegal-drag-table' : ''}`}
    role="gridcell"
    draggable={type !== 'empty'}
    onMouseEnter={onMouseEnter}
    onKeyPress={onKeyPress}
    onDragStart={onDragStart}
    onDragEnd={onDragEnd}
    onDragEnter={onDragEnter}
    {...hotKeys}
  >
    {
      (
        focus.sheetId === sheetId &&
        focus.column === column &&
        focus.row === row &&
        focus.searchInput
      ) ?
        <SearchInput
          search={search}
          tableId={tableId}
          sheetId={sheetId}
          column={column}
          row={row}
          focus={focus}
        /> :
      equals(focus, predicateInputId(sheetId, column, row)) ?
        <PredicateInput
          value={cellInput}
          sheetId={sheetId}
          cellType={type}
          tableId={type === 'predicate' ? tableId : leftCellTableId}
          column={column}
          row={row}
          predicateIdx={predicateIdx}
          updateValue={updateValue}
        /> :
      equals(focus, indexInputId(sheetId, column, row)) ?
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
            valueType={valueType}
            value={value}
            cellLength={cellLength}
          />
        </div>
    }
  </td>
);


Cell.propTypes = {};

export default Cell;
