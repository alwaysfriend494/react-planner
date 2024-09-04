import {SELECT_ZONE} from '../constants';

export function selectZone(layerID, zoneID) {
  return {
    type: SELECT_ZONE,
    layerID,
    zoneID
  }
}
