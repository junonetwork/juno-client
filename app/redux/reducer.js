import { combineReducers } from 'redux';
import sheets              from './modules/sheets';
import tables              from './modules/tables';
import focus               from './modules/focus';
import teaser              from './modules/teaser';
import enhanced            from './modules/enhanced';
import cellInput           from './modules/cellInput';


export default combineReducers({
  sheets,
  tables,
  focus,
  teaser,
  enhanced,
  cellInput,
});
