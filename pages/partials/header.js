import React from 'react'
import Head from 'next/head'
export default function ({ cosmic }) {
  if (!cosmic) {
    return <p>Loading...</p>
  }
  return [
    <Head key={1}>
      <link rel="stylesheet" type="text/css" href="/static/style.css" />
      <link href="https://fonts.googleapis.com/css?family=Lato" rel="stylesheet" />
      <link href="https://fonts.googleapis.com/css?family=Droid+Serif" rel="stylesheet" />
      <meta charSet="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
      <title>{cosmic.post ? cosmic.post.title + ' |' : ''} Simple React Blog</title>
    </Head>,
    <header className="header" key={2}>
      <h1 className="site-title">
        <a href="/">{cosmic.global.header.metadata.site_title}</a>
        <small className="site-title__tag">{cosmic.global.header.metadata.site_tag}</small>
      </h1>
    </header>
  ]
}