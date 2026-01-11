import { Client } from 'minio'

// Cliente MinIO
const minioClient = new Client({
  endPoint: process.env.MINIO_ENDPOINT || 'localhost',
  port: parseInt(process.env.MINIO_PORT || '9000'),
  useSSL: process.env.MINIO_USE_SSL === 'true',
  accessKey: process.env.MINIO_ACCESS_KEY || 'minioadmin',
  secretKey: process.env.MINIO_SECRET_KEY || '',
})

const BUCKET_NAME = process.env.MINIO_BUCKET || 'malaquias'

// URL pública base para acessar arquivos
export function getPublicUrl(filePath: string): string {
  const endpoint = process.env.MINIO_PUBLIC_URL || `http://${process.env.MINIO_ENDPOINT || 'localhost'}:${process.env.MINIO_PORT || '9000'}`
  return `${endpoint}/${BUCKET_NAME}/${filePath}`
}

// Upload de arquivo
export async function uploadFile(
  filePath: string,
  buffer: Buffer,
  contentType: string
): Promise<{ url: string; path: string }> {
  await minioClient.putObject(BUCKET_NAME, filePath, buffer, buffer.length, {
    'Content-Type': contentType,
  })

  return {
    url: getPublicUrl(filePath),
    path: filePath,
  }
}

// Deletar arquivo
export async function deleteFile(filePath: string): Promise<boolean> {
  try {
    await minioClient.removeObject(BUCKET_NAME, filePath)
    return true
  } catch (error) {
    console.error('Erro ao deletar arquivo:', error)
    return false
  }
}

// Listar arquivos em uma pasta
export async function listFiles(
  folder: string,
  limit = 100
): Promise<Array<{ name: string; size: number; lastModified: Date; url: string }>> {
  const files: Array<{ name: string; size: number; lastModified: Date; url: string }> = []

  // Garantir que o prefixo termine com / para listar apenas arquivos da pasta
  const prefix = folder.endsWith('/') ? folder : `${folder}/`

  console.log('[MinIO listFiles] Bucket:', BUCKET_NAME, 'Prefix:', prefix)

  const stream = minioClient.listObjects(BUCKET_NAME, prefix, true)

  return new Promise((resolve, reject) => {
    stream.on('data', (obj) => {
      console.log('[MinIO listFiles] Objeto encontrado:', obj.name, 'size:', obj.size)
      if (obj.name && files.length < limit) {
        files.push({
          name: obj.name.replace(prefix, ''),
          size: obj.size || 0,
          lastModified: obj.lastModified || new Date(),
          url: getPublicUrl(obj.name),
        })
      }
    })
    stream.on('error', (err) => {
      console.error('[MinIO listFiles] Erro:', err)
      reject(err)
    })
    stream.on('end', () => {
      console.log('[MinIO listFiles] Finalizado. Total de arquivos:', files.length)
      resolve(files)
    })
  })
}

// Verificar se arquivo existe
export async function fileExists(filePath: string): Promise<boolean> {
  try {
    await minioClient.statObject(BUCKET_NAME, filePath)
    return true
  } catch {
    return false
  }
}

// Obter informações do arquivo
export async function getFileInfo(filePath: string): Promise<{
  size: number
  contentType: string
  lastModified: Date
} | null> {
  try {
    const stat = await minioClient.statObject(BUCKET_NAME, filePath)
    return {
      size: stat.size,
      contentType: stat.metaData?.['content-type'] || 'application/octet-stream',
      lastModified: stat.lastModified,
    }
  } catch {
    return null
  }
}

export default minioClient
