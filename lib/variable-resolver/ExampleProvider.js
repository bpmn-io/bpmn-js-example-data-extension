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

    return [
      {
        name: 'ExampleProvider',
        type: 'String',
        info: 'Info String'
      }
    ];

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

  const type = getType(value.name);
  let info;

  if (type !== 'Context') {
    info = `Example: ${value.content}`;
  } else {

  }


  let name = key.content;
  if (name.startsWith('"')) {
    name = name.substring(1, name.length - 1);
  }

  return {
    name: name,
    type: type,
    info: info,
    _entries: handleContextValue(value),
    _value: value.content,
    _entry: value
  };
}

function handleContextValue(value) {
  if (value.name === 'Context') {
    return value.children.map(handleContextEntry) ;
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
