const visit = require("unist-util-visit");
const plantumlEncoder = require("plantuml-encoder");

const DEFAULT_OPTIONS = {
  baseUrl: "https://www.plantuml.com/plantuml/png"
};

function replace(source, target) {
  for (const property in source) {
    delete source[property];
  }

  Object.assign(source, target);
}
/**
 * Plugin for remark-js
 *
 * See details about plugin API:
 * https://github.com/unifiedjs/unified#plugin
 *
 * You can specify the endpoint of PlantUML with the option 'baseUrl'
 *
 * @param {Object} pluginOptions Remark plugin options.
 */
function remarkSimplePlantumlPlugin(pluginOptions) {
  const options = { ...DEFAULT_OPTIONS, ...pluginOptions };

  function getValuesFromMeta(meta){
    var args={};
    var match = meta.split(',').map(m=>m.trim());

    for (var i=0; i<match.length; i++){
      args[match[i].split('=')[0].trim()] = match[i].split('=')[1].trim()
    }

    return args
  }

  return function transformer(syntaxTree) {
    visit(syntaxTree, "code", node => {
      let { lang, value, meta } = node;
      if (!lang || !value || lang !== "plantuml") return;

      args = getValuesFromMeta(meta);

      value = "!includeurl " 
            + (args["theme"] || "https://gist.githubusercontent.com/UnresolvedCold/0763c0298a8be2349c56b6944d7542c9/raw/0551ad29c25d008f857c1f4abe3c25a4966e8eee/puml_theme.puml")
            + "\n"
            + value

      node.type = "image";
      node.url = `${options.baseUrl.replace(/\/$/, "")}/${plantumlEncoder.encode(value)}`;
      node.alt = args["alt"];
      node.meta = undefined;

      node.data = { 
            hProperties: {
              "width": args["width"] || "80%",
              "height": args["height"],
              "style": "margin: auto;"
            }, 
          };

      // const figureElement = {
      //   type: "element",
      //   data: { 
      //     hName: "div",  
      //     hProperties: {
      //       "data-remark-code-title": true,
      //       "data-language": node.lang,
      //     }, 
      //   },
      //   // children: [imgElement],
      // };

      // replace(node, figureElement);

    });
    
    return syntaxTree;
  };
}

module.exports = remarkSimplePlantumlPlugin;
