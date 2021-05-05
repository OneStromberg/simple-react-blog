module.exports = {
  bucket: {
    slug: process.env.COSMIC_BUCKET || 'simple-react-blog',
    read_key: process.env.COSMIC_READ_KEY || ''
  },
  future: {
    webpack5: true,
  },
}