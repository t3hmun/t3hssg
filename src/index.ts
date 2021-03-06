/* 
  This file ties together all the steps in a simple one shot manner.
  Reading and writing of files or passing data between steps belongs here, not in any of the libs.
  Everything else, the actual doing should be in the other libs.

  It should be possible to transpose this structure on to a version with file watchers for auto upadate or a CI system or web functions.
 */

import { ensureDirCreated, readAllFilesInDir, writeAllParallel } from "./util/t3hfs";
import { CombinedMetadata, extractAndCombineMetadata } from "./parsers/allMetadata";
import { join, resolve } from "path";
import {
  createTocPageHtml,
  createArticlePageHtml,
  MenuItems,
  PageModel,
} from "./templates/template";
import { HtmlTextMetadata, metadataMarkdownToHtmlAndText } from "./parsers/md";
import { readFileSync, writeFile } from "fs";

process.on("unhandledRejection", (err) => {
  throw err;
});

const projDir = process.cwd();
const srcDir = join(projDir, "src");
const defaultTemplatesDir = join(srcDir, "templates");
const outputsDir = join(srcDir, "../output");

const inputs = {
  articleMdDir: join(srcDir, "../../posts/post"), // This assumes you have a posts folder/repo checked out besides this project.
  articleTemplatePath: join(defaultTemplatesDir, "article.mustache"),
  tocTemplatePath: join(defaultTemplatesDir, "toc.mustache"),
  pageTemplatePath: join(defaultTemplatesDir, "page.mustache"),
};

const outputs = {
  metadatas: join(outputsDir, "metadata"),
  articleHtml: join(outputsDir, "articleHtml"),
  site: join(outputsDir, "site"),
  baseUrl: "/",
};

interface Config {
  siteTitle: string;
  menu: MenuItems[];
}

const config: Config = {
  // TODO: url prefixing
  siteTitle: "t3hsite",
  menu: [
    { text: "Home", url: "/" },
    { text: "GitHub", url: "https://github.com/t3hmun", last: true },
  ],
};

everything();

function log(message: string) {
  console.log(message);
}

// This doesn't need ot be *all* files, could be changed files.
async function everything() {
  const articleTemplate = readFileSync(inputs.articleTemplatePath, "utf-8");
  const tocTemplate = readFileSync(inputs.tocTemplatePath, "utf-8");
  const pageTemplate = readFileSync(inputs.pageTemplatePath, "utf-8");

  const articleFiles = await readAllFilesInDir(inputs.articleMdDir);
  log(`Read ${articleFiles.length} article files.`);

  const combinedMetadatas = articleFiles.map((file) =>
    // TODO: probably pass baseUrl into here, then have safePageName and full url as metadata props.
    extractAndCombineMetadata(file.name, file.data)
  );

  await ensureDirCreated(outputs.metadatas);
  await writeAllParallel(
    combinedMetadatas,
    (m) => `${join(outputs.metadatas, m.fileName)}.json`,
    (m) => JSON.stringify(m)
  );

  const combinedMetadataHtmlTexts: (CombinedMetadata & HtmlTextMetadata)[] = combinedMetadatas.map(
    (c) => {
      return { ...metadataMarkdownToHtmlAndText(c), ...c };
    }
  );

  await ensureDirCreated(outputs.articleHtml);
  await writeAllParallel(
    combinedMetadataHtmlTexts,
    (m) => `${join(outputs.articleHtml, m.fileName)}.html`,
    (m) => JSON.stringify(m)
  );

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

  await ensureDirCreated(outputs.site);
  await new Promise<void>((resolve, reject) =>
    writeFile(`${join(outputs.site, "index.html")}`, tocPage, (err) =>
      err ? reject(err) : resolve()
    )
  );

  const articlePages = combinedMetadataHtmlTexts.map((c) => ({
    fileName: c.fileName,
    html: createArticlePageHtml(pageTemplate, articleTemplate, pageModel, c),
  }));

  await writeAllParallel(
    articlePages,
    (a) => `${join(outputs.site, a.fileName)}.html`,
    (a) => a.html
  );
}
