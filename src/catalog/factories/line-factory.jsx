import React from 'react';
import { buildLine, updatedLine } from './line-factory-3d';
import * as SharedStyle from '../../shared-style';
import * as Geometry from '../../utils/geometry';
import Translator from '../../translator/translator';

const epsilon = 20;
const STYLE_TEXT = { textAnchor: 'middle' };
const STYLE_LINE = { stroke: SharedStyle.LINE_MESH_COLOR.selected };
const STYLE_RECT = { strokeWidth: 1, stroke: SharedStyle.LINE_MESH_COLOR.unselected, fill: 'url(#diagonalFill)' };
const STYLE_RECT_SELECTED = { ...STYLE_RECT, stroke: SharedStyle.LINE_MESH_COLOR.selected };

let translator = new Translator();

export default function LineFactory(name, info, customProperties) {
  let lineElement = {
    name,
    prototype: 'lines',
    info,
    properties: {
      height: {
        label: translator.t('height'),
        type: 'hidden',
        defaultValue: {
          length: 0,
        }
      },
      thickness: {
        label: translator.t('thickness'),
        type: 'hidden',
        defaultValue: {
          length: 1
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
      let { x: x1, y: y1 } = layer.vertices.get(element.vertices.get(0));
      let { x: x2, y: y2 } = layer.vertices.get(element.vertices.get(1));

      let length = Geometry.pointsDistance(x1, y1, x2, y2);
      let length_5 = length / 5;

      let thickness = element.getIn(['properties', 'thickness', 'length']);
      let half_thickness = thickness / 2;
      let half_thickness_eps = half_thickness + epsilon;
      let char_height = 11;
      let extra_epsilon = 5;
      let textDistance = half_thickness + epsilon + extra_epsilon;

      return (element.selected) ?
        <g>
          <rect x="0" y={-half_thickness} width={length} height={thickness} style={STYLE_RECT_SELECTED} />
          <line x1={length_5} y1={-half_thickness_eps} x2={length_5} y2={half_thickness_eps} style={STYLE_LINE} />
          <text x={length_5} y={textDistance + char_height} style={STYLE_TEXT}>A</text>
          <text x={length_5} y={-textDistance} style={STYLE_TEXT}>B</text>
        </g> :
        <rect x="0" y={-half_thickness} width={length} height={thickness} style={STYLE_RECT} />
    },

    render3D: function (element, layer, scene) {
      return buildLine(element, layer, scene);
    },

    updateRender3D: (element, layer, scene, mesh, oldElement, differences, selfDestroy, selfBuild) => {
      return updatedLine(element, layer, scene, mesh, oldElement, differences, selfDestroy, selfBuild);
    }

  };

  if (customProperties) {
    Object.entries(customProperties).map(([key, value]) => {
      const processedValues = {};

      Object.entries(value).map(([fieldKey, fieldValue]) => {
        processedValues[fieldKey] = fieldValue;
      });

      lineElement.properties[key] = processedValues
    });
  }

  return lineElement;
  
}
