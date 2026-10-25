import test from 'node:test';import assert from 'node:assert/strict';import {classifyByRules} from '../src/services/ai/classifier.js';
test('wrong ISBN is classified as high priority metadata issue',()=>{const r=classifyByRules('Amazon shows a wrong ISBN on my book');assert.equal(r.category,'ISBN & Metadata Issues');assert.equal(r.priority,'High');});
test('royalty issue gets payment category',()=>{assert.equal(classifyByRules('I have not received my royalty payment').category,'Royalty & Payments');});
test('general query has a safe default category',()=>{assert.equal(classifyByRules('Can I ask a question?').category,'General Inquiry');});
