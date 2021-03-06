import PositionUtil from './PositionUtil';

describe('PositionUtil class', () => {
  const sliderBody = document.createElement('div');
  Object.defineProperty(sliderBody, 'offsetWidth', { value: 100 });
  Object.defineProperty(sliderBody, 'offsetHeight', { value: 200 });

  describe('calc', () => {
    test('horizontal', () => {
      const bodyClick = { offsetX: 10, offsetY: 20, target: sliderBody };
      // @ts-ignore
      expect(PositionUtil.calc(false, sliderBody, bodyClick)).toEqual(0.1);
    });

    test('vertical', () => {
      const bodyClick = { offsetX: 10, offsetY: 20, target: sliderBody };
      // @ts-ignore
      expect(PositionUtil.calc(true, sliderBody, bodyClick)).toEqual(0.9);
    });

    describe('calcForOwner', () => {
      // @ts-ignore
      sliderBody.getBoundingClientRect = () => ({
        left: 20,
        top: 30,
        height: 100,
        width: 200,
      });
      const sliderRangeOrScale = document.createElement('div');
      const rangeClick = {
        clientX: 100,
        clientY: 50,
        target: sliderRangeOrScale,
      };
      test('horizontal', () => {
        // @ts-ignore
        expect(PositionUtil.calc(false, sliderBody, rangeClick)).toEqual(0.4);
      });
      test('vertical', () => {
        // @ts-ignore
        expect(PositionUtil.calc(true, sliderBody, rangeClick)).toEqual(0.8);
      });
    });
  });
});
