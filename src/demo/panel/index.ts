import { SliderGroup } from 'Slider';
import SliderOptions, { MinMax } from 'support/types';
import '../checkbox/checkbox.scss'
import '../field/field.scss'

class Index {
  private changeableInputs: MinMax<HTMLInputElement> = {};

  // eslint-disable-next-line no-useless-constructor, no-empty-function
  constructor(private sliderGroup: SliderGroup) { }

  init(panelElement: HTMLElement) {
    const data = this.sliderGroup.getOptions()[0];
    panelElement.querySelectorAll('input').forEach((element) => {
      this.prepareElement(data, element);
    });
    this.sliderGroup.addSlideListener(this.handleSliderSlide);
  }

  private handleSliderSlide = (currents: MinMax<number>) => {
    Object.keys(currents).forEach((key) => {
      this.changeableInputs[key].value = currents[key].toString();
    });
  };

  private prepareElement(modelData: SliderOptions, element: HTMLInputElement) {
    const inputElement = element;
    let mappedData;
    if (element.type === 'checkbox') {
      mappedData = this.mapCheckboxData(modelData, element.name);
      inputElement.checked = mappedData.value;
    } else {
      mappedData = this.mapNumberData(modelData, element.name);
      inputElement.value = mappedData.value.toString();
    }
    if (element.name === 'currentMin') this.changeableInputs.min = element;
    if (element.name === 'currentMax') this.changeableInputs.max = element;
    element.addEventListener(
      'input',
      this.makeWrappedListener(mappedData.listener),
    );
  }

  private makeWrappedListener = (
    listener: (event: InputEvent) => void,
  ): ((event: InputEvent) => void
) => (event: InputEvent) => {
    try {
      listener(event);
      (event.target as HTMLInputElement).setCustomValidity('');
    } catch (error) {
      (event.target as HTMLInputElement).setCustomValidity(error.message);
      (event.target as HTMLInputElement).reportValidity();
    }
  };

  private mapCheckboxData(data: SliderOptions, inputName: string) {
    switch (inputName) {
      case 'isRange':
        return { value: data.isRange, listener: this.handleRangeListener };
      case 'isVertical':
        return {
          value: data.isVertical,
          listener: this.handleVerticalListener,
        };
      case 'withTooltip':
        return {
          value: data.withTooltip,
          listener: this.handleTooltipListener,
        };
      case 'withScale':
        return { value: data.withScale, listener: this.handleScaleListener };
      default:
        throw Error('unknown input');
    }
  }

  private mapNumberData(data: SliderOptions, inputName: string) {
    switch (inputName) {
      case 'min':
        return { value: data.border.min, listener: this.handleMinInput };
      case 'max':
        return { value: data.border.max, listener: this.handleMaxInput };
      case 'step':
        return { value: data.step, listener: this.handleStepInput };
      case 'currentMax':
        return {
          value: data.current.max,
          listener: this.handleCurrentMaxInput,
        };
      case 'currentMin':
        return {
          value: data.current.min,
          listener: this.handleCurrentMinInput,
        };
      default:
        throw Error('unknown input');
    }
  }

  private handleScaleListener = () => {
    this.sliderGroup.toggleScale();
  };

  private handleTooltipListener = () => {
    this.sliderGroup.toggleTooltip();
  };

  private handleVerticalListener = () => {
    this.sliderGroup.toggleOrientation();
  };

  private handleRangeListener = () => {
    this.sliderGroup.toggleRange();
  };

  private handleCurrentMinInput = (event: InputEvent) => {
    this.sliderGroup.setCurrentRangeMin(Index.getNumber(event));
  };

  private handleCurrentMaxInput = (event: InputEvent) => {
    this.sliderGroup.setCurrentRangeMax(Index.getNumber(event));
  };

  private handleStepInput = (event: InputEvent) => {
    this.sliderGroup.setStep(Index.getNumber(event));
  };

  private handleMaxInput = (event: InputEvent) => {
    this.sliderGroup.setBorderMax(Index.getNumber(event));
  };

  private handleMinInput = (event: InputEvent) => {
    this.sliderGroup.setBorderMin(Index.getNumber(event));
  };

  private static getNumber(event: InputEvent) {
    const { value } = event.target as HTMLInputElement;
    if (!Index.isNumber(value)) throw Error('Number required');
    return Number(value);
  }

  private static isNumber(value: string) {
    return value !== '' && !Number.isNaN(Number(value));
  }
}

export default Index;
