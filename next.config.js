/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      {
        source: '/asistencia.html',
        destination: '/asistencia',
        permanent: true,
      },
    ]
  },
}

module.exports = nextConfig
