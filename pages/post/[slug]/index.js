import React from 'react'
import _ from 'lodash'
import Header from '../../partials/header'

export async function getStaticPaths(...params) {
  console.log('params', params)
  return {
    paths: [
      { params: { slug: 'string' } }
    ],
    fallback: true
  };
}

export async function getStaticProps({ params }) {
  console.log('params', params)
  return {
    props: {
      ...params
    }
  };
}

class Post extends React.Component {
  render() {
    console.log(this.props)
    return (
      <div>
        <Header />
        <main>
        </main>
      </div>
    )
  }
}

export default Post