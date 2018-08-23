import { Selector } from 'testcafe';

fixture `[배민찬] main 페이지`
  .page `localhost:3001`;

test('자동 완성 검색창에 검색어 넣고 엔터 2회 반복 후, 값을 비우면 최근 검색어 목록이 나타나고, 클릭한 이름이 검색창에 입력된다.', async t => {
  const searchInput = await Selector('#search-input');
  const searchRecentBox = await Selector('#header .search-list-box.recent');

  await t
    .click(searchInput)
    .typeText(searchInput, '미역국')
    .pressKey('enter')
    .pressKey('backspace')
    .pressKey('backspace')
    .pressKey('backspace')
    .typeText(searchInput, '미역')
    .pressKey('enter')
    .pressKey('backspace')
    .pressKey('backspace')
    .click(searchRecentBox.find('li').nth(0))
    .expect(searchInput.value).eql('미역');
});

test('자동 완성 검색창에 검색어를 넣고 나오는 결과목록에서 arrow키를 이용해 목록탐색후 엔터를 치면 검색창에 값이 입력된다.', async t => {
  const searchInput = await Selector('#search-input');
  const searchRecentBox = await Selector('#header .search-list-box.recent');

  await t
    .click(searchInput)
    .typeText(searchInput, '미역국')
    .pressKey('enter')
    .pressKey('backspace')
    .pressKey('backspace')
    .pressKey('backspace')
    .typeText(searchInput, '미역')
    .pressKey('down')
    .pressKey('down')
    .pressKey('enter')
    .expect(searchInput.value).notEql('미역');
});
