export const TEMPLATE = `
<style>
  :host {
    display: block;
  }

  :host(.sticked) {
    position: relative;
  }

  .at-bottom {
    position: absolute;
    top: auto;
    bottom: 0;
  }
</style>
<div>
  <slot></slot>
</div>
`;
