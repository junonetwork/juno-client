import React                   from 'react';
import {}                      from 'prop-types';
import SearchInputRepositoryContainer from '../../containers/SearchInputRepositoryContainer';
import SearchInputTypeContainer from '../../containers/SearchInputTypeContainer';
import                              './style.scss';


const lineHeight = '22px';


const SearchInput = ({
  tableId, sheetId, column, row, focus, repository, type, typeLabel,
  hotKeys, setRepository, create, update, setTypeLabel,
}) => (
  <div
    className="search-input"
    {...hotKeys}
  >
    <SearchInputRepositoryContainer
      repository={repository}
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
      typeLabel={typeLabel}
      tableId={tableId}
      sheetId={sheetId}
      column={column}
      row={row}
      focus={focus}
      lineHeight={lineHeight}
      setTypeLabel={setTypeLabel}
      create={create}
      update={update}
    />
  </div>
);


SearchInput.propTypes = {};

export default SearchInput;
