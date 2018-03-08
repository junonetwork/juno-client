import React                   from 'react';
import {}                      from 'prop-types';
import {
  withHandlers,
}                              from 'recompose';
import                              './style.scss';


const AutocompleteInputItem = withHandlers({
  clickAction: ({ uri, click, }) => (e) => {
    e.preventDefault();
    e.stopPropagation();
    click(uri);
  },
})(
  ({ label, idx, selectionIdx, selected, clickAction, }) => (
    <li
      className={`autocomplete-item ${idx === selectionIdx ? 'active' : ''} ${selected ? 'selected' : ''}`}
      onClick={clickAction}
    >
      <span>{label}</span>
    </li>
  )
);


AutocompleteInputItem.propTypes = {};

export default AutocompleteInputItem;
