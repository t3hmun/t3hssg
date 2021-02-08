/* 
  This file ties together all the steps in a simple one shot manner.
  Reading and writing of files or passing data between steps belongs here, not in any of the libs.
  Everything else, the actual doing should be in the other libs.

  It should be possible to transpose this structure on to a version with file watchers for auto upadate or a CI system or web functions.
 */

import { readAllFilesInDir } from "./util/t3hfs";
import { CombinedMetadata, extractAndCombineMetadata } from "./parsers/allMetadata";
import { join, resolve } from "path";
import {
  createTocPageHtml,
  createArticlePageHtml,
  MenuItems,
  PageModel,
} from "./templates/template";
import { HtmlTextMetadata, metadataMarkdownToHtmlAndText } from "./parsers/md";
import { readFileSync } from "fs";

process.on("unhandledRejection", (err) => {
  throw err;
});

const projectDir = __dirname;
const defaultTemplatesDir = join(projectDir, "templates");

const inputs = {
  articleMdDir: `../posts`, // This assumes you have a posts folder/repo checked out besides this project.
  articleTemplatePath: join(defaultTemplatesDir, "article.mustache"),
  tocTemplatePath: join(defaultTemplatesDir, "toc.mustache"),
  pageTemplatePath: join(defaultTemplatesDir, "page.mustache"),
};

interface Config {
  siteTitle: string;
  menu: MenuItems[];
  // Maybe paths+titles to the body for other pages like about/contact?
}

const config: Config = {
  // TODO: url prefixing
  siteTitle: "t3hsite",
  menu: [
    { text: "home", url: "/" },
    { text: "GitHub", url: "https://github.com/t3hmun" },
  ],
};

everything();

// This doesn't need ot be *all* files, could be changed files.
async function everything() {
  const articleTemplate = readFileSync(inputs.articleTemplatePath, "utf-8");
  const tocTemplate = readFileSync(inputs.tocTemplatePath, "utf-8");
  const pageTemplate = readFileSync(inputs.pageTemplatePath, "utf-8");

  const articleFiles = await readAllFilesInDir(inputs.articleMdDir);

  const combinedMetadatas = articleFiles.map((file) =>
    // TODO: probably pass baseUrl into here, then have safePageName and full url as metadata props.
    extractAndCombineMetadata(file.name, file.data)
  );

  const combinedMetadataHtmlTexts: (CombinedMetadata & HtmlTextMetadata)[] = combinedMetadatas.map(
    (c) => {
      return { ...metadataMarkdownToHtmlAndText(c), ...c };
    }
  );

  // TODO: writeout metadata.

  const pageModel: PageModel = {
    menuItems: config.menu,
    siteTitle: config.siteTitle,
  };

  const tocPage = createTocPageHtml(
    pageTemplate,
    tocTemplate,
    pageModel,
    combinedMetadataHtmlTexts, // TODO: Sort this metadata by date.
    `TODO: Figure out where url gen goes`
  );

  // TODO write toc page

  const articlePages = combinedMetadataHtmlTexts.map((c) =>
    createArticlePageHtml(pageTemplate, articleTemplate, pageModel, c)
  );

  // TODO write article pages.
}
