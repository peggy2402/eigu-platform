import { IsArray, IsString, IsNumber, Min } from 'class-validator'

export class ReorderScenesDto {
  @IsArray()
  items: { sceneId: string; newIndex: number }[]
}
