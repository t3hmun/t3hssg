const MarkdownIt = require("markdown-it");
const hljs = require("highlight.js");
const stripHtml = require("string-strip-html");

const defaultMdIt = configureMarkdownIt();

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

module.exports.convertToHtml = (md) => {
  const html = defaultMdIt.render(md);
  return html;
};

module.exports.metadataMarkdownToHtmlAndText = (metadata) => {
  const articleHtml = md.convertToHtml(metadata.markdown);
  const titleHtml = md.convertToHtml(metadata.titleMarkdown);
  const descriptionHtml = md.convertToHtml(metadata.descriptionMarkdown);

  const titleText = stripHtml(titleHtml).result;
  const descriptionText = stripHtml(descriptionHtml).result;

  return {
    articleHtml,
    titleHtml,
    descriptionHtml,
    titleText,
    descriptionText,
  };
};
