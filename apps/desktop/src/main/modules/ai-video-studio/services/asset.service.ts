import { ProjectService } from './project.service';
import { Asset } from '../../eigu-file/eigu-types';
import * as crypto from 'crypto';
import * as fs from 'fs';

export class AssetService {
  private projectService = ProjectService.getInstance();

  public async importAsset(filePath: string): Promise<{ asset: Asset; buffer: Buffer }> {
    return await this.projectService.getManager().importAsset(filePath);
  }

  public removeAsset(assetId: string): boolean {
    return this.projectService.getManager().removeAsset(assetId);
  }

  public getMissingAssets(): Asset[] {
    return this.projectService.getManager().getMissingExternalAssets();
  }

  public locateMissingAsset(assetId: string, newPath: string): boolean {
    return this.projectService.getManager().locateMissingAsset(assetId, newPath);
  }

  public calculateSha256(filePath: string): string {
    if (!fs.existsSync(filePath)) return '';
    const fileBuffer = fs.readFileSync(filePath);
    return crypto.createHash('sha256').update(fileBuffer).digest('hex');
  }
}
