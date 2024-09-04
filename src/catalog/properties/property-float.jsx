import React from 'react';
import PropTypes from 'prop-types';
import { FormLabel, FormFloatInput } from '../../components/style/export';
import PropertyStyle from './shared-property-style';

export default function PropertyFloat({value, onUpdate, onValid, configs, sourceElement, internalState, state}) {

  let update = (val) => {
    let number = parseFloat(val);

    if (isNaN(number)) {
      number = 0;
    }

    if (configs.hook) {
      return configs.hook(number, sourceElement, internalState, state).then(_val => {
        return onUpdate(_val);
      });
    }

    return onUpdate(number);
  };

  return (
    <table className="PropertyNumber" style={PropertyStyle.tableStyle}>
      <tbody>
      <tr>
        <td style={PropertyStyle.firstTdStyle}><FormLabel>{configs.label}</FormLabel></td>
        <td>
          <FormFloatInput
            value={value}
            onChange={event => update(event.target.value)}
            onValid={onValid}
            min={configs.min}
            max={configs.max}/>
        </td>
      </tr>
      </tbody>
    </table>
  );

}

PropertyFloat.propTypes = {
  value: PropTypes.any.isRequired,
  onUpdate: PropTypes.func.isRequired,
  onValid: PropTypes.func,
  configs: PropTypes.object.isRequired,
  sourceElement: PropTypes.object,
  internalState: PropTypes.object,
  state: PropTypes.object.isRequired
};
