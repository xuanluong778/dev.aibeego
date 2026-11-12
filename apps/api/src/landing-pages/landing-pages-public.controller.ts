import { Body, Controller, Get, Header, Param, Post, Query, Req } from '@nestjs/common';
import type { Request } from 'express';
import { LandingPagesService } from './landing-pages.service';
import { LandingPageTemplatePackService } from './landing-page-template-pack.service';
import {
  SubmitLandingPageLeadDto,
  TrackLandingPageEventDto,
} from './dto/landing-pages.dto';

/** Public landing pages — no JWT. Builder code is never loaded here. */
@Controller('landing-pages/public')
export class LandingPagesPublicController {
  constructor(
    private readonly service: LandingPagesService,
    private readonly templatePacks: LandingPageTemplatePackService,
  ) {}

  private clientIp(req: Request): string {
    const xf = req.headers['x-forwarded-for'];
    if (typeof xf === 'string' && xf.trim()) {
      const first = xf.split(',')[0]?.trim() || '';
      if (first) return first.slice(0, 64);
    }
    return (req.ip || req.socket?.remoteAddress || 'unknown').slice(0, 64);
  }

  /** Published HTML source is public. Draft HTML requires the asset key. */
  @Get('template-html/:templateId')
  @Header('Content-Type', 'text/html; charset=utf-8')
  @Header('X-Content-Type-Options', 'nosniff')
  @Header('Content-Security-Policy', "default-src 'none'; script-src 'none'; style-src 'unsafe-inline' https: data:; img-src 'self' https: data: blob:; font-src https: data:; media-src https: data:; connect-src 'none'; frame-src 'none'; base-uri 'none'; form-action 'none'")
  @Header('Cache-Control', 'private, no-cache')
  templateHtml(@Param('templateId') templateId: string, @Query('k') key?: string) {
    return this.templatePacks.openPublicHtml(templateId, key);
  }

  /** Draft images require the unguessable key. Published images are public. */
  @Get('template-assets/:templateId/:file')
  @Header('X-Content-Type-Options', 'nosniff')
  @Header('Cache-Control', 'private, max-age=300')
  templateAsset(
    @Param('templateId') templateId: string,
    @Param('file') file: string,
    @Query('k') key?: string,
  ) {
    return this.templatePacks.openPublicAsset(templateId, file, key);
  }

  /** Draft preview by opaque token — must be registered before :slug. */
  @Get('preview/:token')
  getByPreviewToken(@Param('token') token: string, @Req() req: Request) {
    return this.service.getPublicByPreviewToken(token, this.clientIp(req));
  }

  @Get(':slug')
  getBySlug(
    @Param('slug') slug: string,
    @Query('organizationId') organizationId?: string,
  ) {
    return this.service.getPublicBySlug(slug, organizationId);
  }

  @Post(':slug/lead')
  submitLead(
    @Param('slug') slug: string,
    @Body() dto: SubmitLandingPageLeadDto,
    @Req() req: Request,
    @Query('organizationId') organizationId?: string,
  ) {
    return this.service.submitPublicLead(slug, dto, this.clientIp(req), organizationId);
  }

  @Post(':slug/events')
  trackEvent(
    @Param('slug') slug: string,
    @Body() dto: TrackLandingPageEventDto,
    @Req() req: Request,
    @Query('organizationId') organizationId?: string,
  ) {
    return this.service.trackPublicEvent(slug, dto, this.clientIp(req), organizationId);
  }
}
