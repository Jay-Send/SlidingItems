import {AfterViewInit, ContentChild, ContentChildren, Directive, ElementRef, QueryList, Renderer2} from '@angular/core';
import {IonItemOptions, IonItemSliding} from '@ionic/angular';

/**
 * The data type used to specify the swipe direction of the emulation.
 */
enum SwipeDirection {
  toLeft = 0,
  toRight
}

/**
 * The directive 'appRevealSliding' is used for emulating swipe event on the Ionic component
 * 'ion-item-sliding' by clicking on an HTML element with the attribute 'appRevealSlidingButton'.
 * The element with the attribute 'appRevealSlidingButton' should be placed inside the 'ion-item' element.
 */

/**
 * Common decorator for specifying the directive. Selector for directive is 'appRevealSliding'.
 */
@Directive({
  selector: '[appRevealSliding]',
})

/**
 * Declaration of the class RevealSlidingDirective that implements the Angular interface AfterViewInit.
 * The interface points that the class will use ngAfterViewInit method.
 */
export class RevealSlidingDirective implements AfterViewInit {
  /**
   * ContentChild decorator is used for getting an object of the 'ion-item-sliding' component.
   * The object has class IonItemSliding. The object will be used only for checking
   * that the directive 'appRevealSliding' is placed to the correct component.
   * More about ContentChild decorator:
   * https://angular.io/api/core/ContentChild
   */
  @ContentChild(IonItemSliding) itemSliding: IonItemSliding;
  /**
   * ContentChildren decorator is used for getting a list of objects of the nested components 'ion-item-options'.
   * The object of component 'ion-item-options' has class IonItemOptions. The list of the
   * components will be used for getting Ionic options buttons location within 'ion-item-sliding' component
   * e.g. 'start' or 'end'. The information about the options buttons location will be used for specifying the direction
   * of the swipe emulation.
   * More about ContentChildren decorator:
   * https://angular.io/api/core/ContentChildren
   */
  @ContentChildren(IonItemOptions) itemOptionsList !: QueryList<IonItemOptions>;

  /**
   * Defines the HTML element to which will be added a click listener to start swipe emulation.
   */
  revealButton: Element;
  /**
   * Defines direction of the swipe emulation.
   */
  swipeDirection: SwipeDirection;

  /**
   * Constructor of the class of the directive.
   * @param el Reference to the element which directive is placed on.
   * @param renderer Object that is used for safe manipulations with HTML DOM elements.
   */
  constructor(private el: ElementRef,
              private renderer: Renderer2) {
  }

  /**
   * Implements AfterViewInit interface.
   * More about the method here:
   * https://angular.io/api/core/AfterViewInit
   */
  ngAfterViewInit() {
    this.selfCheck();
    this.init();
  }

  /**
   * Checks that this directive is placed to the 'ion-item-sliding' component with the nested 'ion-item-options' component.
   */
  private selfCheck() {
    if (!this.itemSliding) {
      throw new Error('RevealSlidingDirective: Missing ion-item-sliding node');
    }
    if (this.itemOptionsList.length > 1) {
      console.warn('RevealSlidingDirective: Processing only a one ion-item-options element');
    }
    if (this.itemOptionsList.length === 0) {
      console.warn('RevealSlidingDirective: Missing ion-item-options element');
    }
  }

  /**
   * Initiates the directive.
   */
  private init() {

    /**
     * Defining the swipe direction by the attribute 'side' of the nested 'ion-item-options' component.
     */
    const itemOption = this.itemOptionsList.first;
    if (itemOption) {
      this.swipeDirection = itemOption.side === 'start' ?
        SwipeDirection.toRight : SwipeDirection.toLeft;
    } else {
      this.swipeDirection = SwipeDirection.toLeft;
    }

    /**
     * Defining the HTML element with the 'appRevealSlidingButton' attribute.
     */
    this.revealButton = this.el.nativeElement.querySelector('ion-item *[appRevealSlidingButton]');
    if (!this.revealButton) {
      console.warn('RevealSlidingDirective: appRevealSlidingButton attribute is missed');
      return;
    }

    /**
     * Adding a click listener for the element.
     */
    this.renderer.listen(this.revealButton, 'click', () => {
      this.sendEvents(0);
    });
  }

  /**
   * Sends emulation events to the 'ion-item-sliding' component. This function is called recursively.
   * @param index Current recursion iteration number.
   */
  private sendEvents(index: number) {
    /**
     * Defines the number of maximum recursion iteration (the deep of the recursion call stack).
     */
    const maxIterations = 5;

    /**
     * Stops the recursion iteration if it has been reached the maximum recursion number. Exit call stack.
     */
    if (index === maxIterations) {
      return;
    }

    /**
     * Sends the events with a little time out, as it happens when a human it does.
     */
    setTimeout(() => {
      this.sendEventsDispatcher(index, maxIterations);
      this.sendEvents(++index);
    }, 10);
  }

  /**
   * The method is the core of the swipe emulation.
   * @param index Current recursion iteration number.
   * @param maxIterations Number of maximum recursion iteration (the deep of the recursion call stack).
   */
  private sendEventsDispatcher(index: number, maxIterations: number) {
    /**
     * Defines mouse events for the emulation.
     */
    const mouseEvents = [
      'mousedown',
      'mouseup',
      'mousemove'
    ];
    /**
     * Defines touch events for the emulation.
     */
    const touchEvents = [
      'touchstart',
      'touchend',
      'touchmove'
    ];

    /**
     * Defines the dispatcher and events that will be used for the swipe emulation.
     * If the browser supports touch events then 'sendTouchEvent' method and 'touchEvents' will be used,
     * else 'sendMouseEvent' and 'mouseEvents' will be used instead.
     */
    const eventTypes = this.supportTouchEvent() ? touchEvents : mouseEvents;
    const dispatcher = this.supportTouchEvent() ? this.sendTouchEvent : this.sendMouseEvent;

    /**
     * Gets the HTML Element of the 'ion-item-sliding' component.
     */
    const el = this.el.nativeElement;
    /**
     * Gets sizes and coordinates of the HTML Element of the 'ion-item-sliding' component.
     */
    const rect = el.getBoundingClientRect();
    /**
     * Defines the delta (offset) of the horizontal coordinate of the event for increment or decrement depends on the swipe direction.
     * When swipe direction will be 'to the right' the horizontal coordinate will increase by this value with each iteration.
     * When direction will be 'to the left' the horizontal coordinate will decrease by this value with each iteration.
     */
    const xStep = 50;
    /**
     * Defines small vertical offset of the event. It is necessary in order to the event will point to the element body,
     * not to its top border. This value will not be changed during the iterations.
     */
    const yOffset = 10;
    /**
     * Defines vertical coordinate for the event.
     */
    const y = rect.top + yOffset;

    /**
     * Defines horizontal coordinate for the event depending on swipe direction.
     */
    let x = rect.right - index * xStep;
    if (this.swipeDirection === SwipeDirection.toRight) {
      x = rect.left + index * xStep;
    }

    /**
     * For the correct emulation process, it is necessary to emulate native touch events, like a human does.
     * The emulation process has three stages: start, move, end.
     * For the first iteration it is passed the start event for the touch event it will be 'touchstart', 'mousedown'
     * for the mouse event.
     */
    if (index === 0) {
      dispatcher(el, eventTypes[0], x, y);
      /**
       * For the last iteration it is passed the end event for the touch event it will be 'touchend', 'mouseup'
       * for the mouse event.
       */
    } else if (index === maxIterations - 1) {
      dispatcher(el, eventTypes[1], x, y);
      /**
       * For the intermediate iteration it is passed the move event for the touch event it will be 'touchmove', 'mousemove'
       * for the mouse event.
       */
    } else {
      dispatcher(el, eventTypes[2], x, y);
    }
  }

  /**
   * Used for sending touch events to the HTML element.
   * @param element The HTMLElement that will accept the event.
   * @param eventType The event type of the mouse event e.g. 'touchstart'.
   * @param x The horizontal coordinate for the event.
   * @param y The vertical coordinate for the event.
   */
  private sendTouchEvent(element: HTMLElement, eventType: string, x: number, y: number) {
    try {
      /**
       * Creating a single contact point on the touch-sensitive device (surface).
       */
      const touch = new Touch({
        identifier: Date.now(),
        target: element,
        clientX: x,
        clientY: y,
        radiusX: 2.5,
        radiusY: 2.5,
        rotationAngle: 10,
        force: 0.5,
      });

      /**
       * Creating the touch event with the list of the touches points.
       */
      const touchList: Touch[] = [touch];
      const touchEvent = new TouchEvent(eventType, {
        cancelable: true,
        bubbles: true,
        touches: touchList,
        targetTouches: [],
        changedTouches: touchList,
        shiftKey: true,
      });

      /**
       * Sending the event to the target HTML element.
       */
      element.dispatchEvent(touchEvent);
    } catch (e) {
      console.error(e);
    }
  }

  /**
   * The method is used for sending only mouse events to the HTML element.
   * @param element The HTMLElement that will accept the event.
   * @param eventType The event type of the mouse event e.g. 'mousemove'.
   * @param x The horizontal coordinate for the event.
   * @param y The vertical coordinate for the event.
   */
  private sendMouseEvent(element: HTMLElement, eventType: string, x: number, y: number) {
    /**
     * Creating the event through the global Window variable 'document'.
     */
    const event = document.createEvent('MouseEvent');
    event.initMouseEvent(
      eventType,
      true /* bubble */,
      true /* cancelable */,
      window, 0,
      0,
      0,
      x,
      y, /* coordinates */
      false, false, false, false, /* modifier keys */
      0 /*left click*/,
      null,
    );

    /**
     * Sending the event to the target HTML element.
     */
    element.dispatchEvent(event);
  }

  /**
   * Checking the ability of the browser to use touch events.
   */
  private supportTouchEvent() {
    return typeof Touch !== 'undefined' &&
           typeof TouchEvent !== 'undefined';
  }
}
