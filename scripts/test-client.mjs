import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import vm from "node:vm";

const listeners = new Map();
const formListeners = new Map();
const attributes = new Map();
const startedAt = {
  value: "",
  setAttribute(name, value) { attributes.set(name, value); }
};
const form = {
  querySelector(selector) {
    if (selector === "[data-started-at]") return startedAt;
    return null;
  },
  addEventListener(name, handler) { formListeners.set(name, handler); }
};
const window = {
  addEventListener(name, handler) { listeners.set(name, handler); }
};
const document = {
  querySelector() { return null; },
  querySelectorAll(selector) {
    if (selector === "[data-lead-form]") return [form];
    return [];
  },
  addEventListener() {}
};

const source = await readFile(new URL("../src/script.js", import.meta.url), "utf8");
vm.runInNewContext(source, { window, document, URLSearchParams, Set, Date });

const assertTimestamp = (label) => {
  assert.match(startedAt.value, /^\d{13}$/, `${label}: input value must contain a timestamp`);
  assert.equal(attributes.get("value"), startedAt.value, `${label}: value attribute must match the input property`);
  assert.ok(Date.now() - Number(startedAt.value) < 1_000, `${label}: timestamp must be current`);
};

assertTimestamp("initial load");

startedAt.value = "";
attributes.delete("value");
listeners.get("pageshow")();
assertTimestamp("pageshow restore");

startedAt.value = "";
attributes.delete("value");
formListeners.get("focusin")();
assertTimestamp("focus fallback");

console.log("Client tests passed: lead form session timestamp survives load, page restore and focus fallback.");
