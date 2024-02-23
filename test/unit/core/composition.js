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

describe('composition events', function () {
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
      const target = document.createElement('p');
      this.emitMock = getEmitterMock();

      this.scrollMock = getScrollMock(target);

      this.eventArg = {
        target,
      };

      this.composition = new Composition(
        this.scrollMock.scroll,
        this.emitMock.emitter,
      );
    });

    it('batchStart should be called when compositionstart event triggered', function () {
      const { addEventListenerCallsArgs } = this.scrollMock.getAddEventListenerArgs();

      addEventListenerCallsArgs[0].callback(this.eventArg);

      const { emitCallCount, emitArgs } = this.emitMock.getMockInfo();
      const { batchStartCallCount } = this.scrollMock.getMockInfo();

      expect(batchStartCallCount).toEqual(1);
      expect(emitCallCount).toEqual(2);
      expect(emitArgs[0].eventName).toEqual(Emitter.events.COMPOSITION_BEFORE_START);
      expect(emitArgs[1].eventName).toEqual(Emitter.events.COMPOSITION_START);
    });

    it('batchEnd should be called when compositionend event triggered', function () {
      const { addEventListenerCallsArgs } = this.scrollMock.getAddEventListenerArgs();

      addEventListenerCallsArgs[0].callback(this.eventArg);
      addEventListenerCallsArgs[1].callback(this.eventArg);

      const { emitCallCount, emitArgs } = this.emitMock.getMockInfo();
      const { batchEndCallCount } = this.scrollMock.getMockInfo();

      expect(batchEndCallCount).toEqual(1);
      expect(emitCallCount).toEqual(4);
      expect(emitArgs[2].eventName).toEqual(Emitter.events.COMPOSITION_BEFORE_END);
      expect(emitArgs[3].eventName).toEqual(Emitter.events.COMPOSITION_END);
    });

    it('isCompositionInProgress should return false when composition is not started', function () {
      const isCompositionStarted = this.composition.isCompositionInProgress();

      expect(isCompositionStarted).toEqual(false);
    });

    it('isCompositionInProgress should return true when composition is started', function () {
      const { addEventListenerCallsArgs } = this.scrollMock.getAddEventListenerArgs();

      addEventListenerCallsArgs[0].callback(this.eventArg);

      const isCompositionStarted = this.composition.isCompositionInProgress();

      expect(isCompositionStarted).toEqual(true);
    });

    it('isCompositionInProgress should return false when composition is ended', function () {
      const { addEventListenerCallsArgs } = this.scrollMock.getAddEventListenerArgs();

      addEventListenerCallsArgs[0].callback(this.eventArg);
      addEventListenerCallsArgs[1].callback(this.eventArg);

      const isCompositionStarted = this.composition.isCompositionInProgress();

      expect(isCompositionStarted).toEqual(false);
    });
  });
});
