const chai = require("chai");

const expect = chai.expect;
const should = chai.should();

const jsonFrontmatter = require("../jsonFrontmatter.js");

describe("jsonFronmatter jsonEndIndex", () => {
  const tests = [
    { description: "empty json", md: `{}\nSome markdown`, expected: 1 },
    {
      description: "one line single string value json",
      //   0123456789012345678901
      md: `{"description":"Text"}\nSome markdown`,
      expected: 21,
    },
    {
      description: "one line single string value unquoted label json",
      //   01234567890123456789
      md: `{description:"Text"}\nSome markdown`,
      expected: 19,
    },
    {
      description: "one line single string with { label json",
      //   0123456789012345678901
      md: `{"description":"T{xt"}\nSome markdown`,
      expected: 21,
    },
    {
      description: "one line single string with } item label json",
      //   0123456789012345678901
      md: `{"description":"Te}t"}\nSome markdown`,
      expected: 21,
    },
    {
      description: "one line single string with {} item label json",
      //   0123456789012345678901
      md: `{"description":"T{}t"}\nSome markdown`,
      expected: 21,
    },
    {
      description: 'one line single string with escaped " json',
      //   0123456789012345x6x78901
      md: `{"description":"\\\"xt"}\nSome markdown`,
      expected: 21,
    },
  ];

  tests.forEach(function (test) {
    it(`parse ${test.description}`, function () {
      jsonFrontmatter.jsonEndIndex(test.md).should.equal(test.expected);
    });
  });
});
