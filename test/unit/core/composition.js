import Block from '../../../blots/block';
import Composition from '../../../core/composition';
import Emitter from '../../../core/emitter';

function getEmitterMock() {
  let emitCallCount = 0;
  const emitArgs = [];

  return {
    getMockInfo: () => ({
      emitCallCount,
      emitArgs,
    }),
    emitter: {
      emit: (eventName, event) => {
        emitCallCount += 1;
        emitArgs.push({
          eventName,
          event,
        });
      },
    },
  };
}

function getScrollMock(target) {
  const addEventListenerCallsArgs = [];
  let batchStartCallCount = 0;
  let batchEndCallCount = 0;

  return {
    getAddEventListenerArgs: () => ({
      addEventListenerCallsArgs,
    }),
    getMockInfo: () => ({
      batchEndCallCount,
      batchStartCallCount,
      addEventListenerCallsArgs,
    }),
    scroll: {
      domNode: {
        addEventListener: (name, callback) => {
          addEventListenerCallsArgs.push({
            name,
            callback,
          });
        },
      },
      find: () => {
        return new Block({ query() {} }, target);
      },
      batchStart: () => {
        batchStartCallCount += 1;
      },
      batchEnd: () => {
        batchEndCallCount += 1;
      },
    },
  };
}

describe('subscriptions', function () {
  it('subscription on compositionstart and compositionend events should be', function () {
    const scrollMock = getScrollMock({});
    // eslint-disable-next-line no-new
    new Composition(scrollMock.scroll, {});

    const { addEventListenerCallsArgs } = scrollMock.getAddEventListenerArgs();

    expect(addEventListenerCallsArgs.length).toEqual(2);

    expect(addEventListenerCallsArgs[0].name).toEqual('compositionstart');
    expect(typeof addEventListenerCallsArgs[0].callback).toEqual('function');

    expect(addEventListenerCallsArgs[1].name).toEqual('compositionend');
    expect(typeof addEventListenerCallsArgs[1].callback).toEqual('function');
  });

  describe('events triggering', function () {
    beforeEach(function () {
      this.target = document.createElement('p');
      this.emitMock = getEmitterMock();

      this.scrollMock = getScrollMock(this.target);

      this.composition = new Composition(this.scrollMock.scroll, this.emitMock.emitter);
    });

    it('trigger compositionstart event', function () {
      const eventArg = {
        target: this.target,
      };

      const { addEventListenerCallsArgs } = this.scrollMock.getAddEventListenerArgs();

      addEventListenerCallsArgs[0].callback(eventArg);

      const { emitCallCount, emitArgs } = this.emitMock.getMockInfo();

      const { batchStartCallCount } = this.scrollMock.getMockInfo();

      expect(batchStartCallCount).toEqual(1);
      expect(emitCallCount).toEqual(2);
      expect(emitArgs[0].eventName).toEqual(Emitter.events.COMPOSITION_BEFORE_START);
      expect(emitArgs[1].eventName).toEqual(Emitter.events.COMPOSITION_START);
    });

    it('trigger compositionend event', function () {
      const eventArg = {
        target: this.target,
      };

      const { addEventListenerCallsArgs } = this.scrollMock.getAddEventListenerArgs();

      addEventListenerCallsArgs[0].callback(eventArg);
      addEventListenerCallsArgs[1].callback(eventArg);

      const { emitCallCount, emitArgs } = this.emitMock.getMockInfo();
      const { batchEndCallCount } = this.scrollMock.getMockInfo();

      expect(batchEndCallCount).toEqual(1);
      expect(emitCallCount).toEqual(4);
      expect(emitArgs[2].eventName).toEqual(Emitter.events.COMPOSITION_BEFORE_END);
      expect(emitArgs[3].eventName).toEqual(Emitter.events.COMPOSITION_END);
    });
  });
});
