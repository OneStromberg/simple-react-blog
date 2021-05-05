import React, { useState, useCallback, useEffect } from 'react'
import _ from 'lodash'
import {
  useAuthUser,
  withAuthUser,
  AuthAction,
  withAuthUserTokenSSR,
} from 'next-firebase-auth'
import { useCollection, useCollectionDataOnce } from 'react-firebase-hooks/firestore';

import db from '../../utils/firestore'
import H from '../../components/Header'

const MessageType = {
  TEXT: 0,
  IMAGE: 1,
  QUIZ: 2,
  POLL: 3
}

class MessageAudience {
  static TO_ALL = 0
  static TO_CHANNEL = 1
  static TO_PERSON = 2
}

const DatabaseList = ({ collection }) => {
  const AuthUser = useAuthUser()
  const [value, loading, error] = useCollection(collection);
  return (
    <div>
      <p>
        {error && <strong>Error: {error}</strong>}
        {loading && <span>List: Loading...</span>}
      </p>
      {value && (
        <ul>
          {value.docs.map((doc) => {
            const messageData = doc.data();
            const { message } = messageData;
            return (
              <li key={doc.id}>
                {message}
              </li>
            )
          })}
        </ul>
      )}
    </div>
  );
};

function ChatIdPicker({ chatId: propsChatId = 0, chatIds = [], onChange = () => { } }) {
  const [chatId, setChatId] = useState(propsChatId || chatIds[0]);
  useEffect(() => onChange({ chatId }), [chatId]);
  const callback = useCallback(({ target: { value } }) => setChatId(value))
  return (
    <div>
      <select value={chatId} onChange={callback}>
        {chatIds.map((o, i) => (
          <option key={'chat_id_picker_' + i} value={o}>{o}</option>
        ))}
      </select>
    </div>
  )
}

function UserData({ selectedId, collectionPath }) {
  const doc = db.doc(`${collectionPath}/${selectedId}`);
  const [userValue, loading, error] = useCollection(doc);
  if (loading) return 'Loading';
  return (
    <div>
      {
        Object.keys(userValue).map((value, i) => (
          <span key={`${value}${i}`}>{value}</span>
        ))
      }
    </div>
  )
}

function UserIdPicker({
  onChange = () => { },
  collectionPath
}) {
  const collection = db.collection(collectionPath);
  const [ids, setIds] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [value, loading, error] = useCollection(collection);

  useEffect(() => {
    if (value) {
      const newIds = value.docs.map(d => d.id);
      setIds(newIds);
      setSelectedId(newIds[0])
    }
  }, [value])
  useEffect(() => {
    if (selectedId) {

    }
  }, [selectedId])
  const callback = useCallback(({ chatId }) => {
    onChange(chatId)
    setSelectedId(chatId)
  })
  if (loading) return 'Loading';
  return (
    <>
      <ChatIdPicker chatIds={ids} onChange={callback} />
      {selectedId && <UserData
        collectionPath={collectionPath}
        selectedId={selectedId}
      />}
    </>
  )
}

function PollOptions({
  options = [],
  setOptions = () => { }
}) {
  return (
    <>
      {
        options.map((o, i) => (
          <div key={'poll_option' + i}>
            <span>{i + 1}</span>
            <textarea
              value={o}
              onChange={({ currentTarget: { value } }) => setOptions(Object.assign([], options, { [i]: value }))}
            />
          </div>))
      }
      <button title="Add option" onClick={() => setOptions([...options, ""])}>
        Add option
      </button>
      <button title="Remove option" onClick={() => setOptions(options.slice(0, options.length - 1))}>
        Remove option
      </button>
    </>
  )
}

function RedirectCheckbox({
  onChange = () => { },
  redirect: propRedirect = false
}) {
  const [redirect, setRedirect] = useState(false);
  const redirectHandler = useCallback(({ target: { value } }) => setRedirect(!redirect));
  useEffect(() => onChange(redirect), [redirect])
  return (
    <label>
      Redirect
      <input
        name="redirect"
        type="checkbox"
        checked={redirect}
        onChange={redirectHandler}
      />
    </label>
  )
}

function Quiz({
  options: propsOptions = [],
  onChange = () => { },
  correctOptionId: propsCorrectOptionId = 0,
}) {
  const [options, setOptions] = useState(propsOptions);
  const [correctOptionId, setCorrectOptionId] = useState(propsCorrectOptionId);
  const [redirect, setRedirect] = useState(false);
  useEffect(() => onChange({
    options,
    correctOptionId,
    redirect
  }), [options, correctOptionId, redirect]);
  return (
    <div>
      Correct option:
      <select value={correctOptionId} onChange={({ target: { value } }) => setCorrectOptionId(value)}>
        {options.map((o, i) => (
          <option key={'quiz_correct_option' + i} value={i}>{i + 1}</option>
        ))}
      </select>
      <PollOptions options={propsOptions} setOptions={setOptions} />
      <RedirectCheckbox redirect={redirect} onChange={setRedirect} />
    </div>
  )
}

function Poll({
  options: propsOptions = [],
  onChange = () => { },
}) {
  const [options, setOptions] = useState(propsOptions);
  const [redirect, setRedirect] = useState(false);
  useEffect(() => onChange({ options, redirect }), [options, redirect]);
  return (
    <div>
      <PollOptions options={propsOptions} setOptions={setOptions} />
      <RedirectCheckbox redirect={redirect} onChange={setRedirect} />
    </div>
  )
}

const Header = withAuthUser()(function () {
  const AuthUser = useAuthUser()
  return <H email={AuthUser.email} signOut={AuthUser.signOut} />
})

const Post = ({ messageCollectionPath, usersCollectionPath }) => {
  const collection = db.collection(messageCollectionPath);
  const AuthUser = useAuthUser()
  const [messageAudience, setMessageAudience] = useState(0)
  const [messageType, setMessageType] = useState(0)
  const [message, setMessage] = React.useState("");
  const [finalAdditionalFields, setFinalAdditionalFields] = React.useState({});
  const [additionalFields, setAdditionalFields] = React.useState({});
  useEffect(() => {
    setFinalAdditionalFields({ ...finalAdditionalFields, ...additionalFields });
  }, [additionalFields]);
  const onSubmit = () => {
    collection.add({
      author: AuthUser.id,
      message,
      shown: false,
      messageType,
      messageAudience,
      ...finalAdditionalFields
    })
  };
  return (
    <div>
      <Header />
      <main>
        <div>
          <select value={messageAudience} onChange={({ target: { value } }) => setMessageAudience(parseInt(value, 10))}>
            <option value={MessageAudience.TO_ALL}>To All</option>
            <option value={MessageAudience.TO_CHANNEL}>To channel</option>
            <option value={MessageAudience.TO_PERSON}>Personal</option>
          </select>
          <select value={messageType} onChange={({ target: { value } }) => setMessageType(parseInt(value, 10))}>
            <option value={MessageType.TEXT}>Text Message</option>
            <option value={MessageType.IMAGE}>Image Message</option>
            <option value={MessageType.QUIZ}>Quiz Message</option>
            <option value={MessageType.POLL}>Poll Message</option>
          </select>
          <textarea
            value={message}
            onChange={({ currentTarget: { value } }) => setMessage(value)}
          />
          {messageAudience === MessageAudience.TO_PERSON && <UserIdPicker
            collectionPath={usersCollectionPath}
            {...additionalFields}
            onChange={setAdditionalFields}
          />}
          {messageAudience === MessageAudience.TO_CHANNEL && <ChatIdPicker
            chatIds={[-1001187924939]}
            {...additionalFields}
            onChange={setAdditionalFields}
          />}
          {messageType === MessageType.QUIZ && <Quiz {...additionalFields} onChange={setAdditionalFields} />}
          {messageType === MessageType.POLL && <Poll {...additionalFields} onChange={setAdditionalFields} />}
          <div>
            <button title="Submit" onClick={onSubmit}>
              Submit
        </button>
          </div>
        </div>
        <DatabaseList collection={collection} />
      </main>
    </div>
  )
}

export const getServerSideProps = withAuthUserTokenSSR()(({ AuthUser }) => ({
  props: {
    messageCollectionPath: process.env.MESSAGES_COLLECTION,
    usersCollectionPath: process.env.USERS_COLLECTION,
  }
}))

export default withAuthUser({
  whenUnauthedBeforeInit: AuthAction.REDIRECT_TO_LOGIN,
  whenAuthed: AuthAction.RENDER,
  whenUnauthedAfterInit: AuthAction.REDIRECT_TO_LOGIN,
})(Post)