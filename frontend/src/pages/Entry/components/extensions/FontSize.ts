import { Extension } from '@tiptap/core';

export type FontSizeOptions = {
    types: string[],
};

declare module '@tiptap/core' {
    interface Commands<ReturnType> {
        setFontSize: (size: string) => ReturnType;
        unsetFontSize: () => ReturnType;
    }
}

export const FontSize = Extension.create<FontSizeOptions>({
    name: 'fontSize',

    addOptions() {
        return {
            types: ['textStyle', 'listItem'],
        };
    },

    addGlobalAttributes() {
        return [
            {
                types: this.options.types,
                attributes: {
                    fontSize: {
                        default: null,
                        parseHTML: element => element.style.fontSize.replace(/['"]+/g, ''),
                        renderHTML: attributes => {
                            if (!attributes.fontSize) {
                                return {};
                            }
                            return {
                                style: `font-size: ${attributes.fontSize}`,
                            };
                        },
                    },
                },
            },
        ];
    },

    addCommands() {
        return {
            setFontSize: fontSize => ({ tr, state, dispatch, chain }) => {
                if (dispatch) {
                    const { selection } = state;
                    const { from, to } = selection;

                    tr.doc.nodesBetween(from, to, (node, pos) => {
                        if (node.type.name === 'listItem') {
                            tr.setNodeMarkup(pos, undefined, { ...node.attrs, fontSize });
                        }
                    });

                    const $from = state.selection.$from;
                    for (let d = $from.depth; d > 0; d--) {
                        const node = $from.node(d);
                        if (node.type.name === 'listItem') {
                            tr.setNodeMarkup($from.before(d), undefined, { ...node.attrs, fontSize });
                        }
                    }

                    const $to = state.selection.$to;
                    for (let d = $to.depth; d > 0; d--) {
                        const node = $to.node(d);
                        if (node.type.name === 'listItem') {
                            tr.setNodeMarkup($to.before(d), undefined, { ...node.attrs, fontSize });
                        }
                    }
                }

                return chain().setMark('textStyle', { fontSize }).run();
            },
            unsetFontSize: () => ({ tr, state, dispatch, chain }) => {
                if (dispatch) {
                    const { selection } = state;
                    const { from, to } = selection;

                    tr.doc.nodesBetween(from, to, (node, pos) => {
                        if (node.type.name === 'listItem') {
                            tr.setNodeMarkup(pos, undefined, { ...node.attrs, fontSize: null });
                        }
                    });

                    const $from = state.selection.$from;
                    for (let d = $from.depth; d > 0; d--) {
                        const node = $from.node(d);
                        if (node.type.name === 'listItem') {
                            tr.setNodeMarkup($from.before(d), undefined, { ...node.attrs, fontSize: null });
                        }
                    }

                    const $to = state.selection.$to;
                    for (let d = $to.depth; d > 0; d--) {
                        const node = $to.node(d);
                        if (node.type.name === 'listItem') {
                            tr.setNodeMarkup($to.before(d), undefined, { ...node.attrs, fontSize: null });
                        }
                    }
                }

                return chain()
                    .setMark('textStyle', { fontSize: null })
                    .removeEmptyTextStyle()
                    .run();
            },
        };
    },
});
