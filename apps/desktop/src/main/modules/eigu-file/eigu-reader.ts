import * as fs from 'fs'
import * as path from 'path'
import { EiguFile, EiguManifest, EiguProject } from './eigu-types'

export class EiguReader {
  async readFile(filePath: string): Promise<EiguFile> {
    if (!fs.existsSync(filePath)) {
      throw new Error(`File not found: ${filePath}`)
    }

    const unzipper = require('unzipper')
    const directory = await unzipper.Open.file(filePath)

    const manifest = await this.parseFile<EiguManifest>(directory, 'manifest.json')
    const project = await this.parseFile<EiguProject>(directory, 'project.json')

    const assetBuffers = new Map<string, Buffer>()
    const thumbnailBuffers = new Map<string, Buffer>()

    for (const file of directory.files) {
      if (file.path.startsWith('assets/') && !file.path.endsWith('/')) {
        const name = file.path.replace('assets/', '')
        assetBuffers.set(name, await file.buffer())
      } else if (file.path.startsWith('thumbnails/') && !file.path.endsWith('/')) {
        const name = file.path.replace('thumbnails/', '')
        thumbnailBuffers.set(name, await file.buffer())
      }
    }

    return { manifest, project, assetBuffers, thumbnailBuffers }
  }

  async readManifest(filePath: string): Promise<EiguManifest> {
    if (!fs.existsSync(filePath)) {
      throw new Error(`File not found: ${filePath}`)
    }
    const unzipper = require('unzipper')
    const directory = await unzipper.Open.file(filePath)
    return this.parseFile<EiguManifest>(directory, 'manifest.json')
  }

  async readProjectJson(filePath: string): Promise<EiguProject> {
    if (!fs.existsSync(filePath)) {
      throw new Error(`File not found: ${filePath}`)
    }
    const unzipper = require('unzipper')
    const directory = await unzipper.Open.file(filePath)
    return this.parseFile<EiguProject>(directory, 'project.json')
  }

  async getAssetBuffer(eiguPath: string, assetFilename: string): Promise<Buffer | null> {
    try {
      const eigu = await this.readFile(eiguPath)
      return eigu.assetBuffers.get(assetFilename.replace('assets/', '')) || null
    } catch {
      return null
    }
  }

  async getThumbnailBuffer(eiguPath: string, thumbFilename: string): Promise<Buffer | null> {
    try {
      const eigu = await this.readFile(eiguPath)
      return eigu.thumbnailBuffers.get(thumbFilename.replace('thumbnails/', '')) || null
    } catch {
      return null
    }
  }

  locateExternalAsset(asset: { externalPath: string | null; fallbackPaths: string[] }): string | null {
    const paths = [
      asset.externalPath,
      ...asset.fallbackPaths,
    ].filter(Boolean) as string[]

    for (const p of paths) {
      if (fs.existsSync(p)) return p
    }
    return null
  }

  private async parseFile<T>(directory: any, filename: string): Promise<T> {
    const file = directory.files.find((f: any) => f.path === filename)
    if (!file) {
      throw new Error(`Missing ${filename} in .eigu archive`)
    }
    const buffer = await file.buffer()
    const content = buffer.toString('utf-8')
    return JSON.parse(content)
  }
}
