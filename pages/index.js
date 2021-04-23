import React from 'react'
import {
  AuthAction,
  useAuthUser,
  withAuthUser,
  withAuthUserTokenSSR,
} from 'next-firebase-auth'
import Link from 'next/link'
import axios from 'axios'
import _ from 'lodash'
import Footer from './partials/footer'
import H from '../components/Header'
import helpers from '../helpers'
import config from '../config'


const Header = withAuthUser()(function () {
  const AuthUser = useAuthUser()
  return <H email={AuthUser.email} signOut={AuthUser.signOut} />
})
class App extends React.Component {
  static async getInitialProps({ req }) {
    const query = `{
      getObjects(bucket_slug: "${config.bucket.slug}", input: {
        read_key: "${config.bucket.read_key}"
      })
      {
        _id
        type_slug
        slug
        title
        metadata
        created_at
      }
    }`
    return await axios.post(`https://graphql.cosmicjs.com/v1`, { query })
      .then(function (response) {
        return {
          cosmic: {
            posts: _.filter(response.data.data.getObjects, { type_slug: 'posts' }),
            global: _.keyBy(_.filter(response.data.data.getObjects, { type_slug: 'globals' }), 'slug')
          }
        }
      })
      .catch(function (error) {
        console.log(error)
      })
  }
  render() {
    if (!this.props.cosmic)
      return <div>Loading...</div>
    return (
      <div>
        <Header />
        <main className="container">
          <Link href="/post">
            <a>Posts</a>
          </Link>
        </main>
        <Footer />
      </div>
    )
  }
}

export default App