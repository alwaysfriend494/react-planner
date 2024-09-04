import {ElementsFactories} from 'react-planner';

const info = {
  title: 'wall',
  tag: ['wall'],
  description: 'Wall with bricks or painted',
  image: require('./wall.png'),
  visibility: {
    catalog: true,
    layerElementsVisible: true
  }
};

const textures = {
  bricks: {
    name: 'Bricks',
    uri: require('./textures/bricks.jpg'),
    lengthRepeatScale: 0.01,
    heightRepeatScale: 0.01,
    normal: {
      uri: require('./textures/bricks-normal.jpg'),
      lengthRepeatScale: 0.01,
      heightRepeatScale: 0.01,
      normalScaleX: 0.8,
      normalScaleY: 0.8
    }
  },
  painted: {
    name:'Painted',
    uri: require('./textures/painted.jpg'),
    lengthRepeatScale: 0.01,
    heightRepeatScale: 0.01,
    normal: {
      uri: require('./textures/painted-normal.jpg'),
      lengthRepeatScale: 0.01,
      heightRepeatScale: 0.01,
      normalScaleX: 0.4,
      normalScaleY: 0.4
    }
  },
};

const customProperties = {
  numVoile: {
    label: 'Num Voile',
    type: 'number',
    defaultValue: 0,
    min: 0,
  },
  charge: {
    label: 'Charge (t/m)',
    type: 'float',
    defaultValue: 0,
    min: 0
  },
  porteur: {
    label: 'Porteur',
    type: 'hidden',
    defaultValue: false
  }
}

export default ElementsFactories.WallFactory('wall', info, textures, customProperties);

