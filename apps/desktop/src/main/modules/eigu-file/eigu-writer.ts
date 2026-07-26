import * as fs from 'fs'
import * as path from 'path'
import * as crypto from 'crypto'
import { app } from 'electron'
import { EiguProject, EiguManifest, Asset } from './eigu-types'

const FORMAT_VERSION = '1.0'
const APP_VERSION = '1.0.0'
const ENGINE = 'eigu-video-engine'
const EMBED_MAX_SIZE = 10 * 1024 * 1024 // 10MB

interface WriteOptions {
  outputPath: string
  project: EiguProject
  assetFiles?: Map<string, Buffer>
  thumbnailFiles?: Map<string, Buffer>
}

function createZipArchive(options: any = { zlib: { level: 6 } }) {
  const archiver = require('archiver')
  if (typeof archiver === 'function') {
    return archiver('zip', options)
  }
  if (archiver && typeof archiver.ZipArchive === 'function') {
    return new archiver.ZipArchive(options)
  }
  if (archiver && archiver.default && typeof archiver.default === 'function') {
    return archiver.default('zip', options)
  }
  throw new Error('Unable to initialize zip archiver instance.')
}

export class EiguWriter {
  async writeProject(options: WriteOptions & { requestId?: string }): Promise<string> {
    const { outputPath, project, requestId = 'req_' + Math.random().toString(36).substring(2, 9) } = options
    console.log(`[EIGU:E2E][${requestId}][WRITER] WRITE_START:`, { outputPath, __filename })

    const manifest: EiguManifest = {
      formatVersion: FORMAT_VERSION,
      appVersion: APP_VERSION,
      createdAt: project.project.createdAt,
      updatedAt: new Date().toISOString(),
      engine: ENGINE,
      assetCount: project.assets.filter(a => a.embedded).length,
      totalAssetSize: project.assets.filter(a => a.embedded).reduce((sum, a) => sum + a.size, 0),
    }

    console.log(`[EIGU:E2E][${requestId}][WRITER] ARCHIVE_CREATE_START`)
    const output = fs.createWriteStream(outputPath)
    const archive = createZipArchive({ zlib: { level: 6 } })
    console.log(`[EIGU:E2E][${requestId}][WRITER] ARCHIVE_CREATE_SUCCESS`)

    return new Promise<string>((resolve, reject) => {
      let isDone = false
      const done = (err?: any) => {
        if (isDone) return
        isDone = true
        if (err) {
          console.error(`[EIGU:E2E][${requestId}][WRITER] WRITE_FAILED:`, err)
          reject(err)
        } else {
          const exists = fs.existsSync(outputPath)
          const size = exists ? fs.statSync(outputPath).size : 0
          console.log(`[EIGU:E2E][${requestId}][FS] STREAM_COMPLETE`, { outputPath, FILE_EXISTS: exists, FILE_SIZE: size })
          resolve(outputPath)
        }
      }

      output.on('close', () => {
        console.log(`[EIGU:E2E][${requestId}][FS] OUTPUT_CLOSE`)
        done()
      })
      output.on('finish', () => {
        console.log(`[EIGU:E2E][${requestId}][FS] OUTPUT_FINISH`)
        done()
      })
      output.on('error', (err) => {
        console.error(`[EIGU:E2E][${requestId}][WRITER] OUTPUT_ERROR:`, err)
        done(err)
      })
      archive.on('error', (err) => {
        console.error(`[EIGU:E2E][${requestId}][WRITER] ARCHIVE_ERROR:`, err)
        done(err)
      })

      archive.pipe(output)
      console.log(`[EIGU:E2E][${requestId}][WRITER] ARCHIVE_PIPE_SUCCESS`)

      // Write manifest.json (uncompressed for fast read)
      archive.append(JSON.stringify(manifest, null, 2), {
        name: 'manifest.json',
        store: true,
      })

      // Write project.json (uncompressed for fast read)
      archive.append(JSON.stringify(project, null, 2), {
        name: 'project.json',
        store: true,
      })

      // Write embedded assets
      if (options.assetFiles) {
        for (const [filename, buffer] of options.assetFiles) {
          archive.append(buffer, { name: `assets/${filename}` })
        }
      }

      // Write thumbnails
      if (options.thumbnailFiles) {
        for (const [filename, buffer] of options.thumbnailFiles) {
          archive.append(buffer, { name: `thumbnails/${filename}` })
        }
      }

      // Write scene exports from project media cache folder
      try {
        const { getProjectMediaDir } = require('../../utils/path.utils')
        const mediaDir = getProjectMediaDir(outputPath)
        if (fs.existsSync(mediaDir)) {
          const files = fs.readdirSync(mediaDir)
          for (const f of files) {
            if (f.endsWith('.mp4')) {
              const fullPath = path.join(mediaDir, f)
              const stat = fs.statSync(fullPath)
              // Embed into archive exports/ if <= 10MB according to 11-Asset-System spec
              if (stat.size <= EMBED_MAX_SIZE) {
                const vidBuffer = fs.readFileSync(fullPath)
                archive.append(vidBuffer, { name: `exports/${f}` })
              }
            }
          }
        }
      } catch (e) {
        // Skip media embed if path unresolvable
      }

      archive.finalize()
    })
  }

  async updateProjectSave(filePath: string, project: EiguProject): Promise<string> {
    const existingAssets = await this.readEmbeddedAssets(filePath)
    const existingThumbnails = await this.readEmbeddedThumbnails(filePath)

    return this.writeProject({
      outputPath: filePath,
      project,
      assetFiles: existingAssets,
      thumbnailFiles: existingThumbnails,
    })
  }

  private async readEmbeddedAssets(eiguPath: string): Promise<Map<string, Buffer>> {
    const map = new Map<string, Buffer>()
    if (!fs.existsSync(eiguPath)) return map
    try {
      const unzipper = require('unzipper')
      const directory = await unzipper.Open.file(eiguPath)
      for (const file of directory.files) {
        if (file.path.startsWith('assets/') && !file.path.endsWith('/')) {
          map.set(file.path.replace('assets/', ''), await file.buffer())
        }
      }
    } catch { /* file doesn't exist yet */ }
    return map
  }

  private async readEmbeddedThumbnails(eiguPath: string): Promise<Map<string, Buffer>> {
    const map = new Map<string, Buffer>()
    if (!fs.existsSync(eiguPath)) return map
    try {
      const unzipper = require('unzipper')
      const directory = await unzipper.Open.file(eiguPath)
      for (const file of directory.files) {
        if (file.path.startsWith('thumbnails/') && !file.path.endsWith('/')) {
          map.set(file.path.replace('thumbnails/', ''), await file.buffer())
        }
      }
    } catch { /* silent */ }
    return map
  }

  async importAsset(assetPath: string): Promise<{ buffer: Buffer; asset: Partial<Asset>; embedded: boolean }> {
    const stat = fs.statSync(assetPath)
    const buffer = fs.readFileSync(assetPath)
    const ext = path.extname(assetPath).toLowerCase()
    const sha256 = crypto.createHash('sha256').update(buffer).digest('hex')
    const mimeType = this.guessMimeType(ext)

    const isEmbedded = buffer.length <= EMBED_MAX_SIZE
    const assetId = `asset_${crypto.randomUUID().slice(0, 8)}`
    const filename = isEmbedded
      ? `assets/${assetId}${ext}`
      : `assets/${path.basename(assetPath)}`

    return {
      buffer,
      asset: {
        id: assetId,
        type: this.guessAssetType(ext),
        filename,
        originalName: path.basename(assetPath),
        mimeType,
        size: buffer.length,
        sha256,
        embedded: isEmbedded,
        externalPath: isEmbedded ? null : assetPath,
        fallbackPaths: [],
      },
      embedded: isEmbedded,
    }
  }

  private guessMimeType(ext: string): string {
    const map: Record<string, string> = {
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.webp': 'image/webp',
      '.svg': 'image/svg+xml',
      '.mp4': 'video/mp4',
      '.mov': 'video/quicktime',
      '.webm': 'video/webm',
      '.wav': 'audio/wav',
      '.mp3': 'audio/mpeg',
      '.ogg': 'audio/ogg',
      '.flac': 'audio/flac',
      '.ttf': 'font/ttf',
      '.otf': 'font/otf',
    }
    return map[ext] || 'application/octet-stream'
  }

  private guessAssetType(ext: string): Asset['type'] {
    const map: Record<string, Asset['type']> = {
      '.jpg': 'image', '.jpeg': 'image', '.png': 'image', '.webp': 'image', '.svg': 'image',
      '.mp4': 'video', '.mov': 'video', '.webm': 'video',
      '.wav': 'audio', '.mp3': 'audio', '.ogg': 'audio', '.flac': 'audio',
      '.ttf': 'font', '.otf': 'font',
    }
    return map[ext] || 'image'
  }
}
