import React                   from 'react';
import {}                      from 'prop-types';
import Cell                    from '../Cell';


const Row = ({ row }) => (
  <tr
    className="row"
  >
    {row.map(({ address, column, row: rowNumber, sheetId, type }) => (
      <Cell
        key={address}
        address={address}
        column={column}
        row={rowNumber}
        sheetId={sheetId}
        type={type}
      />
    ))}
  </tr>
);


Row.propTypes = {};

export default Row;
