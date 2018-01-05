import { combineReducers } from 'redux';
import sheets              from './modules/sheets';
import tables              from './modules/tables';
import focus               from './modules/focus';
import teaser              from './modules/teaser';
import enhanced            from './modules/enhanced';


export default combineReducers({
  sheets,
  tables,
  focus,
  teaser,
  enhanced,
});
