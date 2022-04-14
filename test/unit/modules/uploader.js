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

    it('should not prevent default when no files to drop', function() {
      const quillMock = {
        root: document.createElement('input'),
      };

      // eslint-disable-next-line no-new
      new Uploader(quillMock);
      const dataTransferInstance = new DataTransfer();
      dataTransferInstance.setData('text/plain', 'just text');
      const dropEvent = new DragEvent('drop', {
        dataTransfer: dataTransferInstance,
        cancelable: true,
      });

      quillMock.root.dispatchEvent(dropEvent);

      expect(dropEvent.defaultPrevented).toBeFalse();
    });

    it('should prevent default on drop files', function() {
      const quillMock = {
        root: document.createElement('input'),
      };

      // eslint-disable-next-line no-new
      new Uploader(quillMock);
      const dataTransferInstance = new DataTransfer();
      const fileContent = ['<u>test</u>'];

      dataTransferInstance.setData('text/plain', 'just text');
      dataTransferInstance.items.add(
        new File([new Blob(fileContent, { type: 'text/html' })], 'test.html'),
      );

      const dropEvent = new DragEvent('drop', {
        dataTransfer: dataTransferInstance,
        cancelable: true,
      });

      quillMock.root.dispatchEvent(dropEvent);

      expect(dropEvent.defaultPrevented).toBeTrue();
    });

    [
      {
        preventValue: true,
      },
      {
        preventValue: false,
      },
      {
        preventValue: false,
        forceUpload: true,
      },
    ].forEach(data => {
      it(`check preventImageUploading ${data.preventValue}`, function() {
        const testRange = new Range(0);
        const file = {
          name: 'test.png',
          type: 'image/png',
        };
        const expectedUploadsCount =
          data.preventValue && !data.forceUpload ? 0 : 1;
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

        uploaderInstance.preventImageUploading(!data.preventValue);
        uploaderInstance.preventImageUploading(data.preventValue);

        uploaderInstance.upload(testRange, [file], data.forceUpload);

        expect(uploaderInstance.preventImageUploading()).toEqual(
          data.preventValue,
        );
        expect(uploads.length).toEqual(expectedUploadsCount);
      });
    });
  });
});
