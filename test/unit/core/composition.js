import Composition from '../../../core/composition';

describe('subscriptions', function () {
  it('subscription on compositionstart and compositionend events should be', function () {
    const callsArgs = [];
    let addEventListenerCallCount = 0;
    const scroll = {
      domNode: {
        addEventListener(name, callback) {
          callsArgs.push({
            name,
            callback,
          });
          addEventListenerCallCount += 1;
        },
      },
    };
    const composition = new Composition(scroll, {});

    expect(addEventListenerCallCount).toEqual(2);

    expect(callsArgs[0].name).toEqual('compositionstart');
    expect(typeof callsArgs[0].callback).toEqual('function');

    expect(callsArgs[1].name).toEqual('compositionend');
    expect(typeof callsArgs[1].callback).toEqual('function');
  });
});
