import { useAuth0 } from '@auth0/auth0-react';
import { useEffect, useState } from 'react';

export function Entries() {
    let [entries, setEntries] = useState([]);
    let [refresh, setRefresh] = useState(true);
    const { logout, getAccessTokenSilently, user } = useAuth0();
    useEffect(() => {
        if (refresh) {
            console.log('Refreshing');

            (async () => {
                const token = await getAccessTokenSilently({
                    audience: 'http://localhost:8080',
                });
                const res = await fetch('http://localhost:8080/entries', {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                const e = await res.json();
                console.log(e);

                setEntries(
                    e.map((entry) => {
                        entry.editing = false;
                        return entry;
                    })
                );
            })();
            setRefresh(false);
        }
    }, [getAccessTokenSilently, user?.sub, refresh]);

    let [errorText, setErrorText] = useState('');
    let [hideError, setHideError] = useState(true);
    useEffect(() => {
        if (!hideError) {
            setTimeout(() => {
                setHideError(true);
            }, 2500);
        }
    }, [hideError]);

    async function createEntry() {
        let entry = { date: Date.now(), content: `Today's Post!` };
        const token = await getAccessTokenSilently({
            audience: 'http://localhost:8080',
        });
        const res = await fetch('http://localhost:8080/entries', {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(entry),
        });
        if (res.status !== 400) {
            entry = await res.json();
            setEntries([entry, ...entries]);
        } else {
            setErrorText("You've already made your entry for the day");
            setHideError(false);
        }
    }

    return (
        <>
            <h1>Journal</h1>
            <button onClick={logout}>Click Here to Log Out</button>
            <button onClick={createEntry}>New Entry</button>
            {hideError ? <></> : <p>{errorText}</p>}
            <div>
                {entries.length === 0
                    ? 'No Entries Found'
                    : entries.map((entry, i) => (
                          <Entry
                              entry={entry}
                              key={i}
                              name={i}
                              setRefresh={setRefresh}
                              entries={entries}
                              setEntries={setEntries}
                          />
                      ))}
            </div>
        </>
    );
}

function Entry(props) {
    let { entry, setRefresh } = props;
    let { date } = entry;
    let [content, setContent] = useState(props.entry.content);
    let [editing, setEditing] = useState(false);
    const { getAccessTokenSilently } = useAuth0();

    async function saveEntry() {
        const token = await getAccessTokenSilently({
            audience: 'http://localhost:8080',
        });
        await fetch('http://localhost:8080/entries', {
            method: 'PATCH',
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ date, content }),
        });
    }

    async function deleteEntry() {
        const token = await getAccessTokenSilently({
            audience: 'http://localhost:8080',
        });
        await fetch('http://localhost:8080/entries', {
            method: 'DELETE',
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ date }),
        });
    }

    return (
        <div className="entry">
            <h3>{props.entry.date}</h3>
            {editing ? (
                <textarea
                    id={`${props.name}-textarea`}
                    value={content}
                    onChange={(event) => {
                        setContent(event.target.value);
                    }}
                />
            ) : (
                <p>{props.entry.content}</p>
            )}

            <div className="entry-buttons">
                {editing ? (
                    <>
                        <button
                            onClick={async () => {
                                await saveEntry();
                                setEditing(false);
                                setRefresh(true);
                            }}
                        >
                            Save
                        </button>
                        <button
                            onClick={async () => {
                                setContent(props.entry.content);
                                setEditing(false);
                                if (content === '') await deleteEntry();
                                setRefresh(true);
                            }}
                        >
                            Cancel
                        </button>
                    </>
                ) : (
                    <>
                        <button
                            onClick={() => {
                                setEditing(true);
                            }}
                        >
                            Edit
                        </button>
                        <button
                            onClick={async () => {
                                await deleteEntry();
                                setRefresh(true);
                            }}
                        >
                            Delete
                        </button>
                    </>
                )}
            </div>
        </div>
    );
}
