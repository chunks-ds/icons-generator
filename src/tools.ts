import * as fs from 'fs';

export type ArgumentsCollection = '--mode' | '--sp-file-path';
export type ArgumentValuesSchema = { [key in ArgumentsCollection]: RegExp };

export class Tools {
  public argValidations: ArgumentValuesSchema = {
    '--mode': /^(?!--)(all|sprites|font)$/,
    '--sp-file-path': /^(?!--).+\.html$/
  };

  public checkArgumentValue(arg: ArgumentsCollection, argsArray: string[], required: boolean = true): string | undefined {
    let output: string | undefined = undefined;
    const argSyntax: string = `\"${arg} [value]\" or \"${arg}=[value]\"`;
    const notFoundErrorMsg: string = `Not found required argument ${arg}. Right syntax is: ${argSyntax}.`;
    const notMatchValueErrorMsg: string = `Argument value for ${arg} is not valid.`;
    const prospectOutput: string | undefined = argsArray.find((e: string) => e.includes(arg));
    if (!!prospectOutput) {
      const argParts: string[] = prospectOutput.split('=');
      let candidateValue: string = '';
      if (argParts.length === 1) {
        candidateValue = argsArray[argsArray.indexOf(arg) + 1];
      } else if (argParts.length === 2) {
        candidateValue = argParts[1];
      } else if (required) {
        throw new ReferenceError(notFoundErrorMsg);
      }
      if (!!candidateValue && this.argValidations[arg].test(candidateValue)) {
        output = candidateValue;
      } else {
        const addMsg: string = (required) ? '' : ' This is an optional argument and you can run the command without it.';
        throw new ReferenceError(`${notMatchValueErrorMsg}${addMsg}`);
      }
    } else if (required) {
      throw new ReferenceError(notFoundErrorMsg);
    }
    return output;
  }

  public plainListOfSvgPaths(path: string): string[] {
    const plainContent: string[] = [path];
    const plainFiles: string[] = [];
    for (const item of plainContent) {
      if (fs.statSync(item).isDirectory()) {
        plainContent.push(...fs.readdirSync(item).map((e: string): string => `${item}/${e}`));
      } else if (item.split('.').pop() === 'svg') {
        plainFiles.push(item);
      }
    }

    return plainFiles;
  }
}
