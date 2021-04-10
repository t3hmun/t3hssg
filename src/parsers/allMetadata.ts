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
  /** The text used as a link to this page. */
  link: string;
}

/**
 * Extracts metadata from the fileName and inside of the file. Also separates frontMatter and content from within the file.
 * @param fileName - The name of the file (parsed for date and title metadata).
 * @param dir - The folder path relative to the base path of articles, no trailing slash.
 * @param fileContents - The contents of the file.
 */
export function extractAndCombineMetadata(
  fileName: string,
  dir: string,
  fileContents: string
): CombinedMetadata {
  try {
    const fileNameMetadata = extractMetadataFromFileName(fileName);
    const { jsonMetadata, markdown } = extractJsonMetaAndMarkdown(fileContents);
    const markdownMetadata = extractMarkdownMetadata(markdown);

    const metadata = {
      fileName: fileName,
      dir: dir,
      titleMarkdown: jsonMetadata.title ?? markdownMetadata.title ?? fileNameMetadata.title,
      date: jsonMetadata.date ?? fileNameMetadata.date,
      descriptionMarkdown: jsonMetadata.description ?? markdownMetadata.description ?? undefined,
      markdown: markdown,
      h1Missing: markdownMetadata.h1Missing,
      link: jsonMetadata.link ?? fileNameMetadata.title,
    };

    return metadata;
  } catch (err) {
    err.message = `In fileName: ${fileName}, ${err.message}`;
    throw err;
  }
}
