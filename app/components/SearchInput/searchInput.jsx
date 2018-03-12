/* eslint-disable jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */
import React                   from 'react';
import {}                      from 'prop-types';
import {
  equals,
}                              from 'ramda';
import SearchInputRepositoryContainer from '../../containers/SearchInputRepositoryContainer';
import SearchInputTypeContainer from '../../containers/SearchInputTypeContainer';
import {
  searchInputRepositoryId,
  searchInputTypeId,
}                              from '../../redux/modules/focus';
import                              './style.scss';


const lineHeight = '22px';


const SearchInput = ({
  sheetId, column, row, focus, repository, type,
  onKeyPress, hotKeys, focusSearchInputRepository, focusSearchInputType,
  setRepository, enterRepository, exitRepository, setType, enterType, exitType,
}) => (
  <div
    className="search-input"
    {...hotKeys}
  >
    <div
      className="search-line"
      style={{ lineHeight, }}
    >
      <span className="search-label">Search</span>
      {
        equals(focus, searchInputRepositoryId(sheetId, column, row)) ?
          <SearchInputRepositoryContainer
            value={repository}
            sheetId={sheetId}
            column={column}
            row={row}
            lineHeight={lineHeight}
            onKeyPress={onKeyPress}
            onChange={setRepository}
            enter={enterRepository}
            exit={exitRepository}
          /> :
          <span
            onClick={focusSearchInputRepository}
            className="search-value"
          >
            {
              // TODO - move this stuff to w/i Autocomplete.  pass focus to Autocomplete and render dropdown on focus, value/placeholder otherwise
              repository ?
                <span>{repository}</span> :
                <em className="disabled">repository</em>
            }
          </span>
      }
    </div>
    <div
      className="search-line"
      style={{ lineHeight, }}
    >
      <span className="search-label">For</span>
      {
        equals(focus, searchInputTypeId(sheetId, column, row)) ?
          <SearchInputTypeContainer
            value={type}
            repository={repository}
            sheetId={sheetId}
            column={column}
            row={row}
            lineHeight={lineHeight}
            onKeyPress={onKeyPress}
            onChange={setType}
            enter={enterType}
            exit={exitType}
          /> :
          <span
            onClick={focusSearchInputType}
            className="search-value"
          >
            {
              // TODO - disable input if repository is not chosen - via autocomplete disabled attr
              type ?
                <span>{type}</span> :
                <em className="disabled">type</em>
            }
          </span>
      }
    </div>
  </div>
);


SearchInput.propTypes = {};

export default SearchInput;
