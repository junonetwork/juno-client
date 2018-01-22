import React            from 'react';
import                        './style.scss';


const CellValue = ({ $type, value, cellLength, }) => {
  if ($type === 'error') {
    return (
      <span className="cell-value error" title={value.message}>ERR</span>
    );
  } else if (typeof value === 'undefined' || value === null) {
    return (
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


export default CellValue;
