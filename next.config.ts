
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // Configurar o basePath para /animeitor
  basePath: '/animeitor',
  
  // Necessário para o output standalone no Docker
  output: 'standalone',
  
  // Opcional: configurar assetPrefix se estiver usando CDN
  // assetPrefix: '/animeitor',
  
  // Outras configurações...
  reactStrictMode: true,
}

export default nextConfig