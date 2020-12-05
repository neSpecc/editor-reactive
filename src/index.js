import Editor from './editor';
import Plugin from './plugin';

const editor = new Editor({
    holder: document.getElementById('editor'),
    tools: {
        myTool: Plugin,
    }
})

