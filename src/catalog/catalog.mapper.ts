import { ArticleDocument } from '../articles/schemas/article.schema';
import { ExperienceDocument } from '../experience/schemas/experience.schema';
import { OfferingDocument } from '../offerings/schemas/offering.schema';
import { ProjectDocument } from '../projects/schemas/project.schema';
import { SiteSettingsDocument } from '../site-settings/schemas/site-settings.schema';
import { SkillDocument } from '../skills/schemas/skill.schema';
import { TestimonialDocument } from '../testimonials/schemas/testimonial.schema';

function idOf(doc: { _id?: { toString(): string } }): string {
  return doc._id?.toString() ?? '';
}

function createdAtOf(doc: unknown): string | null {
  const value = (doc as { createdAt?: Date }).createdAt;
  return value?.toISOString?.() ?? null;
}

export function mapSiteSettings(settings: SiteSettingsDocument) {
  return {
    heroTitle: settings.heroTitle,
    heroTitleFa: settings.heroTitleFa || '',
    heroSubtitle: settings.heroSubtitle,
    heroSubtitleFa: settings.heroSubtitleFa || '',
    heroBio: settings.heroBio,
    heroBioFa: settings.heroBioFa || '',
    heroPortraitUrl: settings.heroImage || null,
    cvUrl: settings.cvUrl || null,
    email: settings.email,
    phone: settings.phone || null,
    location: settings.location || null,
    githubUrl: settings.socialLinks?.github || null,
    linkedinUrl: settings.socialLinks?.linkedin || null,
    telegramUrl: settings.socialLinks?.telegram || null,
    instagramUrl: settings.socialLinks?.instagram || null,
    twitterUrl: settings.socialLinks?.twitter || null,
    aboutContent: settings.aboutContent,
    aboutContentFa: settings.aboutContentFa || '',
    tickerSkills: settings.tickerSkills,
    seo: settings.seo,
    pageSubtitles: settings.pageSubtitles ?? {},
  };
}

export function mapProject(project: ProjectDocument) {
  return {
    id: idOf(project),
    slug: project.slug,
    title: project.title,
    titleFa: project.titleFa || '',
    excerpt: project.description,
    excerptFa: project.descriptionFa || '',
    description: project.description,
    descriptionFa: project.descriptionFa || '',
    contentHtml: project.contentHtml,
    contentHtmlFa: project.contentHtmlFa || '',
    coverImageUrl: project.coverImage || null,
    tags: project.techStack ?? [],
    featured: project.featured,
    sortOrder: project.sortOrder,
    published: project.published,
    liveUrl: project.caseStudyUrl || null,
    repoUrl: project.githubUrl || null,
    createdAt: createdAtOf(project),
  };
}

export function mapOffering(offering: OfferingDocument) {
  return {
    id: idOf(offering),
    slug: offering.slug,
    title: offering.title,
    titleFa: offering.titleFa || '',
    description: offering.description,
    descriptionFa: offering.descriptionFa || '',
    icon: offering.icon,
    highlighted: offering.highlighted,
    sortOrder: offering.sortOrder,
    published: offering.published,
    createdAt: createdAtOf(offering),
  };
}

export function mapExperience(item: ExperienceDocument) {
  return {
    id: idOf(item),
    slug: idOf(item),
    company: item.company,
    companyFa: item.companyFa || '',
    role: item.role,
    roleFa: item.roleFa || '',
    period: item.duration,
    periodFa: item.durationFa || '',
    description: item.description,
    descriptionFa: item.descriptionFa || '',
    current: item.highlighted,
    sortOrder: item.sortOrder,
    published: item.published,
    createdAt: createdAtOf(item),
  };
}

export function mapSkill(skill: SkillDocument) {
  return {
    id: idOf(skill),
    slug: idOf(skill),
    name: skill.name,
    category: skill.category,
    icon: skill.icon || null,
    sortOrder: skill.sortOrder,
    published: skill.published,
    createdAt: createdAtOf(skill),
  };
}

export function mapTestimonial(item: TestimonialDocument) {
  return {
    id: idOf(item),
    slug: idOf(item),
    name: item.name,
    role: item.role,
    company: item.company,
    content: item.content,
    contentFa: item.contentFa || '',
    avatarUrl: item.avatarUrl || null,
    sortOrder: item.sortOrder,
    published: item.published,
    createdAt: createdAtOf(item),
  };
}

export function mapArticleListItem(article: ArticleDocument) {
  return {
    id: idOf(article),
    slug: article.slug,
    title: article.title,
    titleFa: article.titleFa || '',
    excerpt: article.excerpt,
    excerptFa: article.excerptFa || '',
    coverImageUrl: article.coverImage || null,
    publishedAt:
      article.publishedAt?.toISOString?.() ?? new Date().toISOString(),
    published: article.published,
    createdAt: createdAtOf(article),
  };
}

export function mapArticleDetail(article: ArticleDocument) {
  return {
    ...mapArticleListItem(article),
    contentHtml: article.contentHtml,
    contentHtmlFa: article.contentHtmlFa || '',
  };
}
