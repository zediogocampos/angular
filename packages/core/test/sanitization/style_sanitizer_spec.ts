/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {_sanitizeStyle} from '../../src/sanitization/style_sanitizer';


describe('Style sanitizer', () => {
  let logMsgs: string[];
  let originalLog: (msg: any) => any;

  beforeEach(() => {
    logMsgs = [];
    originalLog = console.warn;  // Monkey patch DOM.log.
    console.warn = (msg: any) => logMsgs.push(msg);
  });

  afterEach(() => { console.warn = originalLog; });

  function expectSanitize(v: string) { return expect(_sanitizeStyle(v)); }

  it('sanitizes values', () => {
    expectSanitize('').toEqual('');
    expectSanitize('abc').toEqual('abc');
    expectSanitize('50px').toEqual('50px');
    expectSanitize('rgb(255, 0, 0)').toEqual('rgb(255, 0, 0)');
    expectSanitize('expression(haha)').toEqual('unsafe');
  });

  it('rejects unblanaced quotes', () => { expectSanitize('"value" "').toEqual('unsafe'); });

  it('accepts transform functions', () => {
    expectSanitize('rotate(90deg)').toEqual('rotate(90deg)');
    expectSanitize('rotate(javascript:evil())').toEqual('unsafe');
    expectSanitize('translateX(12px, -5px)').toEqual('translateX(12px, -5px)');
    expectSanitize('scale3d(1, 1, 2)').toEqual('scale3d(1, 1, 2)');
  });

  it('accepts gradients', () => {
    expectSanitize('linear-gradient(to bottom, #fg34a1, #bada55)')
        .toEqual('linear-gradient(to bottom, #fg34a1, #bada55)');
    expectSanitize('repeating-radial-gradient(ellipse cover, black, red, black, red)')
        .toEqual('repeating-radial-gradient(ellipse cover, black, red, black, red)');
  });

  it('accepts attr', () => { expectSanitize('attr(value string)').toEqual('attr(value string)'); });

  it('accepts calc', () => { expectSanitize('calc(90%-123px)').toEqual('calc(90%-123px)'); });

  it('accepts var',
     () => { expectSanitize('var(--my-custom-var)').toEqual('var(--my-custom-var)'); });

  it('sanitizes URLs', () => {
    expectSanitize('url(foo/bar.png)').toEqual('url(foo/bar.png)');
    expectSanitize('url( foo/bar.png\n )').toEqual('url( foo/bar.png\n )');
    expectSanitize('url(javascript:evil())').toEqual('unsafe');
    expectSanitize('url(strangeprotocol:evil)').toEqual('unsafe');
  });

  it('accepts quoted URLs', () => {
    expectSanitize('url("foo/bar.png")').toEqual('url("foo/bar.png")');
    expectSanitize(`url('foo/bar.png')`).toEqual(`url('foo/bar.png')`);
    expectSanitize(`url(  'foo/bar.png'\n )`).toEqual(`url(  'foo/bar.png'\n )`);
    expectSanitize('url("javascript:evil()")').toEqual('unsafe');
    expectSanitize('url( " javascript:evil() " )').toEqual('unsafe');
  });
});
