import { Position, SliderEvent } from 'support/enums';

import Observer from '../../observer/index';
import CssClassUtil from '../../utils/CssClassUtil';
import PositionUtil from '../../utils/PositionUtil';
import Point from '../point/index';
import Range from '../range/index';

import Body from './index';

describe('Body class', () => {
  let body: Body;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('buildHtml', () => {
    body = new Body();
    const spyClass = jest.spyOn(CssClassUtil, 'initClass');
    const spyPoint = jest.spyOn(Point.prototype, 'buildHtml');
    const spyPointObserver = jest.spyOn(Point.prototype, 'subscribe');
    const spyRange = jest.spyOn(Range.prototype, 'buildHtml');
    const html = body.buildHtml(true);
    expect(spyClass).toBeCalled();
    expect(spyPoint).toBeCalledTimes(2);
    expect(spyPointObserver).toBeCalled();
    expect(spyRange).toBeCalledTimes(1);
    expect(html).toBeDefined();
  });

  describe('toggles', () => {
    beforeEach(() => {
      body = new Body();
      body.buildHtml(true);
    });

    test('toggleOrientation', () => {
      const spyClass = jest.spyOn(CssClassUtil, 'toggleOrientation');
      const spyPoint = jest.spyOn(Point.prototype, 'toggleOrientation');
      const spyRange = jest.spyOn(Range.prototype, 'toggleOrientation');
      body.toggleOrientation();
      expect(spyRange).toBeCalled();
      expect(spyPoint).toBeCalled();
      expect(spyClass).toBeCalled();
    });

    test('toggleTooltip', () => {
      const spyPoint = jest.spyOn(Point.prototype, 'toggleTooltip');
      body.toggleTooltip();
      expect(spyPoint).toBeCalledTimes(2);
    });

    test('toggleRange', () => {
      const spyPoint = jest.spyOn(Point.prototype, 'toggleHidden');
      body.toggleRange();
      expect(spyPoint).toBeCalledTimes(1);
    });

    test('updatePosition', () => {
      const spyPoint = jest.spyOn(Point.prototype, 'updatePosition');
      const spyRange = jest.spyOn(Range.prototype, 'updatePosition');
      body.updatePosition(true, { min: { percent: 10 } });
      expect(spyPoint).toBeCalledTimes(1);
      expect(spyRange).toBeCalledTimes(1);
      const spyMove = jest.spyOn(Point.prototype, 'startGrabbing');
      body.startPointMove();
      body.updatePosition(true, { min: { percent: 2 }, max: { percent: 20 } });
      expect(spyRange).toBeCalledTimes(2);
      expect(spyPoint).toBeCalledTimes(3);
      expect(spyMove).toBeCalledTimes(2);
    });
  });

  describe('handlers', () => {
    describe('handleSliderBodyMouseDown', () => {
      const spyNotify = jest.spyOn(Observer.prototype, 'notify');
      const spyMoveStart = jest.spyOn(Body.prototype, 'startPointMove');
      body = new Body();
      body.buildHtml(true);

      test('not work on other children', () => {
        const child = document.createElement('div');
        body.getElement().append(child);
        child.dispatchEvent(new MouseEvent('mousedown'));
        expect(spyNotify).not.toBeCalled();
        expect(spyMoveStart).not.toBeCalled();
      });

      test('work on body', () => {
        body.getElement().dispatchEvent(new MouseEvent('mousedown'));
        expect(spyNotify).toBeCalled();
        expect(spyMoveStart).toBeCalled();
      });

      test('notify with position func', () => new Promise((done) => {
        const spyUtil = jest.spyOn(PositionUtil, 'calc');
        const event = new MouseEvent('mousedown');
        body.subscribe(SliderEvent.SliderClick, (func) => {
          try {
            func(true);
            expect(spyUtil).toBeCalledWith(true, body.getElement(), event);
            func(false);
            expect(spyUtil).toBeCalledWith(false, body.getElement(), event);
            done();
          } catch (error) {
            done(error);
          }
        });
        body.getElement().dispatchEvent(event);
      }));
    });

    describe('handlePointMove', () => {
      test('for max', () => new Promise((doneMax) => {
        const points = { min: new Point(), max: new Point() };
        const moveBody = new Body({ points }); // should be unique
        moveBody.buildHtml(true);
        // @ts-ignore
        moveBody.getElement().getBoundingClientRect = () => ({
          top: 1, height: 2, left: 2, width: 4,
        });
        moveBody.subscribe(SliderEvent.PointMove, (func) => {
          try {
            let res = func(true);
            expect(res).toEqual({ position: Position.Max, ratio: -3 });
            res = func(false);
            expect(res).toEqual({ position: Position.Max, ratio: 1.75 });
            doneMax();
          } catch (error) {
            doneMax(error);
          }
        });
        points.max.notify(SliderEvent.PointMove, () => 9);
      }));

      test('for min', () => new Promise((doneMin) => {
        const points = { min: new Point(), max: new Point() };
        const moveBody = new Body({ points });
        moveBody.buildHtml(true);
        // @ts-ignore
        moveBody.getElement().getBoundingClientRect = () => ({
          top: 1, height: 2, left: 2, width: 4,
        });
        moveBody.subscribe(SliderEvent.PointMove, (func) => {
          try {
            let res = func(true);
            expect(res).toEqual({ position: Position.Min, ratio: 1.5 });
            res = func(false);
            expect(res).toEqual({ position: Position.Min, ratio: -0.5 });
            doneMin();
          } catch (error) {
            doneMin(error);
          }
        });
        points.min.notify(SliderEvent.PointMove, () => 0);
      }));
    });
  });
});
