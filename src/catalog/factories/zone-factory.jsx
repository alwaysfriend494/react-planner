import React from 'react';
import { createZone, updatedZone } from './zone-factory-3d';
import * as SharedStyle from '../../shared-style';
import Translator from '../../translator/translator';

let translator = new Translator();

export default function ZoneFactory(name, info, textures, customProperties) {

  let zoneElement = {
    name,
    prototype: 'zones',
    info: {
      ...info,
      visibility: {
        catalog: false,
        layerElementsVisible: false
      }
    },
    properties: {
      patternColor: {
        label: translator.t('color'),
        type: 'color',
        defaultValue: SharedStyle.ZONE_MESH_COLOR.unselected
      },
      thickness: {
        label: translator.t('thickness'),
        type: 'length-measure',
        defaultValue: {
          length: 0,
        }
      },
      cost: {
        label: 'cost(€)',
        type: 'float',
        defaultValue: 0
      },
      devis_data: {
        label: 'devis_data',
        type: 'hidden',
        defaultValue: ''
      }
    },
    render2D: function (element, layer, scene) {
      let path = '';

      ///print zone path
      element.vertices.forEach((vertexID, ind) => {
        let vertex = layer.vertices.get(vertexID);
        path += (ind ? 'L' : 'M') + vertex.x + ' ' + vertex.y + ' ';
      });

      //add holes
      element.holes.forEach(zoneID => {
        let zone = layer.zones.get(zoneID);

        zone.vertices.reverse().forEach((vertexID, ind) => {
          let vertex = layer.vertices.get(vertexID);
          path += (ind ? 'L' : 'M') + vertex.x + ' ' + vertex.y + ' ';
        });

      });

      let fill = element.selected ? SharedStyle.ZONE_MESH_COLOR.selected : element.properties.get('patternColor');

      return (<path d={path} fill={fill} />);
    },

    render3D: function (element, layer, scene) {
      return createZone(element, layer, scene, textures)
    },

    updateRender3D: (element, layer, scene, mesh, oldElement, differences, selfDestroy, selfBuild) => {
      return updatedZone(element, layer, scene, textures, mesh, oldElement, differences, selfDestroy, selfBuild);
    }

  };

  if (textures && textures !== {}) {

    let textureValues = { 'none': 'None' };

    for (let textureName in textures) {
      textureValues[textureName] = textures[textureName].name
    }

    zoneElement.properties.texture = {
      label: translator.t('texture'),
      type: 'enum',
      defaultValue: 'none',
      values: textureValues
    };

  }

  if (customProperties) {
    Object.entries(customProperties).map(([key, value]) => {
      const processedValues = {};

      Object.entries(value).map(([fieldKey, fieldValue]) => {
        processedValues[fieldKey] = fieldValue;
      });

      zoneElement.properties[key] = processedValues
    });
  }

  return zoneElement

}
