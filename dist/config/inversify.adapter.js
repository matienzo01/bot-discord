"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InversifyAdapter = void 0;
class InversifyAdapter {
    constructor(container) {
        this.container = container;
    }
    get(someClass, action) {
        return this.container.get(someClass);
    }
}
exports.InversifyAdapter = InversifyAdapter;
