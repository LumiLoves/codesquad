export default `
{{#if isGroupStart}}        
<li>
  <ul class="content-box">
  {{/if}}
    
    <li>
      <a class="thumbnail-box" href="#" data-detail-hash="{{detail_hash}}">
        <div class="thumbnail">
          <img src="{{image}}" alt="{{alt}}" />
          <div class="overlay">
            {{#each delivery_type}}
              <p class="txt">{{this}}</p>
            {{/each}}
          </div>
        </div>

        <dl class="content">
          <dt class="title">{{title}}</dt>
          <dd class="desc">{{description}}</dd>
          <dd class="price-wrapper">
            {{#if n_price}}
              <span class="original-price">{{this}}</span>
            {{/if}}
            <span class="final-price">
              <span class="number">{{s_price}}</span>
              <!-- <span class="unit">원</span> -->
            </span>
          </dd>
          <dd class="badge-wrapper">
            {{#each badge}}
              <i class="bm-icon badge-event">{{this}}</i>
            {{/each}}
          </dd>                   
        </dl>
      </a>
    </li>

  {{#if isGroupEnd}}
  </ul>
</li>
{{/if}}`;