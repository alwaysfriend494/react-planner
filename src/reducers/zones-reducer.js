import { Zone } from '../class/export';
import { SELECT_ZONE } from '../constants';

export default function (state, action) {
  switch (action.type) {
    case SELECT_ZONE:
      return Zone.select(state, action.layerID, action.zoneID).updatedState;
    default:
      return state;
  }
}
