import VariableProvider from '@bpmn-io/variable-resolver/lib/VariableProvider';
import { parser } from 'lezer-feel';
import { getOutputData } from '../util/exampleDataUtil';

export class ExampleProvider extends VariableProvider {
  getVariables(element) {
    const data = getOutputData(element);

    console.log('ExampleProvider.getVariables', element, data);

    if (!data) {
      return;
    }

    const parsedData = getVariablesFromString(data);

    console.log('parsedData', parsedData);

    return parsedData;

  }
}

function getVariablesFromString(parseableExp) {
  const variables = [];
  const expressions = parseFeel(parseableExp);

  console.log('expressions', expressions);


  if (!expressions) {
    return variables;
  }

  // stack[0].children[0].children[0]; // root=>expression=>context

  expressions.forEach(expression => {
    console.log('expression', expression);
    if (expression.name !== 'Expressions' || !expression.children) {
      return;
    }

    expression.children.forEach(context => {
      console.log('context', context);
      if (context.name !== 'Context' || !context.children) {
        return;
      }

      context.children.forEach(entry => {
        console.log('entry', entry);
        if (entry.name !== 'ContextEntry') {
          return;
        }

        console.log('entry handled', handleContextEntry(entry));

        variables.push(handleContextEntry(entry));
      });
    });
  });

  // if (!rootContext || rootContext.name !== 'Context') {
  //   return variables;
  // }

  // rootContext.children.forEach(entry => {
  //   variables.push(handleContextEntry(entry));
  // });

  return variables;
}

function handleContextEntry(entry) {

  const key = entry.children[0];
  const value = entry.children[1];

  console.log('handleContextEntry', entry, key, value);

  const result = {
    name: key.content,
    type: getType(value.name),
    info:  `Example: ${value.content}`,
    _entries: handleContextValue(value),
    _value: value.content,
    _entry: value
  };

  // TODO: fix in variable resolver (nested types)
  result.detail = result.type;

  result.entries = result._entries.filter(e => !!e.name);

  if (result.type === 'List') {
    result.isList = true;
  }

  if (result.name.startsWith('"')) {
    result.name = result.name.substring(1, result.name.length - 1);
  }

  return result;
}

function handleContextValue(value) {
  if (value.name === 'Context') {
    return value.children.map(handleContextEntry) ;
  }

  if (value.name === 'List') {
    return value.children.map(handleContextValue).flat() ;
  }

  return [
    {
      type: getType(value.name),
      _value: value.content,
      _entry: value
    }
  ];
}

function parseFeel(exp) {
  const tree = parser.parse(exp);

  const stack = [
    {
      children: []
    }
  ];

  tree.iterate({
    enter(node) {

      const {
        name,
        from,
        to
      } = node;


      const skip = (
        (name === exp.slice(from, to) && name !== 'null')
            || name === 'Identifier'
      );

      const _node = {
        name,
        from,
        to,
        children: [],
        skip,
        content: exp.slice(from, to)
      };

      stack.push({
        ..._node
      });

    },

    leave(node) {
      const current = stack.pop();

      if (current.skip) {
        return;
      }

      const parent = stack[stack.length - 1];

      parent.children.push(current);
    }
  });

  return stack[0].children; // root=>expressions
}

function getType(type) {
  const name = type.replace('Literal', '');

  switch (name) {
  case 'Numeric':
    return 'Number';
  case 'VariableName':
    return 'Variable';
  default:
    return name;
  }
}
