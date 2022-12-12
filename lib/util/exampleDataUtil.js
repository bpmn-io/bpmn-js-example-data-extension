import { getBusinessObject, is } from 'bpmn-js/lib/util/ModelUtil';


export function getOutputData(element) {
  const data = getExtensionElements(element, 'exampleData:Output');

  if (data.length > 0) {
    return data[0].data;
  }
}

function getExtensionElements(element, type) {
  const bo = getBusinessObject(element);

  let elements = [];
  const extensionElements = bo.get('extensionElements');

  if (typeof extensionElements !== 'undefined') {
    const extensionValues = extensionElements.get('values');

    console.log('extensionValues', extensionValues);

    if (typeof extensionValues !== 'undefined') {
      elements = extensionValues.filter(e => is(e, type));
      console.log('elements', elements);

    }
  }

  return elements;
}