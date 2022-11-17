import Delta from 'quill-delta';
import Emitter from '../core/emitter';
import Module from '../core/module';
import hasWindow from '../utils/has_window';

class Uploader extends Module {
  constructor(quill, options) {
    super(quill, options);

    this.preventImageUploading(false);
    this.addDragOverHandler();
    this.addDropHandler();
  }

  addDragOverHandler() {
    if (hasWindow()) {
      const ua = window.navigator.userAgent.toLowerCase();
      const isMsIe = ua.indexOf('msie ') !== -1
        || ua.indexOf('trident/') !== -1
        || ua.indexOf('edge/') !== -1;

      if (isMsIe) {
        this.quill.root.addEventListener('dragover', (e) => {
          e.preventDefault();
        });
      }
    }
  }

  addDropHandler() {
    this.quill.root.addEventListener('drop', (e) => {
      const noFiles = e.dataTransfer.files.length === 0;
      const { onDrop } = this.options;

      if (onDrop && typeof onDrop === 'function') {
        onDrop(e);
      }

      if (noFiles || this.preventImageUpload) {
        return;
      }

      e.preventDefault();
      let native;

      if (document.caretRangeFromPoint) {
        native = document.caretRangeFromPoint(e.clientX, e.clientY);
      } else if (document.caretPositionFromPoint) {
        const position = document.caretPositionFromPoint(e.clientX, e.clientY);
        native = document.createRange();
        native.setStart(position.offsetNode, position.offset);
        native.setEnd(position.offsetNode, position.offset);
      } else {
        return;
      }
      const normalized = this.quill.selection.normalizeNative(native);
      const range = this.quill.selection.normalizedToRange(normalized);
      this.upload(range, e.dataTransfer.files);
    });
  }

  preventImageUploading(value) {
    if (typeof value !== 'undefined') {
      this.preventImageUpload = value;
    }
    return this.preventImageUpload;
  }

  upload(range, files, force) {
    if (this.preventImageUpload && !force) {
      return;
    }

    const uploads = [];
    Array.from(files).forEach((file) => {
      if (file && this.options.mimetypes.indexOf(file.type) !== -1) {
        uploads.push(file);
      }
    });
    if (uploads.length > 0) {
      this.options.handler.call(this, range, uploads, this.options.imageBlot);
    }
  }
}

Uploader.DEFAULTS = {
  mimetypes: [
    'image/png',
    'image/jpeg',
    'image/pjpeg',
    'image/gif',
    'image/webp',
    'image/bmp',
    'image/svg+xml',
    'image/vnd.microsoft.icon',
  ],
  imageBlot: 'image',
  handler(range, files, blotName) {
    const promises = files.map((file) => {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          resolve(e.target.result);
        };
        reader.readAsDataURL(file);
      });
    });
    Promise.all(promises).then((images) => {
      const update = images.reduce((delta, image) => {
        return delta.insert({ [blotName]: image });
      }, new Delta().retain(range.index).delete(range.length));
      this.quill.updateContents(update, Emitter.sources.USER);
      this.quill.setSelection(
        range.index + images.length,
        Emitter.sources.SILENT,
      );
    });
  },
};

export default Uploader;
