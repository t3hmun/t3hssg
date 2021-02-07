import mustache from "mustache";
import { CombinedMetadata } from "../parsers/allMetadata";
import { HtmlTextMetadata } from "../parsers/md";

export interface TocModel {
  entries: TocEntry[];
}

export interface TocEntry {
  titleHtml: string;
  titleText: string;
  descriptionHtml?: string;
}

export interface PageModel {
  title: string;
  heading: string;
  menuItems: MenuItems[];
}

export interface CompletePageModel extends PageModel {
  bodyHtml: string;
}

export interface MenuItems {
  text: string;
  url: string;
}

function applyTemplate<TBodyModel>(
  pageTemplate: string,
  bodyTemplate: string,
  pageModel: PageModel,
  bodyModel: TBodyModel
) {
  const bodyHtml = mustache.render(bodyTemplate, bodyModel);
  const complatePageModel: CompletePageModel = { bodyHtml, ...pageModel };
  const pageHtml = mustache.render(pageTemplate, complatePageModel);
  return pageHtml;
}

export function createTocPageHtml(
  pageTemplate: string,
  tocTemplate: string,
  pageModel: PageModel,
  metadata: (HtmlTextMetadata | TocEntry)[]
) {
  const tocModel: TocModel = {
    entries: metadata.map((m) => ({
      titleHtml: m.titleHtml,
      titleText: m.titleText,
      descriptionHtml: m.descriptionHtml,
    })),
  };
  const page = applyTemplate(pageTemplate, tocTemplate, pageModel, tocModel);
  return page;
}

export function createArticlePageHtml(
  pageTemplate: string,
  articleTemplate: string,
  pageModel: PageModel,
  metadata: CombinedMetadata & HtmlTextMetadata
): string {
  const articleModel = {
    needsH1: !metadata.h1Missing,
    ...metadata,
  };

  const page = applyTemplate(pageTemplate, articleTemplate, pageModel, articleModel);
  return page;
}
