import {
  h,
  Component,
} from 'preact';

import "./WheelPicker.scss";
export default class WheelPicker extends Component {
  static selectValue = "Select";

  constructor(props) {
    super(props);
    this.ref = null;
    this.scrollTargetIndex = null;
  }

  componentDidMount() {
    if (this.ref) {
      this.ref.addEventListener("scroll", this.onScroll, { passive: true });
      this.scrollToValue(false);
    }
  }

  componentWillUnmount() {
    if (this.ref) {
      this.ref.removeEventListener("scroll", this.onScroll);
    }
  }

  componentDidUpdate(prevProps) {
    if ((prevProps.values !== this.props.values)) {
      this.scrollToValue(false);
    }
  }

  onScroll = () => {
    const { values, value, onChange } = this.props;
    const itemHeight = 60; // same as styles
    const idx = Math.round((this.ref.scrollTop) / itemHeight);
    const selected = values[idx];
    if (selected !== undefined) {
      this.setState({ selectedIndex: idx });
    }

    if (this.scrollTargetIndex !== null) {
      if (idx === this.scrollTargetIndex) {
        this.scrollTargetIndex = null;
      }

      return;
    }

    if (selected !== undefined && !this.isSameValue(selected, value)) {
      onChange(selected);
    }
  };

  onItemClick = (selected, idx) => {
    const { value, onChange } = this.props;

    this.scrollTargetIndex = this.state.selectedIndex === idx ? null : idx;
    this.scrollToIndex(idx, true, false);

    if (!this.isSameValue(selected, value)) {
      onChange(selected);
    }
  };

  isSameValue(value, nextValue) {
    return JSON.stringify(value) === JSON.stringify(nextValue);
  }

  scrollToIndex(idx, smooth = true, updateSelection = true) {
    if (this.ref) {
      this.ref.scrollTo({
        top: idx * 60,
        behavior: smooth ? "smooth" : "auto",
      });

      if (updateSelection) {
        this.setState({ selectedIndex: idx });
      }
    }
  }

  scrollToValue(smooth = true) {
    const val = this.props.value;
    const idx = this.props.values.findIndex((v) => this.isSameValue(v, val));

    if (idx >= 0) {
      this.scrollToIndex(idx, smooth);
    }
  }

  render({ values, unit, type }, { selectedIndex }) {
    const units =
      type === "height"
        ? "cm"
        : type === "weight" && unit === "in"
          ? "lb"
          : "kg";

    const addItem = window.innerHeight >= 700; 
    return (
      <div class="wheel">
        <div class="wheel-list" ref={(el) => (this.ref = el)}>
          { addItem ? <div className="wheel-item"></div> : null }
          <div className="wheel-item"></div>
          <div className="wheel-item"></div>
          {
            values.map((v, i) => {
              const dist = Math.abs(i - selectedIndex);
              let cls = "wheel-item wheel-item--value";
              const isSelectValue = v === WheelPicker.selectValue;
              if (dist === 0) cls += " active";
              else if (dist === 1) cls += " near";
              else if (dist === 2) cls += " far";
              else cls += " fade";
              return (
                <div key={i} class={cls} onClick={() => this.onItemClick(v, i)}>
                  {isSelectValue
                    ? <div>{WheelPicker.selectValue}</div>
                    : unit === "in" && (type === "height")
                    ? (<div>
                      {v.ft}<span class="unit"> ft </span>{v.in}<span class="unit"> in</span>
                    </div>)
                    : (<div>
                      {v}<span class="unit"> {units}</span>
                    </div>)}
                </div>
              );
            })
          }
          { addItem ? <div className="wheel-item"></div> : null }
          <div className="wheel-item"></div>
          <div className="wheel-item"></div>
        </div>
      </div>
    );
  }
}
