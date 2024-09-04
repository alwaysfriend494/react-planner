import React, { Component } from 'react';
import PropTypes from 'prop-types';
import './overlay.css';
import {
    OverlayInput
} from '../style/export';

let menuHeight = 'auto';

const ButtonLayer = ({ layerID, layer, swapVisibility, scene, copyLayer, selectedLayerID, updateLayer}) => {

    return (
        <div className="button-layer" key={layerID}>
            <button className="layer-button" onClick={(e) => swapVisibility(e, layerID, scene)} style={selectedLayerID == layerID ? {fontWeight: 'bold'} : {} }>{layer.name}</button>
            <OverlayInput
                value={layer.height/100}
                onChange={e => updateLayer(layerID, e.target.value)}
                style={{height: '100%', width: '70px'}}
            />
            <button className="copy-button" onClick={(e) => copyLayer(e, layerID, scene)}>C</button>
        </div>
    )
}

export default class Overlay extends Component {
    constructor(props) {
        super(props);
        this.state = {
            menuHeight: 'auto',
            layerCount: 0,
            lastLayerID: '',
            selectedLayerID: '',
            layers: []
        };
        this.swapVisibility = this.swapVisibility.bind(this);
        this.copyLayer = this.copyLayer.bind(this);
        this.updateLayer = this.updateLayer.bind(this);
    }

    componentDidMount() {
        this.updateLastLayerID();
    }

    componentDidUpdate(prevProps) {
        // Check if the layers have changed
        if (prevProps.state.scene.layers !== this.props.state.scene.layers || prevProps.state.scene.selectedLayer !== this.props.state.scene.selectedLayer) {
            this.updateLastLayerID();
        }
    }

    updateLastLayerID() {
        let layers = this.props.state.scene.layers.entrySeq();
        this.state.selectedLayerID = this.props.state.scene.selectedLayer;
        if (layers.size > 0) {
            const lastID = layers.last()[0]; // Get the last layer ID
            this.setState({ layerCount: layers.count(), lastLayerID: lastID, layers: layers });
        }
    }

    toogle() {
        if (menuHeight == 'auto') {
            menuHeight = '70px';
        } else {
            menuHeight = 'auto';
        }
    }


    addLayer(e) {
        e.stopPropagation();
        let newLayerName = `R+${this.state.layerCount - 4}`;
        this.context.sceneActions.addLayer(newLayerName, `layer-${this.state.layerCount+1}`);
    }

    updateLayer(layerID, height) {
        this.context.sceneActions.setLayerProperties(layerID, { height: height * 100 });
    }

    delLayer(e) {
        e.stopPropagation();
        let delLayerID = '';
        let delLayerAltitude = 0;
        let delLayerHeight = 0;
        this.state.layers.forEach(([layerID, layer]) => {
            if (delLayerAltitude < layer.altitude && layer.order == 1) {
                delLayerAltitude = layer.altitude;
                delLayerHeight = layer.height;
                delLayerID = layerID;
            }
        })
        if (delLayerID == '' || delLayerAltitude == 0 || delLayerHeight == 0) {
            alert("You can't delete an layer any more.");
            return;
        }
        
        this.context.sceneActions.removeLayer(delLayerID, delLayerAltitude, delLayerHeight);
    }

    copyLayer(e, layerID, scene) {
        e.stopPropagation();
        let selectedLayerID = scene.selectedLayer;

        let autosaveKey = 'react-planner_v0';
        let data = JSON.parse(localStorage.getItem(autosaveKey));
        if (data && data.layers) {
            let layerFrom = data.layers[selectedLayerID];
            let layerTo = data.layers[layerID];

            if (layerFrom && layerTo) {
                layerTo.areas = { ...layerFrom.areas, ...layerTo.areas };
                layerTo.holes = { ...layerFrom.holes, ...layerTo.holes };
                layerTo.items = { ...layerFrom.items, ...layerTo.items };
                layerTo.lines = { ...layerFrom.lines, ...layerTo.lines };
                layerTo.vertices = { ...layerFrom.vertices, ...layerTo.vertices };
                layerTo.zones = { ...layerFrom.zones, ...layerTo.zones };
                
                this.context.projectActions.loadProject(data);

                localStorage.setItem(autosaveKey, JSON.stringify(data));
            } else {
                console.error("One of the layers does not exist.");
            }
        } else {
            console.error("No data found in localStorage.");
        }
    }

    swapVisibility(e, selectedLayerID, scene) {
        e.stopPropagation();
        scene.layers.entrySeq().toArray().map(([layerID, layer]) => {
            if (layerID == selectedLayerID) {
                this.context.sceneActions.setLayerProperties(layerID, {visible: true});
            } else {
                this.context.sceneActions.setLayerProperties(layerID, {visible: false});
            }
        });
        this.state.selectedLayerID = selectedLayerID;
        this.context.sceneActions.selectLayer(selectedLayerID);
    };

    render() {
        let scene = this.props.state.scene;

        return (
            <div className="right-menu" style={{ height: menuHeight, transition: 'height 0.3s' }}>
                <div className="header">
                    <button className="header-button" onClick={this.toogle}>Zones d’influences</button>
                </div>
                {
                    this.state.layers.map(([layerID, layer]) => {
                        return (
                            <ButtonLayer key={layerID} layerID={layerID} layer={layer} swapVisibility={this.swapVisibility} scene={scene} copyLayer={this.copyLayer} selectedLayerID={this.state.selectedLayerID} updateLayer={this.updateLayer}/>
                        )
                    })
                }
                <div className="button-control">
                    <button className="control-button" onClick={(e) => this.delLayer(e)}>-</button>
                    <button className="control-button" onClick={(e) => this.addLayer(e)}>+</button>
                </div>

            </div>
        )
    }
};

Overlay.propTypes = {
    state: PropTypes.object.isRequired
};

Overlay.contextTypes = {
    sceneActions: PropTypes.object.isRequired,
    translator: PropTypes.object.isRequired,
    projectActions: PropTypes.object.isRequired
};