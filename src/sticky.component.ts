import { PositionTracker } from "@gen-tech/position-tracker";

import { nearestParent } from './utils/nearest-parent';

const PARENT_ATTRIBURE = "gt-sticky-container";

const Warnings = {
  NOT_DIRECT_CHILD_OF_THE_PARENT:  "Element is not the direct child of its parent",
  DOES_NOT_HAVE_CONTAINER:  `Element does not have container, please add ${PARENT_ATTRIBURE} attribute to its parent`,
}

const tracker = new PositionTracker();

export class StickyComponent extends HTMLElement {
  private parent: HTMLElement = nearestParent(this, `[${PARENT_ATTRIBURE}]`);

  constructor() {
    super();

    if (!this.parent) {
      console.error(Warnings.DOES_NOT_HAVE_CONTAINER);
    }

    if (this.parent !== this.parentElement) {
      console.warn(Warnings.NOT_DIRECT_CHILD_OF_THE_PARENT);
    }

    tracker.trackElement(this.parent).subscribe(console.log);
  }
}