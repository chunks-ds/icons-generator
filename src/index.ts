#!/usr/bin/env node
import * as path from 'path';
import * as fs from 'fs';
import { execSync } from 'child_process';
import { optimize, Output } from 'svgo';
import * as dotEnv from 'dotenv'
import { Tools } from './tools';
dotEnv.config();
const tools: Tools = new Tools();

const workPath: string = path.resolve(__dirname, '../');
const sourcePath: string = path.resolve(workPath, './tmp/source');
const optimizedPath: string = path.resolve(workPath, './tmp/optimized');
console.log('Work path: ' + workPath);

// ###### CHECK IF ENVIRONMENT VARS EXISTS
if (!fs.existsSync(path.resolve(workPath, './.env'))) {
  throw new ReferenceError('File \".env\" required. There should be an environment variables file in the root directory of your project.');
}

// ###### PROCESS COMMAND ARGUMENTS
const allArguments: string[] = process.argv;
console.log('POLLO FRITO', allArguments);
const mode: string | undefined = tools.checkArgumentValue('--mode', allArguments);
const spritesFilePath: string | undefined = tools.checkArgumentValue('--sp-file-path', allArguments, false) ||
  path.resolve(workPath, './tmp/sprites.html');

// ###### GET SVG FILES FROM IMAGES REPOSITORY
try {
  console.log(execSync(`mkdir ${sourcePath}`, { encoding: 'utf-8' }));
  console.log(execSync(`mkdir ${optimizedPath}`, { encoding: 'utf-8' }));
  console.log(execSync(`git init ${sourcePath}`, { encoding: 'utf-8' }));
  console.log(execSync(`git --git-dir=${sourcePath}/.git config user.name \${GIT_USER}`, { encoding: 'utf-8' }));
  console.log(execSync(`git --git-dir=${sourcePath}/.git config user.email \${GIT_EMAIL}`, { encoding: 'utf-8' }));
  console.log(execSync(`git --git-dir=${sourcePath}/.git remote add origin https://\${GIT_USER}:\${GIT_TOKEN}@\${GIT_REPOSITORY}`, { encoding: 'utf-8' }));
  console.log(execSync(`git --git-dir=${sourcePath}/.git --work-tree=${sourcePath} pull origin main`, { encoding: 'utf-8' }));
} catch (error: any) {
  console.error(`COMMAND ERROR: ${error.message}`);
}

// ###### SVG FILES OPTIMIZATION
const svgWorkPath: string = path.resolve(workPath, `${sourcePath}/src/svg`);
const svgOptimizedPath: string = path.resolve(workPath, optimizedPath);
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
console.log('Optimized files process finished successfully.');

//###### GENERATE SPRITES
if (mode === 'all' || mode === 'sprites') {
  const spritesFile: string[] = ['<svg xmlns="http://www.w3.org/2000/svg">'];
  for (const file of svgFiles) {
    const spriteId: string = file.replace(`${svgWorkPath}/`, '').replace('.svg', '');
    const content = fs.readFileSync(file, 'utf8')
      .replace(/<svg\b[^>]*>/i, `<symbol id="${spriteId}" viewBox="0 0 24 24" fill="currentColor">`)
      .replace(/<\/svg>/i, '</symbol>');
    spritesFile.push(content);
  }
  spritesFile.push('</svg>');

  fs.writeFileSync(spritesFilePath, spritesFile.join(''), 'utf8');
}
