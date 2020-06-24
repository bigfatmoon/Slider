import Model from 'model/Model';
import Observer from 'observer/Observer';
import SliderEvent from 'observer/SliderEvent';
import SliderError from 'SliderError';
import MinMaxPosition from 'types/MinMaxPosition';
import { CalcPoint, CalcPositionWithDiff, CalcRatio } from 'types/NotifyData';
import View from 'view/View';

class Presenter extends Observer {
  constructor(protected model: Model, protected view: View) {
    super();
  }

  init(parent: HTMLElement) {
    if (parent === undefined) throw new SliderError('Parent element undefined');
    this.view.render({
      element: parent,
      points: this.model.getPoints(),
      size: this.model.getSize(),
      step: this.model.getStep(),
      isRange: this.model.isRange(),
      isVertical: this.model.isVertical(),
      withScale: this.model.withScale(),
      withTooltip: this.model.withTooltip(),
    });
    this.view
      .subscribe(SliderEvent.SliderClick, this.handleSliderClick)
      .subscribe(SliderEvent.PointMove, this.handlePointMove)
      .subscribe(SliderEvent.PointMoveByScale, this.handlePointMoveByScale);
  }

  protected notifyValueChanged() {
    this.notify(SliderEvent.ValueChanged, this.model.getCurrents());
  }

  private updateCurrentIfRequired(modelValue: number, position: MinMaxPosition) {
    if (!this.model.willCurrentCollapse(position, modelValue)) {
      this.updateCurrent(modelValue, position);
    } else if (!this.model.areCurrentEqual()) {
      const current = this.model.getCurrent(
        position === MinMaxPosition.Max
          ? MinMaxPosition.Min
          : MinMaxPosition.Max,
      );
      this.updateCurrent(current, position);
    }
  }

  private updateCurrent(modelValue: number, position: MinMaxPosition) {
    this.model.setCurrent(position, modelValue);
    this.view.updatePosition(this.model.isVertical(), {
      [position]: this.model.getPoint(position),
    });
    this.notifyValueChanged();
  }

  private handleSliderClick = (calcRatio: CalcRatio) => {
    const modelValue = this.model.calcValue(calcRatio(this.model.isVertical()));
    if (this.model.isSameCurrent(modelValue)) return;
    this.updateCurrentIfRequired(modelValue, this.model.selectPosition(modelValue));
  };

  private handlePointMove = (calcPoint: CalcPoint) => {
    const { ratio, position } = calcPoint(this.model.isVertical());
    this.updateCurrentIfRequired(this.model.calcValue(ratio), position);
  };

  private handlePointMoveByScale = (calcPositionWithDiff: CalcPositionWithDiff) => {
    const { diff, position } = calcPositionWithDiff(this.model.isVertical(), this.model.isRange());
    const modelValue = this.model.calcValue(
      this.model.getCurrent(position) / this.model.getSize() + diff,
    );
    if (this.model.isSameCurrent(modelValue)) return;
    this.updateCurrentIfRequired(modelValue, position);
  };
}

export default Presenter;
