import { Module } from '@nestjs/common';
import { ArticlesModule } from '../articles/articles.module';
import { ContactMessagesModule } from '../contact-messages/contact-messages.module';
import { ExperienceModule } from '../experience/experience.module';
import { OfferingsModule } from '../offerings/offerings.module';
import { ProjectsModule } from '../projects/projects.module';
import { SiteSettingsModule } from '../site-settings/site-settings.module';
import { SkillsModule } from '../skills/skills.module';
import { TestimonialsModule } from '../testimonials/testimonials.module';
import { CatalogController } from './catalog.controller';

@Module({
  imports: [
    SiteSettingsModule,
    ProjectsModule,
    OfferingsModule,
    ExperienceModule,
    SkillsModule,
    TestimonialsModule,
    ArticlesModule,
    ContactMessagesModule,
  ],
  controllers: [CatalogController],
})
export class CatalogModule {}
