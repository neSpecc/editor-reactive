/**
 * Example of tool
 * - has the `template` instead of `render()`
 * - provide data structure via `get data()`
 * - all bindings from data to template on the editor side
 */
export default class Plugin { 
    constructor(){
    }

    get template(){
        return `
            <div>
                <p>My name is {{ name }} {{ family }}. {{ name }} is a good man.</p>
                
                <p>Enter caption (div):</p>
                <div contenteditable bind="caption"></div>
                
                <p>Enter caption (input):</p>
                <input bind="caption"/>
                
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