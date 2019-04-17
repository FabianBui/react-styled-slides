# react-styled-slides
A styled-component slider for React.

### 1. Import & state
```javascript
import Slider from "./Slider";

state = {
  slideIndex: 0,
}
```

### 2. Set up
```javascript
<Slider
  slideIndex={0}
  slidesInView={1}
  gutterWidth={20}
>
  <div>Slide1</div>
  <div>Slide2</div>
  <div>Slide3</div>
</Slider>
```

### 3. Add logics
```javascript
goToSlide = (increment) => {
  const { slideIndex } = this.state
  this.setState({
    slideIndex: slideIndex + increment
  })
};
  
<Slider
...
  prevSlide={() => this.goToSlide(-1)}
  nextSlide={() => this.goToSlide(1)}
>
...


```

Check out this [demo](https://codesandbox.io/embed/ywwo106r7j).

![Alt text](example.png?raw=true "Examples")
