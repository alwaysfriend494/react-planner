import {SELECT_LAYER, ADD_LAYER, SET_LAYER_PROPERTIES, REMOVE_LAYER} from '../constants';

export function selectLayer(layerID) {
  return {
    type: SELECT_LAYER,
    layerID
  }
}

export function addLayer(name, layerID) {
  return {
    type: ADD_LAYER,
    layerID, name
  }
}

export function setLayerProperties(layerID, properties) {
  return {
    type: SET_LAYER_PROPERTIES,
    layerID,
    properties
  }
}

export function removeLayer(layerID, altitude, height) {
  return {
    type: REMOVE_LAYER,
    layerID,
    altitude,
    height
  }
}
