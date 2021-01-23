const chai = require("chai");
const should = chai.should;

const markdownMetadata = require("../parsers/markdownMetadata.js");

describe(`markdownMetadata extractMarkdownMetadata`, function () {
  const tests = [
    {
      description: "One word H1 only",
      markdown: "# Test\n\ncontent",
      expected: {
        title: "Test",
        description: null,
      },
    },
    {
      description: "One word H1 only with crlf after",
      markdown: "# Test\r\n\r\ncontent",
      expected: {
        title: "Test",
        description: null,
      },
    },
    {
      description: "One word H1 only with crlf before",
      markdown: "\r\n# Test\n\ncontent",
      expected: {
        title: "Test",
        description: null,
      },
    },
    {
      description: "One word H1 only with crlf before and after",
      markdown: "\r\n# Test\r\n\r\ncontent",
      expected: {
        title: "Test",
        description: null,
      },
    },
    {
      description: "Two word H1 only",
      markdown: "# Test Header\n\n content",
      expected: {
        title: "Test Header",
        description: null,
      },
    },
    {
      description: "H1 only with text before",
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
