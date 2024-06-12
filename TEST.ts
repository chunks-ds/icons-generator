import { Tools } from './src/tools';
import * as path from 'path';
import * as fs from 'fs';
import { optimize, Output } from 'svgo';

const tools: Tools = new Tools();

const files: string[] = tools.plainListOfSvgPaths(path.resolve(__dirname, './src/test'));

const svgWorkPath: string = path.resolve(__dirname, './src/test');
const svgOptimizedPath: string = path.resolve(__dirname, './src/op');
const svgFiles: string[] = tools.plainListOfSvgPaths(svgWorkPath);
for (const svg of svgFiles) {
  const fileName: string = svg.split('/').pop() as string;
  const svgContent: string = fs.readFileSync(svg, 'utf8');
  const result: Output = optimize(svgContent);
  const pathTree: string[] = svg
    .replace(svgWorkPath, '').replace(fileName, '')
    .split('/').filter((e: string): boolean  => !!e);

  const iterator: string[] = [];
  for (const dir of pathTree) {
    iterator.push(dir);
    const route: string = `${svgOptimizedPath}/${iterator.join('/')}`;
    if (!fs.existsSync(route)) {
      console.log(route);
      fs.mkdirSync(route);
    }
  }
  fs.writeFileSync(`${svg.replace(svgWorkPath, svgOptimizedPath)}`, result.data, 'utf8');
}
