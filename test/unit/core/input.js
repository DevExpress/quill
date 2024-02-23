import Quill from '../../../core/quill';
import Input from '../../../modules/input';

function getQuillMock() {
  const callbackInfo = {};

  const prepareHandler = (key) => {
    callbackInfo[key] = {
      callCount: 0,
      args: [],
    };

    return (name, handler) => {
      callbackInfo[key].args.push({
        name,
        handler,
      });
      callbackInfo[key].callCount += 1;
    };
  };

  return {
    getCallbackInfo(key) {
      return callbackInfo[key];
    },
    quill: {
      on: prepareHandler('on'),
      root: {
        addEventListener: prepareHandler('addEventListener'),
      },
    },
  };
}

describe('subscriptions', function () {
  it('subscription on beforeinput event should be', function () {
    const quillMock = getQuillMock();

    const { quill } = quillMock;

    // eslint-disable-next-line no-new
    new Input(quill, {});

    const addEventListenerInfo = quillMock.getCallbackInfo('addEventListener');
    const { args } = addEventListenerInfo;

    expect(addEventListenerInfo.callCount).toEqual(1);
    expect(args[0].name).toEqual('beforeinput');
    expect(typeof args[0].handler).toEqual('function');
  });

  it('subscription on COMPOSITION_BEFORE_START event should be', function () {
    const quillMock = getQuillMock();

    const { quill } = quillMock;

    // eslint-disable-next-line no-new
    new Input(quill, {});

    const quillOnInfo = quillMock.getCallbackInfo('on');
    const { args } = quillOnInfo;

    expect(quillOnInfo.callCount).toEqual(1);
    expect(args[0].name).toEqual(Quill.events.COMPOSITION_BEFORE_START);
    expect(typeof args[0].handler).toEqual('function');
  });
});
