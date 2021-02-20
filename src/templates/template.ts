import mustache from "mustache";
import { CombinedMetadata } from "../parsers/allMetadata";
import { HtmlTextMetadata } from "../parsers/md";
import { format, formatISO } from "date-fns";

export interface TocModel {
  entries: TocEntry[];
}

export interface TocEntry {
  titleHtml: string;
  titleText: string;
  descriptionHtml?: string;
  dateFormatted: string;
  isoTime: string;
  url: string;
}

export interface PageModel {
  siteTitle: string;
  menuItems: MenuItems[];
}

interface AlmostCompletePageModel extends PageModel {
  title: string;
}

interface CompletePageModel extends AlmostCompletePageModel {
  bodyHtml: string;
}

export interface MenuItems {
  text: string;
  url: string;
  /** Is this the last item. Helps template insert dividers between but not after last item. */
  last?: boolean;
}

function applyTemplate<TBodyModel>(
  pageTemplate: string,
  bodyTemplate: string,
  pageModel: AlmostCompletePageModel,
  bodyModel: TBodyModel
) {
  const bodyHtml = mustache.render(bodyTemplate, bodyModel);
  const completePageModel: CompletePageModel = { bodyHtml, ...pageModel };
  const pageHtml = mustache.render(pageTemplate, completePageModel);
  return pageHtml;
}

/** Toc page, which is currenly hardcoded as homepage. Also lacks paging. */
export function createTocPageHtml(
  pageTemplate: string,
  tocTemplate: string,
  pageModel: PageModel,
  metadata: (CombinedMetadata & HtmlTextMetadata)[],
  url: string
) {
  const tocModel: TocModel = {
    entries: metadata.map((m) => ({
      titleHtml: m.titleHtml,
      titleText: m.titleText,
      descriptionHtml: m.descriptionHtml,
      dateFormatted: format(m.date, "do LLLL y"),
      isoTime: formatISO(m.date),
      url: url,
    })),
  };
  const page = applyTemplate(
    pageTemplate,
    tocTemplate,
    { ...pageModel, title: `Home - ${pageModel.siteTitle}` },
    tocModel
  );
  return page;
}

export function createArticlePageHtml(
  pageTemplate: string,
  articleTemplate: string,
  pageModel: PageModel,
  metadata: CombinedMetadata & HtmlTextMetadata
): string {
  const page = applyTemplate(
    pageTemplate,
    articleTemplate,
    { ...pageModel, title: `${metadata.titleText} - ${pageModel.siteTitle}` },
    metadata
  );
  return page;
}
