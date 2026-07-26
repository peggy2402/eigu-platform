import { ProjectService } from './project.service';
import { Scene } from '../../eigu-file/eigu-types';
import { AIVideoPipeline } from '../../../services/ai-video-pipeline.service';

export class SceneService {
  private projectService = ProjectService.getInstance();
  private pipeline = new AIVideoPipeline();

  public addScene(patch?: Partial<Scene>): Scene {
    return this.projectService.getManager().addScene(patch);
  }

  public updateScene(sceneId: string, patch: Partial<Scene>): Scene | null {
    return this.projectService.getManager().updateScene(sceneId, patch);
  }

  public removeScene(sceneId: string): boolean {
    return this.projectService.getManager().removeScene(sceneId);
  }

  public reorderScenes(fromIndex: number, toIndex: number): void {
    this.projectService.getManager().reorderScenes(fromIndex, toIndex);
  }

  public getScene(sceneId: string): Scene | null {
    const current = this.projectService.getCurrent();
    const scene = current.eigu?.project.scenes.find(s => s.id === sceneId);
    return scene || null;
  }

  public async generateStoryboardPrompts(ideaText: string, mode: 'copy' | 'idea' | 'image' = 'idea', images?: string[]): Promise<string[]> {
    return await this.pipeline.generatePrompts(ideaText, mode, images);
  }
}
