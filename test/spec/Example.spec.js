import TestContainer from 'mocha-test-container-support';

import { BpmnPropertiesPanelModule, BpmnPropertiesProviderModule, ZeebePropertiesProviderModule } from 'bpmn-js-properties-panel';

import ZeebeBehaviorsModule from 'camunda-bpmn-js-behaviors/lib/camunda-cloud';
import ZeebeModdle from 'zeebe-bpmn-moddle/resources/zeebe';

import VariablesModule from '@bpmn-io/variable-resolver';

import VariableProvider from 'lib/';

import Modeler from 'bpmn-js/lib/Modeler';

import simpleXML from '../fixtures/simple.bpmn';
import { setBpmnJS, clearBpmnJS, insertCoreStyles } from '../TestHelper';

const singleStart = window.__env__ && window.__env__.SINGLE_START;

describe('Example', function() {

  let container;

  beforeEach(function() {
    container = TestContainer.get(this);
  });

  let modelerContainer, propertiesContainer;

  beforeEach(function() {
    insertCoreStyles();
    modelerContainer = document.createElement('div');
    modelerContainer.classList.add('modeler-container');

    propertiesContainer = document.createElement('div');
    propertiesContainer.classList.add('properties-container');

    container = TestContainer.get(this);

    container.appendChild(modelerContainer);
    container.appendChild(propertiesContainer);
  });

  async function createModeler(xml, options = {}, BpmnJS = Modeler) {
    const {
      shouldImport = true,
      additionalModules = [
        ZeebeBehaviorsModule,
        BpmnPropertiesPanelModule,
        BpmnPropertiesProviderModule,
        ZeebePropertiesProviderModule
      ],
      moddleExtensions = {
        zeebe: ZeebeModdle
      },
      description = {},
      layout = {}
    } = options;

    clearBpmnJS();

    const modeler = new BpmnJS({
      container: modelerContainer,
      keyboard: {
        bindTo: document
      },
      additionalModules,
      moddleExtensions,
      propertiesPanel: {
        parent: propertiesContainer,
        feelTooltipContainer: container,
        description,
        layout
      },
      ...options
    });

    setBpmnJS(modeler);

    if (!shouldImport) {
      return { modeler };
    }

    try {
      const result = await modeler.importXML(xml);

      return { error: null, warnings: result.warnings, modeler: modeler };
    } catch (err) {
      return { error: err, warnings: err.warnings, modeler: modeler };
    }
  }

  (singleStart ? it.only : it)('example', async function() {
    const result = await createModeler(simpleXML,
      {
        additionalModules: [
          ZeebeBehaviorsModule,
          BpmnPropertiesPanelModule,
          BpmnPropertiesProviderModule,
          ZeebePropertiesProviderModule,
          VariablesModule,
          VariableProvider
        ],
        moddleExtensions: {
          zeebe: ZeebeModdle
        },
      });

    expect(result.error).to.not.exist;
  });

});
