import { SliderEvent } from 'support/enums';
import { CalcAbsolute } from 'support/types';
import CssClassUtil from 'utils/CssClassUtil';

import Point from '../point';
import Tooltip from '../tooltip';


describe('Point class', () => {
  let point: Point;

  beforeEach(() => {
    point = new Point();
  });

  describe('buildHtml', () => {
    test('return prepared element', () => {
      const mockTooltip = jest.spyOn(Tooltip.prototype, 'buildHtml');
      const mockUtil = jest.spyOn(CssClassUtil, 'initClass');
      point.buildHtml(true);
      expect(point.getElement()).toBeDefined();
      expect(mockTooltip).toBeCalled();
      expect(mockUtil).toBeCalled();
    });
  });

  describe('functions for built html', () => {
    beforeEach(() => {
      point.buildHtml(false);
    });

    test('getElement', () => {
      expect(point.getElement()).toBeDefined();
    });

    describe('toggleHidden', () => {
      test('toggleHidden call hidden changes', () => {
        const spy = jest.spyOn(CssClassUtil, 'toggleHidden');
        point.toggleHidden();
        expect(spy).toBeCalledTimes(1);
      });
    });

    describe('toggleOrientation', () => {
      test('call orientation changes and clean styles', () => {
        const spy = jest.spyOn(CssClassUtil, 'toggleOrientation');
        const spyTooltip = jest.spyOn(Tooltip.prototype, 'toggleOrientation');
        point.toggleOrientation();
        expect(spy).toBeCalled();
        expect(spyTooltip).toBeCalledTimes(1);
        expect(point.getElement().style.length).toBe(0);
      });
    });

    test('toggleTooltip', () => {
      const spy = jest.spyOn(Tooltip.prototype, 'toggleHidden');
      point.toggleTooltip();
      expect(spy).toBeCalled();
    });

    describe('subscribe', () => {
      test('handleMouseMove notify about changes', () => new Promise((done) => {
        // @ts-ignore
        point.getElement().getBoundingClientRect = () => ({
          x: 3, y: 4, width: 8, height: 10,
        });
        point.subscribe(SliderEvent.PointMove, (calcAbsolute: CalcAbsolute) => {
          try {
            expect(calcAbsolute(true)).toEqual(6);
            expect(calcAbsolute(false)).toEqual(5);
            done();
          } catch (error) {
            done(error);
          }
        });
        point.getElement().dispatchEvent(new MouseEvent('mousedown', { clientX: 3, clientY: 5 }));
        const event = new MouseEvent('mousemove', { clientX: 1, clientY: 2 });
        document.dispatchEvent(event);
      }));
    });

    describe('updatePosition', () => {
      beforeEach(() => {
        Object.defineProperty(point.getElement(), 'offsetWidth', { value: 10 });
      });

      test('update vertical without tooltip', () => {
        const spy = jest.spyOn(Tooltip.prototype, 'update');
        point.updatePosition(true, { percent: 10 });
        expect(spy).not.toBeCalled();
        expect(point.getElement().style.bottom).toBe('calc(10% - 5px)');
        spy.mockReset();
      });

      test('update horizontal and tooltip', () => {
        const spy = jest.spyOn(Tooltip.prototype, 'update');
        point.updatePosition(false, { percent: 10, tooltip: 10 });
        expect(spy).toBeCalledTimes(1);
        expect(point.getElement().style.left).toBe('calc(10% - 5px)');
        spy.mockReset();
      });
    });

    describe('handlers', () => {
      describe('handleMouseDown', () => {
        test('add point and body class and notify', () => {
          const spyClass = jest.spyOn(CssClassUtil, 'addGrabbing');
          point.getElement().dispatchEvent(new MouseEvent('mousedown'));
          expect(spyClass).toBeCalled();
          expect(document.documentElement.classList).toContain('slider-plugin');
        });
      });

      describe('handleMouseUp', () => {
        test('remove point and body class', () => {
          jest.resetAllMocks();
          const spyClass = jest.spyOn(CssClassUtil, 'removeGrabbing');
          point.getElement().dispatchEvent(new MouseEvent('mousedown'));
          document.dispatchEvent(new MouseEvent('mouseup'));
          expect(spyClass).toBeCalled();
          expect(document.documentElement.classList).not.toContain(
            'slider-plugin',
          );
        });
      });

      describe('handleMouseMove', () => {
        test('will notify', () => {
          const spy = jest.spyOn(Point.prototype, 'notify');
          point.getElement().dispatchEvent(new MouseEvent('mousedown'));
          document.dispatchEvent(new MouseEvent('mousemove'));
          expect(spy).toBeCalled();
        });

        test('calcAbsolute', () => new Promise((done) => {
          // @ts-ignore
          point.getElement().getBoundingClientRect = () => ({
            x: 5, y: 10, width: 10, height: 14,
          });
          point.subscribe(SliderEvent.PointMove, (calcAbsolute: CalcAbsolute) => {
            try {
              expect(calcAbsolute(false)).toBe(44);
              expect(calcAbsolute(true)).toBe(56);
              done();
            } catch (error) {
              done(error);
            }
          });
          point.getElement().dispatchEvent(new MouseEvent('mousedown', { clientX: 6, clientY: 11 }));
          document.dispatchEvent(new MouseEvent('mousemove', { clientX: 40, clientY: 50 }));
        }));
      });
    });
  });
});
