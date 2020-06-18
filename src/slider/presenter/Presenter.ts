import DefaultModel from '../model/DefaultModel';
import SliderEvent from '../observer/SliderEvent';
import { PointMoveData, RelativePointPercents } from '../types/PointPosition';
import Observer from '../observer/Observer';
import MinMaxPosition from '../types/MinMaxPosition';
import SliderError from '../SliderError';
import View from '../view/View';

class Presenter extends Observer {
  protected model: DefaultModel;

  protected view: View;

  constructor(model: DefaultModel, view: View) {
    super();
    this.model = model;
    this.view = view;
  }

  init(parent: HTMLElement) {
    if (parent === undefined) throw new SliderError('Parent element undefined');
    this.view.render(
      parent,
      this.model.getBoolOptions(),
      this.model.getCurrentPoints(),
      this.model.step,
      this.model.getRangeSize(),
    );
    this.view
      .subscribe(SliderEvent.SliderClick, this.handleSliderClick)
      .subscribe(SliderEvent.PointMove, this.handlePointMove);
  }

  protected updatePosition(modelValue: number, position: MinMaxPosition) {
    if (!this.model.willCurrentCollapse(position, modelValue)) {
      this.model.setCurrent({ [position]: modelValue });
      this.view.updatePosition(
        this.model.isVertical,
        { [position]: this.model.getPoint(position) },
      );
      this.notify(SliderEvent.ValueChanged, { value: modelValue, position });
    }
  }

  private handleSliderClick = ({ x, y }: RelativePointPercents) => {
    const modelValue = this.model.calcModelValue(this.model.isVertical ? 100 - y : x);
    if (this.model.isSameCurrent(modelValue)) return;
    this.updatePosition(modelValue, this.model.selectPosition(modelValue));
  }

  private handlePointMove = ({ x, y, position }: PointMoveData) => {
    this.updatePosition(
      this.model.calcModelValue(this.model.isVertical ? 100 - y : x),
      position,
    );
  }
}

export default Presenter;
