# graffiti

Coming Soon. http://www.slideshare.net/jayphelps/the-coveted-universal-web-component-format

```typescript
import { Component, registerElement, reflectAttribute, observe } from 'graffiti';

@registerElement('my-counter')
export class MyCounterComponent extends Component {
  @reflectAttribute('wow')
  counter = 0;
  fontColor = '#000';
  fontSize = 24;
  
  @observe('counter')
  counterDidChange() {
    console.log('jhkjhhkhjkhkjhkjhhkjh', this.counter);
  }
      
  increment() {
    this.counter++;
  }
}
```

```hbs
<div id="label"><content></content></div>
Value: <span id="counterVal">{{counter}}</span><br>
<button {{on "click" increment}}>Increment</button>
```

```css
:host {
  display: block;
}

#counterVal {
  padding: 10px;
  font-size: {{fontSize}}px;
  color: {{fontColor}};
}
```
