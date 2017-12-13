import React                   from 'react';
import {}                      from 'prop-types';
import Cell                    from '../../containers/CellContainer';


const Row = ({ row, focusCell, navigate }) => (
  <tr
    className="row"
  >
    {row.map((cell) => (
      <Cell
        key={cell.address}
        {...cell}
        navigate={navigate}
        focusCell={focusCell}
      />
    ))}
  </tr>
);


Row.propTypes = {};

export default Row;
