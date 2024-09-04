import {ElementsFactories} from 'react-planner';

const info = {
  title: 'zone',
  tag: ['zone'],
  description: 'zone',
  image: require('./textures/zone.png'),
  visibility: {
    catalog: true,
    layerElementsVisible: false
  }
};

const customProperties = {
  numVoile: {
    label: 'Num Voile',
    type: 'number',
    defaultValue: 0,
    min: 0,
  }
}

export default ElementsFactories.LineFactory('line', info, customProperties);