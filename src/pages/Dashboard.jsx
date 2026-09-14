import { useEffect, useState } from 'react';
import { api } from '../api';
import { useAuth } from '../auth';

const CONTEXTS = ['professional', 'personal', 'gaming'];
const LEVELS = ['public', 'consented', 'private'];
const NAME_TYPES = [
  'legal',
  'preferred',
  'professional',
  'username',
  'nickname',
  'religious',
];
const title = (text) => text.charAt(0).toUpperCase() + text.slice(1);

export default function Dashboard() {
  const { user } = useAuth();
  const base = `/users/${user.id}`;
  const [context, setContext] = useState('professional');
  const [attributes, setAttributes] = useState([]);
  const [definitions, setDefinitions] = useState([]);
  const [names, setNames] = useState([]);
  const [message, setMessage] = useState('');

  async function load(ctx) {
    const [persona, defs, nameData] = await Promise.all([
      api(`${base}/personas/${ctx}`),
      api(`/attribute-definitions?context=${ctx}`),
      api(`${base}/names?context=${ctx}`),
    ]);

    setAttributes(persona.attributes);
    setDefinitions(defs);
    setNames(nameData.names);
  }

  useEffect(() => {
    setMessage('');
    load(context).catch((err) => setMessage(err.message));
  }, [context]);

  async function saveAttributes(changes, note) {
    try {
      const persona = await api(`${base}/personas/${context}`, {
        method: 'PATCH',
        body: { attributes: changes },
      });
      setAttributes(persona.attributes);
      setMessage(note);
    } catch (err) {
      setMessage(err.message);
    }
  }

  async function addName(name) {
    try {
      await api(`${base}/names`, {
        method: 'POST',
        body: { ...name, context },
      });
      await load(context);
      setMessage('Name added.');
    } catch (err) {
      setMessage(err.message);
    }
  }

  async function removeName(id) {
    try {
      await api(`${base}/names/${id}`, { method: 'DELETE' });
      await load(context);
      setMessage('Name removed.');
    } catch (err) {
      setMessage(err.message);
    }
  }

  const unused = definitions.filter(
    (d) => !attributes.some((a) => a.attribute_key === d.attribute_key)
  );

  return (
    <section>
      <h1>Your personas</h1>
      <div role="tablist" aria-label="Persona" className="tabs">
        {CONTEXTS.map((c) => (
          <button
            key={c}
            type="button"
            role="tab"
            aria-selected={c === context}
            onClick={() => setContext(c)}
          >
            {title(c)}
          </button>
        ))}
      </div>
      <p role="status" aria-live="polite">
        {message}
      </p>
      <h2>{title(context)} attributes</h2>
      <table>
        <thead>
          <tr>
            <th>Attribute</th>
            <th>Value</th>
            <th>Who can see it</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {attributes.map((a) => (
            <AttributeRow
              key={a.attribute_key}
              attribute={a}
              onSave={(value, visibility) =>
                saveAttributes(
                  [
                    {
                      attribute_key: a.attribute_key,
                      attribute_value: value,
                      visibility_level: visibility,
                    },
                  ],
                  'Saved.'
                )
              }
              onRemove={() =>
                saveAttributes(
                  [{ attribute_key: a.attribute_key, attribute_value: null }],
                  'Removed.'
                )
              }
            />
          ))}
        </tbody>
      </table>
      {unused.length > 0 && (
        <AddAttribute
          definitions={unused}
          onAdd={(key, value, visibility) =>
            saveAttributes(
              [
                {
                  attribute_key: key,
                  attribute_value: value,
                  visibility_level: visibility,
                },
              ],
              'Added.'
            )
          }
        />
      )}
      <h2>{title(context)} names</h2>
      <ul>
        {names.map((n) => (
          <li key={n.id}>
            {n.name_value}{' '}
            <small>
              ({n.name_type}
              {n.is_default ? ', default' : ''}, {n.visibility_level})
            </small>
            <button
              type="button"
              onClick={() => removeName(n.id)}
              arialabel={`Remove ${n.name_value}`}
            >
              Remove
            </button>
          </li>
        ))}
      </ul>
      <AddName onAdd={addName} />
    </section>
  );
}

function AttributeRow({ attribute, onSave, onRemove }) {
  const [value, setValue] = useState(attribute.attribute_value);
  const [visibility, setVisibility] = useState(attribute.visibility_level);
  const id = `attr-${attribute.attribute_key}`;

  return (
    <tr>
      <td>
        <label htmlFor={id}>{attribute.label}</label>
      </td>
      <td>
        <input
          id={id}
          value={value}
          onChange={(e) => setValue(e.target.value)}
        />
      </td>
      <td>
        <select
          aria-label={`Visibility of ${attribute.label}`}
          value={visibility}
          onChange={(e) => setVisibility(e.target.value)}
        >
          {LEVELS.map((l) => (
            <option key={l} value={l}>
              {l}
            </option>
          ))}
        </select>
      </td>
      <td>
        <button type="button" onClick={() => onSave(value, visibility)}>
          Save
        </button>
        <button type="button" onClick={onRemove}>
          Remove
        </button>
      </td>
    </tr>
  );
}

function AddAttribute({ definitions, onAdd }) {
  const [key, setKey] = useState(definitions[0].attribute_key);
  const [value, setValue] = useState('');
  const [visibility, setVisibility] = useState('public');

  return (
    <form
      className="inline"
      onSubmit={(e) => {
        e.preventDefault();
        onAdd(key, value, visibility);
        setValue('');
      }}
    >
      <label htmlFor="new-key">New attribute</label>
      <select id="new-key" value={key} onChange={(e) => setKey(e.target.value)}>
        {definitions.map((d) => (
          <option key={d.attribute_key} value={d.attribute_key}>
            {d.label}
          </option>
        ))}
      </select>
      <label htmlFor="new-value">Value</label>
      <input
        id="new-value"
        required
        value={value}
        onChange={(e) => setValue(e.target.value)}
      />
      <label htmlFor="new-visibility">Visibility</label>
      <select
        id="new-visibility"
        value={visibility}
        onChange={(e) => setVisibility(e.target.value)}
      >
        {LEVELS.map((l) => (
          <option key={l} value={l}>
            {l}
          </option>
        ))}
      </select>
      <button type="submit">Add</button>
    </form>
  );
}

function AddName({ onAdd }) {
  const [nameValue, setNameValue] = useState('');
  const [nameType, setNameType] = useState('preferred');
  const [isDefault, setIsDefault] = useState(false);

  return (
    <form
      className="inline"
      onSubmit={(e) => {
        e.preventDefault();
        onAdd({
          name_value: nameValue,
          name_type: nameType,
          is_default: isDefault,
        });
        setNameValue('');
      }}
    >
      <label htmlFor="name-value">New name</label>
      <input
        id="name-value"
        required
        value={nameValue}
        onChange={(e) => setNameValue(e.target.value)}
      />
      <label htmlFor="name-type">Type</label>
      <select
        id="name-type"
        value={nameType}
        onChange={(e) => setNameType(e.target.value)}
      >
        {NAME_TYPES.map((t) => (
          <option key={t} value={t}>
            {t}
          </option>
        ))}
      </select>
      <label>
        <input
          type="checkbox"
          checked={isDefault}
          onChange={(e) => setIsDefault(e.target.checked)}
        />{' '}
        Default for this persona
      </label>
      <button type="submit">Add name</button>
    </form>
  );
}
