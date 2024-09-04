import React, { useState } from 'react';
import { buildWall, updatedWall } from './wall-factory-3d';
import * as SharedStyle from '../../shared-style';
import * as Geometry from '../../utils/geometry';
import Translator from '../../translator/translator';

const epsilon = 20;
const STYLE_TEXT = { textAnchor: 'middle' };
const STYLE_LINE = { stroke: SharedStyle.LINE_MESH_COLOR.selected };
const STYLE_RECT = { strokeWidth: 1, stroke: SharedStyle.LINE_MESH_COLOR.unselected, fill: 'url(#diagonalFill)', zIndex: 1, position: 'relative' };
const STYLE_RECT_SELECTED = { ...STYLE_RECT, stroke: SharedStyle.LINE_MESH_COLOR.selected };
const foreignObjectStyle = { overflow: 'visible' };

let translator = new Translator();

export default function WallFactory(name, info, textures, customProperties) {

  let wallElement = {
    name,
    prototype: 'lines',
    info,
    properties: {
      height: {
        label: translator.t('height'),
        type: 'length-measure',
        defaultValue: {
          length: 300,
        }
      },
      thickness: {
        label: translator.t('thickness'),
        type: 'length-measure',
        defaultValue: {
          length: 20
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

    render2D: function (element, layer, angle) {
      let { x: x1, y: y1 } = layer.vertices.get(element.vertices.get(0));
      let { x: x2, y: y2 } = layer.vertices.get(element.vertices.get(1));

      let length = Geometry.pointsDistance(x1, y1, x2, y2);
      let length_5 = length / 5;

      let thickness = element.getIn(['properties', 'thickness', 'length']);
      // let porteur = element.getIn(['properties', 'porteur']);
      const [porteur, setPorteur] = useState(false);
      let half_thickness = thickness / 2;
      let half_thickness_eps = half_thickness + epsilon;
      let char_height = 11;
      let extra_epsilon = 5;
      let textDistance = half_thickness + epsilon + extra_epsilon;

      // return (element.selected) ?
      //   <g>
      //     <rect x="0" y={-half_thickness} width={length} height={thickness} style={STYLE_RECT_SELECTED} />
      //     <line x1={length_5} y1={-half_thickness_eps} x2={length_5} y2={half_thickness_eps} style={STYLE_LINE} />
      //     <text x={length_5} y={textDistance + char_height} style={STYLE_TEXT}>A</text>
      //     <text x={length_5} y={-textDistance} style={STYLE_TEXT}>B</text>
      //   </g> :
      //   <rect x="0" y={-half_thickness} width={length} height={thickness} style={STYLE_RECT} />

      return (
        <g style={{position: 'relative'}}>
          <rect x="0" y={-half_thickness} width={length} height={thickness} style={STYLE_RECT_SELECTED} />
          <line x1={length_5} y1={-half_thickness_eps} x2={length_5} y2={half_thickness_eps} style={STYLE_LINE}/>
          <text x={length_5} y={textDistance + char_height} style={STYLE_TEXT}>A</text>
          <text x={length_5} y={-textDistance} style={STYLE_TEXT}>B</text>
          <svg xmlns="http://www.w3.org/2000/svg" version="1.1">
            <foreignObject x={length / 2 - 50} y={half_thickness_eps / 2 } width="100" height="100" style={foreignObjectStyle}>
              <select xmlns="http://www.w3.org/1999/xhtml" value={porteur} onChange={(e) => setPorteur(e.target.value)}  style={{transform: `rotate(${-angle}deg)`}}>
                <option value="true">Porteur</option>
                <option value="false">Non porteur</option>
              </select>
            </foreignObject>
          </svg>
        </g>
      )

      // return (element.selected) ?
      //   <g>
      //     <rect x="0" y={-half_thickness} width={length} height={thickness} style={STYLE_RECT_SELECTED} />
      //     <line x1={length_5} y1={-half_thickness_eps} x2={length_5} y2={half_thickness_eps} style={STYLE_LINE} />
      //     <text x={length_5} y={textDistance + char_height} style={STYLE_TEXT}>A</text>
      //     <text x={length_5} y={-textDistance} style={STYLE_TEXT}>B</text>
      //     <svg xmlns="http://www.w3.org/2000/svg" version="1.1">
      //       <foreignObject x={length / 2 - 50} y={half_thickness_eps / 2} width="100" height="100">
      //         <select xmlns="http://www.w3.org/1999/xhtml" value={porteur} onChange={(e) => setPorteur(e.target.value)}>
      //           <option value="true">Porteur</option>
      //           <option value="false">Non porteur</option>
      //         </select>
      //       </foreignObject>
      //     </svg>
      //   </g> :
      //   <rect x="0" y={-half_thickness} width={length} height={thickness} style={STYLE_RECT} />
    },

    render3D: function (element, layer, scene) {
      return buildWall(element, layer, scene, textures);
    },

    updateRender3D: (element, layer, scene, mesh, oldElement, differences, selfDestroy, selfBuild) => {
      return updatedWall(element, layer, scene, textures, mesh, oldElement, differences, selfDestroy, selfBuild);
    }

  };

  if (textures && textures !== {}) {

    let textureValues = { 'none': 'None' };

    for (let textureName in textures) {
      textureValues[textureName] = textures[textureName].name;
    }

    wallElement.properties.textureA = {
      label: translator.t('texture') + ' A',
      type: 'enum',
      defaultValue: textureValues.bricks ? 'bricks' : 'none',
      values: textureValues
    };

    wallElement.properties.textureB = {
      label: translator.t('texture') + ' B',
      type: 'enum',
      defaultValue: textureValues.bricks ? 'bricks' : 'none',
      values: textureValues
    };

  }

  if (customProperties) {
    Object.entries(customProperties).map(([key, value]) => {
      const processedValues = {};

      Object.entries(value).map(([fieldKey, fieldValue]) => {
        processedValues[fieldKey] = fieldValue;
      });

      wallElement.properties[key] = processedValues
    });
  }

  return wallElement;
}
