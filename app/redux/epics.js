import {
  editValueCellEpic,
}                        from './modules/tables';
import {
  updateGraphValueEpic,
  deleteGraphValueEpic,
}                        from './modules/falcor';


export default [
  editValueCellEpic,
  updateGraphValueEpic,
  deleteGraphValueEpic,
];
