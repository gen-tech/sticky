/**
 * Sticky component position state
 */
export enum StickPosition {
  /**
   * Default position
   */
  Indeterminite = 0,

  /**
   * Element is sticked to window
   */
  Sticked = 1 << 0,

  /**
   * Element is sticked to top of element
   */
  Above = 1 << 1,

  /**
   * Element is sticked to bottom of element
   */
  Below = 1 << 2,

  /**
   * Element is sticked to element
   */
  Stripped = Above | Below
}