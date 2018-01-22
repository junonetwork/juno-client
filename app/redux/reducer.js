import { combineReducers } from 'redux';
import sheets              from './modules/sheets';
import tables              from './modules/tables';
import active               from './modules/active';
import teaser              from './modules/teaser';
import enhanced            from './modules/enhanced';
import cellInput           from './modules/cellInput';


export default combineReducers({
  sheets,
  tables,
  active,
  teaser,
  enhanced,
  cellInput,
});
