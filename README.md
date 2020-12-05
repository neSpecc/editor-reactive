# Reactive tools for editor.js

Experiment 0.1

[Open Demo](https://nespecc.github.io/editor-reactive/dist/index.html)

## Features

- Parsing plugins template string
- Reactive `{{ mustache }}` variables in templates
- Reactive `<div bind="variable"></div>` in templates
- Reactive `<div bind="variable" contenteditable></div>` in templates
- Support both `contenteditable` and `input` bindings
- Caret is not jumping when `contenteditable` is changing

## Plugin example 

[See demo example][src/plugin.js]


```js
/**
 * Example of tool
 * - has the `template` instead of `render()`
 * - provides data structure via `get data()`
 * - no manipulations with DOM, just changing a data
 */
export default class Plugin { 
    constructor(){
    }

    get template(){
        return `
            <div>
                <p>My name is {{ name }}</p>
                
                <div contenteditable bind="caption"></div>

                <div>And the caption is: {{ caption }}</div> 
            </div>
        `
    }

    get data(){
        return {
            name: 'Jerom',
            family: 'Kawasaki',
            caption: 'Apple Developers Program'
        }
    }
}
```