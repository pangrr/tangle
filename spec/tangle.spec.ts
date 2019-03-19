import 'mocha';
import { expect } from 'chai';
import * as shx from 'shelljs';
import * as path from 'path';
import * as fs from 'fs';
import * as fsx from 'fs-extra';


const tmpDir = 'tmp';


describe('tangle', () => {
  afterEach(() => {
    fsx.removeSync(tmpDir);
  });

  it('should generate the right code for sample markdown files', () => {
    fs.readdirSync(path.join('spec', 'sampleMarkdownFiles')).forEach(fileName => {
      shx.exec(`node bin/tangle.js spec/sampleMarkdownFiles/${fileName} -d ${tmpDir}`);
    });

    fs.readdirSync(path.join('spec', 'expectedCodeFiles')).forEach(fileName => {
      expect(sameFileContent(path.join('spec', 'expectedCodeFiles', `${fileName}`), path.join(tmpDir, `${fileName}`))).to.be.true;
    })
  });
});


function sameFileContent(filePathA: string, filePathB: string): boolean {
  return fs.readFileSync(filePathA).equals(fs.readFileSync(filePathB));
}
