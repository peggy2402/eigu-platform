import {
  Controller, Get, Post, Patch, Put, Delete, Body, Param, Query, UseGuards, Req, UseInterceptors, UploadedFile,
} from '@nestjs/common'
import { FileInterceptor } from '@nestjs/platform-express'
import { AuthGuard } from '@nestjs/passport'
import { AIVideoService } from './ai-video.service'
import { CreateProjectDto } from './dto/create-project.dto'
import { UpdateProjectDto } from './dto/update-project.dto'
import { CreateSceneDto } from './dto/create-scene.dto'
import { UpdateSceneDto } from './dto/update-scene.dto'
import { CreateCharacterDto } from './dto/create-character.dto'
import { ReorderScenesDto } from './dto/reorder-scenes.dto'
import { RenderOptionsDto } from './dto/render-options.dto'
import { StoryPipeline } from './pipeline/story-pipeline'

@Controller('ai-video')
@UseGuards(AuthGuard('jwt'))
export class AIVideoController {
  constructor(private readonly svc: AIVideoService) {}

  // ===== PROJECTS =====
  @Post('projects')
  createProject(@Req() req: any, @Body() dto: CreateProjectDto) {
    return this.svc.createProject(req.user.id, dto)
  }

  @Get('projects')
  listProjects(@Req() req: any, @Query('status') status?: string, @Query('category') category?: string) {
    return this.svc.listProjects(req.user.id, { status, category })
  }

  @Get('projects/deleted')
  listDeletedProjects(@Req() req: any) {
    return this.svc.listDeletedProjects(req.user.id)
  }

  @Get('projects/:id')
  getProject(@Param('id') id: string, @Req() req: any) {
    return this.svc.getProject(id, req.user.id)
  }

  @Patch('projects/:id')
  updateProject(@Param('id') id: string, @Body() dto: UpdateProjectDto, @Req() req: any) {
    return this.svc.updateProject(id, dto, req.user.id)
  }

  @Delete('projects/:id')
  softDeleteProject(@Param('id') id: string, @Req() req: any) {
    return this.svc.softDeleteProject(id, req.user.id)
  }

  @Post('projects/:id/restore')
  restoreProject(@Param('id') id: string, @Req() req: any) {
    return this.svc.restoreProject(id, req.user.id)
  }

  @Delete('projects/:id/hard')
  hardDeleteProject(@Param('id') id: string, @Req() req: any) {
    return this.svc.hardDeleteProject(id, req.user.id)
  }

  @Post('projects/:id/duplicate')
  duplicateProject(@Param('id') id: string, @Body('name') name: string, @Req() req: any) {
    return this.svc.duplicateProject(id, name, req.user.id)
  }

  // ===== SCENES =====
  @Get('projects/:id/scenes')
  getScenes(@Param('id') id: string, @Req() req: any) {
    return this.svc.getProject(id, req.user.id).then(p => p.scenes)
  }

  @Post('projects/:id/scenes')
  addScene(@Param('id') id: string, @Body() dto: CreateSceneDto, @Req() req: any) {
    return this.svc.addScene(id, dto, req.user.id)
  }

  @Patch('projects/:id/scenes/:sid')
  updateScene(@Param('id') id: string, @Param('sid') sid: string, @Body() dto: UpdateSceneDto, @Req() req: any) {
    return this.svc.updateScene(id, sid, dto, req.user.id)
  }

  @Delete('projects/:id/scenes/:sid')
  deleteScene(@Param('id') id: string, @Param('sid') sid: string, @Req() req: any) {
    return this.svc.deleteScene(id, sid, req.user.id)
  }

  @Post('projects/:id/scenes/reorder')
  reorderScenes(@Param('id') id: string, @Body() dto: ReorderScenesDto, @Req() req: any) {
    return this.svc.reorderScenes(id, dto, req.user.id)
  }

  // ===== CHARACTERS =====
  @Get('characters')
  listCharacters(@Req() req: any, @Query('projectId') projectId?: string) {
    return this.svc.listCharacters(projectId, req.user.id)
  }

  @Post('characters')
  createCharacter(@Req() req: any, @Body() dto: CreateCharacterDto) {
    return this.svc.createCharacter(req.user.id, dto.projectId || '', dto)
  }

  @Patch('characters/:id')
  updateCharacter(@Param('id') id: string, @Body() dto: Partial<CreateCharacterDto>, @Req() req: any) {
    return this.svc.updateCharacter(id, dto, req.user.id)
  }

  @Delete('characters/:id')
  deleteCharacter(@Param('id') id: string, @Req() req: any) {
    return this.svc.deleteCharacter(id, req.user.id)
  }

  // ===== ASSETS =====
  @Get('projects/:id/assets')
  listAssets(@Param('id') id: string, @Req() req: any) {
    return this.svc.listAssets(id, req.user.id)
  }

  @Post('projects/:id/assets')
  @UseInterceptors(FileInterceptor('file'))
  uploadAsset(@Param('id') id: string, @UploadedFile() file: any, @Body('type') type: string, @Body('name') name: string, @Req() req: any) {
    return this.svc.uploadAsset(id, file, type || 'image', name || file?.originalname || 'untitled', req.user.id)
  }

  @Delete('projects/:id/assets/:aid')
  deleteAsset(@Param('id') id: string, @Param('aid') aid: string, @Req() req: any) {
    return this.svc.deleteAsset(id, aid, req.user.id)
  }

  // ===== BRAND KIT =====
  @Get('projects/:id/brand-kit')
  getBrandKit(@Param('id') id: string, @Req() req: any) {
    return this.svc.getBrandKit(id, req.user.id)
  }

  @Patch('projects/:id/brand-kit')
  updateBrandKit(@Param('id') id: string, @Body() dto: any, @Req() req: any) {
    return this.svc.updateBrandKit(id, dto, req.user.id)
  }

  // ===== GENERATION =====
  @Post('generate/storyboard')
  async generateStoryboard(@Body() dto: { type: string; text?: string; url?: string; projectId?: string }) {
    const pipeline = new StoryPipeline()
    return pipeline.generate({ type: dto.type as any, text: dto.text, url: dto.url })
  }

  // ===== RENDER =====
  @Post('render')
  submitRender(@Req() req: any, @Body() dto: RenderOptionsDto & { projectId: string }) {
    return this.svc.submitRender(dto.projectId, dto, req.user.id)
  }

  @Get('queue')
  getQueueStatus(@Req() req: any, @Query('projectId') projectId?: string) {
    return this.svc.getQueueStatus(projectId, req.user.id)
  }

  @Get('jobs')
  listJobs(@Req() req: any, @Query('projectId') projectId?: string, @Query('status') status?: string, @Query('limit') limit?: string) {
    return this.svc.listJobs(projectId, status, limit ? parseInt(limit, 10) : 50, req.user.id)
  }

  @Get('jobs/:id')
  getJob(@Param('id') id: string, @Req() req: any) {
    return this.svc.getJob(id, req.user.id)
  }

  @Post('jobs/:id/cancel')
  cancelJob(@Param('id') id: string, @Req() req: any) {
    return this.svc.cancelJob(id, req.user.id)
  }

  @Post('jobs/:id/retry')
  retryJob(@Param('id') id: string, @Req() req: any) {
    return this.svc.retryJob(id, req.user.id)
  }

  @Post('queue/:id/cancel')
  cancelRender(@Param('id') id: string, @Req() req: any) {
    return this.svc.cancelRender(id, req.user.id)
  }

  // ===== PROVIDERS =====
  @Get('providers')
  listProviders() {
    return this.svc.listProviders()
  }

  @Get('providers/health')
  getProviderHealth() {
    return this.svc.getProviderHealth()
  }

  // ===== COST =====
  @Get('projects/:id/cost-estimate')
  estimateCost(@Param('id') id: string, @Req() req: any) {
    return this.svc.estimateCost(id, req.user.id)
  }

  // ===== AUDIT =====
  @Get('audit-logs')
  getAuditLogs(@Req() req: any, @Query('projectId') projectId?: string, @Query('limit') limit?: string) {
    return this.svc.getAuditLogs(projectId, req.user.id, limit ? parseInt(limit, 10) : 50)
  }

  // ===== SUBTITLES =====
  @Get('projects/:id/scenes/:sid/subtitle')
  getSubtitle(@Param('id') id: string, @Param('sid') sid: string, @Req() req: any) {
    return this.svc.getSceneSubtitle(id, sid, req.user.id)
  }

  @Put('projects/:id/scenes/:sid/subtitle')
  upsertSubtitle(@Param('id') id: string, @Param('sid') sid: string, @Body() dto: any, @Req() req: any) {
    return this.svc.upsertSubtitle(id, sid, dto, req.user.id)
  }

  @Delete('projects/:id/scenes/:sid/subtitle')
  deleteSubtitle(@Param('id') id: string, @Param('sid') sid: string, @Req() req: any) {
    return this.svc.deleteSubtitle(id, sid, req.user.id)
  }

  @Post('projects/:id/scenes/:sid/subtitle/generate')
  generateSubtitle(@Param('id') id: string, @Param('sid') sid: string, @Req() req: any) {
    return this.svc.generateSubtitleFromVoice(id, sid, req.user.id)
  }

  // ===== VOICE =====
  @Get('voice-library')
  getVoiceLibrary() {
    return this.svc.getVoiceLibrary()
  }

  @Patch('projects/:id/scenes/:sid/voice')
  updateSceneVoice(@Param('id') id: string, @Param('sid') sid: string, @Body() dto: any, @Req() req: any) {
    return this.svc.updateSceneVoice(id, sid, dto, req.user.id)
  }

  // ===== MUSIC =====
  @Get('music-library')
  getMusicLibrary() {
    return this.svc.getMusicLibrary()
  }

  // ===== ANALYTICS =====
  @Get('analytics/summary')
  getAnalytics(@Req() req: any) {
    return this.svc.getAnalyticsSummary(req.user.id)
  }

  // ===== CREDIT & SAAS ENDPOINTS =====
  @Get('user-credit')
  getUserCredit(@Req() req: any) {
    return this.svc.getUserCredit(req.user.id)
  }

  @Post('generate-prompts')
  generatePrompts(@Body() dto: { text: string; mode?: string; images?: string[] }) {
    return this.svc.generatePromptsBackend(dto.text, dto.mode, dto.images)
  }

  @Get('jobs/:jobId/status')
  getJobStatus(@Param('jobId') jobId: string, @Req() req: any) {
    return this.svc.getJob(jobId, req.user.id)
  }
}
