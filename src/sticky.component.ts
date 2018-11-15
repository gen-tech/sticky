import { PositionTracker } from "@gen-tech/position-tracker";
import { Subject, combineLatest, Subscription } from 'rxjs';
import { map, filter, distinctUntilChanged, startWith } from "rxjs/operators";

import { StickPosition } from './models/sticky-event.enum';
import { Attributes } from "./models/observed-attributes.type";
import { __POSITION_TRACKER, __TEMPLATE_ELEMENT, __subscriptions, __offsetTop, __offsetBottom } from './private-selectors';
import { TEMPLATE } from './sticky.template';
import { elementBuilder } from './utils/element-builder';

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

  /**
   * Position Tracker Singleton Instance
   */
  private static readonly [__POSITION_TRACKER] = new PositionTracker(0);

  /**
   * Template Element to clone for each sticky element
   */
  private static readonly [__TEMPLATE_ELEMENT] = elementBuilder('template', TEMPLATE);

  /**
   * Container element which wraps sticky content
   */
  public container: HTMLDivElement;

  /**
   * Attribute Change
   */
  protected _attributeChange$ = new Subject<{name: Attributes, value: string}>();

  /**
   * Offset Top Observable
   */
  protected _offsetTop$ = this._attributeChange$.pipe(
    filter(({name}) => name === 'offset-top'),
    map(({value}) => +value),
    startWith(0),
    distinctUntilChanged()
  );

  /**
   * Offset Bottom Observable
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

  /**
   * A container subscription stores all subscriptions to unsubscribe when component destructures
   */
  private [__subscriptions] = new Subscription();

  /**
   * Current Offset Top Value
   */
  private [__offsetTop] = 0;

  /**
   * Current Offset Bottom Value
   */
  private [__offsetBottom] = 0;

  /**
   * Sticky Web Component Constructor
   */
  constructor() {
    super();

    const shadowDom = this.attachShadow({ mode: 'closed' });
    const shadowDomContent = <HTMLElement>StickyComponent[__TEMPLATE_ELEMENT].content.cloneNode(true);

    this.container = shadowDomContent.querySelector('div');

    shadowDom.appendChild(shadowDomContent);
  }

  /**
   * [Lifecycle Callback] Attribute Change
   *
   * Runs when an observed attribute changes
   *
   * @param name name of attribute
   * @param oldValue old value
   * @param newValue new value
   */
  public attributeChangedCallback(name: Attributes, oldValue: string, newValue: string): void {
    this._attributeChange$.next({name, value: newValue});
  }

  /**
   * [Lifecycle Callback] Connected
   *
   * Runs when component initialized
   */
  public connectedCallback(): void {

    // Main logic
    this[__subscriptions].add(this.position$.subscribe(event => {
      switch (event) {
        case StickPosition.Above:  // Remove everything
          this.classList.remove('sticked');
          this._resetContainerStyles();
        break;

        case StickPosition.Below: // Make container absolute
          this._resetContainerStyles();
          this._setContainerSize();

          if (getComputedStyle(this).position === 'static') {
            this.classList.add('sticked');
          }

					this.container.classList.add('at-bottom');
        break;

        case StickPosition.Sticked:
          this._resetContainerStyles();
          this._setContainerSize();
          this.container.style.setProperty('position', 'fixed');
          this.container.style.setProperty('top', "0");
        break;
      }
    }));

    // Update offsetTop value
    this[__subscriptions].add(this._offsetTop$.subscribe(value => {
      this[__offsetTop] = value;
    }));

    // Update offsetBottom value
    this[__subscriptions].add(this._offsetBottom$.subscribe(value => {
      this[__offsetBottom] = value;
    }));
  }

  /**
   * [Lifecycle Callback] Disconnected
   *
   * Runs when component is destroyed
   */
  public disconnectedCallback(): void {
    this[__subscriptions].unsubscribe();
  }

  /**
   * Reset Container Styles
   */
  private _resetContainerStyles() {
    this.container.classList.remove('at-bottom');
		["position", "top", "bottom", "width", "height"].forEach(prop => this.container.style.removeProperty(prop));
  }

  /**
   * Update Container Size
   */
  private _setContainerSize() {
    this.container.style.width = this.container.offsetWidth + "px";
    this.container.style.height = this.container.offsetHeight + "px";
  }
}