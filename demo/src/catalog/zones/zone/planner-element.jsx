import {ElementsFactories} from 'react-planner';

let info = {
  title: 'zone',
  tag: ['zone'],
  description: 'Generic Room',
  image: '',
  visibility: {
    catalog: true,
    layerElementsVisible: false
  }
};

let textures = {
  parquet: {
    name: 'Parquet',
    uri: require('./textures/parquet.jpg'),
    lengthRepeatScale: 0.004,
    heightRepeatScale: 0.004,
  },
  tile1: {
    name: 'Tile1',
    uri: require('./textures/tile1.jpg'),
    lengthRepeatScale: 0.01,
    heightRepeatScale: 0.01,
  },
  ceramic: {
    name:'Ceramic Tile',
    uri: require('./textures/ceramic-tile.jpg'),
    lengthRepeatScale: 0.02,
    heightRepeatScale: 0.02
  },
  strand_porcelain: {
    name:'Strand Porcelain Tile',
    uri: require('./textures/strand-porcelain.jpg'),
    lengthRepeatScale: 0.02,
    heightRepeatScale: 0.02
  },
  grass: {
    name: 'Grass',
    uri: require('./textures/grass.jpg'),
    lengthRepeatScale: 0.01,
    heightRepeatScale: 0.01,
  }
};

const customProperties = {
  chargeSurfacique: {
    label: 'Surface load (t/m²)',
    type: 'float',
    defaultValue: 0.65,
  },
  natureToiture: {
    label: 'Type of roof',
    type: 'enum',
    defaultValue: '0 None',
    values: {
      '0.35 Traditional frame + Roofing': 'Traditional frame + Roofing',
      '0.25 Industrial truss + Roofing': 'Industrial truss + Roofing',
      '0.5 20 cm concrete terrace roof + waterproofing': '20 cm concrete terrace roof + waterproofing',
      '0.35 Toiture terrasse en poutrelle hourdis + étanchéité': 'Toiture terrasse en poutrelle hourdis + étanchéité',
      '0.2 Hollow-core beam terrace roof + waterproofing': 'Toiture terrasse en bois + étanchéité',
      '0 None': 'None',
      '0 Other': 'Other'
    }
  },
  naturePlanchers: {
    label: 'Type of floors',
    type: 'enum',
    defaultValue: '0.5 Concrete (20cm)',
    values: {
      '0.5 Concrete (20cm)': 'Concrete (20cm)',
      '0.375 Concrete (15cm)': 'Concrete (15cm)',
      '0.45 Concrete (18cm)': 'Concrete (18cm)',
      '0.4 Concrete hollow-core beam': 'Concrete hollow-core beam',
      '0.3 Lightweight hollow-core beam': 'Lightweight hollow-core beam',
      '0.28 Steel deck': 'Steel deck',
      '0.2 Wood': 'Wood',
      '0 Other': 'Other'
    }
  },
  natureRevetements: {
    label: 'Type of coverings',
    type: 'enum',
    defaultValue: '0.15 Screed + Tiles + Partition',
    values: {
      '0.15 Screed + Tiles + Partition': 'Screed + Tiles + Partition',
      '0.08 Parquet + Lightweight partition': 'Parquet + Lightweight partition',
      '0.06 Lino + Lightweight partition': 'Lino + Lightweight partition',
      '0 Other': 'Other'
    }
  },
  chargeExploitation: {
    label: 'Operating load',
    type: 'enum',
    defaultValue: '0 None',
    values: {
      '0.15 Dwelling': 'Dwelling',
      '0.25 Garage': 'Garage',
      '0.35 Terrace': 'Terrasse',
      '0.35 Balcony': 'Balcony',
      '0 None': 'None',
      '0 Other': 'Other'
    }
  },
  aleasClimatiques: {
    label: 'Climatic hazards',
    type: 'enum',
    defaultValue: '0 None',
    values: {
      '0.08 Snow': 'Snow',
      '0 None': 'None'
    }
  }
}

export default ElementsFactories.ZoneFactory('zone', info, textures, customProperties);
