/* 
  This file ties together all the steps in a simple one shot manner.
  Reading and writing of files or passing data between steps belongs here, not in any of the libs.
  Everything else, the actual doing should be in the other libs.

  It should be possible to transpose this structure on to a version with file watchers for auto upadate or a CI system or web functions.
 */

const t3hfs = require("./util/t3hfs.js");
const metadataParser = require("./parsers/allMetadata.js");
const path = require("path");
const md = require("./parsers/md.js");
const template = require("./templates/template.js");

process.on("unhandledRejection", (err) => {
  throw err;
});

const projectDir = __dirname;
const defaultTemplatesDir = path.join(projectDir, "templates");

const inputs = {
  articleMdDir: `../posts`, // This assumes you have a posts folder/repo checked out besides this project.
  articleTemplate: path.join(defaultTemplatesDir, "article.mustache"),
  tocTemplate: path.join(defaultTemplatesDir, "toc.mustache"),
};

// This doesn't need ot be *all* files, could be changed files.
const readEditedFilesPromise = t3hfs.readAllFilesInDir(articleMdDir);

readEditedFilesPromise
  .then((files) =>
    files.map((file) => ({
      file: file,
      metadata: metadataParser.extractAndCombineMetadata(file.name, file.data),
    }))
  )
  .then((mdWithMetadata) => {
    mdWithMetadata.map((mwm) => {
      return { ...md.metadataMarkdownToHtmlAndText(mwm), ...mwm };
    });
  })
  .then((htmlWithMetadata) => {
    // TODO: send metadata to TOC builder (probably a template)
    // TODO: send metadata to template engine
    const tocPage = template.applyTemplate(inputs.tocTemplate, {
      pageTitle: "t3hweb",
      entries: htmlWithMetadata.map((hwm) => ({
        headTitle: hwm.titleText,
        needsH1: !hwm.h1missing,
        h1TitleHtml: hwm.titleHtml,
        articleHtml: hwm.articleHtml,
      })),
    });

    const articles = template.applyTemplate(inputs.articleTemplate, {
      headTitle: `article.web`,
    });
  })
  .catch((err) => {
    throw err;
  });
