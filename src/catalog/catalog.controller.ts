import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { ArticlesService } from '../articles/articles.service';
import { ContactMessagesService } from '../contact-messages/contact-messages.service';
import { CreateContactMessageDto } from '../contact-messages/dto/contact-message.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
import { ExperienceService } from '../experience/experience.service';
import { OfferingsService } from '../offerings/offerings.service';
import { ProjectsService } from '../projects/projects.service';
import { SiteSettingsService } from '../site-settings/site-settings.service';
import { SkillsService } from '../skills/skills.service';
import { TestimonialsService } from '../testimonials/testimonials.service';
import {
  mapArticleDetail,
  mapArticleListItem,
  mapExperience,
  mapOffering,
  mapProject,
  mapSiteSettings,
  mapSkill,
  mapTestimonial,
} from './catalog.mapper';

@Controller({ version: '1', path: 'catalog' })
export class CatalogController {
  constructor(
    private siteSettingsService: SiteSettingsService,
    private projectsService: ProjectsService,
    private offeringsService: OfferingsService,
    private experienceService: ExperienceService,
    private skillsService: SkillsService,
    private testimonialsService: TestimonialsService,
    private articlesService: ArticlesService,
    private contactMessagesService: ContactMessagesService,
  ) {}

  @Post('contact')
  submitContact(@Body() dto: CreateContactMessageDto) {
    return this.contactMessagesService.create(dto);
  }

  @Get('home')
  async getHome() {
    const [
      settings,
      featuredProjects,
      offerings,
      experience,
      skills,
      testimonials,
      articles,
    ] = await Promise.all([
      this.siteSettingsService.get(),
      this.projectsService.findFeatured(),
      this.offeringsService.findPublished(),
      this.experienceService.findPublished(),
      this.skillsService.findPublished(),
      this.testimonialsService.findPublished(),
      this.articlesService.findAll({ page: 1, pageSize: 6 }, true),
    ]);

    return {
      settings: mapSiteSettings(settings),
      featuredProjects: featuredProjects.map(mapProject),
      offerings: offerings.map(mapOffering),
      experience: experience.map(mapExperience),
      skills: skills.map(mapSkill),
      testimonials: testimonials.map(mapTestimonial),
      articles: articles.items.map(mapArticleListItem),
    };
  }

  @Get('settings')
  async getSettings() {
    const settings = await this.siteSettingsService.get();
    return mapSiteSettings(settings);
  }

  @Get('site-settings')
  async getSiteSettingsAlias() {
    return this.getSettings();
  }

  @Get('services')
  async getServices() {
    const items = await this.offeringsService.findPublished();
    return items.map(mapOffering);
  }

  @Get('experience')
  async getExperience() {
    const items = await this.experienceService.findPublished();
    return items.map(mapExperience);
  }

  @Get('skills')
  async getSkills() {
    const items = await this.skillsService.findPublished();
    return items.map(mapSkill);
  }

  @Get('testimonials')
  async getTestimonials() {
    const items = await this.testimonialsService.findPublished();
    return items.map(mapTestimonial);
  }

  @Get('projects')
  async getProjects(@Query() query: PaginationDto) {
    const result = await this.projectsService.findAll(query, true);
    return {
      ...result,
      items: result.items.map(mapProject),
    };
  }

  @Get('projects/:slug')
  async getProjectBySlug(@Param('slug') slug: string) {
    const project = await this.projectsService.findBySlug(slug, true);
    return mapProject(project);
  }

  @Get('articles')
  async getArticles(@Query() query: PaginationDto) {
    const result = await this.articlesService.findAll(query, true);
    return {
      ...result,
      items: result.items.map(mapArticleListItem),
    };
  }

  @Get('articles/:slug')
  async getArticleBySlug(@Param('slug') slug: string) {
    const article = await this.articlesService.findBySlug(slug, true);
    return mapArticleDetail(article);
  }
}
