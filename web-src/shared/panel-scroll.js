// Keep the mouse wheel inside a scrollable panel instead of letting it fall
// through to LiteGraph and zoom the graph canvas behind the node. Shared by the
// Director, Monitor and Extractor DOM widgets.
//
// Returns a `wheel` listener (bubble phase). When the element under the pointer
// sits inside a scroll container that can still scroll the way the wheel is
// going, the event is kept here (stopPropagation) so the browser performs the
// native scroll and the host never sees it. At a scroll boundary, or with no
// scroll container in the path, the event is left alone so canvas zoom keeps
// working everywhere else.

export function panelWheelKeeper(root) {
  return (event) => {
    if (event.ctrlKey) return; // host pinch-zoom gesture
    for (let node = event.composedPath?.()[0] || event.target; node && node !== root; node = node.parentNode) {
      if (!(node instanceof HTMLElement)) continue;
      const style = getComputedStyle(node);
      if (/(auto|scroll)/.test(style.overflowY) && node.scrollHeight - node.clientHeight > 1) {
        const atTop = node.scrollTop <= 0;
        const atBottom = node.scrollTop + node.clientHeight >= node.scrollHeight - 1;
        if ((event.deltaY < 0 && !atTop) || (event.deltaY > 0 && !atBottom)) event.stopPropagation();
        return;
      }
      if (/(auto|scroll)/.test(style.overflowX) && node.scrollWidth - node.clientWidth > 1 && event.deltaX !== 0) {
        event.stopPropagation();
        return;
      }
    }
  };
}
