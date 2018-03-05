import React                   from 'react';
import {}                      from 'prop-types';
import {
  path,
}                              from 'ramda';
import {
  pure,
}                              from 'recompose';
import {
  pureRowWithFocus,
}                              from '../../hoc/pureWithFocus';
import Cell                    from '../../containers/CellContainer';


const Row = ({ row, upperRow, ...functions }) => (
  <tr
    className="row"
  >
    {row.map((cell, idx) => (
      <Cell
        key={cell.address}
        leftCellType={path([idx - 1, 'type'], row)}
        leftCellTableId={path([idx - 1, 'tableId'], row)}
        upCellType={path([idx, 'type'], upperRow)}
        upCellTableId={path([idx, 'tableId'], upperRow)}
        {...cell}
        {...functions}
      />
    ))}
  </tr>
);


Row.propTypes = {};

export default pureRowWithFocus(Row);
