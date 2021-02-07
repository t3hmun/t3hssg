const mustache = require("mustache");

module.exports.applyTemplate = (template, model) => {
  mustache.render(template, model);
};
