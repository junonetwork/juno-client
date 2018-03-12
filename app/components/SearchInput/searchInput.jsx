import React                   from 'react';
import {}                      from 'prop-types';
import SearchInputRepositoryContainer from '../../containers/SearchInputRepositoryContainer';
import SearchInputTypeContainer from '../../containers/SearchInputTypeContainer';
import                              './style.scss';


const lineHeight = '22px';


const SearchInput = ({
  sheetId, column, row, focus, repository, type, onKeyPress, hotKeys,
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

      <SearchInputRepositoryContainer
        value={repository}
        sheetId={sheetId}
        column={column}
        row={row}
        focus={focus}
        lineHeight={lineHeight}
        onKeyPress={onKeyPress}
        onChange={setRepository}
        enter={enterRepository}
        exit={exitRepository}
      />
    </div>
    <div
      className="search-line"
      style={{ lineHeight, }}
    >
      <span className="search-label">For</span>
      <SearchInputTypeContainer
        value={type}
        repository={repository}
        sheetId={sheetId}
        column={column}
        row={row}
        focus={focus}
        lineHeight={lineHeight}
        onKeyPress={onKeyPress}
        onChange={setType}
        enter={enterType}
        exit={exitType}
      />
    </div>
  </div>
);


SearchInput.propTypes = {};

export default SearchInput;
