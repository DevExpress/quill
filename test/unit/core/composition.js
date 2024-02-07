import Block from '../../../blots/block';
import Composition from '../../../core/composition';
import Emitter from '../../../core/emitter';

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
    // eslint-disable-next-line no-new
    new Composition(scroll, {});

    expect(addEventListenerCallCount).toEqual(2);

    expect(callsArgs[0].name).toEqual('compositionstart');
    expect(typeof callsArgs[0].callback).toEqual('function');

    expect(callsArgs[1].name).toEqual('compositionend');
    expect(typeof callsArgs[1].callback).toEqual('function');
  });

  describe('events triggering', function () {
    beforeEach(function () {
      this.addEventListenerCallsArgs = [];
      this.target = document.createElement('p');
      this.batchStartCallCount = 0;
      this.batchEndCallCount = 0;
      this.emitCallCount = 0;
      this.emitArgs = [];
      const emitterMock = {
        emit: (eventName, event) => {
          this.emitCallCount += 1;
          this.emitArgs.push({
            eventName,
            event,
          });
        },
      };
      const scrollMock = {
        domNode: {
          addEventListener: (name, callback) => {
            this.addEventListenerCallsArgs.push({
              name,
              callback,
            });
          },
        },
        find: () => {
          return new Block({ query() {} }, this.target);
        },
        batchStart: () => {
          this.batchStartCallCount += 1;
        },
        batchEnd: () => {
          this.batchEndCallCount += 1;
        },
      };

      this.composition = new Composition(scrollMock, emitterMock);
    });

    it('trigger compositionstart event', function () {
      const eventArg = {
        target: this.target,
      };
      this.addEventListenerCallsArgs[0].callback(eventArg);

      expect(this.batchStartCallCount).toEqual(1);
      expect(this.emitCallCount).toEqual(2);
      expect(this.emitArgs[0].eventName).toEqual(Emitter.events.COMPOSITION_BEFORE_START);
      expect(this.emitArgs[1].eventName).toEqual(Emitter.events.COMPOSITION_START);
    });

    it('trigger compositionend event', function () {
      const eventArg = {
        target: this.target,
      };

      this.addEventListenerCallsArgs[0].callback(eventArg);

      this.addEventListenerCallsArgs[1].callback(eventArg);

      expect(this.batchEndCallCount).toEqual(1);
      expect(this.emitCallCount).toEqual(4);
      expect(this.emitArgs[2].eventName).toEqual(Emitter.events.COMPOSITION_BEFORE_END);
      expect(this.emitArgs[3].eventName).toEqual(Emitter.events.COMPOSITION_END);
    });
  });
});
