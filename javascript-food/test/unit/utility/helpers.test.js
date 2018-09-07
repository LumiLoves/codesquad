/**
 * helpers.test.js
 */

import * as helpers from './../../../src/js/utility/helpers.js';
import HttpError from './../../../src/js/component/http/HttpError.js';
const { expect } = chai;

describe('[Utility] helpers', () => {

  describe('# attachIndexToDom()', () => {
    let listBox = null;

    beforeEach(() => {
      let count = 10;
      listBox = document.createElement('ul');

      while (count-- > -1) {
        const listItem = document.createElement('li');
        listItem.appendChild(document.createElement('a'));
        listBox.appendChild(listItem);
      }
    });

    afterEach(() => {
      listBox = null;
    });

    it('nodeList의 listElements에 index값을 순서대로 부여한다.', () => {
      // given
      const listItems = listBox.querySelectorAll('li');

      // when 
      helpers.attachIndexToDom(listItems);
      // then
      expect(listItems[0].index).to.equal(0);
      expect(listItems[9].index).to.equal(9);
    });

    it('nodeList의 listElement에서 선택한 하위 selector요소에 index값을 순서대로 부여한다.', () => {
      // given
      const listItems = listBox.querySelectorAll('li');

      // when 
      helpers.attachIndexToDom(listItems, 'a');
      // then
      expect(listItems[0].querySelector('a').index).to.equal(0);
      expect(listItems[9].querySelector('a').index).to.equal(9);
    });
  });

  describe.skip('# getFetchData()', () => {
    it('유효한 url 요청 시, 응답으로 올바른 데이터를 받아온다.', async () => {
      // given
      const testUrl = '/test-success';
      const expectedResponse = { "data": "success" };
      let testedResponse = null;

      // when
      testedResponse = await helpers.getFetchData({ url: testUrl });
      // then  
      expect(testedResponse).to.deep.equal(expectedResponse);
    });

    it('유효하지 않은 url 요청 시, HttpError 인스턴스가 throw 된다.', async () => {
      // given
      const testUrl = '/test-error';

      try {
        // when
        await helpers.getFetchData({ url: testUrl });
      } catch(err) {
        // then
        expect(err instanceof HttpError).to.be.true;
      }
    });
  });

  describe('# fadeOutElem()', () => {
    it('DOM Element의 opacity 값이 변화값에 반비례하는 경과시간 후 0이 된다.', async () => {  
      // given
      const div = document.createElement('div');
      const OPACITY_INTERVAL_VALUE = 0.05;
      const EXPECTED_OPACITY = '0';

      // when 
      await helpers.fadeOutElem(div, OPACITY_INTERVAL_VALUE);
      // then
      expect(div.style.opacity).to.equal(EXPECTED_OPACITY);
    });
  });

  describe('# fadeInElem()', () => {
    it('DOM Element의 opacity 값이 변화값에 반비례하는 경과시간 후 1이 된다.', async () => {
      // given
      const div = document.createElement('div');
      const OPACITY_INTERVAL_VALUE = 0.05;
      const EXPECTED_OPACITY = '1';
      
      // when
      await helpers.fadeInElem(div, OPACITY_INTERVAL_VALUE);
      // then
      expect(div.style.opacity).to.equal(EXPECTED_OPACITY);
    });
  });

}); // helpers