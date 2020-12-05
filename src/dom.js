import parse from 'html-dom-parser';
import { nanoid } from 'nanoid';

export default class Dom {
    constructor(template, dataToBind, onChange){
        /**
         * Saved bindings for mustache inside text - {{ variable }}
         */
        this.mustacheBindings = [];

        /**
         * Saved bindings for «bind="variable"»
         */
        this.elementBindings = [];

        /**
        * Create Proxy from Plugin's data to pass it to the Dom
        */
        this.dataProxy = new Proxy(dataToBind, this.data);
        
        /**
         * Parse string
         */
        const parsed = parse(template)[0]

        /**
         * Render DOM
         */
        this.el = this.create(parsed)

        /**
         * Save onChange callback
         */
        this.onChange = onChange;
    }

    /**
     * Data proxy handler
     */
    get data(){
        const self = this;

        return {
            set(target, prop, value, receiver){
                Reflect.set(...arguments);

                /**
                 * Update DOM
                 */
                self.updateNodeWithData(prop, value);

                return true;
            },
            get(target, prop, receiver){
                return Reflect.get(...arguments);
            }
        }
    }

    create(node){
        switch (node.type){
            case 'tag': 
            case 'script': 
                return this.createElementNode(node)
            case 'text': 
                return this.createTextNode(node.data)

        }

        const unknownNode = document.createElement('div');

        unknownNode.classList.add('unknown')
        unknownNode.textContent = 'Unknown node type: ' + node.type;

        return unknownNode;
    }

    createElementNode(node){
        const el = document.createElement(node.name);

        /**
         * If bind="variable" passed, we will skip all children content
         */
        let isHTMLBinded = false;

        /**
         * Add attributes
         */
        Object.entries(node.attribs).forEach(([key, value]) => {
            el.setAttribute(key, value)
        })

        const isBinding = node.attribs['bind'];
        const isContentEditable = node.attribs['contenteditable'] !== undefined || node.name === 'input';

        /**
         * Process variable binding
         */
        if (isBinding){
            const variable = node.attribs['bind'];

            el.dataset.var = variable;
            
            isHTMLBinded = true;

            this.elementBindings.push({
                variable,
                node: el,
            })
            
            /**
             * Set initial content from data
             */
            if (node.name === 'input'){
                el.value = this.dataProxy[variable]
            } else {
                el.innerHTML = this.dataProxy[variable];
            }

            /**
             * Watch changes if case of contenteditable
             */
            if (isContentEditable){
                el.addEventListener('input', () => {
                    this.dataProxy[variable] = node.name === 'input' ? el.value : el.innerHTML;
                })
            }
        }
        

        el.dataset.tag = node.name;

        if (isHTMLBinded && node.children.length){
            console.warn('Element with the "bind" attribute should not contain anything', el)
        }

        if (!isHTMLBinded){
            node.children.forEach(childNode => {
                el.appendChild(this.create(childNode));
            });
        }

        return el;
    }

    createTextNode(text, id){
        const originalText = text;
        const vars = this.findVariables(text);
        let node;

        const isNew = !id;

        /**
         * If id passed, just update innerHTML
         * Otherwise create new element and save it to the bindings
         */
        if (!isNew) {   
            node = document.querySelector(`[data-id="${id}"]`);
        } else {
            id = nanoid(5);
            node = document.createElement('span');
            node.dataset.id = id;
        }

        if (vars.length){
            vars.forEach(variable => {
                text = this.substituteVariable(text, variable)                

                if (isNew) {
                    this.mustacheBindings.push({
                        variable,
                        node,
                        text: originalText,
                        id
                    })
                }
            })

            node.innerHTML = text;
        } else {
            node = document.createTextNode(text);
        }

        return node;
    }

    /**
     * Return array of mustache variables
     * «My name is {{ name }} {{ family }}» -> ["name", "family"]
     */
    findVariables(text){
        const varsRx = /{{([ a-zA-Z0-9-]+)}}/g;

        let match = varsRx.exec(text);
        let vars = []

        while (match != null) {
            vars.push(match[1].trim());

            match = varsRx.exec(text);
        }

        return vars;
    }

    /**
     * Replace mustaches with values
     * 
     * «Hello, {{ name }}»  --> «Hello, Jerom»
     */
    substituteVariable(text, variable){
        const dataBinded = this.dataProxy[variable];
        const space = '(\\s+)?';

        if (dataBinded){
            return text.replace(
                new RegExp('{{' + space + variable + space + '}}'), 
                // <span> is used only for demo-highlighting
                `<span data-var="${variable}">
                    ${this.dataProxy[variable]}
                </span>`
            );
        }

        return text;
    }

    /**
     * Returns rendered element
     * 
     * @public
     */
    getEl(){
        return this.el;
    }

    /**
     * External data setter 
     * 
     * @public
     */
    changeDataValue(name, value){
        this.dataProxy[name] = value;
    }

    /**
     * Update DOM by updating data
     */
    updateNodeWithData(name, value){
        this.mustacheBindings.forEach(({variable, node, text, id}) => {
            if (variable !== name){
                return;
            }

            this.createTextNode(text, id);
        })
        

        this.elementBindings.forEach(({variable, node, id}) => {
            if (variable !== name){
                return;
            }

            /**
             * Prevent caret jumping
             */
            if (document.activeElement === node){
                return;
            }

            if (node.tagName.toLowerCase() === 'input'){
                node.value = value
            } else {
                node.innerHTML = value;
            }
        })

        this.onChange();
    }

    getData(){
        return this.dataProxy;
    }
}
