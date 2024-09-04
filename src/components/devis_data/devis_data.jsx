import React, { useRef } from 'react';

const devisComponetStyle = {
  position: 'absolute',
  left: '5%',
  top: '10%',
  width:'90%',
  height: '80%',
  background: '#fff',
  border: '10px solid #000'
};

const cancelButtonStyle = {
  fontWeight: 'bold',
  fontSize: '40px',
  textAlign: 'right',
  paddingRight: '10px',
  cursor: 'pointer',
  color: '#000'
}

const iframeStyle = {
  width: '100%',
  height: '90%'
}

const DevisComponent = ({element, layer, state, setIsChiffrage, projectActions}) => {
  const iframeRef = useRef(null);

  const handleValue = () => {
    let data = state.getIn(['scene', 'layers', layer.id, element.prototype, element.id, 'properties']).toJS().devis_data;
    let plan_data = state.getIn(['scene']);
    let element_data = state.getIn(['scene', 'layers', layer.id, element.prototype, element.id]);
    
    const message = {
      type: 'change_devis',
      data: data,
      plan_data: plan_data,
      element_data: element_data
    };

    iframeRef.current.contentWindow.postMessage(JSON.stringify(message), '*');
  };

  const handleMessage = (event) => {
    const message = JSON.parse(event.data);
    if (message.type == 'changed_devis') {
      projectActions.setChiffrage(layer.id, element.prototype, element.id, { devis_data: JSON.stringify(message.data) });
    }
  };

  React.useEffect(() => {
    window.addEventListener('message', handleMessage);
    setTimeout(function() {
        handleValue();
    }, 500);

    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, []);

  return (
    <div style={{ ...devisComponetStyle }}>
      <div style={{ ...cancelButtonStyle }} onClick={() => setIsChiffrage(false)}>&times;</div>
      <iframe
        ref={iframeRef}
        src='/devis_data/index.html'
        style={{ ...iframeStyle }}
      ></iframe>
    </div>
  );
};

export default DevisComponent;
