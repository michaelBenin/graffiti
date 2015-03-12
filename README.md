# graffiti

Coming soon. [Watch the teaser](https://www.youtube.com/watch?v=sNeK4Kplo9g&t=812).

```hbs
<my-counter counter="0" font-color="red" font-size="32"></my-counter>
```

![image](https://cloud.githubusercontent.com/assets/762949/6720571/4863d198-cd81-11e4-913a-5ff18d985ca9.png)

```javascript
import { registerElement, reflectToAttribute, observe, autobind } from 'graffiti';

@registerElement('my-counter')
class MyCounterComponent {
  @reflectToAttribute()
  counter = 0;
  fontColor = '#000';
  fontSize = 24;
  
  @observe('counter')
  counterDidChange() {
    console.log('counter', this.counter);
  }
  
  @autobind    
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

## Contributing
The API/syntax will be in flux before the `v1.0.0` stable release. If you have comments or suggestions, definitely jump in. Particularly focused on high-performance use cases such as [dbmonster](https://dbmonster.firebaseapp.com/), high through-put realtime charts, and other render intensive components.

# License
MIT Licensed
