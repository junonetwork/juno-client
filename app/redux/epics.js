// import { combineEpics } from 'redux-observable';
import {
  updateCellValueEpic,
  sampleEpic,
}                        from './modules/tables';

// export default combineEpics();

export default [updateCellValueEpic, sampleEpic];
