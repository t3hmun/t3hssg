import { extractMetadataFromFileName } from "./filenameMetadata";
import { extractJsonMetaAndMarkdown } from "./jsonFrontmatter";
import { extractMarkdownMetadata } from "./markdownMetadata";

export interface CombinedMetadata {
  fileName: string;
  titleMarkdown: string;
  date: Date;
  descriptionMarkdown?: string;
  markdown: string;
  h1Missing: boolean;
}

/**
 * Extracts metadata from the fileName and inside of the file. Also separates frontMatter and content from within the file.
 * @param {string} fileName - The name of the file (parsed for date and title metadata).
 * @param {string} fileContents - The contents of the file.
 */
export function extractAndCombineMetadata(
  fileName: string,
  fileContents: string
): CombinedMetadata {
  const fileNameMetadata = extractMetadataFromFileName(fileName);
  const { jsonMetadata, markdown } = extractJsonMetaAndMarkdown(fileContents);
  const markdownMetadata = extractMarkdownMetadata(markdown);

  const metadata = {
    fileName: fileName,
    titleMarkdown: jsonMetadata.title ?? markdownMetadata.title ?? fileNameMetadata.title,
    date: jsonMetadata.date ?? fileNameMetadata.date,
    descriptionMarkdown: jsonMetadata.description ?? markdownMetadata.description ?? undefined,
    markdown: markdown,
    h1Missing: markdownMetadata.h1Missing,
  };

  return metadata;
}
