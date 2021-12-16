import Uploader from '../../../modules/uploader';
import { Range } from '../../../core/selection';

describe('Uploader', function() {
  describe('image uploading', function() {
    [
      {
        name: 'test.png',
        type: 'image/png',
      },
      {
        name: 'test.jpeg',
        type: 'image/jpeg',
      },
      {
        name: 'test.pjpeg',
        type: 'image/pjpeg',
      },
      {
        name: 'test.gif',
        type: 'image/gif',
      },
      {
        name: 'test.webp',
        type: 'image/webp',
      },
      {
        name: 'test.bmp',
        type: 'image/bmp',
      },
      {
        name: 'test.svg',
        type: 'image/svg+xml',
      },
      {
        name: 'test.icon',
        type: 'image/vnd.microsoft.icon',
      },
      {
        name: 'test.html',
        type: 'text/html',
        isNotImage: true,
      },
    ].forEach(file => {
      it(`upload ${file.name}`, function() {
        const testRange = new Range(0);
        let uploads = [];

        const quillMock = {
          root: {
            addEventListener: () => {},
          },
        };

        const uploaderInstance = new Uploader(quillMock, {
          mimetypes: Uploader.DEFAULTS.mimetypes,
          handler: (range, files) => {
            uploads = files;
          },
        });

        uploaderInstance.upload(testRange, [file]);

        expect(uploads.length).toEqual(file.isNotImage ? 0 : 1);
      });
    });
  });
});
