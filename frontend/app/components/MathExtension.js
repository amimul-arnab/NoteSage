// /app/components/MathExtension.js
import { Node } from '@tiptap/core';
import 'katex/dist/katex.min.css'; // Ensure KaTeX CSS is loaded
import katex from 'katex';

export default Node.create({
  name: 'math',

  group: 'inline math',
  inline: true,
  atom: true,

  addAttributes() {
    return {
      latex: {
        default: '',
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'span.katex-math',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return ['span', { class: 'katex-math' }, HTMLAttributes.latex];
  },

  addNodeView() {
    return ({ node }) => {
      const span = document.createElement('span');
      span.classList.add('katex-math');

      try {
        katex.render(node.attrs.latex, span, {
          throwOnError: false,
        });
      } catch (error) {
        console.error('KaTeX rendering error:', error);
        span.textContent = node.attrs.latex;
      }

      return {
        dom: span,
      };
    };
  },

  addCommands() {
    return {
      insertMath: (latex) => ({ chain }) => {
        return chain().insertContent({ type: this.name, attrs: { latex } }).run();
      },
    };
  },
});
