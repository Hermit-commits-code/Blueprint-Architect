import assert from 'assert';
import sinon from 'sinon';
import * as vscode from 'vscode';
import * as fs from 'fs';
import path from 'path';
import { getBlueprints } from '../src/extension';

describe('Blueprint Architect Extension (Integration)', () => {
  let showErrorMessageStub: sinon.SinonStub;
  let workspaceFoldersStub: sinon.SinonStub;
  let readFileStub: sinon.SinonStub;
  let testWorkspaceUri: vscode.Uri;

  beforeEach(() => {
    showErrorMessageStub = sinon.stub(vscode.window, 'showErrorMessage');
    workspaceFoldersStub = sinon
      .stub(vscode.workspace, 'workspaceFolders')
      .value([{ uri: vscode.Uri.file('/fake/workspace') }]);
    readFileStub = sinon.stub(vscode.workspace.fs, 'readFile');
    testWorkspaceUri = vscode.Uri.file('/fake/workspace');
  });

  afterEach(() => {
    sinon.restore();
  });

  it('should return null and show error for invalid JSON config', async () => {
    readFileStub.resolves(Buffer.from('not-json'));
    const result = await getBlueprints(testWorkspaceUri);
    assert.strictEqual(result, null);
    assert.ok(showErrorMessageStub.called);
  });

  it('should return null and show error for config that is not an object', async () => {
    readFileStub.resolves(Buffer.from('[]'));
    const result = await getBlueprints(testWorkspaceUri);
    assert.strictEqual(result, null);
    assert.ok(showErrorMessageStub.called);
  });

  it('should return valid config for correct blueprint structure', async () => {
    const validConfig = {
      myComponent: {
        files: [{ path: 'index.tsx', content: 'test' }],
      },
    };
    readFileStub.resolves(Buffer.from(JSON.stringify(validConfig)));
    const result = await getBlueprints(testWorkspaceUri);
    assert.ok(result);
    assert.ok(result!.myComponent);
    assert.strictEqual(result!.myComponent.files[0].path, 'index.tsx');
  });
});
