// generateImgIndex.js
const fs = require("fs");
const path = require("path");

const imgDir = path.join(__dirname, "src/assets/img");
const outputFile = path.join(imgDir, "index.js");

// pega todos os arquivos da pasta img
const files = fs.readdirSync(imgDir).filter(file =>
  /\.(png|jpe?g|svg|gif|webp)$/i.test(file)
);

let content = files
  .map(file => {
    const name = file
      .replace(/\.[^/.]+$/, "")       // remove extensão
      .replace(/[-\s]+(.)?/g, (_, c) => c ? c.toUpperCase() : ""); // camelCase
    return `import ${name} from "./${file}";`;
  })
  .join("\n");

content += `\n\nexport {\n  ${files
  .map(file =>
    file.replace(/\.[^/.]+$/, "").replace(/[-\s]+(.)?/g, (_, c) => c ? c.toUpperCase() : "")
  )
  .join(",\n  ")}\n};\n`;

fs.writeFileSync(outputFile, content);

console.log("index.js gerado com sucesso!");
