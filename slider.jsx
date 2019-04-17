import React, { PureComponent } from "react";
import styled from "styled-components";
import posed from "react-pose";
import { value, spring } from "popmotion";

const VELOCITY_THRESHOLD = 600;
const DISTANCE_PERCENTILE_THRESHOLD = 0.1;

const Draggable = styled(
  posed.div({
    draggable: "x",
    rest: {
      x: ({ offset }) => {
        return -offset;
      },
      transition: { type: "spring", stiffness: 75, mass: 0.25 }
    },
    dragEnd: {
      transition: ({ from, to, velocity, offset }) => {
        return spring({
          from,
          to: -offset,
          velocity,
          stiffness: 75,
          mass: 0.25
        });
      }
    }
  })
)`
  display: flex;
  flex-wrap: nowrap;
  margin-left: -${p => p.gutter}px;
  margin-right: -${p => p.gutter}px;

  > * {
    flex-shrink: 0;
  }

  cursor: move; /* fallback if grab cursor is unsupported */
  cursor: grab;
  cursor: -moz-grab;
  cursor: -webkit-grab;

  /* (Optional) Apply a "closed-hand" cursor during drag operation. */
  &:active * {
    cursor: grabbing !important;
    cursor: -moz-grabbing !important;
    cursor: -webkit-grabbing !important;
  }
`;

const Slide = styled.div`
  width: ${p => p.width};
  padding: 0 ${p => p.gutter}px;
  box-sizing: border-box;
`;

export default class Slider extends PureComponent {
  static defaultProps = {
    duration: 3000,
    onDragStart() {},
    onDragEnd() {},
    onTransitionEnd() {}
  };

  state = {
    root: null,
    offset: 0,
    slideWidth: 0
  };

  x = value(0);
  preventClick = false;

  componentDidMount() {
    window.addEventListener("resize", this.setSlider);
  }

  componentWillUnmount() {
    window.removeEventListener("resize", this.setSlider);
  }

  componentDidUpdate() {
    this.setSlider();
  }

  setSlider = () => {
    const { root } = this.state;
    const { slideIndex, slidesInView } = this.props;

    const slideWidth = root.clientWidth / slidesInView;

    this.setState({
      slideWidth: slideWidth,
      offset: Math.round(slideWidth * slideIndex)
    });
  };

  goToPreviousSlide = () => {
    // this.goToSlide(this.state.slideIndex - 1);
    const { slideIndex } = this.props;
    if (slideIndex > 0) this.props.prevSlide();
  };

  goToNextSlide = () => {
    const { slideIndex, children, slidesInView } = this.props;
    if (slideIndex < children.length - slidesInView) this.props.nextSlide();
    // this.goToSlide(this.state.slideIndex + 1);
  };

  goToSlide = newSlideIndex => {
    const { children } = this.props;
    if (newSlideIndex >= 0 && newSlideIndex < children.length) {
      this.setState({
        slideIndex: newSlideIndex
      });
    }
  };

  onDragStart = e => {
    e.preventDefault();
    this.preventClick = false;
    this.props.onDragStart();
  };

  onDragEnd = () => {
    const { offset, slideWidth } = this.state;

    const start = -offset;
    const distance = this.x.get() - start;
    const velocity = this.x.getVelocity();

    if (distance !== 0) {
      // prevents click from firing in onClickCapture
      this.preventClick = true;

      const threshold = DISTANCE_PERCENTILE_THRESHOLD * slideWidth;

      if (distance < -threshold || velocity < -VELOCITY_THRESHOLD) {
        this.goToNextSlide();
      } else if (distance > threshold || velocity > VELOCITY_THRESHOLD) {
        this.goToPreviousSlide();
      }
    }

    this.props.onDragEnd();
  };

  onClickCapture = e => {
    if (this.preventClick) {
      e.stopPropagation();
      e.preventDefault();
    }
  };

  registerRootElement = root => {
    if (root && !this.state.root) {
      this.setState({
        root
      });
    }
  };

  render() {
    const { gutterWidth, children } = this.props;
    const { slideWidth, offset } = this.state;

    const valuesMap = { x: this.x };

    const wrappedChildren = children.map((el, i) => {
      return (
        <Slide key={i} width={slideWidth + "px"} gutter={gutterWidth / 2}>
          {el}
        </Slide>
      );
    });

    return (
      <Draggable
        ref={this.registerRootElement}
        values={valuesMap}
        offset={offset}
        onClickCapture={this.onClickCapture}
        onDragStart={this.onDragStart}
        onDragEnd={this.onDragEnd}
        onPoseComplete={this.props.onTransitionEnd}
        poseKey={offset}
        pose={"rest"}
        gutter={gutterWidth / 2}
      >
        {wrappedChildren}
      </Draggable>
    );
  }
}
