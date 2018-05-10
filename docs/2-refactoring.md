# 리팩토링 2차 - Renderer 객체 개선 (작성중)



## 1. Renderer 호출영역과 정의영역

```javascript
/* ClientRenderer 호출 */
const oTabBestDish = new Tab({
  wrapperElem: document.querySelector('#best-seller .tab-box'),
  renderer: new ClientRenderer({
    getData: async () => {
      const res = await fetch(urlInfo.domain + urlInfo.bestDish);
      return await res.json();
    },
    template: lumiUtil.template,
    templateHTML: document.querySelector('[data-template-html="best-seller__tab-content-item"]').innerHTML
  }),
  dom: lumiUtil.dom
});

/* ClientRenderer 정의 */
class ClientRenderer {
  constructor({ getData, template, templateHTML }) {
    this.data = null;
    this.getData = getData; // 예) ajax, localStorage, cache 등등...
    this.template = template;
    this.templateHTML = templateHTML;
  }
  async renderUI({ remodelData, wrapper }) { /*...*/ }
  _saveResData(data) { /*...*/ }
  _makeHTML(appendWrapper) { /*...*/ }
}
```

* getData => 노출되는 비즈니스 로직
  * ajax로 받는 Data가 어느 클래스(Tab? Renderer)에 포함되는게 적절한가?
  * 실제 상황에서 데이터 받는 방법이 바뀌는 일이 많을까? 
    * => X. 의존성을 전제로 하고 클래스 내부에 정해진 코드를 두자.
    * => 외부에서 주입하는 코드 삭제. Tab Class에 코드 작성
    * => Tab Class에서 데이터를 받아 Renderer에 넘겨주는 형식으로 변경
* Renderer에서 Data를 받아서 템플레이팅 하는 기능만 집중
  * => 이름 변경 (ClientRenderer => TemplateRenerer)
  * => 필요없는 것 삭제
  * => 템플릿 기능 강화 (util의 template을 이쪽으로 옮기고 util에서 삭제)
* Renderer의 인스턴스를 클래스의 매개변수로 보내는 방식이 괜찮나?
  * => ClientRenderer 주입방식을 수정
    * => 생성과 호출을 분리하도록 수정.
    * **렌더러 주입방식**
      * 1번
        * oLS = new ListSlider({ ... });
        * oLS.addModule('render', new Render({ ... }) ); // 먼저 선언.
        * oLS.init();
      * 2번
        * oLS = new ListSlider({ ... });
        * oLS.init({ render: new Render({ ... }) }); // init의 매게변수로 저 객체를 보내는게 적당한가? 문맥에 어울리나?
      * `추가된 고민..`
        * 저렇게 되면 모든 ui 클래스뿐만이 아니라... 모든 클래스에서? addModule이라는 메서드를 써야할 것 같은데 이건 그럼 어쩌나?? 클래스는 또 부모를 2 개 가질 수 없지 않나



## 2. 코드일관성

(지난번)엔 클래스 내부끼리의 규칙이나 네이밍에 대한 코드일관성을 생각하여 개발

(이번)에는 호출부(사용측)에서의 일관성을 리팩토링

- 추상화되는 수준이 달랐던 문제
- 매개변수 타입



## 3. 객체들에 대한 고민

1) 이 객체는 어떤 역할을 하나? (객체의 성격, 종류)
=> UI Component중에서 템플릿렌더링이 필요한 Component만 가져다가 쓰게 함.

<br>

2) 이 객체는 어떻게 소통하고 싶은가? (객체의 관계 / 어디서 주고 어디로 보낼건가? / 합치기, 보내기, 부르기 )
=> 부모X. 자식X. 갖가지 유형의 UI컴포넌트가 위임하여 사용가능한 유틸리티 역할이다.

<br>

3) 객체의 특성 + 관계의 흐름들을 고려하여 구현하기. 이런 것들이 모여서 패턴이 되는건가?

<br>

1+2 = 유틸/프레임워크/라이브러리 ??



>  어떤 것의 적절한 경계를 나눠서 객체의 범위로 지정하도록 판단하는게 어려움.
>
> <br>
>
> 헷갈리는 개념들. 객체의 종류/시각<br>
>
> UI Component. Util. Library. Framework<br>
>
> Component. Module, Class, Function<br>
>
> 위젯, 컴포넌트, ……<br>
>
> <br>
>
> 유틸 = 헬퍼 코드. 도메인에 의존X, 재사용되는 코드의 나열.<br>
>
> 라이브러리 = 어떤 영역에 한정하여 짜치는 기능들을 다양하게 보완하도록 제공.<br>
>
> 찾아보면 블로그나 서비스마다 정의하는 내용이나 경계가 명확하지 않으나, <br>
> 중요한 것은 내가 만든 코드에서 내가 어떤 이유때문에 이렇게 정의했다는 생각을 가지고 있는게 중요한 것 같음.





|      구분       |        이름        | 역할                                       | 정의 (코드로 됨?!)           | 구조   |
| :-------------: | :----------------: | ------------------------------------------ | ---------------------------- | ------ |
|  UI Component   |       Slider       | 모든 슬라이드의 부모 슬라이더 컴포넌트     | 동적                         | Class  |
|  UI Component   |     ListSlider     | 가로로 나열된 목록 슬라이더 컴포넌트       | 동적                         | Class  |
|  UI Component   |    VisualSlider    | 이미지 슬라이더 컴포넌트                   | 동적                         | Class  |
|  UI Component   |        Tab         | 탭 컴포넌트                                | 동적                         | Class  |
| 비 UI Component |  TemplateRenderer  | 렌더링 컴포넌트                            | 동적                         | Class  |
|      Util       |      ajax.js       | 모듈                                       | 정적 / 객체리터럴            | Object |
|      Util       |    animation.js    |                                            | 정적 / 객체리터럴            | Object |
|      Util       |     helpers.js     |                                            | 정적 / 객체리터럴            | Object |
|   호스트 코드   |   bmc-page-**.js   | 페이지별 init 정의 (인스턴스 생성 및 사용) | 정적 / 즉시실행함수.모듈패턴 | Module |
|   호스트 코드   | bmc-page-global.js |                                            | 정적 / 즉시실행함수.모듈패턴 | Module |



## 4. UI Component 구조 vs MVC구조

* mvc로 하면 자주 바뀌는 UI를 분리하고 조립하기가 더 불리하지 않을까?
* 그럼 mvc가 더 유용한 경우는?
* UI별 mvc를 만들면 될까? 결국 적용범위의 문제인가?

<br>

이 사이트가 데이터 조작이 많냐? 애니메이션이 많냐? 인풋이 많은 UI들이 많냐? 에 따라 선택할 수 있는 디자인패턴이 달라짐<br>==> 무슨 패턴 쓸거냐? 무슨 프레임워크 쓸 거냐?<br>
==> 단방향 인터랙션이 많냐? 양방향이 많냐?<br>
양방향일땐 주고받는 데이터가 많기 때문에 mvc가 적합하지만, 이런 일반적인 홈페이지는 UI컴포넌트 기반이 더 잘 어울릴 수 있음. (두가지 방법이 어떤거 같냐?장단점?)<br>
오히려 이런 데이터보다는 비동기 문제가 중요하게 다뤄져야 할 패턴일 수 있다.

