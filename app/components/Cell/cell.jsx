import React                   from 'react';
import {}                      from 'prop-types';
import                              './style.scss';


const Cell = ({ column, row, type }) => (
  <td
    className="cell"
  >
    {column} {row}
  </td>
);


Cell.propTypes = {};

export default Cell;
