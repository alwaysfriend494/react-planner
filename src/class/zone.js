import { fromJS } from 'immutable';
import { Layer, Vertex, Group } from './export';
import {
  IDBroker,
  NameGenerator
} from '../utils/export';

class Zone{

  static add( state, layerID, type, verticesCoords, catalog ) {

    let zone;

    let layer = state.getIn(['scene', 'layers', layerID]);

    layer = layer.withMutations(layer => {
      let zoneID = IDBroker.acquireID();

      let vertices = verticesCoords.map( ( v ) => Vertex.add( state, layerID, v.x, v.y, 'zones', zoneID).vertex.id );

      zone = catalog.factoryElement(type, {
        id: zoneID,
        name: NameGenerator.generateName('zones', catalog.getIn(['elements', type, 'info', 'title'])),
        type,
        prototype: 'zones',
        vertices
      });

      layer.setIn(['zones', zoneID], zone);
    });

    state = state.setIn(['scene', 'layers', layerID], layer);

    return { updatedState: state, zone };
  }

  static select( state, layerID, zoneID ){
    state = Layer.select( state, layerID ).updatedState;
    state = Layer.selectElement( state, layerID, 'zones', zoneID ).updatedState;

    return {updatedState: state};
  }

  static remove( state, layerID, zoneID ) {

    let zone = state.getIn(['scene', 'layers', layerID, 'zones', zoneID]);

    if( zone.get('selected') === true ) state = this.unselect( state, layerID, zoneID ).updatedState;

    zone.vertices.forEach(vertexID => { state = Vertex.remove( state, layerID, vertexID, 'zones', zoneID).updatedState; });

    state = state.deleteIn(['scene', 'layers', layerID, 'zones', zoneID]);

    state.getIn(['scene', 'groups']).forEach( group => state = Group.removeElement(state, group.id, layerID, 'zones', zoneID).updatedState );

    return {updatedState: state};
  }

  static unselect( state, layerID, zoneID ) {
    state = Layer.unselect( state, layerID, 'zones', zoneID ).updatedState;

    return {updatedState: state};
  }

  static setProperties( state, layerID, zoneID, properties ) {
    state = state.mergeIn(['scene', 'layers', layerID, 'zones', zoneID, 'properties'], properties);

    return { updatedState: state };
  }

  static setJsProperties( state, layerID, zoneID, properties ) {
    return this.setProperties( state, layerID, zoneID, fromJS(properties) );
  }

  static updateProperties( state, layerID, zoneID, properties) {
    properties.forEach( ( v, k ) => {
      if( state.hasIn(['scene', 'layers', layerID, 'zones', zoneID, 'properties', k]) )
        state = state.mergeIn(['scene', 'layers', layerID, 'zones', zoneID, 'properties', k], v);
    });

    return { updatedState: state };
  }

  static updateJsProperties( state, layerID, zoneID, properties) {
    return this.updateProperties( state, layerID, zoneID, fromJS(properties) );
  }

  static setAttributes( state ) {
    return { updatedState: state };
  }

}

export { Zone as default };
