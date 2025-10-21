"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toSnakeCase = exports.toKebabCase = exports.toPascalCase = void 0;
function toPascalCase(str) {
    return str
        .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
        .replace(/[^a-zA-Z0-9]+/g, ' ')
        .split(' ')
        .filter(Boolean)
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join('');
}
exports.toPascalCase = toPascalCase;
function toKebabCase(str) {
    return str
        .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
        .replace(/[^a-zA-Z0-9]+/g, '-')
        .replace(/([A-Z])/g, '-$1')
        .toLowerCase()
        .replace(/^-+|-+$/g, '')
        .replace(/--+/g, '-');
}
exports.toKebabCase = toKebabCase;
function toSnakeCase(str) {
    return str
        .replace(/([a-z0-9])([A-Z])/g, '$1_$2')
        .replace(/[^a-zA-Z0-9]+/g, '_')
        .replace(/([A-Z])/g, '_$1')
        .toLowerCase()
        .replace(/^_+|_+$/g, '')
        .replace(/__+/g, '_');
}
exports.toSnakeCase = toSnakeCase;
