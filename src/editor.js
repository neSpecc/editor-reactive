import Dom from './dom';

export default class Editor {
    constructor({tools, holder}){
        this.toolsConfig = tools;
        this.holder = holder;

        /**
         * Will be stored tools classes
         */
        this.tools = {};

        this.render();

        /**
         * For displaying the output on demo page
         */
        this.onChange();
    }

    render(){
        /**
         * Iterate over tools
         */
        Object.entries(this.toolsConfig).forEach(([name, toolClass]) => {
            const tool = new toolClass();
            const react = this.parseTemplate(tool.template.trim(), tool.data);

            this.holder.appendChild(react.getEl());

            this.tools[name] = {
                tool,
                react
            };
        });
    }

    parseTemplate(template, dataToBind){
        /**
         * Create Dom structure with bindings
         */
        const react = new Dom(template, dataToBind, () => {
            this.onChange();
        });
     
        /**
         * Temporary.
         * Expose method for changing the data from outside.
         */
        window.change = function(pair){
            Object.entries(pair).forEach(([key, value]) => {
                react.changeDataValue(key, value);
            })
        }
        
        return react;
    }

    onChange(){
        document.querySelector('.output pre').innerHTML = JSON.stringify({
            blocks: Object.entries(this.tools).map(([name, {tool, react}]) => {
                return {
                    type: name,
                    data: react.getData(),
                }
            })
        }, undefined, '   ')
    }
}