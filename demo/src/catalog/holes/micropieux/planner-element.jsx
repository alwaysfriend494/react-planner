import * as Three from 'three';
import React from 'react';

let textureLoader = new Three.TextureLoader();
let mat = textureLoader.load(require('./copper.jpg'));
let frameMaterial = new Three.MeshLambertMaterial({ map: mat });

function createFrame(RADIUS_10, HEIGHT, xPos, zPos, frameMaterial) {
  let frame = new Three.Mesh(
    new Three.CylinderGeometry(RADIUS_10, RADIUS_10, HEIGHT + HEIGHT / 10, 32),
    frameMaterial
  );
  frame.position.set(xPos, 0, zPos);
  return frame;
}

function makeObjectMaxLOD(RADIUS, HEIGHT) {
  let RADIUS_10 = RADIUS / 10;
  let RADIUS_2_5 = RADIUS / 2.5;

  let column = new Three.Object3D();
  let object = new Three.Mesh(
    new Three.CylinderGeometry(RADIUS, RADIUS, HEIGHT, 32),
    frameMaterial
  );

  const frame1 = createFrame(RADIUS_10, HEIGHT, RADIUS_2_5, RADIUS_2_5, frameMaterial);
  const frame2 = createFrame(RADIUS_10, HEIGHT, -RADIUS_2_5, -RADIUS_2_5, frameMaterial);
  const frame3 = createFrame(RADIUS_10, HEIGHT, -RADIUS_2_5, RADIUS_2_5, frameMaterial);
  const frame4 = createFrame(RADIUS_10, HEIGHT, RADIUS_2_5, -RADIUS_2_5, frameMaterial);

  column.add(object, frame1, frame2, frame3, frame4);

  return column;
}

function makeObjectMinLOD(RADIUS, HEIGHT) {
  let RADIUS_10 = RADIUS / 10;
  let RADIUS_2_5 = RADIUS / 2.5;

  let column = new Three.Object3D();
  let object = new Three.Mesh(
    new Three.CylinderGeometry(RADIUS, RADIUS, HEIGHT, 6, 6),
    frameMaterial
  );

  const frame1 = createFrame(RADIUS_10, HEIGHT, RADIUS_2_5, RADIUS_2_5, frameMaterial);
  const frame2 = createFrame(RADIUS_10, HEIGHT, -RADIUS_2_5, -RADIUS_2_5, frameMaterial);
  const frame3 = createFrame(RADIUS_10, HEIGHT, -RADIUS_2_5, RADIUS_2_5, frameMaterial);
  const frame4 = createFrame(RADIUS_10, HEIGHT, RADIUS_2_5, -RADIUS_2_5, frameMaterial);

  column.add(object, frame1, frame2, frame3, frame4);

  return column;
}

export default {
  name: 'micropieux',
  prototype: 'holes',

  info: {
    tag: ['structure'],
    title: 'micropieux',
    description: 'Round Column in the wall',
    image: require('./micropieux.png')
  },

  properties: {
    altitude: {
      label: 'altitude',
      type: 'length-measure',
      defaultValue: {
        length: 0,
        unit: 'cm'
      }
    },
    height: {
      label: 'height',
      type: 'length-measure',
      defaultValue: {
        length: 300,
        unit: 'cm'
      }
    },
    radius: {
      label: 'radius',
      type: 'length-measure',
      defaultValue: {
        length: 20,
        unit: 'cm'
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
    let RADIUS = element.properties.get('radius').get('length');
    let angle = element.rotation + 90;

    let textRotation = 0;
    if (Math.sin(angle * Math.PI / 180) < 0) {
      textRotation = 180;
    }

    let circleStyle = { stroke: element.selected ? '#0096fd' : '#000', strokeWidth: '2px', fill: '#84e1ce' };

    return (
      <g>
        <circle key='1' cx='0' cy='0' r={RADIUS} style={circleStyle} />
        <text key='2' cx='0' cy='0'
              transform={`scale(1,-1) rotate(${textRotation})`}
              style={{ textAnchor: 'middle', fontSize: '11px' }}>
          {element.type}
        </text>
      </g>
    );
  },

  render3D: function (element, layer, scene) {
    let HEIGHT = element.properties.get('height').get('length');
    let RADIUS = element.properties.get('radius').get('length');
    let newAltitude = element.properties.get('altitude').get('length');

    /**************** LOD max ***********************/
    let columnMaxLOD = new Three.Object3D();
    let objectMaxLOD = makeObjectMaxLOD(RADIUS, HEIGHT);
    columnMaxLOD.add(objectMaxLOD.clone());
    columnMaxLOD.position.y += HEIGHT / 2 + newAltitude;

    /**************** LOD min ***********************/
    let columnMinLOD = new Three.Object3D();
    let objectMinLOD = makeObjectMinLOD(RADIUS, HEIGHT);
    columnMinLOD.add(objectMinLOD.clone());
    columnMinLOD.position.y += HEIGHT / 2 + newAltitude;

    /*** add all Level of Detail ***/
    let lod = new Three.LOD();

    lod.addLevel(columnMaxLOD, 1300);
    lod.addLevel(columnMinLOD, 2000);
    lod.updateMatrix();
    lod.matrixAutoUpdate = false;

    if (element.selected) {
      let bbox = new Three.BoxHelper(lod, 0x99c3fb);
      bbox.material.linewidth = 5;
      bbox.renderOrder = 1000;
      bbox.material.depthTest = false;
      lod.add(bbox);
    }

    return Promise.resolve(lod);
  }
};
