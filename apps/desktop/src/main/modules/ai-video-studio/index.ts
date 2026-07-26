import { ProjectService } from './services/project.service';
import { SceneService } from './services/scene.service';
import { CharacterService } from './services/character.service';
import { AssetService } from './services/asset.service';
import { RenderService } from './services/render.service';

export * from './services/project.service';
export * from './services/scene.service';
export * from './services/character.service';
export * from './services/asset.service';
export * from './services/render.service';
export * from './adapters/provider.adapter';

export function initializeAIVideoStudioModule() {
  console.log('[AI Video Studio Module] Initializing Module Services & Auto-Save Timer...');
  ProjectService.getInstance();
}
