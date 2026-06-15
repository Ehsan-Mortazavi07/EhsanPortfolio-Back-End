import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  Param,
  Patch,
  Post,
  Put,
  Query,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ArticlesService } from '../articles/articles.service';
import { CreateArticleDto, UpdateArticleDto } from '../articles/dto/article.dto';
import { ContactMessagesService } from '../contact-messages/contact-messages.service';
import { ErrorMessages } from '../common/constants/error-messages';
import { PaginationDto } from '../common/dto/pagination.dto';
import { UsersQueryDto } from '../users/dto/users-query.dto';
import { AdminGuard, JwtAuthGuard } from '../common/guards/auth.guards';
import { ExperienceService } from '../experience/experience.service';
import {
  CreateExperienceDto,
  UpdateExperienceDto,
} from '../experience/dto/experience.dto';
import {
  multerDiskStorage,
  uploadFileFilter,
  UPLOAD_MAX_FILE_SIZE,
} from '../helpers/multer.config';
import { OfferingsService } from '../offerings/offerings.service';
import {
  CreateOfferingDto,
  UpdateOfferingDto,
} from '../offerings/dto/offering.dto';
import { ProjectsService } from '../projects/projects.service';
import {
  CreateProjectDto,
  UpdateProjectDto,
} from '../projects/dto/project.dto';
import { SiteSettingsService } from '../site-settings/site-settings.service';
import { UpdateSiteSettingsDto } from '../site-settings/dto/site-settings.dto';
import { SkillsService } from '../skills/skills.service';
import { CreateSkillDto, UpdateSkillDto } from '../skills/dto/skill.dto';
import { TestimonialsService } from '../testimonials/testimonials.service';
import {
  CreateTestimonialDto,
  UpdateTestimonialDto,
} from '../testimonials/dto/testimonial.dto';
import { CreateUserDto, UpdateUserDto } from '../users/dto/user.dto';
import { UsersService } from '../users/users.service';
import { mapUser } from '../users/users.mapper';
import { UserDocument, UserRole } from '../users/schemas/user.schema';
import { canManageRoles } from '../users/user-role.util';
import {
  mapArticleDetail,
  mapArticleListItem,
  mapExperience,
  mapOffering,
  mapProject,
  mapSiteSettings,
  mapSkill,
  mapTestimonial,
} from '../catalog/catalog.mapper';
import { isMongoObjectId } from '../common/utils/object-id.util';

@Controller({ version: '1', path: 'admin' })
@UseGuards(JwtAuthGuard, AdminGuard)
export class AdminController {
  constructor(
    private usersService: UsersService,
    private siteSettingsService: SiteSettingsService,
    private projectsService: ProjectsService,
    private offeringsService: OfferingsService,
    private experienceService: ExperienceService,
    private skillsService: SkillsService,
    private testimonialsService: TestimonialsService,
    private contactMessagesService: ContactMessagesService,
    private articlesService: ArticlesService,
  ) {}

  @Get('dashboard')
  async dashboard() {
    const [
      users,
      projects,
      offerings,
      experience,
      skills,
      testimonials,
      articles,
      contactMessages,
      unreadMessages,
    ] = await Promise.all([
      this.usersService.count(),
      this.projectsService.count(),
      this.offeringsService.count(),
      this.experienceService.count(),
      this.skillsService.count(),
      this.testimonialsService.count(),
      this.articlesService.count(),
      this.contactMessagesService.count(),
      this.contactMessagesService.countUnread(),
    ]);

    return {
      users,
      projects,
      offerings,
      experience,
      skills,
      testimonials,
      articles,
      contactMessages,
      unreadMessages,
    };
  }

  @Get('dashboard/stats')
  async dashboardStats() {
    const stats = await this.dashboard();
    return {
      projects: stats.projects,
      services: stats.offerings,
      experience: stats.experience,
      skills: stats.skills,
      testimonials: stats.testimonials,
      articles: stats.articles,
      contactMessages: stats.contactMessages,
      unreadMessages: stats.unreadMessages,
    };
  }

  @Post('upload')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: multerDiskStorage,
      fileFilter: uploadFileFilter,
      limits: { fileSize: UPLOAD_MAX_FILE_SIZE },
    }),
  )
  upload(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException(ErrorMessages.FILE_REQUIRED);
    }
    return { path: `/uploads/${file.filename}` };
  }

  // Users
  @Get('users')
  async listUsers(@Query() query: UsersQueryDto) {
    const result = await this.usersService.findAll(query);
    return { ...result, items: result.items.map(mapUser) };
  }

  @Post('users')
  async createUser(@Body() dto: CreateUserDto, @Req() req: { user: UserDocument }) {
    if (dto.role && dto.role !== UserRole.USER && !canManageRoles(req.user.role)) {
      throw new ForbiddenException(ErrorMessages.ROLE_CHANGE_FORBIDDEN);
    }
    const user = await this.usersService.create(dto);
    return mapUser(user);
  }

  @Get('users/:id')
  async getUser(@Param('id') id: string) {
    const user = await this.usersService.findById(id);
    return mapUser(user);
  }

  @Patch('users/:id')
  async updateUser(
    @Param('id') id: string,
    @Body() dto: UpdateUserDto,
    @Req() req: { user: UserDocument },
  ) {
    const user = await this.usersService.update(id, dto, req.user);
    return mapUser(user);
  }

  @Delete('users/:id')
  deleteUser(@Param('id') id: string) {
    return this.usersService.remove(id);
  }

  // Site Settings
  @Get('site-settings')
  async getSiteSettings() {
    const settings = await this.siteSettingsService.get();
    return mapSiteSettings(settings);
  }

  @Put('site-settings')
  updateSiteSettings(@Body() dto: UpdateSiteSettingsDto) {
    return this.siteSettingsService.update(dto);
  }

  // Projects
  @Get('projects')
  async listProjects(@Query() query: PaginationDto) {
    const result = await this.projectsService.findAll(query);
    return { ...result, items: result.items.map(mapProject) };
  }

  @Post('projects')
  createProject(@Body() dto: CreateProjectDto) {
    return this.projectsService.create(dto);
  }

  @Get('projects/:identifier')
  async getProject(@Param('identifier') identifier: string) {
    const project = isMongoObjectId(identifier)
      ? await this.projectsService.findById(identifier)
      : await this.projectsService.findBySlug(identifier);
    return mapProject(project);
  }

  @Patch('projects/:identifier')
  async updateProject(
    @Param('identifier') identifier: string,
    @Body() dto: UpdateProjectDto,
  ) {
    const project = isMongoObjectId(identifier)
      ? await this.projectsService.findById(identifier)
      : await this.projectsService.findBySlug(identifier);
    const updated = await this.projectsService.update(project._id.toString(), dto);
    return mapProject(updated);
  }

  @Delete('projects/:identifier')
  async deleteProject(@Param('identifier') identifier: string) {
    const project = isMongoObjectId(identifier)
      ? await this.projectsService.findById(identifier)
      : await this.projectsService.findBySlug(identifier);
    return this.projectsService.remove(project._id.toString());
  }

  // Offerings / Services
  @Get('offerings')
  async listOfferings(@Query() query: PaginationDto) {
    const result = await this.offeringsService.findAll(query);
    return { ...result, items: result.items.map(mapOffering) };
  }

  @Get('services')
  listServices(@Query() query: PaginationDto) {
    return this.listOfferings(query);
  }

  @Post('offerings')
  async createOffering(@Body() dto: CreateOfferingDto) {
    const created = await this.offeringsService.create(dto);
    return mapOffering(created);
  }

  @Post('services')
  createService(@Body() dto: CreateOfferingDto) {
    return this.createOffering(dto);
  }

  @Get('offerings/:identifier')
  async getOffering(@Param('identifier') identifier: string) {
    const item = isMongoObjectId(identifier)
      ? await this.offeringsService.findById(identifier)
      : await this.offeringsService.findBySlug(identifier);
    return mapOffering(item);
  }

  @Get('services/:identifier')
  getService(@Param('identifier') identifier: string) {
    return this.getOffering(identifier);
  }

  @Patch('offerings/:identifier')
  async updateOffering(
    @Param('identifier') identifier: string,
    @Body() dto: UpdateOfferingDto,
  ) {
    const item = isMongoObjectId(identifier)
      ? await this.offeringsService.findById(identifier)
      : await this.offeringsService.findBySlug(identifier);
    const updated = await this.offeringsService.update(item._id.toString(), dto);
    return mapOffering(updated);
  }

  @Patch('services/:identifier')
  updateService(
    @Param('identifier') identifier: string,
    @Body() dto: UpdateOfferingDto,
  ) {
    return this.updateOffering(identifier, dto);
  }

  @Delete('offerings/:identifier')
  async deleteOffering(@Param('identifier') identifier: string) {
    const item = isMongoObjectId(identifier)
      ? await this.offeringsService.findById(identifier)
      : await this.offeringsService.findBySlug(identifier);
    return this.offeringsService.remove(item._id.toString());
  }

  @Delete('services/:identifier')
  deleteService(@Param('identifier') identifier: string) {
    return this.deleteOffering(identifier);
  }

  // Experience
  @Get('experience')
  async listExperience(@Query() query: PaginationDto) {
    const result = await this.experienceService.findAll(query);
    return { ...result, items: result.items.map(mapExperience) };
  }

  @Post('experience')
  createExperience(@Body() dto: CreateExperienceDto) {
    return this.experienceService.create(dto);
  }

  @Get('experience/:identifier')
  async getExperience(@Param('identifier') identifier: string) {
    const item = await this.experienceService.findById(identifier);
    return mapExperience(item);
  }

  @Patch('experience/:identifier')
  async updateExperience(
    @Param('identifier') identifier: string,
    @Body() dto: UpdateExperienceDto,
  ) {
    const updated = await this.experienceService.update(identifier, dto);
    return mapExperience(updated);
  }

  @Delete('experience/:identifier')
  deleteExperience(@Param('identifier') identifier: string) {
    return this.experienceService.remove(identifier);
  }

  // Skills
  @Get('skills')
  async listSkills(@Query() query: PaginationDto) {
    const result = await this.skillsService.findAll(query);
    return { ...result, items: result.items.map(mapSkill) };
  }

  @Post('skills')
  createSkill(@Body() dto: CreateSkillDto) {
    return this.skillsService.create(dto);
  }

  @Get('skills/:identifier')
  async getSkill(@Param('identifier') identifier: string) {
    const item = await this.skillsService.findById(identifier);
    return mapSkill(item);
  }

  @Patch('skills/:identifier')
  async updateSkill(
    @Param('identifier') identifier: string,
    @Body() dto: UpdateSkillDto,
  ) {
    const updated = await this.skillsService.update(identifier, dto);
    return mapSkill(updated);
  }

  @Delete('skills/:identifier')
  deleteSkill(@Param('identifier') identifier: string) {
    return this.skillsService.remove(identifier);
  }

  // Testimonials
  @Get('testimonials')
  async listTestimonials(@Query() query: PaginationDto) {
    const result = await this.testimonialsService.findAll(query);
    return { ...result, items: result.items.map(mapTestimonial) };
  }

  @Post('testimonials')
  createTestimonial(@Body() dto: CreateTestimonialDto) {
    return this.testimonialsService.create(dto);
  }

  @Get('testimonials/:identifier')
  async getTestimonial(@Param('identifier') identifier: string) {
    const item = await this.testimonialsService.findById(identifier);
    return mapTestimonial(item);
  }

  @Patch('testimonials/:identifier')
  async updateTestimonial(
    @Param('identifier') identifier: string,
    @Body() dto: UpdateTestimonialDto,
  ) {
    const updated = await this.testimonialsService.update(identifier, dto);
    return mapTestimonial(updated);
  }

  @Delete('testimonials/:identifier')
  deleteTestimonial(@Param('identifier') identifier: string) {
    return this.testimonialsService.remove(identifier);
  }

  // Contact Messages
  @Get('contact-messages')
  listContactMessages(@Query() query: PaginationDto) {
    return this.contactMessagesService.findAll(query);
  }

  @Get('contact-messages/:id')
  getContactMessage(@Param('id') id: string) {
    return this.contactMessagesService.findById(id);
  }

  @Patch('contact-messages/:id/read')
  markContactMessageRead(@Param('id') id: string) {
    return this.contactMessagesService.markAsRead(id);
  }

  @Delete('contact-messages/:id')
  deleteContactMessage(@Param('id') id: string) {
    return this.contactMessagesService.remove(id);
  }

  // Articles
  @Get('articles')
  async listArticles(@Query() query: PaginationDto) {
    const result = await this.articlesService.findAll(query);
    return { ...result, items: result.items.map(mapArticleListItem) };
  }

  @Post('articles')
  createArticle(@Body() dto: CreateArticleDto) {
    return this.articlesService.create(dto);
  }

  @Get('articles/:identifier')
  async getArticle(@Param('identifier') identifier: string) {
    const article = isMongoObjectId(identifier)
      ? await this.articlesService.findById(identifier)
      : await this.articlesService.findBySlug(identifier);
    return mapArticleDetail(article);
  }

  @Patch('articles/:identifier')
  async updateArticle(
    @Param('identifier') identifier: string,
    @Body() dto: UpdateArticleDto,
  ) {
    const article = isMongoObjectId(identifier)
      ? await this.articlesService.findById(identifier)
      : await this.articlesService.findBySlug(identifier);
    const updated = await this.articlesService.update(article._id.toString(), dto);
    return mapArticleDetail(updated);
  }

  @Delete('articles/:identifier')
  async deleteArticle(@Param('identifier') identifier: string) {
    const article = isMongoObjectId(identifier)
      ? await this.articlesService.findById(identifier)
      : await this.articlesService.findBySlug(identifier);
    return this.articlesService.remove(article._id.toString());
  }
}
