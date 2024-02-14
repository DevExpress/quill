import Input from '../../../modules/input';

describe('subscriptions', function () {
  it('subscription on beforeinput event should be', function () {
    let addEventListenerCallCount = 0;
    let eventName = '';
    let handler;
    const quill = {
      on() {},
      root: {
        addEventListener(name, callback) {
          eventName = name;
          handler = callback;
          addEventListenerCallCount += 1;
        },
      },
    };

    // eslint-disable-next-line no-new
    new Input(quill, {});

    expect(addEventListenerCallCount).toEqual(1);
    expect(eventName).toEqual('beforeinput');
    expect(typeof handler).toEqual('function');
  });
});
