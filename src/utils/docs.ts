import { AnyCommand } from '../command';

/**
 * Creates a string containing a standard markdown document that describes passed command..
 */
export const generateDoc = (command: AnyCommand): string => `
# ${command.name}

${
  command.description
    ? command.description.replace(/\n/g, '<br />')
    : 'No description has been provided for this action.'
}

### Command Parameters

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
${Object.entries(command.parameters).map(([arg, value]) => `<tr>
<td>${arg}</td>
<td>${value.cli || '-'}</td>
<td>${value.env || '-'}</td>
<td>${value.type.name}</td>
<td>${!value.default && value.required ? 'yes' : 'no' }</td>
<td><pre>${value.default || '-'}</pre></td>
<td>${value.description.replace(/\n/g, '<br />')}</td>
</tr>`).join('')}
</table>

### Used Types

<table>
<thead><tr>
<td>Type</td>
<td>Description</td>
</tr></thead>
${Object.values(command.parameters)
  .map(input => input.type)
  .map(type => `<tr>
<td>${type.name}</td>
<td>${type.description.replace(/\n/g, '<br />')}</td>
</tr>`)
  .join('')}
</table>
`;
