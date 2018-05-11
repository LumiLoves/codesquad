class UI {
  addModule({ renderer }) {
    renderer && (this.renderer = renderer);
  }
  async _requestTemplateData(reqUrl) {
    const res = await fetch(reqUrl);
    let resJSON = await res.json();
    if (typeof this._remodelRenderData === 'function') {
      resJSON = this._remodelRenderData(resJSON);
    }
    return resJSON;
  }
}
