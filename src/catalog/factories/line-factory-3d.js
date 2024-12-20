import {
    TextureLoader,
    Mesh,
    RepeatWrapping,
    Vector2,
    BoxGeometry,
    MeshBasicMaterial,
    Group
  } from 'three';
  
  import ThreeBSP from '../../utils/threeCSG.es6';
  import {verticesDistance} from '../../utils/geometry';
  import * as SharedStyle from '../../shared-style';
  
  const halfPI = Math.PI / 2;
  
  export function buildLine(element, layer, scene)
  {
    // Get the two vertices of the line
    let vertex0 = layer.vertices.get(element.vertices.get(0));
    let vertex1 = layer.vertices.get(element.vertices.get(1));
    let inverted = false;
  
    // The first vertex is the smaller one
    if (vertex0.x > vertex1.x) {
      let app = vertex0;
      vertex0 = vertex1;
      vertex1 = app;
      inverted = true;
    }
  
    // Get height and thickness of the line converting them into the current scene units
    let height = element.properties.getIn(['height', 'length']);
    let thickness = element.properties.getIn(['thickness', 'length']);
    let halfThickness = thickness / 2;
    let faceThickness = 0.2;
    let faceDistance = 1;
  
    let distance = verticesDistance( vertex0, vertex1 );
    let halfDistance = distance / 2;
  
    let soulMaterial = new MeshBasicMaterial( {color: ( element.selected ? SharedStyle.MESH_SELECTED : 0xD3D3D3 )} );
    let soul = new Mesh( new BoxGeometry(distance, height, thickness), soulMaterial );
  
    let alpha = Math.asin((vertex1.y - vertex0.y) / (distance));
  
    let sinAlpha = Math.sin(alpha);
    let cosAlpha = Math.cos(alpha);
  
    soul.position.y += height / 2;
    soul.position.x += halfDistance * cosAlpha;
    soul.position.z -= halfDistance * sinAlpha;
  
    soul.rotation.y = alpha;
  
    element.holes.forEach( holeID => {
      let holeData = layer.holes.get(holeID);
  
      let holeWidth = holeData.properties.getIn(['width', 'length']);
      let holeHeight = holeData.properties.getIn(['height', 'length']);
      let holeAltitude = holeData.properties.getIn(['altitude', 'length']);
      let offset = inverted ? 1 - holeData.offset : holeData.offset;
      let holeDistance = offset * distance;
  
      let holeGeometry = new BoxGeometry( holeWidth, holeHeight, thickness );
      let holeMesh = new Mesh( holeGeometry );
  
      holeMesh.position.y += holeHeight / 2 + holeAltitude;
      holeMesh.position.x += holeDistance * cosAlpha;
      holeMesh.position.z -= holeDistance * sinAlpha;
  
      holeMesh.rotation.y = alpha;
  
      let lineBSP = new ThreeBSP( soul );
      let holeBSP = new ThreeBSP( holeMesh );
  
      let lineWithHoleBSP = lineBSP.subtract( holeBSP );
      soul = lineWithHoleBSP.toMesh( soulMaterial );
    });
  
    soul.name = 'soul';
  
    let frontMaterial = new MeshBasicMaterial();
    let backMaterial = new MeshBasicMaterial();
  
    let scaleFactor = faceThickness / thickness;
    let texturedFaceDistance = halfThickness + faceDistance;
  
    let frontFace = soul.clone();
    frontFace.material = frontMaterial;
    frontFace.scale.set( 1, 1, scaleFactor );
    frontFace.position.x += texturedFaceDistance * Math.cos(alpha - ( halfPI ) );
    frontFace.position.z -= texturedFaceDistance * Math.sin(alpha - ( halfPI ) );
    frontFace.name = 'frontFace';
  
    let backFace = soul.clone();
    backFace.material = backMaterial;
    backFace.scale.set( 1, 1, scaleFactor );
    backFace.position.x += texturedFaceDistance * Math.cos(alpha + ( halfPI ) );
    backFace.position.z -= texturedFaceDistance * Math.sin(alpha + ( halfPI ) );
    backFace.name = 'backFace';
  
    let merged = new Group();
    merged.add( soul, frontFace, backFace );
  
    return Promise.resolve( merged );
  }
  
  export function updatedLine( element, layer, scene, mesh, oldElement, differences, selfDestroy, selfBuild ) {
    let noPerf = () => { selfDestroy(); return selfBuild(); };
  
    let soul = mesh.getObjectByName('soul');
    let frontFace = mesh.getObjectByName('frontFace');
    let backFace = mesh.getObjectByName('backFace');
  
    if( differences[0] == 'selected' ) {
      soul.material = new MeshBasicMaterial( {color: ( element.selected ? SharedStyle.MESH_SELECTED : 0xD3D3D3 )} );
    }
    else if( differences[0] == 'properties' ){
  
      if( differences[1] == 'thickness' ){
        let newThickness = element.getIn(['properties', 'thickness', 'length']);
        let oldThickness = oldElement.getIn(['properties', 'thickness', 'length']);
        let halfNewThickness = newThickness / 2;
        let texturedFaceDistance = halfNewThickness + 1;
        let originalThickness = oldThickness / soul.scale.z;
        let alpha = soul.rotation.y;
  
        let xTemp = texturedFaceDistance * Math.cos(alpha - ( halfPI ) );
        let zTemp = texturedFaceDistance * Math.sin(alpha - ( halfPI ) );
  
        soul.scale.set( 1, 1, ( newThickness / originalThickness ) );
  
        frontFace.position.x = soul.position.x + ( xTemp );
        frontFace.position.z = soul.position.z + ( zTemp );
  
        backFace.position.x = soul.position.x - ( xTemp );
        backFace.position.z = soul.position.z - ( zTemp );
      }
      else return noPerf();
    }
    else return noPerf();
  
    return Promise.resolve(mesh);
  }
  