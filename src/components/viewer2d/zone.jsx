import React from 'react';
import PropTypes from 'prop-types';
import polylabel from 'polylabel';
import zonepolygon from 'area-polygon';

const STYLE_TEXT = {
  textAnchor: 'middle',
  fontSize: '12px',
  fontFamily: '"Courier New", Courier, monospace',
  pointerEvents: 'none',
  fontWeight: 'bold',

  //http://stackoverflow.com/questions/826782/how-to-disable-text-selection-highlighting-using-css
  WebkitTouchCallout: 'none', /* iOS Safari */
  WebkitUserSelect: 'none', /* Chrome/Safari/Opera */
  MozUserSelect: 'none', /* Firefox */
  MsUserSelect: 'none', /* Internet Explorer/Edge */
  userSelect: 'none'
};


export default function Zone({layer, zone, catalog}) {

  let rendered = catalog.getElement(zone.type).render2D(zone, layer);

  let renderedZoneSize = null;

  if (zone.selected) {
    let polygon = zone.vertices.toArray().map(vertexID => {
      let {x, y} = layer.vertices.get(vertexID);
      return [x, y];
    });

    let polygonWithHoles = polygon;

    zone.holes.forEach(holeID => {

      let polygonHole = layer.zones.get(holeID).vertices.toArray().map(vertexID => {
        let {x, y} = layer.vertices.get(vertexID);
        return [x, y];
      });

      polygonWithHoles = polygonWithHoles.concat(polygonHole.reverse());
    });

    let center = polylabel([polygonWithHoles], 1.0);
    let zoneSize = zonepolygon(polygon, false);

    //subtract holes zone
    zone.holes.forEach(zoneID => {
      let hole = layer.zones.get(zoneID);
      let holePolygon = hole.vertices.toArray().map(vertexID => {
        let {x, y} = layer.vertices.get(vertexID);
        return [x, y];
      });
      zoneSize -= zonepolygon(holePolygon, false);
    });

    renderedZoneSize = (
      <text x="0" y="0" transform={`translate(${center[0]} ${center[1]}) scale(1, -1)`} style={STYLE_TEXT}>
        {(zoneSize / 10000).toFixed(2)} m{String.fromCharCode(0xb2)}
      </text>
    )
  }

  return (
    <g
      data-element-root
      data-prototype={zone.prototype}
      data-id={zone.id}
      data-selected={zone.selected}
      data-layer={layer.id}
    >
      {rendered}
      {renderedZoneSize}
    </g>
  )

}

Zone.propTypes = {
  zone: PropTypes.object.isRequired,
  layer: PropTypes.object.isRequired,
  catalog: PropTypes.object.isRequired
};


