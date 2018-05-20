import * as fs from 'fs';
import * as util from 'util';
import * as assert from 'assert';

import { AssetService, AssetUtil, Asset } from '@travetto/asset';
import { Suite, Test, BeforeAll, BeforeEach } from '@travetto/test';
import { DependencyRegistry, Injectable } from '@travetto/di';
import { AssetS3Source } from '../src/service/source';
import { AssetS3Config } from '../src/service/config';

const fsStat = util.promisify(fs.stat);

@Injectable({ target: AssetS3Config })
class Conf extends AssetS3Config {

}

@Injectable()
class Source extends AssetS3Source {

}

@Suite()
class TestAssetService {

  @BeforeAll()
  async init() {
    await DependencyRegistry.init();
  }

  @Test('downloads an file from a url')
  async download() {
    const service = await DependencyRegistry.getInstance(AssetService);
    assert(service);
    assert((service as any).source);

    const filePath = await AssetUtil.downloadUrl('https://www.google.com/images/branding/googlelogo/2x/googlelogo_color_272x92dp.png');
    assert(filePath !== undefined);
    assert(filePath.split('.').pop() === 'png');

    let file = await AssetUtil.localFileToAsset(filePath);
    file = await service.save(file);

    assert(file.contentType === 'image/png');
    assert(file.length > 0);

    try {
      await fsStat(filePath);
      assert(false);
    } catch {
      assert(true);
    }
  }
}