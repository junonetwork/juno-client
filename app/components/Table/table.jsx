/* eslint-disable jsx-a11y/no-noninteractive-tabindex */
import React                   from 'react';
import {}                      from 'prop-types';
import Row                     from '../Row';
import                              './style.scss';


const Table = ({ sheetMatrix, ...functions }) => (
  <div
    className="scroll-styled table-window"
    tabIndex="0"
  >
    <table
      className="table"
      role="grid"
    >
      <tbody>
        {sheetMatrix.map((row, idx) => (
          <Row
            key={idx} // eslint-disable-line react/no-array-index-key
            row={row}
            upperRow={sheetMatrix[idx - 1]}
            {...functions}
          />
        ))}
      </tbody>
    </table>
  </div>
);


Table.propTypes = {};

export default Table;
