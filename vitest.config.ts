import {defineConfig} from "vitest/config";
import {fileURLToPath} from "node:url";
export default defineConfig({resolve:{alias:[
 {find:/^@everlang\/backend\/(.*)$/,replacement:fileURLToPath(new URL("./packages/backend/src/",import.meta.url))+"$1"},
 {find:/^@everlang\/contracts\/(.*)$/,replacement:fileURLToPath(new URL("./packages/contracts/src/",import.meta.url))+"$1"},
 {find:"@",replacement:fileURLToPath(new URL("./apps/web/",import.meta.url))}
]},test:{include:["tests/unit/**/*.test.ts"]}});
