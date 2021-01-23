const fnmParser = require("./filenameMetadata.js");
const jsonFMParser = require("./jsonFrontmatter.js");
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

  // TODO, this will just be descirption.
  const contentMetadata = {};

  const metadata = {
    fileName: fileName,
    title: jsonBlock.title ?? fileNameMetadata.title,
    date: jsonBlock.date ?? fileNameMetadata.date,
    descriptionMarkdown:
      jsonBlock.description ?? contentMetadata.description ?? "",
    markdown: markdown,
  };
};
