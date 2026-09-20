import { useEffect, useState } from 'react';
import { Navigate, NavLink, useParams } from 'react-router-dom';
import { Check, Pencil, Plus, Trash2, X } from 'lucide-react';
import { api } from '../api';
import { useAuth } from '../auth';
import Avatar from '../components/Avatar';
import PageHead from '../components/PageHead';
import { findPersona, PERSONAS, VISIBILITY } from '../personas';

const LEVELS = Object.keys(VISIBILITY);
const NAME_TYPES = [
  'legal',
  'preferred',
  'professional',
  'username',
  'nickname',
  'religious',
];
const ROW = 'border-t border-line py-3 first:border-t-0';
const FORM =
  'grid items-end gap-3 sm:grid-cols-[repeat(auto-fit,minmax(12rem,1fr))]';

const tabClass = ({ isActive }) =>
  `flex items-center gap-2 whitespace-nowrap rounded-lg px-4 py-2 font-semibold no-underline ${
    isActive ? 'bg-accent text-accent-ink' : 'text-muted hover:text-ink'
  }`;

export default function PersonaEditor() {
  const { context } = useParams();
  if (!findPersona(context))
    return <Navigate to="/personas/professional" replace />;

  return (
    <>
      <PageHead title="Profile management">
        Manage the details each persona shares.
      </PageHead>
      <nav
        aria-label="Persona"
        className="mb-4 flex w-fit max-w-full gap-1 overflow-x-auto rounded-xl border border-line bg-surface p-1"
      >
        {PERSONAS.map((p) => (
          <NavLink
            key={p.context}
            to={`/personas/${p.context}`}
            className={tabClass}
          >
            <p.Icon aria-hidden="true" size={18} />
            {p.label}
          </NavLink>
        ))}
      </nav>
      {/* key={context} gives each persona fresh state, so no value leaks between personas. */}
      <Editor key={context} context={context} />
    </>
  );
}

function Editor({ context }) {
  const { user } = useAuth();
  const base = `/users/${user.id}`;
  const persona = findPersona(context);
  const [attributes, setAttributes] = useState(null);
  const [definitions, setDefinitions] = useState([]);
  const [names, setNames] = useState([]);
  const [message, setMessage] = useState('');
  const [adding, setAdding] = useState(null); // 'attribute', 'name' or null

  // The same three reads as the old Dashboard.jsx.
  const load = () =>
    Promise.all([
      api(`${base}/personas/${context}`),
      api(`/attribute-definitions?context=${context}`),
      api(`${base}/names?context=${context}`),
    ]).then(([personaData, defs, nameData]) => {
      setAttributes(personaData.attributes);
      setDefinitions(defs);
      setNames(nameData.names);
    });

  useEffect(() => {
    load().catch((err) => setMessage(err.message));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  async function saveAttributes(changes, note) {
    try {
      const data = await api(`${base}/personas/${context}`, {
        method: 'PATCH',
        body: { attributes: changes },
      });
      setAttributes(data.attributes);
      setMessage(note);
      return true;
    } catch (err) {
      setMessage(err.message);
      return false;
    }
  }

  async function addName(name) {
    try {
      await api(`${base}/names`, {
        method: 'POST',
        body: { ...name, context },
      });
      await load();
      setMessage('Name added.');
      setAdding(null);
    } catch (err) {
      setMessage(err.message);
    }
  }

  async function removeName(id) {
    try {
      await api(`${base}/names/${id}`, { method: 'DELETE' });
      await load();
      setMessage('Name removed.');
    } catch (err) {
      setMessage(err.message);
    }
  }

  if (!attributes)
    return (
      <p role="status" aria-live="polite">
        {message || 'Loading…'}
      </p>
    );

  const unused = definitions.filter(
    (d) => !attributes.some((a) => a.attribute_key === d.attribute_key)
  );
  const displayName =
    names.find((n) => n.is_default)?.name_value ||
    names[0]?.name_value ||
    user.email;

  return (
    <>
      <p role="status" aria-live="polite" className="status">
        {message}
      </p>

      <section className="card mb-4 overflow-hidden p-0">
        <div className={`h-22 ${persona.banner}`} />
        <div className="flex items-end gap-4 px-5 pb-5">
          <Avatar
            name={displayName}
            size="lg"
            className={`-mt-9 ${persona.text}`}
          />
          <div className="min-w-0">
            <h2 className="text-lg font-bold">{displayName}</h2>
            <p className="text-muted">{persona.label} persona</p>
          </div>
        </div>
      </section>

      <section className="card mb-4">
        <div className="mb-2 flex items-center justify-between gap-4">
          <h2 className="card-title">{persona.label} details</h2>
          {unused.length > 0 && adding !== 'attribute' && (
            <button
              type="button"
              className="btn btn-ghost"
              onClick={() => setAdding('attribute')}
            >
              <Plus aria-hidden="true" size={18} />
              Add detail
            </button>
          )}
        </div>
        {attributes.length === 0 && (
          <p className="text-muted">No details yet. Add one to start.</p>
        )}
        <ul>
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
        </ul>
        {adding === 'attribute' && unused.length > 0 && (
          <AddAttribute
            definitions={unused}
            onCancel={() => setAdding(null)}
            onAdd={async (key, value, visibility) => {
              const ok = await saveAttributes(
                [
                  {
                    attribute_key: key,
                    attribute_value: value,
                    visibility_level: visibility,
                  },
                ],
                'Added.'
              );
              if (ok) setAdding(null);
            }}
          />
        )}
      </section>

      <section className="card">
        <div className="mb-2 flex items-center justify-between gap-4">
          <h2 className="card-title">{persona.label} names</h2>
          {adding !== 'name' && (
            <button
              type="button"
              className="btn btn-ghost"
              onClick={() => setAdding('name')}
            >
              <Plus aria-hidden="true" size={18} />
              Add name
            </button>
          )}
        </div>
        {names.length === 0 && <p className="text-muted">No names yet.</p>}
        <ul>
          {names.map((n) => (
            <li
              key={n.id}
              className={`${ROW} flex items-center justify-between gap-4`}
            >
              <span className="flex flex-wrap items-center gap-2">
                <strong>{n.name_value}</strong>
                <span className="badge">{n.name_type}</span>
                {n.is_default && (
                  <span className="badge badge-accent">Default</span>
                )}
                <span className="badge">{VISIBILITY[n.visibility_level]}</span>
              </span>
              <button
                type="button"
                className="icon-btn"
                onClick={() => removeName(n.id)}
                aria-label={`Remove ${n.name_value}`}
              >
                <Trash2 size={18} />
              </button>
            </li>
          ))}
        </ul>
        {adding === 'name' && (
          <AddName onAdd={addName} onCancel={() => setAdding(null)} />
        )}
      </section>
    </>
  );
}

function VisibilitySelect({ id, value, onChange }) {
  return (
    <div className="field">
      <label htmlFor={id} className="label">
        Who can see it
      </label>
      <select
        id={id}
        className="input"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        {LEVELS.map((l) => (
          <option key={l} value={l}>
            {VISIBILITY[l]}
          </option>
        ))}
      </select>
    </div>
  );
}

// Read-only by default. The form appears only when the user clicks Edit.
function AttributeRow({ attribute, onSave, onRemove }) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(attribute.attribute_value);
  const [visibility, setVisibility] = useState(attribute.visibility_level);
  const id = `attr-${attribute.attribute_key}`;

  if (!editing)
    return (
      <li
        className={`${ROW} grid items-center gap-2 sm:grid-cols-[11rem_minmax(0,1fr)_auto] sm:gap-4`}
      >
        <span className="text-sm text-muted">{attribute.label}</span>
        <span className="flex flex-wrap items-center gap-2">
          <span className="break-all">{attribute.attribute_value}</span>
          <span className="badge">
            {VISIBILITY[attribute.visibility_level]}
          </span>
        </span>
        <button
          type="button"
          className="icon-btn"
          onClick={() => setEditing(true)}
          aria-label={`Edit ${attribute.label}`}
        >
          <Pencil size={18} />
        </button>
      </li>
    );

  return (
    <li className={ROW}>
      <form
        className={FORM}
        onSubmit={async (e) => {
          e.preventDefault();
          if (await onSave(value, visibility)) setEditing(false);
        }}
      >
        <div className="field">
          <label htmlFor={id} className="label">
            {attribute.label}
          </label>
          <input
            id={id}
            className="input"
            value={value}
            onChange={(e) => setValue(e.target.value)}
          />
        </div>
        <VisibilitySelect
          id={`${id}-visibility`}
          value={visibility}
          onChange={setVisibility}
        />
        <div className="col-span-full flex flex-wrap gap-2">
          <button type="submit" className="btn btn-primary">
            <Check aria-hidden="true" size={18} />
            Save
          </button>
          <button
            type="button"
            className="btn btn-ghost"
            onClick={() => setEditing(false)}
          >
            <X aria-hidden="true" size={18} />
            Cancel
          </button>
          <button type="button" className="btn btn-danger" onClick={onRemove}>
            <Trash2 aria-hidden="true" size={18} />
            Remove
          </button>
        </div>
      </form>
    </li>
  );
}

function AddAttribute({ definitions, onAdd, onCancel }) {
  const [key, setKey] = useState(definitions[0].attribute_key);
  const [value, setValue] = useState('');
  const [visibility, setVisibility] = useState('public');

  return (
    <form
      className={`${FORM} mt-4 rounded-lg bg-soft p-4`}
      onSubmit={(e) => {
        e.preventDefault();
        onAdd(key, value, visibility);
      }}
    >
      <div className="field">
        <label htmlFor="new-key" className="label">
          Detail
        </label>
        <select
          id="new-key"
          className="input"
          value={key}
          onChange={(e) => setKey(e.target.value)}
        >
          {definitions.map((d) => (
            <option key={d.attribute_key} value={d.attribute_key}>
              {d.label}
            </option>
          ))}
        </select>
      </div>
      <div className="field">
        <label htmlFor="new-value" className="label">
          Value
        </label>
        <input
          id="new-value"
          className="input"
          required
          value={value}
          onChange={(e) => setValue(e.target.value)}
        />
      </div>
      <VisibilitySelect
        id="new-visibility"
        value={visibility}
        onChange={setVisibility}
      />
      <div className="col-span-full flex flex-wrap gap-2">
        <button type="submit" className="btn btn-primary">
          Add detail
        </button>
        <button type="button" className="btn btn-ghost" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </form>
  );
}

function AddName({ onAdd, onCancel }) {
  const [nameValue, setNameValue] = useState('');
  const [nameType, setNameType] = useState('preferred');
  const [isDefault, setIsDefault] = useState(false);

  return (
    <form
      className={`${FORM} mt-4 rounded-lg bg-soft p-4`}
      onSubmit={(e) => {
        e.preventDefault();
        onAdd({
          name_value: nameValue,
          name_type: nameType,
          is_default: isDefault,
        });
      }}
    >
      <div className="field">
        <label htmlFor="name-value" className="label">
          Name
        </label>
        <input
          id="name-value"
          className="input"
          required
          value={nameValue}
          onChange={(e) => setNameValue(e.target.value)}
        />
      </div>
      <div className="field">
        <label htmlFor="name-type" className="label">
          Type
        </label>
        <select
          id="name-type"
          className="input"
          value={nameType}
          onChange={(e) => setNameType(e.target.value)}
        >
          {NAME_TYPES.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
      </div>
      <label className="col-span-full flex items-center gap-2">
        <input
          type="checkbox"
          checked={isDefault}
          onChange={(e) => setIsDefault(e.target.checked)}
        />
        Default name for this persona
      </label>
      <div className="col-span-full flex flex-wrap gap-2">
        <button type="submit" className="btn btn-primary">
          Add name
        </button>
        <button type="button" className="btn btn-ghost" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </form>
  );
}
