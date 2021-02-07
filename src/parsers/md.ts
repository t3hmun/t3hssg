import MarkdownIt from "markdown-it";
import hljs from "highlight.js";
import { stripHtml } from "string-strip-html";
import { CombinedMetadata } from "./allMetadata";

const defaultMdIt = configureMarkdownIt();

export interface HtmlTextMetadata {
  articleHtml: string;
  /** Should not have H1 tags, but html escapes possible, simple markdown formatting possible. */
  titleHtml: string;
  /** Should be a single paragraph of text. */
  descriptionHtml?: string;
  /** Pure text title, no html or formatting. */
  titleText: string;
  /** Pure text description, no html or formatting. */
  descriptionText?: string;
}

export function metadataMarkdownToHtmlAndText(metadata: CombinedMetadata): HtmlTextMetadata {
  const articleHtml = convertToHtml(metadata.markdown);
  const titleHtml = convertToHtml(metadata.titleMarkdown);
  const descriptionHtml = metadata.descriptionMarkdown
    ? convertToHtml(metadata.descriptionMarkdown)
    : undefined;

  const titleText = stripHtml(titleHtml).result;
  const descriptionText = descriptionHtml ? stripHtml(descriptionHtml).result : undefined;

  return {
    articleHtml,
    titleHtml,
    descriptionHtml,
    titleText,
    descriptionText,
  };
}

function convertToHtml(md: string) {
  const html = defaultMdIt.render(md);
  return html;
}

function configureMarkdownIt() {
  // Mostly copy paste from the MarkdownIt readme, customised.
  const mdit = new MarkdownIt({
    html: true, // Enable HTML tags in source
    xhtmlOut: false, // Use '/' to close single tags (<br />).
    // This is only for full CommonMark compatibility.
    breaks: false, // Convert '\n' in paragraphs into <br>
    langPrefix: "language-", // CSS language prefix for fenced blocks. Can be
    // useful for external highlighters.
    linkify: false, // Autoconvert URL-like text to links

    // I do not want typographer, do not want quotes interfered with.
    typographer: false,

    highlight: function (str, lang) {
      if (lang && hljs.getLanguage(lang)) {
        try {
          return hljs.highlight(lang, str).value;
        } catch (err) {
          throw err;
        }
      }

      return ""; // use external default escaping
    },
  });
  return mdit;
}
