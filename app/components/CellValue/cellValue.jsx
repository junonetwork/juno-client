import React            from 'react';
import {
  oneOfType,
  string,
  number,
  bool,
}                        from 'prop-types';
import                        './style.scss';


const CellValue = ({ type, value, cellLength, pending, }) => {
  if (type === 'error') {
    return (
      <span className="cell-value error" title={value}>ERR</span>
    );
  } else if (pending) {
    return (
      <span className="cell-value pending"><span className="spinner" /></span>
    );
  } else if (typeof value === 'undefined' || value === null) {
    return (
      // <span className="cell-value non-existent">-</span>
      <span className="cell-value non-existent" />
    );
  } else if (cellLength > 1) {
    return (
      <span className="cell-value multi">
        {value}
        <small>{`+${cellLength}`}</small>
      </span>
    );
  }

  return (
    <span className="cell-value single">{value}</span>
  );
};


CellValue.propTypes = {
  type: string.isRequired,
  value: oneOfType([string, number]),
  cellLength: number,
  pending: bool.isRequired,
};


export default CellValue;
