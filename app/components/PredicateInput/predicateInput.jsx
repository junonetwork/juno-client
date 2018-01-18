import React                 from 'react';
import {
}                            from 'prop-types';
import {
  withHandlers,
}                            from 'recompose';
import                            './style.scss';


const PredicateInputItem = withHandlers({
  itemClick: ({ uri, addPredicates, }) => () => addPredicates([uri]),
})(
  ({ label, idx, selectionIdx, selected, itemClick, }) => (
    <li
      className={`predicate-input-item ${idx === selectionIdx ? 'active' : ''} ${selected ? 'selected' : ''}`}
    >
      <button
        className="unstyled"
        onClick={itemClick}
      >
        <strong>{label}</strong>
      </button>
    </li>
  )
);


const PredicateInput = ({
  predicateList, value, selectionIdx, graphFragmentStatus, hotKeys, addPredicates,
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
      {predicateList.length > 0 ?
        <ul
          className="unselected-predicates"
        >
          {predicateList.map(({ uri, label, selected, }, idx) => (
            <PredicateInputItem
              key={uri}
              uri={uri}
              label={label}
              idx={idx}
              selectionIdx={selectionIdx}
              selected={selected}
              addPredicates={addPredicates}
            />
          ))}
        </ul> :
        <ul className="empty-predicate-list">none</ul>
      }
    </div>

  </div>
);

PredicateInput.propTypes = {};


export default PredicateInput;
