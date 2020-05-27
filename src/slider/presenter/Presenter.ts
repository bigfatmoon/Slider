import Model from '../model/Model';
import View from '../view/View';
import SliderEvent from '../observer/SliderEvent';
import MinMaxPosition from '../model/MinMaxPosition';
import {IPointMoveData, IRelativePointPercents} from '../common-interfaces/NotifyInterfaces';
import Observer from '../observer/Observer';
import SliderError from '../model/SliderError';

class Presenter extends Observer {
  protected model: Model;

  protected view: View;

  constructor(model: Model, view: View) {
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
      .subscribe(SliderEvent.sliderClick, this.handleSliderClick)
      .subscribe(SliderEvent.pointMove, this.handlePointMove);
  }

  protected updateScaleLines() {
    this.view.updateScaleLines(this.model.step, this.model.getRangeSize(), this.model.isVertical);
  }

  private handleSliderClick = ({x, y}: IRelativePointPercents) => {
    const modelValue = this.model.calcModelValue(this.model.isVertical ? 100 - y : x);
    if (this.model.isSameCurrent(modelValue)) return;
    this.updatePosition(modelValue, this.model.selectPosition(modelValue));
  }

  protected updatePosition(modelValue: number, position: MinMaxPosition) {
    if (!this.model.willCurrentCollapse(position, modelValue)) {
      this.model.setCurrent({[position]: modelValue});
      this.view.updatePosition(
        this.model.isVertical,
        {[position]: this.model.getPoint(position)},
      );
      this.notify(SliderEvent.valueChanged, {value: modelValue, position});
    }
  }

  private handlePointMove = ({x, y, position}: IPointMoveData) => {
    this.updatePosition(
      this.model.calcModelValue(this.model.isVertical ? 100 - y : x),
      position,
    );
  }
}

export default Presenter;
