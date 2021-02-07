import mustache from "mustache";
import { CombinedMetadata } from "../parsers/allMetadata";
import { HtmlTextMetadata } from "../parsers/md";

export interface TocModel {
  pageTitle: string;
  entries: TocEntry[];
}

export interface TocEntry {
  titleHtml: string;
  titleText: string;
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

export function applyTemplate<TBodyModel>(
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

export function applyTocTemplate(
  pageTemplate: string,
  tocTemplate: string,
  pageModel: PageModel,
  metadata: (CombinedMetadata & HtmlTextMetadata)[]
) {
  const tocModel: TocModel = {
    entries: metadata.map((m) => ({})),
  };
}
