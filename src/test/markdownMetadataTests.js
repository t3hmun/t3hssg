const chai = require("chai");
const should = chai.should;

const markdownMetadata = require("../parsers/markdownMetadata.js");

describe(`markdownMetadata extractMarkdownMetadata H1 only`, function () {
  const tests = [
    {
      description: "One word H1",
      markdown: "# Test\n\ncontent",
      expected: {
        title: "Test",
        description: null,
      },
    },
    {
      description: "One word H1 with crlf after",
      markdown: "# Test\r\n\r\ncontent",
      expected: {
        title: "Test",
        description: null,
      },
    },
    {
      description: "One word H1 with crlf before",
      markdown: "\r\n# Test\n\ncontent",
      expected: {
        title: "Test",
        description: null,
      },
    },
    {
      description: "One word H1 with crlf before and after",
      markdown: "\r\n# Test\r\n\r\ncontent",
      expected: {
        title: "Test",
        description: null,
      },
    },
    {
      description: "Two word H1",
      markdown: "# Test Header\n\n content",
      expected: {
        title: "Test Header",
        description: null,
      },
    },
    {
      description: "H1 with text before",
      markdown: "\n> Some comment about stuff\n\n# Test Header\n\n content",
      expected: {
        title: "Test Header",
        description: null,
      },
    },
  ];

  tests.forEach((test) => {
    it(`parse ${test.description}`, function () {
      const actual = markdownMetadata.extractMarkdownMetadata(test.markdown);
      actual.should.eql(test.expected);
    });
  });
});

describe(`markdownMetadata extractMarkdownMetadata H1 and description`, function () {
  const tests = [
    {
      description: "One word H1 and description",
      markdown: "# Test\n\ncontent\n\n## h2",
      expected: {
        title: "Test",
        description: "content",
      },
    },
    {
      description: "One word H1 and description extra newlines",
      markdown: "# Test\n\ncontent\n\n\n\n## h2",
      expected: {
        title: "Test",
        description: "content",
      },
    },
    {
      description: "One word H1 and description with crlfs",
      markdown: "# Test\r\n\r\ncontent\r\n\r\n## h2",
      expected: {
        title: "Test",
        description: "content",
      },
    },
    {
      description: "One word H1 and description and 2 h2s",
      markdown:
        "# Test\n\ncontent\n\n## h2\nMore stuff\n\n## h2\n\neven more content",
      expected: {
        title: "Test",
        description: "content",
      },
    },
    {
      description: "One word H1 and description and 2 h2s with crlfs",
      markdown:
        "# Test\r\n\r\ncontent\r\n\r\n## h2\r\nMore stuff\r\n\r\n## h2\r\n\r\neven more content",
      expected: {
        title: "Test",
        description: "content",
      },
    },
    {
      description: "Two word H1 and content",
      markdown: "# Test Header\n\n some content\n\n## h2",
      expected: {
        title: "Test Header",
        description: "some content",
      },
    },
    {
      description: "H1 and content with text before",
      markdown:
        "\n> Some comment about stuff\n\n# Test Header\n\n content\n\n## h2",
      expected: {
        title: "Test Header",
        description: "content",
      },
    },
  ];

  tests.forEach((test) => {
    it(`parse ${test.description}`, function () {
      const actual = markdownMetadata.extractMarkdownMetadata(test.markdown);
      actual.should.eql(test.expected);
    });
  });
});

describe(`markdownMetadata extractMarkdownMetadata Description with no H1`, () => {
  const tests = [
    {
      description: "One word description",
      markdown: "hi\n## h2",
      expected: { title: null, description: "hi" },
    },
    {
      description: "Muliline description",
      markdown: "hi\nthis is a \nmany line\ndescription\n## h2",
      expected: {
        title: null,
        description: "hi\nthis is a \nmany line\ndescription",
      },
    },
  ];

  tests.forEach((test) => {
    it(`parse ${test.description}`, () => {
      const actual = markdownMetadata.extractMarkdownMetadata(test.markdown);
      actual.should.eql(test.expected);
    });
  });
});
