import React from 'react'
import axios from 'axios'
import _ from 'lodash'
import {
  useAuthUser,
  withAuthUser,
  AuthAction,
  withAuthUserTokenSSR,
} from 'next-firebase-auth'
import { useCollection } from 'react-firebase-hooks/firestore';
// import firebase from '../firebaseClient';

import db from '../../utils/firestore'
import H from '../../components/Header'

const DatabaseList = () => {
  const AuthUser = useAuthUser()
  const [value, loading, error] = useCollection(db.collection('messages'));
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

function Editor() {
  const AuthUser = useAuthUser()
  const [message, setMessage] = React.useState("");
  return (
    <div>
      <textarea
        value={message}
        onChange={({ currentTarget: { value } }) => setMessage(value)}
      />
      <div>
        <button title="Submit" onClick={() => {
          db.collection('messages').add({ author: AuthUser.id, message, shown: false })
          setMessage("")
        }}>
          Submit
      </button>
      </div>
    </div>
  )
}

// export async function getStaticProps(params) {
//   console.log('params', params)
//   return {
//     props: {
//       cosmic: {
//         global: [],
//         post: []
//       }
//     }
//   };
// }

const Header = withAuthUser()(function () {
  const AuthUser = useAuthUser()
  return <H email={AuthUser.email} signOut={AuthUser.signOut} />
})

class Post extends React.Component {
  render() {
    return (
      <div>
        <Header />
        <main>
          <DatabaseList />
          <Editor />
        </main>
      </div>
    )
  }
}

export const getServerSideProps = withAuthUserTokenSSR()()

export default withAuthUser({
  whenUnauthedBeforeInit: AuthAction.REDIRECT_TO_LOGIN,
  whenAuthed: AuthAction.RENDER,
  whenUnauthedAfterInit: AuthAction.REDIRECT_TO_LOGIN,
})(Post)