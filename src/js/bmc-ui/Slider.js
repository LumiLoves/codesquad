'use strict';

/**
 * Slider
 */

class Slider {
  constructor() {
    this.activeIndex = 0;
  }

  /* data */

  _updateActiveIndexData(i) {
    this.activeIndex = i || 0;
  }

  /* ui */

  _activeContent(oldIndex, newIndex) {
    const oldIndexSet = this._calcSlideIndexSet(oldIndex);
    const newIndexSet = this._calcSlideIndexSet(newIndex);

    this._removeDirectionClass(oldIndexSet);      
    this._addDirectionClass(newIndexSet);
  }
  _calcSlideIndex(i) {
    return (this.maxIndex + i) % this.maxIndex;
  }
  _calcSlideIndexSet(i) {
    return {
      prev: this._calcSlideIndex(i - 1),
      current: this._calcSlideIndex(i),
      next: this._calcSlideIndex(i + 1)
    }
  }
  _removeDirectionClass(indexSet) {
    this.contentItems.item(indexSet.prev).classList.remove('prev');
    this.contentItems.item(indexSet.current).classList.remove('current');
    this.contentItems.item(indexSet.next).classList.remove('next');
  }
  _addDirectionClass(indexSet) {
    this.contentItems.item(indexSet.prev).classList.add('prev');
    this.contentItems.item(indexSet.current).classList.add('current');
    this.contentItems.item(indexSet.next).classList.add('next');
  }

  /* event */

  _isPrevBtn(elem) {
    return elem.classList.contains('prev');
  }
  _isNextBtn(elem) {
    return elem.classList.contains('next');
  }
}

