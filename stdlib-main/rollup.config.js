import node from "@rollup/plugin-node-resolve";
import {terser} from "rollup-plugin-terser";
import meta from "./package.json" assert {type: "json"};

const copyright = `// @observablehq/stdlib v${meta.version} Copyright ${(new Date).getFullYear()} Observable, Inc.`;

export default [
  {
    input: "src/index.js",
    plugins: [
      node(),
      terser({
        output: {preamble: copyright},
        mangle: {
          reserved: [
            "FileAttachment",
            "RequireError",
            "DuckDBClient",
            "SQLiteDatabaseClient",
            "Workbook",
            "ZipArchive",
            "ZipArchiveEntry"
          ]
        }
      })
    ],
    output: {
      format: "umd",
      extend: true,
      name: "observablehq",
      file: "dist/stdlib.js"
    }
  }
];
