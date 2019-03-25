import 'mocha';
import { expect } from 'chai';
import * as shx from 'shelljs';
import * as path from 'path';
import * as fs from 'fs';
import * as fsx from 'fs-extra';


const outputDir = 'testOutput';


describe('tangle', () => {
  afterEach(() => {
    fsx.removeSync(outputDir);
  });

  it('should generate a file with identical content as aHtml/demo.html from aHtml/demo.md', () => {
    shx.exec(`node bin/tangle.js examples/aHtml/demo.md -d ${outputDir}`);
    expect(sameFileContent(path.join('examples', 'aHtml', 'demo.html'), path.join(outputDir, 'demo.html'))).to.be.true;
  });

  it('should generate a file with identical content as tangle/tangle.ts from tangle/tangle.md', () => {
    shx.exec(`node bin/tangle.js examples/tangle/tangle.md -d ${outputDir}`);
    expect(sameFileContent(path.join('examples', 'tangle', 'tangle.ts'), path.join(outputDir, 'tangle.ts'))).to.be.true;
  });
});


function sameFileContent(filePathA: string, filePathB: string): boolean {
  return fs.readFileSync(filePathA).equals(fs.readFileSync(filePathB));
}
