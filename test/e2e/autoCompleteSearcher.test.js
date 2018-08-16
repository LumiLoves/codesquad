import { Selector } from 'testcafe';

fixture `[배민찬] main 페이지`
  .page `localhost:3001`;

test('자동 완성 검색창에 검색어를 넣고 엔터치기 2회 반복 후, 값을 비우면 최근 검색어 목록이 나타나고, 클릭한 이름이 검색창에 입력된다.', async t => {
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
