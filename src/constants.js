/** @fileoverview Shared constants: word bank and colour palette */

export const WORDS = [
    // ── JavaScript / TypeScript ──
    'FUNCTION', 'ASYNC', 'AWAIT', 'EXPORT', 'IMPORT', 'TYPEOF', 
    'DEBUGGER', 'PROMISE', 'CONSOLE', 'UNDEFINED', 'DOCUMENT',

    // ── Python ──
    'DEF', 'ELIF', 'LAMBDA', 'YIELD', 'PASS', 'GLOBAL', 
    'NONLOCAL', 'ASSERT', 'EXCEPT', 'FINALLY', 'TUPLE',

    // ── Java / C# ──
    'PUBLIC', 'PRIVATE', 'PROTECTED', 'STATIC', 'CLASS', 
    'INTERFACE', 'EXTENDS', 'IMPLEMENTS', 'ABSTRACT', 'VIRTUAL',
    'SYNCHRONIZED', 'VOLATILE', 'NAMESPACE', 'OVERRIDE', 'BOOLEAN',

    // ── C / C++ ──
    'INCLUDE', 'DEFINE', 'STRUCT', 'TYPEDEF', 'UNION', 'SIZEOF', 
    'UNSIGNED', 'INLINE', 'TEMPLATE', 'CONSTEXPR', 'NULLPTR', 'MALLOC',

    // ── General / Control Flow ──
    'RETURN', 'BREAK', 'CONTINUE', 'WHILE', 'SWITCH', 'DEFAULT', 
    'CATCH', 'THROW', 'THIS', 'SUPER', 'CONST', 'FALSE', 'TRUE'
];

/** @readonly */
export const C = {
    bg:         '#05050a',
    cyan:       '#00ffff',
    green:      '#00ff41',
    red:        '#ff003c',
    purple:     '#ae81ff',
    white:      '#e0e0e0',
    dimWhite:   'rgba(224,224,224,0.5)',
    empColor:   '#ae81ff',
};
