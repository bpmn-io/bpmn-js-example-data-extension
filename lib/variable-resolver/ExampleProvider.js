import VariableProvider from '@bpmn-io/variable-resolver/lib/VariableProvider';
import { is } from 'bpmn-js/lib/util/ModelUtil';

export class ExampleProvider extends VariableProvider {

  getVariables(element) {
    if (!is(element, 'bpmn:Process')) {
      return;
    }

    return [
      {
        name: 'ExampleProvider',
        type: 'String',
        info: 'Info String'
      }
    ];

  }
}