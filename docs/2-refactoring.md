# 리팩토링 2차 - Renderer 객체 개선 (작성중)



## 1. Renderer 호출영역과 정의영역

[기존 코드]

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

* getData()
  * ajax로 받는 data가 어느 클래스(Tab? Renderer?)에 포함되는게 적절한가?
    * => Tab 클래스에서 데이터를 받아 Renderer에 넘겨주는 형식으로 변경
  * 실제 상황에서 데이터 받는 방법이 바뀌는 일이 많을까? (ajax? localStorage?) + 노출되는 비즈니스 로직
    * => X. 의존성을 전제로 하고, Tab 클래스 내부에 getData를 추가
    * => 외부에서 주입받는 getData 삭제
  * => 광범위한 메서드명을 구체적으로 변경 (getData => getRequestData)
* class Renderer => data를 받아서 템플레이팅 하는 기능만 집중
  * => 이름 변경 (ClientRenderer => TemplateRenerer)
  * => 필요없는 것 삭제 (data와 관련된 속성 및 메서드)
  * => 템플릿 기능 강화 (util.template의 메서드를 클래스 메서드로 옮기고 util.template 삭제)
  * `[추가 고민] 꼭 클래스일 필요가 있을까? 기존 유틸에 있던 형태로 다시 돌아가야 하나? / 동적인 데이터는 templateHTML뿐이고 (UI에서 가지고 있어도 될거 같고?), 클래스를 상속받거나 상속할 가능성이 있는가? `
* Renderer의 인스턴스를 Tab 클래스의 매개변수로 보내는 방식이 괜찮나?
  *  => Renderer 주입방식을 수정
  * => 생성과 호출을 분리하도록 수정.
  * **렌더러 주입방식**
    * 1번 : (선택한 방식) 먼저 어떤 모듈을 추가하는지 선언한 뒤 -> init시킨다.
      * oLS = new ListSlider({ ... });
      * oLS.addModule('render', new Render({ ... }) );
      * oLS.init();
    * 2번 : (선택하지 않은 이유) init의 매개변수로 renderer 인스턴스를 보내는 게 적당한가? init의 문맥에 어울리나? 생각했을때 아니었음
      * oLS = new ListSlider({ ... });
      * oLS.init({ render: new Render({ ... }) });
    * `[추가 고민] 저렇게 되면 Tab 클래스 뿐만이 아니라... 모든 UI 클래스에서 addModule이라는 메서드를 써야할 것 같은데? 모든 UI 클래스에 상속하는 부모 클래스를 만들어야 하나? / ListSlider는 이미 Slider라는 부모를 상속받고 있는데, 부모를 2개 가질 수 없지 않나? 상속을 2개 이상 받게 되는 경우는 어떻게 처리하나? 이런 경우가 생기는 것이 잘못된 설계한 건가? `



## 2. 코드일관성

(지난번)엔 클래스 내부끼리의 규칙이나 네이밍에 대한 코드일관성을 생각하여 개발

(이번)에는 호출부(사용측)에서의 일관성을 고민하며 리팩토링 

* (지난번 리팩토링때는 사용하는 측에서의 일관성을 고려해야겠다는 생각을 전혀 하지 못했었다.)

- 추상화되는 수준이 달랐던 문제 (추상화된 메서드만 불러내는 곳에서, 노출된 로직이 들어간 코드가 들어 있었던 점)
- 매개변수 타입 (한 객체에 넘기는 매개변수의 타입이 모두 다르고 제각각)



## 3. Renderer 객체 재정의 + 객체를 만들 때 고민할 것들

Renderer 클래스 객체에 대한 역할 및 디자인 재정의 (이미 있었던 Renderer 클래스를 다시 고민해 봄)

* 1) 역할 정의 
  * => Renderer는 템플릿 렌더링이 필요한 UI 클래스만 위임하여 사용할 수 있는 유틸리티 성격? UI 클래스들을 도와주는 성격의 객체이다.
* 2) 역할에 따른 다른 객체와의 소통방법
  * => 그러므로 어떤 클래스의 부모도 X, 자식도 X. 템플릿 렌더링이 필요한 UI 클래스가 생길 때마다 호출하는 측에서 맘대로 추가할 수 있고, 
  * => UI 클래스 내부에서는 Renderer가 들어왔는지 안들어왔는지 모르고, 있던 없던 상관없이 동작할 수 있어야 한다.
* 3) 1, 2에 맞는 코드 구현하기
  * [기존] UI 인스턴스 생성 -> 인스턴스 호출
    * 생성과 호출이 동시에 됨
  * [변경] UI 인스턴스 생성 -> 필요한 모듈(Renderer) 추가 -> 인스턴스 호출
    * 생성과 호출시점을 분리하여, 그 사이에 모듈을 추가하고 호출할 수 있도록 변경함.
    * 인스턴스 호출과정에서, Renderer 인스턴스가 있고 && 템플릿 렌더링이 필요한 상황이면 render메서드 실행



(위 과정을 통해 알게 된) 객체를 만들 때 고민할 것들을 도출해 봄

* 1) 이 객체는 어떤 역할을 하나? (객체의 성격, 종류)
* 2) 이 객체는 다른 객체들과 어떻게 소통(관계)하고 싶은가? (객체의 관계 특징 / 어디서 주고 어디로 보낼건가? / 합치기, 보내기, 부르기)
* 3) 객체의 역할 + 관계성을 고려하여 코드를 어떤 형태로 디자인할 지 알 수 있다. `이런 것들이 모여서 패턴이 되는건가?`















`1+2 = 패턴/유틸/프레임워크/라이브러리 ?`
`( 객체의 역할과 다른 객체와 어떻게 관계맺는지에 따라서 패턴같은 것들이 만들어지는 것인가?)`



> 어떤 것의 적절한 경계를 나눠서 객체의 범위로 지정하도록 판단하는게 어려움.
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



역할과 관계에 따라 왜 이 구조와 패턴을 쓰게 되었는가?

어제 객체강의중 배민찬에 해당하는 것 추가로 적기. ==> 독립적인 UI Component들과 전역모델이 있는 형식



|     구분     |        이름        | 역할                                       | 정의 (코드로 됨?!)           | 구조   |
| :----------: | :----------------: | ------------------------------------------ | ---------------------------- | ------ |
| UI Component |       Slider       | 모든 슬라이드의 부모 슬라이더 컴포넌트     | 동적                         | Class  |
| UI Component |     ListSlider     | 가로로 나열된 목록 슬라이더 컴포넌트       | 동적                         | Class  |
| UI Component |    VisualSlider    | 이미지 슬라이더 컴포넌트                   | 동적                         | Class  |
| UI Component |        Tab         | 탭 컴포넌트                                | 동적                         | Class  |
| UI Assistant |  TemplateRenderer  | 렌더링 컴포넌트                            | 동적                         | Class  |
|     Util     |      ajax.js       | 모듈                                       | 정적 / 객체리터럴            | Object |
|     Util     |    animation.js    |                                            | 정적 / 객체리터럴            | Object |
|     Util     |     helpers.js     |                                            | 정적 / 객체리터럴            | Object |
| 호스트 코드  |   bmc-page-**.js   | 페이지별 init 정의 (인스턴스 생성 및 사용) | 정적 / 즉시실행함수.모듈패턴 | Module |
| 호스트 코드  | bmc-page-global.js |                                            | 정적 / 즉시실행함수.모듈패턴 | Module |



## 4. UI Component 구조 vs MVC구조

* mvc로 하면 자주 바뀌는 UI를 분리하고 조립하기가 더 불리하지 않을까?
* 그럼 mvc가 더 유용한 경우는?
* UI별 mvc를 만들면 될까? 결국 적용범위의 문제인가?

<br>

이 사이트가 데이터 조작이 많냐? 애니메이션이 많냐? 인풋이 많은 UI들이 많냐? 에 따라 선택할 수 있는 디자인패턴이 달라짐<br>==> 무슨 패턴 쓸거냐? 무슨 프레임워크 쓸 거냐?<br>
==> 단방향 인터랙션이 많냐? 양방향이 많냐?<br>
양방향일땐 주고받는 데이터가 많기 때문에 mvc가 적합하지만, 이런 일반적인 홈페이지는 UI컴포넌트 기반이 더 잘 어울릴 수 있음. (두가지 방법이 어떤거 같냐?장단점?)<br>
오히려 이런 데이터보다는 비동기 문제가 중요하게 다뤄져야 할 패턴일 수 있다.



MVC는 독립된 뷰끼리 조립되고 빠지고의 개념보다 하나의 큰 어플리케이션, 하나의 큰 뷰안에 관련된 작은 뷰들이 모여있고 그들이 서로 끊임없는 통신. 하나의 데이터로 여러 뷰에 영향을 줌. 수시로 바뀜.
반면 컴포넌트는 서로 통신할 일이 거의 없다.





많이 참고한 코드

https://github.com/nhnent/fe.javascript







---



template





미션 스텝별 깃브랜치형식

주간목표

오프라인리뷰 가볍게 정리

​	Promise 직접 구현? 모사드 패턴?

​	테스트코드

​	빌드 환경



