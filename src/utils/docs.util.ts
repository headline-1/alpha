import { AnyCommand, AnyParameters } from '../command';

/**
 * Creates a string containing a standard markdown document that describes passed command..
 */
export const generateDoc = <T extends AnyParameters, R>(command: AnyCommand<T, R>): string => {
  const parameters = Object.entries(command.parameters);
  const types = Object.values(command.parameters).map(input => input.type);

  const parametersResult = parameters.length ? `
<h3>Command Parameters</h3>
<br/>
<table>
  <thead><tr>
    <td>Configuration name</td>
    <td>CLI</td>
    <td>Environmental variable</td>
    <td>Type</td>
    <td>Required</td>
    <td>Default value</td>
    <td>Description</td>
  </tr></thead>
  ${Object.entries(command.parameters).map(([arg, value]) => `
    <tr>
      <td>${arg}</td>
      <td>${value.cli || '-'}</td>
      <td>${value.env || '-'}</td>
      <td>${value.type.name}</td>
      <td>${!value.default && !value.type.optional ? 'yes' : 'no'}</td>
      <td><pre>${value.default || '-'}</pre></td>
      <td>${value.description.replace(/\\n/g, '<br />')}</td>
    </tr>`).join('')
      }
</table>`
    : '<p>This command has no parameters.</p>';

  const typesResult = types.length ? `
<h3>Used Types</h3>
<table>
  <thead><tr>
    <td>Type</td>
    <td>Description</td>
  </tr></thead>
  ${types.map(type => `
    <tr>
      <td>${type.name}</td>
      <td>${type.description.replace(/\n/g, '<br />')}
    </td></tr>`).join('')
      }
</table>`
    : '';

  return `
<h1>${command.name}</h1>
<br/>
<div>
${command.description
    ? command.description.replace(/\n/g, '<br />')
    : '<p>No description has been provided for this command.</p>'
    }
</div>

${parametersResult}
${typesResult}
`.replace(/\s{2,}/g, ' ').trim() + '\n';
};
