import { PositionTracker } from "@gen-tech/position-tracker";
import { Subject, combineLatest, Subscription } from 'rxjs';
import { map, filter, distinctUntilChanged, startWith } from "rxjs/operators";

import { StickPosition } from './models/sticky-event.enum';
import { __POSITION_TRACKER, __TEMPLATE_ELEMENT, __subscriptions } from './private.selectors';
import { TEMPLATE } from './sticky.template';
import { elementBuilder } from './utils/element-builder';

/**
 * Observed Attribute types
 */
type Attributes = 'offset-top' | 'offset-bottom';

/**
 * Sticky Web Component
 */
export class StickyComponent extends HTMLElement {
  /**
   * Observed attributes
   */
  public static get observedAttributes(): Attributes[] {
    return ['offset-top', 'offset-bottom'];
  }

  /**
   * Warnings
   */
  public static WARNINGS = {

  };

  private static readonly [__POSITION_TRACKER] = new PositionTracker(0);

  private static readonly [__TEMPLATE_ELEMENT] = elementBuilder('template', TEMPLATE);

  public container: HTMLDivElement;

  /**
   * Attribute Change
   */
  protected _attributeChange$ = new Subject<{name: Attributes, value: string}>();

  /**
   * Offset Top
   */
  protected _offsetTop$ = this._attributeChange$.pipe(
    filter(({name}) => name === 'offset-top'),
    map(({value}) => +value),
    startWith(0),
    distinctUntilChanged()
  );

  /**
   * Offset Bottom
   */
  protected _offsetBottom$ = this._attributeChange$.pipe(
    filter(({name}) => name === 'offset-bottom'),
    map(({value}) => +value),
    startWith(0),
    distinctUntilChanged()
  );

  /**
   * Position observable
   */
  public position$ = combineLatest(
    StickyComponent[__POSITION_TRACKER].trackElement(this),
    this._offsetTop$,
    this._offsetBottom$
  ).pipe(
    map(([{top}, offsetTop, offsetBottom]) => {
      if (top - offsetTop + this.clientHeight - this.container.clientHeight < 0) {
        return StickPosition.Below;
      } else if (top - offsetTop > 0) {
        return StickPosition.Above;
      }

      return StickPosition.Sticked;
    }),
    distinctUntilChanged()
  );

  private [__subscriptions] = new Subscription();

  constructor() {
    super();

    const shadowDom = this.attachShadow({ mode: 'closed' });

    const shadowDomContent = StickyComponent[__TEMPLATE_ELEMENT].content.cloneNode(true);

    this.container = <HTMLDivElement>(<HTMLElement>shadowDomContent).querySelector('div');

    shadowDom.appendChild(shadowDomContent);
  }

  /**
   * Attribute change lifecycle callback
   * @param name name of attribute
   * @param oldValue old value
   * @param newValue new value
   */
  public attributeChangedCallback(name: Attributes, oldValue: string, newValue: string): void {
    this._attributeChange$.next({name, value: newValue});
  }

  public connectedCallback(): void {
    const updateSubscription = this.position$.subscribe(event => {
      switch (event) {
        case StickPosition.Above:  // Remove everything
          this.classList.remove('sticked');
          this._resetStyles();
        break;

        case StickPosition.Below: // Make container absolute
          this._resetStyles();
          this._setContainerSize();

          if (getComputedStyle(this).position === 'static') {
            this.classList.add('sticked');
          }

					this.container.classList.add('at-bottom');
        break;

        case StickPosition.Sticked:
          this._resetStyles();
          this._setContainerSize();
          this.container.style.setProperty('position', 'fixed');
          this.container.style.setProperty('top', "0");
        break;
      }
    });

    this[__subscriptions].add(updateSubscription);

    console.log(this);
  }

  public disconnectedCallback(): void {
    this[__subscriptions].unsubscribe();
  }

  private _resetStyles() {
    this.container.classList.remove('at-bottom');
		["position", "top", "bottom", "width", "height"].forEach(prop => this.container.style.removeProperty(prop));
  }

  private _setContainerSize() {
    this.container.style.width = this.container.offsetWidth + "px";
    this.container.style.height = this.container.offsetHeight + "px";
  }
}