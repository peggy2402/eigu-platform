import { ProjectService } from './project.service';
import { Character } from '../../eigu-file/eigu-types';

export class CharacterService {
  private projectService = ProjectService.getInstance();

  public addCharacter(patch?: Partial<Character>): Character {
    const char: Character = {
      id: patch?.id || `char_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      name: patch?.name || 'Nhân vật mới',
      appearance: patch?.appearance || '',
      clothing: patch?.clothing || '',
      style: patch?.style || 'cinematic',
      personality: patch?.personality || '',
      voiceId: patch?.voiceId || null,
      referenceImages: patch?.referenceImages || [],
      generationSettings: patch?.generationSettings || {},
      lockedAttributes: patch?.lockedAttributes || [],
      version: patch?.version || 1,
      ...patch,
    };
    return this.projectService.getManager().addCharacter(char);
  }

  public updateCharacter(characterId: string, patch: Partial<Character>): Character | null {
    return this.projectService.getManager().updateCharacter(characterId, patch);
  }

  public removeCharacter(characterId: string): boolean {
    return this.projectService.getManager().removeCharacter(characterId);
  }

  public getCharacters(): Character[] {
    const current = this.projectService.getCurrent();
    return current.eigu?.project.characters || [];
  }
}
