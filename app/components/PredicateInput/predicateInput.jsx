/* eslint-disable jsx-a11y/no-static-element-interactions */
import React                 from 'react';
import {
}                            from 'prop-types';
import                            './style.scss';


const PredicateInput = ({
  predicateList, value, selectionIdx, graphFragmentStatus, hotKeys,
}) => (
  <div
    className="predicate-input"
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
      className="predicate-input-content"
    >
      <ul
        className="unselected-predicates"
      >
        {predicateList.map(({ uri, label, selected, }, idx) => (
          <li
            key={uri}
            className={`predicate-input-item ${idx === selectionIdx ? 'active' : ''} ${selected ? 'selected' : ''}`}
          >
            <strong>{label}</strong>
          </li>
        ))}
      </ul>
    </div>

  </div>
);

PredicateInput.propTypes = {};


export default PredicateInput;
