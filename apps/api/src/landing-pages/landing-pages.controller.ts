import {
  Body,
  Controller,
  Delete,
  Get,
  BadRequestException,
  Logger,
  Header,
  Param,
  Patch,
  Post,
  Query,
  StreamableFile,
  UploadedFile,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { JwtAuthGuard } from '../common/guards/auth.guard';
import { TenantGuard } from '../common/guards/tenant.guard';
import { PermissionsGuard } from '../common/guards/permissions.guard';
import { RequirePermissions } from '../common/decorators/require-permissions.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { AuthUser } from '../common/interfaces/auth-user.interface';
import { createUploadMulterOptions } from '../common/uploads/upload-policy';
import { PlatformAdminGuard } from '../common/guards/platform-admin.guard';
import { LandingPagesService } from './landing-pages.service';
import { LandingPageTemplatePackService } from './landing-page-template-pack.service';
import { TEMPLATE_PACK_MAX_ZIP_BYTES, TEMPLATE_BULK_MAX_ZIP_BYTES } from './template-pack';
import {
  AutosaveLandingPageDto,
  CreateLandingPageDto,
  GenerateLandingPageAiDto,
  SuggestLandingPageBriefDto,
  ApplyBusinessProfileDto,
  UpsertBusinessProfileDto,
  InlineAiSuggestFieldDto,
  CrawlLandingPageUrlDto,
  ApplyPageDoctorDto,
  RestoreLandingPageVersionDto,
  LandingPageAnalyticsQueryDto,
  ListLandingPageTemplatesQueryDto,
  ListLandingPagesQueryDto,
  PublishLandingPageDto,
  UpdateLandingPageDto,
  UpsertCustomDomainDto,
} from './dto/landing-pages.dto';

const templateBulkUploadLogger = new Logger('LandingTemplateBulkUpload');
const templateBulkUpload = FilesInterceptor('files', 300, {
  storage: memoryStorage(),
  limits: { fileSize: TEMPLATE_BULK_MAX_ZIP_BYTES, files: 300 },
  fileFilter: (req, file, cb) => {
    const request = req as typeof req & { lpBulkUploadLogged?: boolean };
    if (!request.lpBulkUploadLogged) {
      request.lpBulkUploadLogged = true;
      templateBulkUploadLogger.log(JSON.stringify({ event: 'bulk-upload-received', file: String(file.originalname || '').slice(0, 160), requestBytes: Number(req.headers['content-length'] || 0), fileLimitBytes: TEMPLATE_BULK_MAX_ZIP_BYTES }));
    }
    cb(null, true);
  },
});

const templateZipUpload = FileInterceptor('file', {
  storage: memoryStorage(),
  limits: { fileSize: TEMPLATE_PACK_MAX_ZIP_BYTES, files: 1 },
});

@Controller('landing-pages')
@UseGuards(JwtAuthGuard, TenantGuard, PermissionsGuard)
export class LandingPagesController {
  constructor(
    private readonly service: LandingPagesService,
    private readonly templatePacks: LandingPageTemplatePackService,
  ) {}

  @Get('overview')
  @RequirePermissions('lead.read')
  overview(@CurrentUser() user: AuthUser) {
    return this.service.overview(user.organizationId);
  }

  @Get('business-profile')
  @RequirePermissions('lead.read')
  getBusinessProfile(@CurrentUser() user: AuthUser) {
    return this.service.getBusinessProfile(user.organizationId);
  }

  @Patch('business-profile')
  @RequirePermissions('lead.write')
  upsertBusinessProfile(
    @CurrentUser() user: AuthUser,
    @Body() dto: UpsertBusinessProfileDto,
  ) {
    return this.service.upsertBusinessProfile(user, dto);
  }

  @Get('analytics')
  @RequirePermissions('lead.read')
  analytics(
    @CurrentUser() user: AuthUser,
    @Query() query: LandingPageAnalyticsQueryDto,
  ) {
    return this.service.analytics(user.organizationId, query);
  }

  @Get('domains')
  @RequirePermissions('lead.read')
  domains(@CurrentUser() user: AuthUser) {
    return this.service.listDomains(user.organizationId);
  }

  @Post('generate')
  @RequirePermissions('lead.write')
  generate(@CurrentUser() user: AuthUser, @Body() dto: GenerateLandingPageAiDto) {
    return this.service.generateAi(user, dto);
  }

  @Post('ai-suggest-brief')
  @RequirePermissions('lead.write')
  suggestBrief(@CurrentUser() user: AuthUser, @Body() dto: SuggestLandingPageBriefDto) {
    return this.service.suggestAiBrief(user, dto);
  }

  @Post('crawl-url')
  @RequirePermissions('lead.write')
  crawlUrl(@CurrentUser() user: AuthUser, @Body() dto: CrawlLandingPageUrlDto) {
    return this.service.crawlPublicUrl(user, dto);
  }

  @Get('templates')
  @RequirePermissions('lead.read')
  listTemplates(
    @CurrentUser() user: AuthUser,
    @Query() query: ListLandingPageTemplatesQueryDto,
  ) {
    return this.service.listTemplates(user.organizationId, query, user);
  }

  @Get('templates/packs/export-all')
  @UseGuards(PlatformAdminGuard)
  @RequirePermissions('lead.read')
  @Header('Cache-Control', 'no-store')
  async exportAllTemplatePacks(@CurrentUser() user: AuthUser): Promise<StreamableFile> {
    const bundle = await this.templatePacks.exportAll(user);
    return new StreamableFile(bundle.body, {
      type: 'application/zip',
      disposition: `attachment; filename="${bundle.filename}"`,
    });
  }

  @Post('templates/packs/bulk')
  @UseGuards(PlatformAdminGuard)
  @RequirePermissions('lead.write')
  @UseInterceptors(templateBulkUpload)
  importTemplatePacksBulk(
    @CurrentUser() user: AuthUser,
    @UploadedFiles() files: Array<{ originalname?: string; buffer?: Buffer; size?: number }>,
  ) {
    return this.templatePacks.importBulk(user, files || []);
  }

  @Post('templates/packs')
  @UseGuards(PlatformAdminGuard)
  @RequirePermissions('lead.write')
  @UseInterceptors(templateZipUpload)
  importTemplatePack(@CurrentUser() user: AuthUser, @UploadedFile() file: { originalname?: string; buffer?: Buffer; size?: number }) {
    return this.templatePacks.importNew(user, file);
  }

  @Get('templates/:idOrSlug/pack')
  @UseGuards(PlatformAdminGuard)
  @RequirePermissions('lead.read')
  @Header('Cache-Control', 'no-store')
  async exportTemplatePack(
    @CurrentUser() user: AuthUser,
    @Param('idOrSlug') idOrSlug: string,
  ): Promise<StreamableFile> {
    const pack = await this.templatePacks.exportPack(user, idOrSlug);
    return new StreamableFile(pack.body, {
      type: 'application/zip',
      disposition: `attachment; filename="${pack.filename}"`,
    });
  }

  @Post('templates/:idOrSlug/pack')
  @UseGuards(PlatformAdminGuard)
  @RequirePermissions('lead.write')
  @UseInterceptors(templateZipUpload)
  importTemplatePackUpdate(
    @CurrentUser() user: AuthUser,
    @Param('idOrSlug') idOrSlug: string,
    @UploadedFile() file: { originalname?: string; buffer?: Buffer; size?: number },
  ) {
    return this.templatePacks.importUpdate(user, idOrSlug, file);
  }

  @Post('templates/:idOrSlug/edit-session')
  @UseGuards(PlatformAdminGuard)
  @RequirePermissions('lead.write')
  openTemplateEditSession(
    @CurrentUser() user: AuthUser,
    @Param('idOrSlug') idOrSlug: string,
    @Body() body: { reset?: boolean },
  ) {
    return this.templatePacks.openEditSession(user, idOrSlug, { reset: body?.reset === true });
  }

  @Post('templates/:idOrSlug/save-from-session')
  @UseGuards(PlatformAdminGuard)
  @RequirePermissions('lead.write')
  saveTemplateFromSession(
    @CurrentUser() user: AuthUser,
    @Param('idOrSlug') idOrSlug: string,
    @Body() body: { publish?: boolean },
  ) {
    return this.templatePacks.saveFromSession(user, idOrSlug, { publish: body?.publish === true });
  }

  @Post('templates/:idOrSlug/publish')
  @UseGuards(PlatformAdminGuard)
  @RequirePermissions('lead.write')
  publishTemplatePack(@CurrentUser() user: AuthUser, @Param('idOrSlug') idOrSlug: string) {
    return this.templatePacks.publish(user, idOrSlug);
  }

  @Get('templates/:idOrSlug/versions')
  @UseGuards(PlatformAdminGuard)
  @RequirePermissions('lead.read')
  templatePackVersions(@CurrentUser() user: AuthUser, @Param('idOrSlug') idOrSlug: string) {
    return this.templatePacks.listVersions(user, idOrSlug);
  }

  @Post('templates/:idOrSlug/versions/:version/restore')
  @UseGuards(PlatformAdminGuard)
  @RequirePermissions('lead.write')
  restoreTemplatePack(
    @CurrentUser() user: AuthUser,
    @Param('idOrSlug') idOrSlug: string,
    @Param('version') version: string,
  ) {
    const v = Number(version);
    if (!Number.isInteger(v) || v < 1) throw new BadRequestException('Version không hợp lệ');
    return this.templatePacks.restore(user, idOrSlug, v);
  }

  @Get('templates/:idOrSlug')
  @RequirePermissions('lead.read')
  getTemplate(@CurrentUser() user: AuthUser, @Param('idOrSlug') idOrSlug: string) {
    return this.service.getTemplate(user.organizationId, idOrSlug, user);
  }

  @Get()
  @RequirePermissions('lead.read')
  list(@CurrentUser() user: AuthUser, @Query() query: ListLandingPagesQueryDto) {
    return this.service.listPages(user.organizationId, query);
  }

  @Post()
  @RequirePermissions('lead.write')
  create(@CurrentUser() user: AuthUser, @Body() dto: CreateLandingPageDto) {
    return this.service.create(user, dto);
  }

  @Get(':id')
  @RequirePermissions('lead.read')
  get(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.service.get(user, id);
  }

  @Patch(':id')
  @RequirePermissions('lead.write')
  update(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
    @Body() dto: UpdateLandingPageDto,
  ) {
    return this.service.update(user, id, dto);
  }

  @Post(':id/apply-business-profile')
  @RequirePermissions('lead.write')
  applyBusinessProfile(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
    @Body() dto: ApplyBusinessProfileDto,
  ) {
    return this.service.applyBusinessProfileToPage(user, id, dto);
  }

  @Post(':id/ai-suggest-field')
  @RequirePermissions('lead.write')
  aiSuggestField(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
    @Body() dto: InlineAiSuggestFieldDto,
  ) {
    return this.service.suggestInlineField(user, id, dto);
  }

  @Post(':id/page-doctor')
  @RequirePermissions('lead.write')
  pageDoctor(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.service.runPageDoctor(user, id);
  }

  @Post(':id/page-doctor/apply')
  @RequirePermissions('lead.write')
  applyPageDoctor(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
    @Body() dto: ApplyPageDoctorDto,
  ) {
    return this.service.applyPageDoctor(user, id, dto);
  }

  @Get(':id/versions')
  @RequirePermissions('lead.read')
  listVersions(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.service.listPageVersions(user, id);
  }

  @Get(':id/versions/:version')
  @RequirePermissions('lead.read')
  getVersion(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
    @Param('version') version: string,
  ) {
    const v = Number(version);
    if (!Number.isInteger(v) || v < 1) {
      throw new BadRequestException('Version không hợp lệ');
    }
    return this.service.getPageVersion(user, id, v);
  }

  @Post(':id/versions/:version/restore')
  @RequirePermissions('lead.write')
  restoreVersion(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
    @Param('version') version: string,
    @Body() dto: RestoreLandingPageVersionDto,
  ) {
    const v = Number(version);
    if (!Number.isInteger(v) || v < 1) {
      throw new BadRequestException('Version không hợp lệ');
    }
    return this.service.restorePageVersion(user, id, v, dto);
  }

  @Get(':id/preview-token')
  @RequirePermissions('lead.read')
  previewTokenStatus(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.service.getPreviewTokenStatus(user, id);
  }

  @Post(':id/preview-token')
  @RequirePermissions('lead.write')
  issuePreviewToken(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
    @Body() body?: { expiresInHours?: number },
  ) {
    return this.service.issuePreviewToken(user, id, {
      expiresInHours: body?.expiresInHours,
    });
  }

  @Post(':id/preview-token/revoke')
  @RequirePermissions('lead.write')
  revokePreviewToken(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.service.revokePreviewToken(user, id);
  }

  @Post(':id/recover-draft')
  @RequirePermissions('lead.write')
  recoverDraft(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
    @Body() dto: AutosaveLandingPageDto,
  ) {
    return this.service.recoverDraft(user, id, dto);
  }

  @Post(':id/autosave')
  @RequirePermissions('lead.write')
  autosave(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
    @Body() dto: AutosaveLandingPageDto,
  ) {
    return this.service.autosave(user, id, dto);
  }

  @Post(':id/upload-image')
  @RequirePermissions('lead.write')
  @UseInterceptors(FileInterceptor('file', createUploadMulterOptions('image')))
  uploadImage(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.service.uploadPublicImage(user, id, file);
  }

  @Post(':id/upload-background')
  @RequirePermissions('lead.write')
  @UseInterceptors(FileInterceptor('file', createUploadMulterOptions('lp_background')))
  uploadBackground(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.service.uploadPublicBackground(user, id, file);
  }

  @Get(':id/media')
  @RequirePermissions('lead.read')
  listMedia(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
    @Query('scope') scope?: string,
    @Query('q') q?: string,
  ) {
    return this.service.listMedia(user, id, { scope, q });
  }

  @Post(':id/publish')
  @RequirePermissions('lead.write')
  publish(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
    @Body() dto: PublishLandingPageDto,
  ) {
    return this.service.publish(user, id, dto);
  }

  @Post(':id/unpublish')
  @RequirePermissions('lead.write')
  unpublish(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.service.unpublish(user, id);
  }

  @Post(':id/duplicate')
  @RequirePermissions('lead.write')
  duplicate(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.service.duplicate(user, id);
  }

  @Post(':id/archive')
  @RequirePermissions('lead.write')
  archive(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.service.archive(user, id);
  }

  @Post('bulk-delete')
  @RequirePermissions('lead.write')
  bulkDelete(@CurrentUser() user: AuthUser, @Body() body: { ids: string[] }) {
    return this.service.bulkDelete(user, body?.ids || []);
  }

  @Delete(':id')
  @RequirePermissions('lead.write')
  delete(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.service.delete(user, id);
  }

  @Post(':id/delete')
  @RequirePermissions('lead.write')
  deletePost(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.service.delete(user, id);
  }

  @Post(':id/domain')
  @RequirePermissions('lead.write')
  upsertDomain(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
    @Body() dto: UpsertCustomDomainDto,
  ) {
    return this.service.upsertDomain(user, id, dto);
  }

  @Post(':id/domain/verify')
  @RequirePermissions('lead.write')
  verifyDomain(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.service.verifyDomain(user, id);
  }
}
