/* 
  This file ties together all the steps in a simple one shot manner.
  Reading and writing of files or passing data between steps belongs here, not in any of the libs.
  Everything else, the actual doing should be in the other libs.

  It should be possible to transpose this structure on to a version with file watchers for auto upadate or a CI system or web functions.
 */

import { readAllFilesInDir } from "./util/t3hfs";
import { extractAndCombineMetadata } from "./parsers/allMetadata";
import { join } from "path";
import { createTocPageHtml, createArticlePageHtml } from "./templates/template";
import { metadataMarkdownToHtmlAndText } from "./parsers/md";

process.on("unhandledRejection", (err) => {
  throw err;
});

const projectDir = __dirname;
const defaultTemplatesDir = join(projectDir, "templates");

const inputs = {
  articleMdDir: `../posts`, // This assumes you have a posts folder/repo checked out besides this project.
  articleTemplate: join(defaultTemplatesDir, "article.mustache"),
  tocTemplate: join(defaultTemplatesDir, "toc.mustache"),
};

// This doesn't need ot be *all* files, could be changed files.
const readEditedFilesPromise = readAllFilesInDir(inputs.articleMdDir);

readEditedFilesPromise
  .then((files) =>
    files.map((file) => ({
      file: file,
      metadata: extractAndCombineMetadata(file.name, file.data),
    }))
  )
  .then((mdWithMetadata) => {
    mdWithMetadata.map((mwm) => {
      return { ...metadataMarkdownToHtmlAndText(mwm.metadata), ...mwm };
    });
  })
  .then((htmlWithMetadata) => {
    // TODO: send metadata to TOC builder (probably a template)
    // TODO: send metadata to template engine
  })
  .catch((err) => {
    throw err;
  });
