const fnmParser = require("./filenameMetadata.js");
const jsonFMParser = require("./jsonFrontmatter.js");
const mdmParser = require("./markdownMetadata.js");
/**
 * Extracts metadata from the fileName and inside of the file. Also separates frontMatter and content from within the file.
 * @param {string} fileName - The name of the file (parsed for date and title metadata).
 * @param {string} fileContents - The contents of the file.
 */
module.exports.extractAndCombineMetadata = (fileName, fileContents) => {
  const fileNameMetadata = fnmParser.extractMetadataFromFileName(fileName);
  const jsonEndIndex = jsonFMParser.jsonEndIndex(fileContents);
  const jsonBlock = fileContents.slice(0, jsonEndIndex);
  const markdown = fileContents.slice(jsonEndIndex);

  const jsonMetadata = JSON.parse(jsonBlock);
  const markdownMetadata = mdmParser.extractMarkdownMetadata(markdown);

  if (hasNoText(jsonMetadata.title))
    throw new error(`Empty json title is invalid, fileName:${fileName}`);

  const metadata = {
    fileName: fileName,
    titleMarkdown:
      jsonMetadata.title ?? markdownMetadata.title ?? fileNameMetadata.title,
    date: JsonMetadata.date ?? fileNameMetadata.date,
    descriptionMarkdown:
      JsonMetadata.description ?? contentMetadata.description ?? null,
    markdown: markdown,
    h1Missing: markdownMetadata.h1Missing,
  };

  return metadata;
};

function hasNoText(value) {
  if (!value) return true;
  if (value.trim() === "") return true;
  return false;
}
