import React                   from 'react';
import {}                      from 'prop-types';
import {
  withHandlers,
}                              from 'recompose';
import                              './style.scss';


const AutocompleteItem = withHandlers({
  clickAction: ({ uri, idx, click, }) => (e) => {
    e.preventDefault();
    e.stopPropagation();
    click(uri, idx);
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


AutocompleteItem.propTypes = {};

export default AutocompleteItem;
