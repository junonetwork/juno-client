import React                 from 'react';
import {
}                            from 'prop-types';
import {
  withHandlers,
}                            from 'recompose';
import                            './style.scss';


const TooltipItem = withHandlers({
  clickAction: ({ uri, click, }) => (e) => {
    e.preventDefault();
    e.stopPropagation();
    click(uri);
  },
})(
  ({ label, idx, selectionIdx, selected, clickAction, }) => (
    <li
      className={`tooltip-list-item ${idx === selectionIdx ? 'active' : ''} ${selected ? 'selected' : ''}`}
      onClick={clickAction}
    >
      <strong>{label}</strong>
    </li>
  )
);


const CellTooltip = ({
  list, value, selectionIdx, graphFragmentStatus, hotKeys, click,
}) => (
  <div
    className="tooltip-input"
    {...hotKeys}
  >
    <div className="input">
      {value}
    </div>

    {graphFragmentStatus === 'next' &&
      <div className="loading">
        <div className="spinner" />
      </div>
    }

    <div
      className="tooltip-input-content"
    >
      {list.length > 0 ?
        <ul className="tooltip-list">
          {list.map(({ uri, label, selected, }, idx) => (
            <TooltipItem
              key={uri}
              uri={uri}
              label={label}
              idx={idx}
              selectionIdx={selectionIdx}
              selected={selected}
              click={click}
            />
          ))}
        </ul> :
        <ul className="tooltip-empty-list">none</ul>
      }
    </div>

  </div>
);


CellTooltip.propTypes = {};


export default CellTooltip;
