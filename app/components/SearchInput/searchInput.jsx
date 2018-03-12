import React                   from 'react';
import {}                      from 'prop-types';
import SearchInputRepositoryContainer from '../../containers/SearchInputRepositoryContainer';
import SearchInputTypeContainer from '../../containers/SearchInputTypeContainer';
import                              './style.scss';


const lineHeight = '22px';


const SearchInput = ({
  tableId, sheetId, column, row, focus, repository, type, hotKeys,
  setRepository, create, update, setType,
}) => (
  <div
    className="search-input"
    {...hotKeys}
  >
    <SearchInputRepositoryContainer
      repository={repository}
      type={type}
      tableId={tableId}
      sheetId={sheetId}
      column={column}
      row={row}
      focus={focus}
      lineHeight={lineHeight}
      setRepository={setRepository}
    />
    <SearchInputTypeContainer
      repository={repository}
      type={type}
      tableId={tableId}
      sheetId={sheetId}
      column={column}
      row={row}
      focus={focus}
      lineHeight={lineHeight}
      setType={setType}
      create={create}
      update={update}
    />
  </div>
);


SearchInput.propTypes = {};

export default SearchInput;
