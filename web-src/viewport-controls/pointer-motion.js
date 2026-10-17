// Integrate movement with the sensitivity active for each new segment.
// Reapplying a modifier to the entire gesture makes stationary values jump.
export function createPointerMotion(start) {
  let previous = [...start];
  const total = start.map(() => 0);
  return (point, sensitivity = 1) => {
    point.forEach((value, i) => { total[i] += (value - previous[i]) * sensitivity; });
    previous = [...point];
    return [...total];
  };
}
