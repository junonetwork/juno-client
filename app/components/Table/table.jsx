import React                   from 'react';
import {}                      from 'prop-types';
import Row                     from '../Row';
import                              './style.scss';


const Table = ({ sheetMatrix, focusCell, teaseCell, navigate }) => (
  <table
    className="table"
    role="grid"
  >
    <tbody>
      {sheetMatrix && sheetMatrix.map((row, idx) => (
        <Row
          key={idx} // eslint-disable-line react/no-array-index-key
          row={row}
          focusCell={focusCell}
          teaseCell={teaseCell}
          navigate={navigate}
        />
      ))}
    </tbody>
  </table>
);


Table.propTypes = {};

export default Table;
