import Uploader from '../../../modules/uploader';
import { Range } from '../../../core/selection';

describe('Uploader', function() {
  describe('image uploading', function() {
    it('Check default mimetypes', function() {
      expect(Uploader.DEFAULTS.mimetypes).toEqual([
        /^image\/(a?png|bmp|gif|p?jpe?g|svg|vnd\.microsoft\.icon|webp)/i,
      ]);
    });
    it('Check file types upload filtration', function() {
      const testRange = new Range(0);
      let uploads;

      const quillMock = {
        root: {
          addEventListener: () => {},
        },
      };

      const gifFile = {
        name: 'test.gif',
        type: 'image/gif',
      };

      const pngFile = {
        name: 'test.png',
        type: 'image/png',
      };

      const htmlFile = {
        name: 'test.html',
        type: 'text/html',
      };

      const uploaderInstance = new Uploader(quillMock, {
        mimetypes: Uploader.DEFAULTS.mimetypes,
        handler: (range, files) => {
          uploads = files;
        },
      });

      uploaderInstance.upload(testRange, [gifFile, pngFile, htmlFile]);

      expect(uploads).toEqual([gifFile, pngFile]);
    });
  });
});
