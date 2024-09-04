import React from 'react';
import ReactDOM from 'react-dom';
import ContainerDimensions from 'react-container-dimensions';
import Immutable, {Map} from 'immutable';
import immutableDevtools from 'immutable-devtools';
import {createStore} from 'redux';
import {Provider} from 'react-redux';

import MyCatalog from './catalog/mycatalog';

import ToolbarScreenshotButton from './ui/toolbar-screenshot-button';

import {
  Models as PlannerModels,
  reducer as PlannerReducer,
  ReactPlanner,
  Plugins as PlannerPlugins,
  ReactPlannerActions
} from 'react-planner'; //react-planner

const { loadProject } = ReactPlannerActions.projectActions;

//define state
let AppState = Map({
  'react-planner': new PlannerModels.State()
});

const planChangeActions = [
  'SET_PROPERTIES',
  'SET_ITEMS_ATTRIBUTES',
  'SET_LINES_ATTRIBUTES',
  'SET_HOLES_ATTRIBUTES',
  'REMOVE',
  'UNDO',
  'SET_PROJECT_PROPERTIES',
  'ADD_HORIZONTAL_GUIDE',
  'ADD_VERTICAL_GUIDE',
  'ADD_CIRCULAR_GUIDE',
  'REMOVE_HORIZONTAL_GUIDE',
  'REMOVE_VERTICAL_GUIDE',
  'REMOVE_CIRCULAR_GUIDE',
  'END_DRAWING_ITEM',
  'END_DRAGGING_ITEM',
  'END_ROTATING_ITEM',
  'END_DRAWING_HOLE',
  'END_DRAGGING_HOLE',
  'END_DRAWING_LINE',
  'END_DRAGGING_LINE',
  'ADD_GROUP',
  'ADD_GROUP_FROM_SELECTED',
  'ADD_TO_GROUP',
  'REMOVE_FROM_GROUP',
  'SET_GROUP_PROPERTIES',
  'SET_GROUP_ATTRIBUTES',
  'SET_GROUP_BARYCENTER',
  'REMOVE_GROUP',
  'REMOVE_GROUP_AND_DELETE_ELEMENTS',
  'GROUP_TRANSLATE',
  'GROUP_ROTATE',
  'ADD_LAYER',
  'SET_LAYER_PROPERTIES',
  'REMOVE_LAYER',
  'END_DRAGGING_VERTEX',
];

//define reducer
let reducer = (state, action) => {
  state = state || AppState;
  state = state.update('react-planner', plannerState => PlannerReducer(plannerState, action));
  if (planChangeActions.includes(action.type)) {
    const plannerState = state.get('react-planner');
    const data = {
      type: action.type,
      data: plannerState.getIn(['scene'])
    };

    const message = JSON.stringify({
      type: 'plan_changed',
      data: data
    });

    window.postMessage(message, window.location.origin);
  }

  return state;
};

let blackList = isProduction === true ? [] : [
  'UPDATE_MOUSE_COORDS',
  'UPDATE_ZOOM_SCALE',
  'UPDATE_2D_CAMERA'
];

if( !isProduction ) {
  console.info('Environment is in development and these actions will be blacklisted', blackList);
  console.info('Enable Chrome custom formatter for Immutable pretty print');
  immutableDevtools( Immutable );
}

//init store
let store = createStore(
  reducer,
  null,
  !isProduction && window.devToolsExtension ?
    window.devToolsExtension({
      features: {
        pause   : true,     // start/pause recording of dispatched actions
        lock    : true,     // lock/unlock dispatching actions and side effects
        persist : true,     // persist states on page reloading
        export  : true,     // export history of actions in a file
        import  : 'custom', // import history of actions from a file
        jump    : true,     // jump back and forth (time travelling)
        skip    : true,     // skip (cancel) actions
        reorder : true,     // drag and drop actions in the history list
        dispatch: true,     // dispatch custom actions or action creators
        test    : true      // generate tests for the selected actions
      },
      actionsBlacklist: blackList,
      maxAge: 999999
    }) :
    f => f
);

let plugins = [
  PlannerPlugins.Keyboard(),
  PlannerPlugins.Autosave('react-planner_v0'),
  PlannerPlugins.ConsoleDebugger(),
];

let toolbarButtons = [
  ToolbarScreenshotButton,
];

window.addEventListener("message", function(event) {
  try {
    if (typeof event.data === 'string') {
      const message = JSON.parse(event.data);
      if (message.type === 'plan_changed') {
        console.log(message.data.type);
        //set data
      } else if (message.type == 'react_planner_load') {

        store.dispatch(loadProject(JSON.parse(message.data)));
      }
    } else {
      console.warn('Received data is not a JSON string: ', event.data);
    }
  } catch (error) {
    console.error('Error processing message:', error);
  }
});

//render
ReactDOM.render(
  (
    <Provider store={store}>
      <ContainerDimensions>
        {({width, height}) =>
          <ReactPlanner
            catalog={MyCatalog}
            width={width}
            height={height}
            plugins={plugins}
            toolbarButtons={toolbarButtons}
            stateExtractor={state => state.get('react-planner')}
          />
        }
      </ContainerDimensions>
    </Provider>
  ),
  document.getElementById('app')
);

