/* eslint-disable class-methods-use-this */

import { MinMax, PointData, ViewOptions } from 'support/types';

import View from '../view';

class MockView extends View {
  render(options:ViewOptions) {}

  toggleOrientation(): void {}

  toggleRange() {}

  toggleScale() {}

  toggleTooltip() {}

  updateCurrent(isVertical: boolean, points: MinMax<PointData>) {}

  updateScaleLines(step: number, size: number, isVertical: boolean) {}
}

export default MockView;
